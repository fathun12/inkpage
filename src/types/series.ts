// A series groups articles into numbered parts (Phase 28c).
export type Series = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  created_at: string;
  updated_at: string;
};

// Admin: with the number of articles in it (drafts included).
export type OwnSeries = Series & { articleCount: number };

// What the drawer of the editor needs to offer the choice.
export type SeriesOption = { id: string; title: string };