"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ChangeEvent } from "react";
import Highlight from "@tiptap/extension-highlight";
import { Mathematics } from "@tiptap/extension-mathematics";
import { Placeholder } from "@tiptap/extension-placeholder";
import Superscript from "@tiptap/extension-superscript";
import { TableKit } from "@tiptap/extension-table";
import { NodeSelection } from "@tiptap/pm/state";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "katex/dist/katex.min.css";
import { Button } from "@/components/ui/Button";
import { FlashNotice } from "@/components/ui/FlashNotice";
import { articleConfig, articleImages, articleLimits } from "@/config/article";
import { mediaConfig } from "@/config/media";
import { readingMinutes, wordCount } from "@/lib/article-doc";
import { imageFiles, prepareArticleImage } from "@/lib/article-image";
import { uploadToSignedPath } from "@/lib/direct-upload";
import { lowlight } from "@/lib/lowlight";
import { typedFrom } from "@/lib/typeset";
import { cleanPastedHtml } from "@/lib/paste-word";
import type {
  ArticleSaveResult,
  ArticleState,
  ArticleStatus,
  DocNode,
  SaveArticleAction,
  SignArticleImageAction,
} from "@/types/article";
import type { FormAction } from "@/types/form";
import { ArticleImage } from "./ArticleImage";
import { ArticleCodeBlock } from "./ArticleCodeBlock";
import { ArticleDirection, ArticleFootnote } from "./ArticleExtras";
import { ArticleTypography } from "./ArticleTypography";
import { EditorMenus } from "./EditorMenus";
import { PublishDrawer, type DrawerSnapshot } from "./PublishDrawer";

type SaveState = { kind: "saved" } | { kind: "dirty" } | { kind: "saving" } | { kind: "error"; message: string };

type Props = {
  initial: {
    title: string;
    subtitle: string;
    doc: DocNode;
    status: ArticleStatus;
    state: ArticleState;
    slug: string | null;
    cover: string | null;
  };
  username: string;
  backHref: string;
  viewHref: string | null;
  previewHref: string;
  save: SaveArticleAction;
  signImage: SignArticleImageAction;
  publish: FormAction;
  unpublish: FormAction;
  remove: FormAction;
  notice: { tone: "error" | "ok"; text: string } | null;
};

const stateLabels: Record<ArticleState, string> = { draft: "Draft", scheduled: "Scheduled", live: "Live" };

type AutoProps = { value: string; onChange: (value: string) => void; onEnter: () => void };

// A title box that grows with its text.
function AutoTextarea({ value, onChange, onEnter }: AutoProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const caret = useRef<number | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  // After a typing rule changed the text, the caret goes back right after the typed character.
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && caret.current !== null) {
      el.setSelectionRange(caret.current, caret.current);
      caret.current = null;
    }
  });
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      maxLength={articleLimits.title}
      placeholder="Title"
      aria-label="Title"
      onChange={(e) => {
        const typed = typedFrom(e);
        if (typed.value !== e.currentTarget.value) caret.current = typed.caret;
        onChange(typed.value.replace(/\n/g, " "));
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnter();
        }
      }}
      className="w-full resize-none overflow-hidden bg-transparent font-display text-4xl font-semibold leading-tight tracking-tight outline-none placeholder:text-ink-soft sm:text-5xl"
    />
  );
}

