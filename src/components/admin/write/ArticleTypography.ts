import { Extension, textInputRule } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

// A sentence starts after . ! ? or an ellipsis (with an optional closing quote or bracket) and a space.
const sentenceStart = /[.!?…]["'“”‘’)\]]*\s$/u;

// Typing helpers of the article editor: dashes and capital letters.
export const ArticleTypography = Extension.create({
  name: "articleTypography",

  addInputRules() {
    return [
      // Two hyphens become an em dash.
      textInputRule({ find: /--$/, replace: "—" }),
      // Space, hyphen, space after a word becomes an en dash with its spaces.
      textInputRule({ find: /\S\s(-)\s$/, replace: "–" }),
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("articleAutoCapital"),
        props: {
          // A lowercase letter typed at the start of a paragraph or sentence is written as a capital instead.
          handleTextInput(view, from, to, text) {
            if (!/^\p{Ll}$/u.test(text)) return false;
            const { state } = view;
            const parent = state.doc.resolve(from).parent;
            if (!parent.isTextblock || parent.type.spec.code) return false;
            const before = parent.textBetween(0, state.doc.resolve(from).parentOffset, undefined, "\ufffc");
            if (before !== "" && !sentenceStart.test(before)) return false;
            view.dispatch(state.tr.insertText(text.toUpperCase(), from, to));
            return true;
          },
        },
      }),
    ];
  },
});