import type { ReactNode } from "react";
import { renderToString } from "katex";
import "katex/dist/katex.min.css";
import { Img } from "@/components/ui/Img";
import { isCodeLanguage, languageLabel } from "@/config/code-languages";
import { isArticleImageSrc, isHighlightColor, isSafeHref } from "@/lib/article-doc";
import { lowlight } from "@/lib/lowlight";
import type { DocMark, DocNode } from "@/types/article";

// Footnotes are numbered in reading order while the text is drawn; the list goes under the article.
type Ctx = { notes: string[] };

// The part of lowlight's syntax tree (hast) that we draw: text and spans with class names.
type Hast = { type: string; value?: string; properties?: { className?: unknown }; children?: Hast[] };

function renderHast(nodes: Hast[] | undefined, key: string): ReactNode[] {
  return (nodes ?? []).map((node, i) => {
    const k = `${key}.${i}`;
    if (node.type === "text") return node.value ?? "";
    if (node.type !== "element") return null;
    const raw = node.properties?.className;
    const className = Array.isArray(raw) ? raw.filter((c): c is string => typeof c === "string").join(" ") : undefined;
    return (
      <span key={k} className={className}>
        {renderHast(node.children, k)}
      </span>
    );
  });
}

// Colors the code on the server, so readers download no highlighter. Unknown language = plain text.
function codeContent(code: string, language: string | null): ReactNode {
  if (!language || language === "plaintext" || !lowlight.registered(language)) return code;
  try {
    const tree = lowlight.highlight(language, code) as unknown as { children?: Hast[] };
    return renderHast(tree.children, "c");
  } catch {
    return code;
  }
}

// A formula drawn by KaTeX on the server. A broken formula shows as red text, never as an error page.
function Formula({ latex, block }: { latex: string; block: boolean }) {
  let html: string;
  try {
    html = renderToString(latex, { displayMode: block, throwOnError: false, strict: "ignore" });
  } catch {
    return <code>{latex}</code>;
  }
  return block ? (
    <div className="math-block" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span className="math-inline" dangerouslySetInnerHTML={{ __html: html }} />
  );
}

function spanAttr(value: unknown): number | undefined {
  return typeof value === "number" && value > 1 ? value : undefined;
}

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
    case "table":
      return (
        <div key={key} className="table-scroll">
          <table>
            <tbody>{kids()}</tbody>
          </table>
        </div>
      );
    case "tableRow":
      return <tr key={key}>{kids()}</tr>;
    case "tableHeader":
      return (
        <th key={key} colSpan={spanAttr(node.attrs?.colspan)} rowSpan={spanAttr(node.attrs?.rowspan)}>
          {kids()}
        </th>
      );
    case "tableCell":
      return (
        <td key={key} colSpan={spanAttr(node.attrs?.colspan)} rowSpan={spanAttr(node.attrs?.rowspan)}>
          {kids()}
        </td>
      );
    case "codeBlock": {
      const code = (node.content ?? []).map((part) => part.text ?? "").join("");
      const raw = node.attrs?.language;
      const language = isCodeLanguage(raw) ? raw : null;
      return (
        <div key={key} className="code-block">
          <div className="code-block-head">
            <span className="code-lang">{languageLabel(language)}</span>
          </div>
          <pre tabIndex={0}>
            <code>{codeContent(code, language)}</code>
          </pre>
        </div>
      );
    }
    case "inlineMath":
    case "blockMath": {
      const latex = typeof node.attrs?.latex === "string" ? node.attrs.latex : "";
      return latex ? <Formula key={key} latex={latex} block={node.type === "blockMath"} /> : null;
    }
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