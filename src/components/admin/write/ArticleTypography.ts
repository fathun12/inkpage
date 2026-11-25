import { Extension, InputRule, textInputRule } from "@tiptap/core";

// Typing helpers of the article editor: dashes and capital letters.
// Backspace right after one of them gives back what you typed.
export const ArticleTypography = Extension.create({
  name: "articleTypography",

  addInputRules() {
    return [
      // Two hyphens become an em dash.
      textInputRule({ find: /--$/, replace: "—" }),
      // Space, hyphen, space after a word becomes an en dash with its spaces.
      textInputRule({ find: /\S\s(-)\s$/, replace: "–" }),
      // The first letter of a paragraph, or of a sentence after . ! ? and a space, becomes a capital.
      new InputRule({
        find: /(?:^|[.!?…]["'“”‘’)\]]*\s)(\p{Ll})$/u,
        handler: ({ state, range, match }) => {
          state.tr.insertText(match[1].toUpperCase(), range.to, range.to);
        },
      }),
    ];
  },
});