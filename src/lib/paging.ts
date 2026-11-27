// Reads ?page=N. A missing or broken value is page 1.
export function readPage(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = raw && /^\d{1,6}$/.test(raw) ? Number(raw) : 1;
  return n >= 1 ? n : 1;
}

export type Paged<T> = { items: T[]; page: number; pages: number; total: number };

// One page of a list. The caller shows "not found" when page is bigger than pages.
export function paginate<T>(all: T[], page: number, size: number): Paged<T> {
  const total = all.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const start = (page - 1) * size;
  return { items: all.slice(start, start + size), page, pages, total };
}