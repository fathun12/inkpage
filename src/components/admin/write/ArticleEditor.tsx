"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Placeholder } from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/Button";
import { FlashNotice } from "@/components/ui/FlashNotice";
import { articleConfig, articleLimits } from "@/config/article";
import { readingMinutes, wordCount } from "@/lib/article-doc";
import type {
  ArticleSaveResult,
  ArticleState,
  ArticleStatus,
  DocNode,
  SaveArticleAction,
} from "@/types/article";
import type { FormAction } from "@/types/form";
import { EditorMenus } from "./EditorMenus";
import { PublishDrawer, type DrawerSnapshot } from "./PublishDrawer";

type SaveState = { kind: "saved" } | { kind: "dirty" } | { kind: "saving" } | { kind: "error"; message: string };

type Props = {
  initial: { title: string; subtitle: string; doc: DocNode; status: ArticleStatus; state: ArticleState; slug: string | null };
  username: string;
  backHref: string;
  viewHref: string | null;
  save: SaveArticleAction;
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
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      maxLength={articleLimits.title}
      placeholder="Title"
      aria-label="Title"
      onChange={(e) => onChange(e.target.value.replace(/\n/g, " "))}
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

export function ArticleEditor({ initial, username, backHref, viewHref, save, publish, unpublish, remove, notice }: Props) {
  const published = initial.status === "published";
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [saveState, setSaveState] = useState<SaveState>({ kind: "saved" });
  const [drawer, setDrawer] = useState<DrawerSnapshot | null>(null);
  const [noticeOpen, setNoticeOpen] = useState(notice !== null);

  const titleRef = useRef(initial.title);
  const subtitleRef = useRef(initial.subtitle);
  const subtitleInput = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const scheduleRef = useRef<() => void>(() => {});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const running = useRef(false);
  const queued = useRef(false);

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
            content: JSON.parse(JSON.stringify(editor.getJSON())),
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
  }, [save]);

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
    ],
    content: initial.doc,
    editorProps: {
      attributes: { class: "article-prose", "aria-label": "Article body" },
      // Word and web pages bring heading levels the editor does not have.
      transformPastedHTML: (html) => html.replace(/<(\/?)h1\b/gi, "<$1h2").replace(/<(\/?)h[4-6]\b/gi, "<$1h3"),
    },
    onUpdate: () => scheduleRef.current(),
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  useEffect(() => {
    scheduleRef.current = schedule;
  }, [schedule]);

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

  function openDrawer() {
    if (!editor) return;
    setDrawer({ title, subtitle, content: JSON.stringify(editor.getJSON()) });
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
            <span>
              {words} words · {readingMinutes(words)} min read
            </span>
            <span className={saveState.kind === "error" ? "text-accent" : undefined} role="status">
              {statusText}
            </span>
            {saveState.kind === "error" && (
              <Button size="sm" onClick={() => void flush()}>
                Retry
              </Button>
            )}
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

      <main className="mx-auto w-full max-w-[42rem] px-5 pb-40 pt-10 sm:px-8">
        <AutoTextarea value={title} onChange={onTitle} onEnter={() => subtitleInput.current?.focus()} />
        <input
          ref={subtitleInput}
          value={subtitle}
          maxLength={articleLimits.subtitle}
          placeholder="Subtitle (optional)"
          aria-label="Subtitle"
          onChange={(e) => onSubtitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              editor?.commands.focus("start");
            }
          }}
          className="mt-3 w-full bg-transparent text-xl text-ink-soft outline-none placeholder:text-ink-soft"
        />
        <div className="relative mt-8">
          <EditorContent editor={editor} />
          {editor && <EditorMenus editor={editor} />}
        </div>
      </main>

      {drawer && (
        <PublishDrawer
          snapshot={drawer}
          status={initial.status}
          slug={initial.slug}
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