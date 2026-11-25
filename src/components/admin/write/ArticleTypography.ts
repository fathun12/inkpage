import { Extension, textInputRule } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { ReplaceStep } from "@tiptap/pm/transform";

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
        // The typed letter is let into the document first, then swapped for its capital.
        // This does not depend on how the browser delivers the typing.
        appendTransaction(transactions, _oldState, state) {
          if (transactions.length !== 1) return null;
          const tr = transactions[0];
          if (!tr.docChanged || tr.steps.length !== 1) return null;
          const ui = tr.getMeta("uiEvent");
          if (ui === "paste" || ui === "drop" || tr.getMeta("paste") || tr.getMeta("composition")) return null;

          const step = tr.steps[0];
          if (!(step instanceof ReplaceStep) || step.from !== step.to) return null;
          const typed = step.slice.content;
          if (typed.childCount !== 1 || !typed.firstChild?.isText) return null;
          const letter = typed.firstChild.text ?? "";
          if (!/^\p{Ll}$/u.test(letter)) return null;
          const upper = letter.toUpperCase();
          if (upper.length !== 1 || upper === letter) return null;

          const from = step.from;
          if (from + 1 > state.doc.content.size) return null;
          const $from = state.doc.resolve(from);
          const parent = $from.parent;
          if (!parent.isTextblock || parent.type.spec.code) return null;
          if (state.doc.textBetween(from, from + 1) !== letter) return null;

          const before = parent.textBetween(0, $from.parentOffset, undefined, "\ufffc");
          if (before !== "" && !sentenceStart.test(before)) return null;

          return state.tr.insertText(upper, from, from + 1);
        },
      }),
    ];
  },
});