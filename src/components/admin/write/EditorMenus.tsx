"use client";

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import { normalizeHref } from "@/lib/article-doc";
import { cn } from "@/lib/utils";

type ToolProps = { label: string; active?: boolean; title?: string; onRun: () => void };

// mousedown is cancelled so the click never steals the text selection from the editor.
function Tool({ label, active = false, title, onRun }: ToolProps) {
  return (
    <button
      type="button"
      title={title ?? label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onRun}
      className={cn("px-2.5 py-1.5 text-sm font-medium hover:bg-bg/15", active && "bg-bg/25")}
    >
      {label}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-bg/30" aria-hidden="true" />;
}

// The menu over selected text, and the menu on an empty line.
export function EditorMenus({ editor }: { editor: Editor }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [href, setHref] = useState("");
  const [linkError, setLinkError] = useState(false);

  useEffect(() => {
    const close = () => setLinkOpen(false);
    editor.on("selectionUpdate", close);
    return () => {
      editor.off("selectionUpdate", close);
    };
  }, [editor]);

  function openLink() {
    const current = editor.getAttributes("link").href;
    setHref(typeof current === "string" ? current : "");
    setLinkError(false);
    setLinkOpen(true);
  }

  function applyLink() {
    const value = href.trim();
    if (value === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkOpen(false);
      return;
    }
    const clean = normalizeHref(value);
    if (!clean) {
      setLinkError(true);
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: clean }).run();
    setLinkOpen(false);
  }

  return (
    <>
      <BubbleMenu
        editor={editor}
        options={{ placement: "top", offset: 8 }}
        shouldShow={({ state }) => {
          const { from, to } = state.selection;
          return from !== to && state.doc.textBetween(from, to).length > 0;
        }}
      >
        <div
          role="toolbar"
          aria-label="Text formatting"
          className="ink-border flex items-center overflow-hidden rounded-md bg-ink text-bg"
        >
          {linkOpen ? (
            <>
              <input
                autoFocus
                value={href}
                onChange={(e) => {
                  setHref(e.target.value);
                  setLinkError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyLink();
                  }
                  if (e.key === "Escape") setLinkOpen(false);
                }}
                placeholder="https://"
                aria-label="Link address"
                aria-invalid={linkError}
                className="w-56 bg-transparent px-3 py-1.5 text-sm text-bg outline-none placeholder:text-bg/60"
              />
              {linkError && <span className="pr-2 text-xs">Not a link</span>}
              <Tool label="Apply" onRun={applyLink} />
              {editor.isActive("link") && (
                <Tool
                  label="Remove"
                  onRun={() => {
                    editor.chain().focus().extendMarkRange("link").unsetLink().run();
                    setLinkOpen(false);
                  }}
                />
              )}
            </>
          ) : (
            <>
              <Tool label="B" title="Bold" active={editor.isActive("bold")} onRun={() => editor.chain().focus().toggleBold().run()} />
              <Tool label="I" title="Italic" active={editor.isActive("italic")} onRun={() => editor.chain().focus().toggleItalic().run()} />
              <Tool label="U" title="Underline" active={editor.isActive("underline")} onRun={() => editor.chain().focus().toggleUnderline().run()} />
              <Tool label="Link" active={editor.isActive("link")} onRun={openLink} />
              <Divider />
              <Tool label="H2" title="Heading" active={editor.isActive("heading", { level: 2 })} onRun={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
              <Tool label="H3" title="Subheading" active={editor.isActive("heading", { level: 3 })} onRun={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
              <Tool label="Quote" active={editor.isActive("blockquote")} onRun={() => editor.chain().focus().toggleBlockquote().run()} />
              <Tool label="List" title="Bulleted list" active={editor.isActive("bulletList")} onRun={() => editor.chain().focus().toggleBulletList().run()} />
              <Tool label="1. List" title="Numbered list" active={editor.isActive("orderedList")} onRun={() => editor.chain().focus().toggleOrderedList().run()} />
              <Tool label="¶" title="Normal paragraph" onRun={() => editor.chain().focus().setParagraph().run()} />
            </>
          )}
        </div>
      </BubbleMenu>

      <FloatingMenu
        editor={editor}
        options={{ placement: "right", offset: 8 }}
        shouldShow={({ state }) => {
          const { $anchor, empty } = state.selection;
          return empty && $anchor.depth === 1 && $anchor.parent.type.name === "paragraph" && $anchor.parent.content.size === 0;
        }}
      >
        <div role="toolbar" aria-label="Insert" className="ink-border flex items-center overflow-hidden rounded-md bg-surface text-ink">
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="px-2.5 py-1.5 text-sm hover:bg-line/40">H2</button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="px-2.5 py-1.5 text-sm hover:bg-line/40">H3</button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBlockquote().run()} className="px-2.5 py-1.5 text-sm hover:bg-line/40">Quote</button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleBulletList().run()} className="px-2.5 py-1.5 text-sm hover:bg-line/40">List</button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().toggleOrderedList().run()} className="px-2.5 py-1.5 text-sm hover:bg-line/40">1. List</button>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().focus().setHorizontalRule().run()} className="px-2.5 py-1.5 text-sm hover:bg-line/40" title="Divider">* * *</button>
        </div>
      </FloatingMenu>
    </>
  );
}