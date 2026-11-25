"use client";

import { useEffect, useState, type ComponentProps } from "react";
import { NodeSelection } from "@tiptap/pm/state";
import type { Editor } from "@tiptap/react";
import { BubbleMenu, FloatingMenu } from "@tiptap/react/menus";
import { articleLimits } from "@/config/article";
import { highlightColors, normalizeHref } from "@/lib/article-doc";
import { cn } from "@/lib/utils";

type BubbleProps = ComponentProps<typeof BubbleMenu>;
type FloatingProps = ComponentProps<typeof FloatingMenu>;

const mathTypes = ["inlineMath", "blockMath"];

// These must stay OUTSIDE the component: new objects on every render make the menus re-register in a loop.
const bubbleOptions: BubbleProps["options"] = { placement: "top", offset: 8 };

// The bubble shows over selected text, and over a selected footnote marker or formula (to edit it).
// It stays away from code blocks, where text marks do not exist.
const showBubble: BubbleProps["shouldShow"] = ({ state }) => {
  const { selection } = state;
  if (selection instanceof NodeSelection) {
    const name = selection.node.type.name;
    return name === "footnote" || mathTypes.includes(name);
  }
  if (selection.$from.parent.type.name === "codeBlock") return false;
  const { from, to } = selection;
  return from !== to && state.doc.textBetween(from, to).length > 0;
};

// The table menu shows when the cursor sits in a table (a text selection shows the text menu instead).
const showTableMenu: BubbleProps["shouldShow"] = ({ editor, state }) =>
  editor.isActive("table") && state.selection.empty;

const swatches: Record<string, string> = {
  yellow: "rgba(255, 214, 10, 0.75)",
  green: "rgba(52, 199, 89, 0.75)",
  blue: "rgba(10, 132, 255, 0.75)",
  pink: "rgba(255, 55, 140, 0.75)",
};
const floatingOptions: FloatingProps["options"] = { placement: "left", offset: 12, shift: { padding: 4 } };
const showFloating: FloatingProps["shouldShow"] = ({ state }) => {
  const { $anchor, empty } = state.selection;
  return empty && $anchor.depth === 1 && $anchor.parent.type.name === "paragraph" && $anchor.parent.content.size === 0;
};

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

type MathFieldProps = { initial: string; onApply: (latex: string) => void; onRemove: () => void };

// The LaTeX box for a selected formula. The parent gives it a key per formula, so it starts fresh each time.
function MathField({ initial, onApply, onRemove }: MathFieldProps) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <input
        autoFocus
        value={value}
        maxLength={articleLimits.latex}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Escape") {
            e.preventDefault();
            onApply(value);
          }
        }}
        placeholder="LaTeX, for example \frac{a}{b}"
        aria-label="Formula (LaTeX)"
        spellCheck={false}
        className="w-80 bg-transparent px-3 py-1.5 font-mono text-sm text-bg outline-none placeholder:text-bg/60"
      />
      <Tool label="Apply" onRun={() => onApply(value)} />
      <Tool label="Remove" onRun={onRemove} />
    </>
  );
}

// How many rows and columns the table under the cursor has (null = not in a table).
function tableSize(editor: Editor): { rows: number; cols: number } | null {
  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name === "table") return { rows: node.childCount, cols: node.firstChild?.childCount ?? 0 };
  }
  return null;
}

