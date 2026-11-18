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

export type SocialItem = { label: string; url: string };

// Extra per-type data stored in blocks.data (jsonb).
export type BlockData = {
  images?: string[]; // gallery
  items?: SocialItem[]; // socials
  target?: string; // countdown, ISO date
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
  is_visible: boolean;
  is_pinned: boolean;
  publish_at: string | null;
  expire_at: string | null;
  created_at: string;
};

export type BlockView = Block & { status: BlockStatus };
