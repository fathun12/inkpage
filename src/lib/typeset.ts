// Typing helpers for the plain text boxes of the editor (title and subtitle): curly quotes, dashes and
// capital letters. The same rules as the article body (components/admin/write/ArticleTypography.ts).
// If you change a rule there, change it here too.

export type Typed = { value: string; caret: number };

const sentenceStart = /[.!?\u2026]["'\u201C\u201D\u2018\u2019)\]]*\s$/u;
const opensQuote = /[\s{[(<'"\u2018\u201C]$/;

// Takes the text and the caret right after one typed character, returns the text with the rule applied.
export function typeset(value: string, caret: number): Typed {
  const before = value.slice(0, caret);
  const after = value.slice(caret);
  const last = before.slice(-1);
  const prev = before.slice(0, -1);
  let next = before;

  if (last === '"' || last === "'") {
    const open = prev === "" || opensQuote.test(prev);
    if (last === '"') next = prev + (open ? "\u201C" : "\u201D");
    else next = prev + (open ? "\u2018" : "\u2019");
  } else if (before.endsWith("--")) {
    next = before.slice(0, -2) + "\u2014";
  } else if (/\S\s-\s$/.test(before)) {
    next = before.slice(0, -2) + "\u2013 ";
  } else if (/^\p{Ll}$/u.test(last) && (prev === "" || sentenceStart.test(prev))) {
    const upper = last.toUpperCase();
    if (upper.length === 1) next = prev + upper;
  }

  return { value: next + after, caret: next.length };
}

type BoxEvent = { currentTarget: HTMLInputElement | HTMLTextAreaElement; nativeEvent: Event };

// For an onChange of a text box: applies the rules only when ONE character was typed (not paste, delete or IME).
export function typedFrom(e: BoxEvent): Typed {
  const el = e.currentTarget;
  const value = el.value;
  const caret = el.selectionStart ?? value.length;
  if ((e.nativeEvent as InputEvent).inputType !== "insertText") return { value, caret };
  return typeset(value, caret);
}