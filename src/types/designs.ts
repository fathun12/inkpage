// Published projects (houses and furniture) of the owner's House Showcase website, from its public endpoint.
export type DesignKind = "house" | "furniture";

export type DesignProject = {
  slug: string;
  kind: DesignKind;
  title: string;
  tagline: string;
  cover: string | null;
  // Documentation photos, already in random order (up to 12). They slide on the card.
  photos: string[];
  href: string;
};

export type DesignsData = { total: number; projects: DesignProject[] };