// The menu over selected text, the table menu, and the menu on an empty line.
export function EditorMenus({ editor, onPickImage }: { editor: Editor; onPickImage: () => void }) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [href, setHref] = useState("");
  const [linkError, setLinkError] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [markerOpen, setMarkerOpen] = useState(false);

  useEffect(() => {
    const close = () => {
      setLinkOpen(false);
      setPlusOpen(false);
      setMarkerOpen(false);
    };
    editor.on("selectionUpdate", close);
    editor.on("update", close);
    return () => {
      editor.off("selectionUpdate", close);
      editor.off("update", close);
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

  function applyMarker(color: string | null) {
    const chain = editor.chain().focus();
    if (color === null || editor.isActive("highlight", { color })) chain.unsetHighlight().run();
    else chain.setHighlight({ color }).run();
    setMarkerOpen(false);
  }

  // Right to left (Arabic) for the paragraph or heading the selection is in.
  function toggleRtl() {
    const type = editor.isActive("heading") ? "heading" : "paragraph";
    const rtl = editor.getAttributes(type).dir === "rtl";
    editor.chain().focus().updateAttributes(type, { dir: rtl ? null : "rtl" }).run();
  }

  // The marker goes after the selected text, and is selected so its note box opens at once.
  function insertFootnote() {
    const to = editor.state.selection.to;
    editor.chain().focus().insertContentAt(to, { type: "footnote", attrs: { note: "" } }).setNodeSelection(to).run();
  }

  // An inline formula goes after the selected text, selected so its LaTeX box opens at once.
  function insertInlineMath() {
    const to = editor.state.selection.to;
    editor.chain().focus().insertContentAt(to, { type: "inlineMath", attrs: { latex: "x" } }).setNodeSelection(to).run();
  }

  // A formula on its own line replaces the empty paragraph the "+" button belongs to.
  function insertBlockMath() {
    const { $from } = editor.state.selection;
    const from = $from.before();
    editor
      .chain()
      .focus()
      .insertContentAt({ from, to: $from.after() }, { type: "blockMath", attrs: { latex: "x = y" } })
      .setNodeSelection(from)
      .run();
  }

  const selection = editor.state.selection;
  const selectedNode = selection instanceof NodeSelection ? selection.node : null;

  const footnoteOn = selectedNode?.type.name === "footnote";
  const rawNote: unknown = footnoteOn ? selectedNode?.attrs.note : "";
  const noteText = typeof rawNote === "string" ? rawNote : "";

  const mathNode = selectedNode && mathTypes.includes(selectedNode.type.name) ? selectedNode : null;
  const rawLatex: unknown = mathNode?.attrs.latex;
  const mathLatex = typeof rawLatex === "string" ? rawLatex : "";

  function setNote(value: string) {
    editor.chain().updateAttributes("footnote", { note: value }).run();
  }

  function finishNote() {
    editor.chain().focus().setTextSelection(editor.state.selection.to).run();
  }

  function removeSelected() {
    editor.chain().focus().deleteSelection().run();
  }

  function applyMath(latex: string) {
    if (!mathNode) return;
    const text = latex.trim();
    if (text === "") {
      removeSelected();
      return;
    }
    if (mathNode.type.name === "blockMath") {
      editor.chain().focus().updateBlockMath({ latex: text }).run();
    } else {
      const to = editor.state.selection.to;
      editor.chain().focus().updateInlineMath({ latex: text }).setTextSelection(to).run();
    }
  }

  const size = tableSize(editor);
  const canAddRow = !size || size.rows < articleLimits.tableRows;
  const canAddCol = !size || size.cols < articleLimits.tableCols;

  // What the "+" button offers. New block types are added here.
  const inserts: { label: string; title?: string; run: () => void }[] = [
    { label: "H2", title: "Heading", run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "H3", title: "Subheading", run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "Quote", run: () => editor.chain().focus().toggleBlockquote().run() },
    { label: "List", title: "Bulleted list", run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "1. List", title: "Numbered list", run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Image", title: "Insert picture", run: onPickImage },
    {
      label: "Table",
      title: "Insert table",
      run: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    { label: "Code", title: "Code block", run: () => editor.chain().focus().toggleCodeBlock().run() },
    { label: "Math", title: "Formula on its own line", run: insertBlockMath },
    { label: "* * *", title: "Divider", run: () => editor.chain().focus().setHorizontalRule().run() },
  ];

  return (
    <>
      <BubbleMenu editor={editor} options={bubbleOptions} shouldShow={showBubble}>
        <div
          role="toolbar"
          aria-label="Text formatting"
          className="ink-border flex items-center overflow-hidden rounded-md bg-ink text-bg"
        >
          {footnoteOn ? (
            <>
              <input
                autoFocus
                value={noteText}
                maxLength={articleLimits.footnote}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "Escape") {
                    e.preventDefault();
                    finishNote();
                  }
                }}
                placeholder="Write the note"
                aria-label="Footnote text"
                className="w-72 bg-transparent px-3 py-1.5 text-sm text-bg outline-none placeholder:text-bg/60"
              />
              <Tool label="Done" onRun={finishNote} />
              <Tool label="Remove" onRun={removeSelected} />
            </>
          ) : mathNode ? (
            <MathField key={selection.from} initial={mathLatex} onApply={applyMath} onRemove={removeSelected} />
          ) : markerOpen ? (
            <>
              {highlightColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  title={`Highlight ${color}`}
                  aria-label={`Highlight ${color}`}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyMarker(color)}
                  className="mx-1 my-1.5 h-5 w-5 rounded-full border border-bg/40"
                  style={{ backgroundColor: swatches[color] }}
                />
              ))}
              <Tool label="None" title="Remove highlight" onRun={() => applyMarker(null)} />
              <Tool label="Back" onRun={() => setMarkerOpen(false)} />
            </>
          ) : linkOpen ? (
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
              <Tool label="Mark" title="Highlight" active={editor.isActive("highlight")} onRun={() => setMarkerOpen(true)} />
              <Tool label="x²" title="Superscript" active={editor.isActive("superscript")} onRun={() => editor.chain().focus().toggleSuperscript().run()} />
              <Divider />
              <Tool label="H2" title="Heading" active={editor.isActive("heading", { level: 2 })} onRun={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
              <Tool label="H3" title="Subheading" active={editor.isActive("heading", { level: 3 })} onRun={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
              <Tool label="Quote" active={editor.isActive("blockquote")} onRun={() => editor.chain().focus().toggleBlockquote().run()} />
              <Tool label="List" title="Bulleted list" active={editor.isActive("bulletList")} onRun={() => editor.chain().focus().toggleBulletList().run()} />
              <Tool label="1. List" title="Numbered list" active={editor.isActive("orderedList")} onRun={() => editor.chain().focus().toggleOrderedList().run()} />
              <Tool label="¶" title="Normal paragraph" onRun={() => editor.chain().focus().setParagraph().run()} />
              <Divider />
              <Tool label="RTL" title="Right to left (Arabic)" active={editor.getAttributes("paragraph").dir === "rtl" || editor.getAttributes("heading").dir === "rtl"} onRun={toggleRtl} />
              <Tool label="Note" title="Footnote" onRun={insertFootnote} />
              <Tool label="Math" title="Formula inside the text" onRun={insertInlineMath} />
            </>
          )}
        </div>
      </BubbleMenu>

      <BubbleMenu editor={editor} pluginKey="tableMenu" options={bubbleOptions} shouldShow={showTableMenu}>
        <div role="toolbar" aria-label="Table" className="ink-border flex items-center overflow-hidden rounded-md bg-ink text-bg">
          {canAddRow && <Tool label="+ Row" title="Add a row below" onRun={() => editor.chain().focus().addRowAfter().run()} />}
          <Tool label="- Row" title="Delete this row" onRun={() => editor.chain().focus().deleteRow().run()} />
          {canAddCol && <Tool label="+ Col" title="Add a column on the right" onRun={() => editor.chain().focus().addColumnAfter().run()} />}
          <Tool label="- Col" title="Delete this column" onRun={() => editor.chain().focus().deleteColumn().run()} />
          <Divider />
          <Tool label="Header" title="Make the row a header row, or back" onRun={() => editor.chain().focus().toggleHeaderRow().run()} />
          <Tool label="Delete table" onRun={() => editor.chain().focus().deleteTable().run()} />
        </div>
      </BubbleMenu>

      <FloatingMenu editor={editor} options={floatingOptions} shouldShow={showFloating}>
        <div className="relative flex items-center">
          <button
            type="button"
            title="Add block"
            aria-label="Add block"
            aria-expanded={plusOpen}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setPlusOpen((open) => !open)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full border border-line bg-bg text-xl leading-none text-ink-soft transition-transform hover:text-ink",
              plusOpen && "rotate-45 text-ink",
            )}
          >
            +
          </button>
          {plusOpen && (
            <div
              role="toolbar"
              aria-label="Insert"
              className="ink-border absolute left-full top-1/2 ml-2 flex -translate-y-1/2 items-center overflow-hidden whitespace-nowrap rounded-md bg-surface text-ink"
            >
              {inserts.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  title={item.title ?? item.label}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    item.run();
                    setPlusOpen(false);
                  }}
                  className="px-2.5 py-1.5 text-sm hover:bg-line/40"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </FloatingMenu>
    </>
  );
}