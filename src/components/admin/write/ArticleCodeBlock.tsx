"use client";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { NodeViewContent, NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { codeLanguages } from "@/config/code-languages";

// A code block with the language picker at its top left corner.
function CodeBlockView({ node, updateAttributes }: NodeViewProps) {
  const raw: unknown = node.attrs.language;
  const language = typeof raw === "string" && raw !== "" ? raw : "plaintext";
  return (
    <NodeViewWrapper className="code-block">
      <div className="code-block-head" contentEditable={false}>
        <select
          value={language}
          onChange={(e) => updateAttributes({ language: e.target.value })}
          aria-label="Code language"
          className="code-lang"
        >
          {codeLanguages.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
      <pre spellCheck={false}>
        <NodeViewContent />
      </pre>
    </NodeViewWrapper>
  );
}

export const ArticleCodeBlock = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },
});