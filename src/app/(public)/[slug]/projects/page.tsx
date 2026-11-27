import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/site/PageIntro";
import { Pager } from "@/components/site/Pager";
import { ProjectList } from "@/components/site/ProjectList";
import { SearchBox } from "@/components/site/SearchBox";
import { SearchStatus } from "@/components/site/SearchStatus";
import { pageSizes } from "@/config/paging";
import { cleanUrl } from "@/config/seo";
import { routes } from "@/config/site";
import { readSite } from "@/config/site-content";
import { readSiteStyle } from "@/config/site-style";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { readProjectItem } from "@/lib/item-data";
import { paginate, readPage } from "@/lib/paging";
import { matchesWords, readQuery } from "@/lib/search";
import { listBlocks } from "@/lib/site-view";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[]; q?: string | string[] }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const page = readPage(sp.page);
  const q = readQuery(sp.q);
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) return { title: "Not found" };
  const name = readSite(profile.site).projects.title ?? "Projects";
  // A search result page is not for Google: noindex, and no canonical.
  if (q) {
    return {
      title: `Search \u201c${q}\u201d \u00b7 ${name} \u00b7 ${profile.display_name}`,
      robots: { index: false, follow: true },
    };
  }
  // Every page points to itself, so Google keeps page 2 and later as their own pages.
  const clean = cleanUrl(profile.username, "/projects");
  const canonical = clean && page > 1 ? `${clean}?page=${page}` : clean;
  return {
    title: `${page > 1 ? `${name} (page ${page})` : name} \u00b7 ${profile.display_name}`,
    alternates: canonical ? { canonical } : undefined,
  };
}

// The projects in the order the owner set, in pages of 6. ?q=x searches titles, descriptions and link names.
export default async function ProjectsPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = readPage(sp.page);
  const q = readQuery(sp.q);
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) notFound();

  const site = readSite(profile.site);
  const style = readSiteStyle(profile.site_style);
  // Header blocks are never drawn on this page, so they are left out before the list is split into pages.
  const all = listBlocks(await getPublicBlocks(profile.id), "projects").filter((b) => b.type !== "header");
  const rows = q
    ? all.filter((block) => {
        const item = readProjectItem(block);
        const text = `${item.title} ${item.body ?? ""} ${item.links.map((link) => link.label).join(" ")}`;
        return matchesWords(text, q);
      })
    : all;
  const paged = paginate(rows, page, pageSizes.projects);
  if (page > paged.pages) notFound();

  const projectsUrl = routes.section(profile.username, "projects");
  const pagerBase = q ? `${projectsUrl}?q=${encodeURIComponent(q)}` : projectsUrl;

  return (
    <>
      <PageIntro title={site.projects.title ?? "Projects"} intro={site.projects.intro} />
      {all.length > 0 && (
        <SearchBox
          id="projects-search"
          value={q}
          placeholder="Search titles, descriptions, or links"
          label="Search projects"
        />
      )}
      {q && <SearchStatus query={q} count={rows.length} clearHref={projectsUrl} />}
      {rows.length > 0 ? (
        <>
          <ProjectList
            blocks={paged.items}
            mode="page"
            slide={{ seconds: style.heroSeconds, autoplay: style.motion !== "off" }}
          />
          <Pager base={pagerBase} page={page} pages={paged.pages} label="Projects pages" />
        </>
      ) : (
        <p className="mx-auto max-w-5xl px-5 pb-24 text-ink-soft sm:px-8">
          {q ? `Nothing found for \u201c${q}\u201d.` : "Nothing here yet."}
        </p>
      )}
    </>
  );
}