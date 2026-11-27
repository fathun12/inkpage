// Structured data for search engines: a script tag with the data written safely.
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // "<" is escaped, so text from an article can never close the script tag.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}