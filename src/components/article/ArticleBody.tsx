import type { ReactNode } from "react";
import { isSafeHref } from "@/lib/article-doc";
import type { DocMark, DocNode } from "@/types/article";

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

function renderNode(node: DocNode, key: string): ReactNode {
  const kids = (): ReactNode[] => (node.content ?? []).map((child, i) => renderNode(child, `${key}.${i}`));
  switch (node.type) {
    case "text":
      return (node.marks ?? []).reduce<ReactNode>((acc, mark, i) => wrap(acc, mark, `${key}m${i}`), node.text ?? "");
    case "paragraph": {
      const content = kids();
      return <p key={key}>{content.length > 0 ? content : <br />}</p>;
    }
    case "heading":
      return node.attrs?.level === 3 ? <h3 key={key}>{kids()}</h3> : <h2 key={key}>{kids()}</h2>;
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
  return <div className="article-prose">{(doc.content ?? []).map((node, i) => renderNode(node, String(i)))}</div>;
}