"use client";

import { Image } from "@tiptap/extension-image";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { Img } from "@/components/ui/Img";
import { articleLimits } from "@/config/article";
import { cn } from "@/lib/utils";

// How a picture looks inside the editor: the picture and a caption box under it.
function ImageView({ node, selected, updateAttributes }: NodeViewProps) {
  const src = typeof node.attrs.src === "string" ? node.attrs.src : "";
  const caption = typeof node.attrs.caption === "string" ? node.attrs.caption : "";
  return (
    <NodeViewWrapper as="figure" className={cn(selected && "is-selected")}>
      <div data-drag-handle>
        <Img src={src} />
      </div>
      <input
        value={caption}
        maxLength={articleLimits.caption}
        placeholder="Caption (optional)"
        aria-label="Picture caption"
        onChange={(e) => updateAttributes({ caption: e.target.value })}
      />
    </NodeViewWrapper>
  );
}

// The standard Tiptap picture plus a caption.
export const ArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: "",
        parseHTML: (el: HTMLElement) => el.getAttribute("data-caption") ?? "",
        renderHTML: (attrs: Record<string, unknown>) =>
          typeof attrs.caption === "string" && attrs.caption !== "" ? { "data-caption": attrs.caption } : {},
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});