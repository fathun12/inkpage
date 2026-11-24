// The books of the owner's Biblia library, as read from its public endpoint.
export type BibliaBook = {
  slug: string;
  title: string;
  authors: string[];
  year: number | null;
  cover: string | null;
  available: boolean;
  href: string;
};

export type BibliaData = { titles: number; books: BibliaBook[] };