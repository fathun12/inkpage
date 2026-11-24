// A small source or copyright line at the bottom right of a media. The parent must be position: relative.
export function Credit({ text }: { text: string | null | undefined }) {
  if (!text) return null;
  return <span className="site-credit font-mono">{text}</span>;
}