export function ArticleEditor({ initial, username, backHref, viewHref, previewHref, save, signImage, publish, unpublish, remove, notice }: Props) {
  const published = initial.status === "published";
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [saveState, setSaveState] = useState<SaveState>({ kind: "saved" });
  const [drawer, setDrawer] = useState<DrawerSnapshot | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(notice !== null);

  const titleRef = useRef(initial.title);
  const subtitleRef = useRef(initial.subtitle);
  const subtitleInput = useRef<HTMLInputElement>(null);
  const subtitleCaret = useRef<number | null>(null);
  useLayoutEffect(() => {
    const el = subtitleInput.current;
    if (el && subtitleCaret.current !== null) {
      el.setSelectionRange(subtitleCaret.current, subtitleCaret.current);
      subtitleCaret.current = null;
    }
  });
  const editorRef = useRef<Editor | null>(null);
  const scheduleRef = useRef<() => void>(() => {});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const running = useRef(false);
  const queued = useRef(false);

  const startIndent = initial.doc.attrs?.indent === true;
  const [indent, setIndent] = useState(startIndent);
  const indentRef = useRef(startIndent);

  const [imageStatus, setImageStatus] = useState<{ text: string; error: boolean } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<(files: File[]) => void>(() => {});

  // The article's own setting (first line indented or not) travels inside the saved document.
  const docOf = useCallback((ed: Editor): DocNode => {
    const json = JSON.parse(JSON.stringify(ed.getJSON())) as DocNode;
    return indentRef.current ? { ...json, attrs: { indent: true } } : json;
  }, []);

  // Sends the text to the server. If more typing arrives while it runs, it goes around once more.
  const flush = useCallback(async () => {
    if (running.current) {
      queued.current = true;
      return;
    }
    running.current = true;
    try {
      do {
        queued.current = false;
        const editor = editorRef.current;
        if (!editor) break;
        setSaveState({ kind: "saving" });
        let result: ArticleSaveResult;
        try {
          result = await save({
            title: titleRef.current,
            subtitle: subtitleRef.current,
            content: docOf(editor),
          });
        } catch {
          result = { ok: false, error: "Could not reach the server. Check your connection." };
        }
        if (!result.ok) {
          setSaveState({ kind: "error", message: result.error });
          break;
        }
        if (!queued.current) setSaveState({ kind: "saved" });
      } while (queued.current);
    } finally {
      running.current = false;
    }
  }, [save, docOf]);

  // Drafts save by themselves after a short pause. A published article waits for the Update button.
  const schedule = useCallback(() => {
    setSaveState({ kind: "dirty" });
    if (published) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void flush();
    }, articleConfig.autosaveMs);
  }, [flush, published]);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        strike: false,
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
        },
      }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      ArticleImage.configure({ inline: false, allowBase64: false }),
      Highlight.configure({ multicolor: true }),
      Superscript,
      ArticleDirection,
      ArticleFootnote,
      ArticleTypography,
      TableKit,
      ArticleCodeBlock.configure({ lowlight, defaultLanguage: "plaintext", enableTabIndentation: true, tabSize: 2 }),
      Mathematics.configure({ katexOptions: { throwOnError: false, strict: "ignore" } }),
    ],
    content: initial.doc,
    editorProps: {
      attributes: { class: "article-prose", "aria-label": "Article body" },
      // A click on a formula selects it, and that opens its LaTeX box.
      handleClickOn: (view, _pos, node, nodePos) => {
        if (node.type.name !== "inlineMath" && node.type.name !== "blockMath") return false;
        view.dispatch(view.state.tr.setSelection(NodeSelection.create(view.state.doc, nodePos)));
        return true;
      },
      // Word and web pages bring list paragraphs, heading levels and pictures the editor cannot keep.
      transformPastedHTML: (html) => cleanPastedHtml(html),
      // A copied picture (no text with it) or a dropped file becomes a picture in the article.
      handlePaste: (_view, event) => {
        const data = event.clipboardData;
        if (!data || data.getData("text/plain").trim() !== "") return false;
        const files = imageFiles(data.files);
        if (files.length === 0) return false;
        event.preventDefault();
        imagesRef.current(files);
        return true;
      },
      handleDrop: (_view, event) => {
        const files = imageFiles(event.dataTransfer?.files);
        if (files.length === 0) return false;
        event.preventDefault();
        imagesRef.current(files);
        return true;
      },
    },
    onUpdate: () => scheduleRef.current(),
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    scheduleRef.current = schedule;
  }, [schedule]);

  // Shrinks each picture in the browser, uploads it straight to Storage, then puts it in the text.
  const insertImages = useCallback(
    async (files: File[]) => {
      const ed = editorRef.current;
      if (!ed) return;
      let count = 0;
      ed.state.doc.descendants((node) => {
        if (node.type.name === "image") count += 1;
        return true;
      });
      if (count + files.length > articleImages.maxPerArticle) {
        setImageStatus({ text: `An article can have at most ${articleImages.maxPerArticle} pictures.`, error: true });
        return;
      }
      for (const [i, file] of files.entries()) {
        setImageStatus({ text: `Uploading picture ${i + 1} of ${files.length}...`, error: false });
        const prepared = await prepareArticleImage(file);
        if ("error" in prepared) {
          setImageStatus({ text: prepared.error, error: true });
          return;
        }
        let sign: Awaited<ReturnType<SignArticleImageAction>>;
        try {
          sign = await signImage({ kind: "image", type: prepared.file.type, size: prepared.file.size });
        } catch {
          sign = { error: "Could not reach the server. Check your connection." };
        }
        if ("error" in sign) {
          setImageStatus({ text: sign.error, error: true });
          return;
        }
        const failure = await uploadToSignedPath(mediaConfig.bucket, sign.path, sign.token, prepared.file);
        if (failure) {
          setImageStatus({ text: `Upload failed: ${failure}`, error: true });
          return;
        }
        ed.chain().focus().setImage({ src: sign.url }).run();
      }
      setImageStatus(null);
    },
    [signImage],
  );

  useEffect(() => {
    imagesRef.current = (files) => {
      void insertImages(files);
    };
  }, [insertImages]);

  function onPickFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = imageFiles(e.currentTarget.files);
    e.currentTarget.value = "";
    if (files.length > 0) void insertImages(files);
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  // Leaving with unsaved text asks first.
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (saveState.kind !== "saved") e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [saveState.kind]);

  function onTitle(value: string) {
    titleRef.current = value;
    setTitle(value);
    schedule();
  }

  function onSubtitle(value: string) {
    subtitleRef.current = value;
    setSubtitle(value);
    schedule();
  }

  function toggleIndent() {
    const next = !indentRef.current;
    indentRef.current = next;
    setIndent(next);
    schedule();
  }

  // A draft is saved first, then shown. A published article is NOT saved here (only Update does that),
  // so its preview is the saved version.
  async function openPreview() {
    const win = window.open("", "_blank");
    if (!win) {
      setImageStatus({ text: "Allow pop-ups to see the preview.", error: true });
      return;
    }
    if (!published) {
      if (timer.current) clearTimeout(timer.current);
      await flush();
    }
    win.location.href = previewHref;
  }

  function openDrawer() {
    if (!editor) return;
    setDrawer({ title, subtitle, content: JSON.stringify(docOf(editor)) });
  }

  const words = editor ? wordCount(editor.getText()) : 0;
  const statusText =
    saveState.kind === "saved"
      ? "Saved"
      : saveState.kind === "saving"
        ? "Saving..."
        : saveState.kind === "dirty"
          ? published
            ? "Unsaved changes"
            : "Saving soon"
          : `Failed: ${saveState.message}`;

  return (
    <div className="fixed inset-0 overflow-y-auto bg-bg">
      <header className="sticky top-0 z-30 border-b border-line bg-bg">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
          <a href={backHref} className="text-sm underline underline-offset-4">
            &larr; Articles
          </a>
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">{stateLabels[initial.state]}</span>
          <div className="ml-auto flex flex-wrap items-center gap-3 text-sm text-ink-soft">
            <button
              type="button"
              onClick={toggleIndent}
              aria-pressed={indent}
              title="Indent the first line of every paragraph"
              className="underline underline-offset-4"
            >
              First line: {indent ? "Indented" : "Plain"}
            </button>
            <span>
              {words} words · {readingMinutes(words)} min read
            </span>
            <span className={saveState.kind === "error" ? "text-accent" : undefined} role="status">
              {statusText}
            </span>
            {imageStatus &&
              (imageStatus.error ? (
                <button
                  type="button"
                  onClick={() => setImageStatus(null)}
                  title="Dismiss"
                  className="text-accent underline underline-offset-4"
                >
                  {imageStatus.text}
                </button>
              ) : (
                <span role="status">{imageStatus.text}</span>
              ))}
            {saveState.kind === "error" && (
              <Button size="sm" onClick={() => void flush()}>
                Retry
              </Button>
            )}
            <button
              type="button"
              onClick={() => void openPreview()}
              title={published ? "Shows the saved version, not unsaved changes" : "Saves, then opens the preview"}
              className="underline underline-offset-4"
            >
              Preview
            </button>
            {viewHref && (
              <a href={viewHref} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                View
              </a>
            )}
            {published ? (
              <>
                <Button size="sm" onClick={openDrawer} disabled={!editor}>
                  Details
                </Button>
                <Button
                  size="sm"
                  variant="accent"
                  onClick={() => void flush()}
                  disabled={saveState.kind !== "dirty" && saveState.kind !== "error"}
                >
                  Update
                </Button>
              </>
            ) : (
              <Button size="sm" variant="accent" onClick={openDrawer} disabled={!editor}>
                Publish
              </Button>
            )}
          </div>
        </div>
      </header>

      {notice && noticeOpen && (
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-2 px-5 pt-4">
          <FlashNotice tone={notice.tone}>{notice.text}</FlashNotice>
          <button type="button" onClick={() => setNoticeOpen(false)} className="text-xs underline underline-offset-4">
            Dismiss
          </button>
        </div>
      )}

      <main className="mx-auto w-full max-w-2xl px-5 pb-40 pt-10 sm:px-8">
        <AutoTextarea value={title} onChange={onTitle} onEnter={() => subtitleInput.current?.focus()} />
        <input
          ref={subtitleInput}
          value={subtitle}
          maxLength={articleLimits.subtitle}
          placeholder="Subtitle (optional)"
          aria-label="Subtitle"
          onChange={(e) => {
            const typed = typedFrom(e);
            if (typed.value !== e.currentTarget.value) subtitleCaret.current = typed.caret;
            onSubtitle(typed.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              editor?.commands.focus("start");
            }
          }}
          className="mt-3 w-full bg-transparent text-xl text-ink-soft outline-none placeholder:text-ink-soft"
        />
        <div className="relative mt-8" data-indent={indent ? "true" : undefined}>
          <EditorContent editor={editor} />
          {editor && <EditorMenus editor={editor} onPickImage={() => fileInput.current?.click()} />}
          <input
            ref={fileInput}
            type="file"
            accept={articleImages.accept}
            multiple
            className="hidden"
            aria-label="Add pictures"
            onChange={onPickFiles}
          />
        </div>
      </main>

      {drawer && (
        <PublishDrawer
          snapshot={drawer}
          status={initial.status}
          slug={initial.slug}
          cover={initial.cover}
          signImage={signImage}
          username={username}
          viewHref={viewHref}
          publish={publish}
          unpublish={unpublish}
          remove={remove}
          onClose={() => setDrawer(null)}
        />
      )}
    </div>
  );
}