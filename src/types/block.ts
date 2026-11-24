export const blockTypes = [
  "link",
  "header",
  "text",
  "embed",
  "gallery",
  "socials",
  "countdown",
  "project",
] as const;
export type BlockType = (typeof blockTypes)[number];
export type BlockStatus = "live" | "hidden" | "scheduled" | "expired";

// How an item of Projects or Writing looks (the Home slider and its own page).
export const itemShapes = ["card", "button", "text"] as const;
export type ItemShape = (typeof itemShapes)[number];

export type SocialItem = { label: string; url: string };

// Image or GIF inside a link or project card (blocks.data.media).
// Labels, defaults and heights are in config/card.ts.
export const mediaFits = ["cover", "contain"] as const;
export const mediaPositions = ["center", "top", "bottom"] as const;
export const mediaPlacements = ["behind", "below"] as const;
export const mediaHeights = ["sm", "md", "lg"] as const;
export type MediaFit = (typeof mediaFits)[number];
export type MediaPosition = (typeof mediaPositions)[number];
export type MediaPlacement = (typeof mediaPlacements)[number];
export type MediaHeight = (typeof mediaHeights)[number];

export type CardMedia = {
  url: string;
  kind: "image" | "gif";
  opacity: number; // 0 to 100
  fit: MediaFit;
  position: MediaPosition;
  placement: MediaPlacement;
  height: MediaHeight; // only used when placement is "below"
};

// Extra per-type data stored in blocks.data (jsonb).
export type BlockData = {
  images?: string[]; // gallery
  items?: SocialItem[]; // socials
  target?: string; // countdown, ISO date
  media?: CardMedia; // link and project cards
  home?: boolean; // item of Projects or Writing that is also shown on Home
  shape?: ItemShape; // missing = card
  nexus?: string; // Nexus Mods download link
  github?: string; // GitHub release link
};

export type Block = {
  id: string;
  user_id: string;
  type: BlockType;
  title: string;
  url: string | null;
  body: string | null;
  image_url: string | null;
  data: BlockData;
  position: number;
  page: "home" | "projects" | "writing";
  is_visible: boolean;
  is_pinned: boolean;
  publish_at: string | null;
  expire_at: string | null;
  created_at: string;
};

export type BlockView = Block & { status: BlockStatus };
