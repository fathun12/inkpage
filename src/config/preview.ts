// Messages between the Customize studio and its preview. The preview is a real page (/admin/preview) shown in a
// frame, so the two talk with postMessage. Only messages between the same origin are accepted.

export const previewPath = "/admin/preview";

export const previewMessages = {
  // preview -> studio: the preview page is ready to receive the draft
  ready: "inkpage-preview-ready",
  // studio -> preview: the draft (fonts and style) as it is now
  draft: "inkpage-preview-draft",
  // preview -> studio: a section was clicked
  pick: "inkpage-preview-pick",
  // studio -> preview: play the entrance of Home again
  replay: "inkpage-preview-replay",
} as const;