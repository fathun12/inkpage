// Languages offered in a code block. The ids are highlight.js names that lowlight's "common" set knows.
export const codeLanguages = [
  { id: "plaintext", label: "Plain text" },
  { id: "bash", label: "Bash" },
  { id: "c", label: "C" },
  { id: "cpp", label: "C++" },
  { id: "csharp", label: "C#" },
  { id: "css", label: "CSS" },
  { id: "diff", label: "Diff" },
  { id: "go", label: "Go" },
  { id: "java", label: "Java" },
  { id: "javascript", label: "JavaScript" },
  { id: "json", label: "JSON" },
  { id: "kotlin", label: "Kotlin" },
  { id: "markdown", label: "Markdown" },
  { id: "php", label: "PHP" },
  { id: "python", label: "Python" },
  { id: "ruby", label: "Ruby" },
  { id: "rust", label: "Rust" },
  { id: "sql", label: "SQL" },
  { id: "swift", label: "Swift" },
  { id: "typescript", label: "TypeScript" },
  { id: "xml", label: "HTML / XML" },
  { id: "yaml", label: "YAML" },
] as const;

export type CodeLanguageId = (typeof codeLanguages)[number]["id"];

export function isCodeLanguage(value: unknown): value is CodeLanguageId {
  return typeof value === "string" && codeLanguages.some((language) => language.id === value);
}

export function languageLabel(id: string | null | undefined): string {
  return codeLanguages.find((language) => language.id === id)?.label ?? "Plain text";
}