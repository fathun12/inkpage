import { Extension, Node, mergeAttributes } from "@tiptap/core";

// Right-to-left paragraphs and headings (Arabic). Saved as dir="rtl" on the block.
export const ArticleDirection = Extension.create({
  name: "articleDirection",
  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"],
        attributes: {
          dir: {
            default: null,
            parseHTML: (element: HTMLElement) => (element.getAttribute("dir") === "rtl" ? "rtl" : null),
            renderHTML: (attributes: Record<string, unknown>) => (attributes.dir === "rtl" ? { dir: "rtl" } : {}),
          },
        },
      },
    ];
  },
});

// A footnote marker: a small atom in the text that carries the note (plain text).
// The number comes from a CSS counter in the editor and from the reader's own count.
export const ArticleFootnote = Node.create({
  name: "footnote",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  priority: 101, // checked before the Superscript mark, which also reads <sup>
  addAttributes() {
    return {
      note: {
        default: "",
        parseHTML: (element: HTMLElement) => element.getAttribute("data-note") ?? "",
        renderHTML: (attributes: Record<string, unknown>) => ({ "data-note": String(attributes.note ?? "") }),
      },
    };
  },
  parseHTML() {
    return [{ tag: "sup[data-footnote]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["sup", mergeAttributes({ "data-footnote": "" }, HTMLAttributes)];
  },
});