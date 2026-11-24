import type { ReactNode } from "react";
import { Img } from "@/components/ui/Img";
import { isArticleImageSrc, isHighlightColor, isSafeHref } from "@/lib/article-doc";
import type { DocMark, DocNode } from "@/types/article";

// Footnotes are numbered in reading order while the text is drawn; the list goes under the article.
type Ctx = { notes: string[] };

function wrap(node: ReactNode, mark: DocMark, key: string): ReactNode {
  switch (mark.type) {
    case "bold":
      return <strong key={key}>{node}</strong>;
    case "italic":
      return <em key={key}>{node}</em>;
    case "underline":
      return <u key={key}>{node}</u>;
    case "code":
      return <code key={key}>{node}</code>;
    case "superscript":
      return <sup key={key}>{node}</sup>;
    case "highlight": {
      const color = mark.attrs?.color;
      return (
        <mark key={key} data-color={isHighlightColor(color) ? color : "yellow"}>
          {node}
        </mark>
      );
    }
    case "link": {
      const href = mark.attrs?.href;
      return isSafeHref(href) ? (
        <a key={key} href={href} target="_blank" rel="noopener noreferrer nofollow">
          {node}
        </a>
      ) : (
        node
      );
    }
    default:
      return node;
  }
}

function renderNode(node: DocNode, key: string, ctx: Ctx): ReactNode {
  const kids = (): ReactNode[] => (node.content ?? []).map((child, i) => renderNode(child, `${key}.${i}`, ctx));
  const dir = node.attrs?.dir === "rtl" ? "rtl" : undefined;
  switch (node.type) {
    case "text":
      return (node.marks ?? []).reduce<ReactNode>((acc, mark, i) => wrap(acc, mark, `${key}m${i}`), node.text ?? "");
    case "paragraph": {
      const content = kids();
      return (
        <p key={key} dir={dir}>
          {content.length > 0 ? content : <br />}
        </p>
      );
    }
    case "heading":
      return node.attrs?.level === 3 ? (
        <h3 key={key} dir={dir}>
          {kids()}
        </h3>
      ) : (
        <h2 key={key} dir={dir}>
          {kids()}
        </h2>
      );
    case "blockquote":
      return <blockquote key={key}>{kids()}</blockquote>;
    case "bulletList":
      return <ul key={key}>{kids()}</ul>;
    case "orderedList": {
      const start = node.attrs?.start;
      return (
        <ol key={key} start={typeof start === "number" ? start : undefined}>
          {kids()}
        </ol>
      );
    }
    case "listItem":
      return <li key={key}>{kids()}</li>;
    case "image": {
      const src = node.attrs?.src;
      if (!isArticleImageSrc(src)) return null;
      const caption = typeof node.attrs?.caption === "string" ? node.attrs.caption : "";
      return (
        <figure key={key}>
          <Img src={src} />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      );
    }
    case "footnote": {
      const note = typeof node.attrs?.note === "string" ? node.attrs.note : "";
      if (!note) return null;
      ctx.notes.push(note);
      const n = ctx.notes.length;
      return (
        <sup key={key} className="fn-ref">
          <a href={`#fn-${n}`} id={`fnref-${n}`} aria-label={`Note ${n}`}>
            {n}
          </a>
        </sup>
      );
    }
    case "horizontalRule":
      return <hr key={key} />;
    case "hardBreak":
      return <br key={key} />;
    default:
      return null;
  }
}

// Draws a saved article. No editor code is loaded for readers: this is plain React.
export function ArticleBody({ doc }: { doc: DocNode }) {
  const ctx: Ctx = { notes: [] };
  const body = (doc.content ?? []).map((node, i) => renderNode(node, String(i), ctx));
  return (
    <>
      <div className="article-prose" data-indent={doc.attrs?.indent === true ? "true" : undefined}>
        {body}
      </div>
      {ctx.notes.length > 0 && (
        <aside className="article-notes" aria-label="Notes">
          <ol>
            {ctx.notes.map((note, i) => (
              <li key={i} id={`fn-${i + 1}`}>
                {note}{" "}
                <a href={`#fnref-${i + 1}`} aria-label="Back to the text">
                  ↩
                </a>
              </li>
            ))}
          </ol>
        </aside>
      )}
    </>
  );
}