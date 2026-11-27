import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StudioPreview } from "@/components/admin/studio/StudioPreview";
import type { ContentsItem } from "@/components/site/HeroContents";
import { readBackground } from "@/config/background";
import { readFonts } from "@/config/font-choices";
import { readSite } from "@/config/site-content";
import { readSiteStyle } from "@/config/site-style";
import { routes } from "@/config/site";
import { shopConfig } from "@/config/shop";
import { getPublicArticles } from "@/features/articles/queries";
import { requireUser } from "@/features/auth/queries";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileById } from "@/features/profile/queries";
import { getPublicShop } from "@/features/shop/public";
import { fetchBiblia } from "@/features/site/biblia";
import { fetchDesigns } from "@/features/site/designs";
import { fetchGithub } from "@/features/site/github";
import { fetchSteam } from "@/features/site/steam";
import {
  buildNav,
  homeCountdown,
  homeProjects,
  homeShowcase,
  homeWriting,
  listBlocks,
  resolveHomeMedia,
  socialsOf,
} from "@/lib/site-view";

export const metadata: Metadata = { title: "Preview", robots: { index: false } };

// The page shown inside the Customize studio. It is Home as a visitor sees it (same data, same menu, same bars),
// but the studio sends it the draft, so the unsaved settings show at once. Only the owner can open it.
export default async function PreviewPage() {
  const user = await requireUser();
  const profile = await getProfileById(user.id);
  if (!profile) redirect(routes.setup);

  const blocks = await getPublicBlocks(profile.id);
  const site = readSite(profile.site);
  const base = routes.profile(profile.username);

  const [biblia, designs, github, steam, shop, articles] = await Promise.all([
    fetchBiblia(site.bibliaUrl, 6),
    fetchDesigns(site.designsUrl, 6),
    fetchGithub(site.githubUser),
    fetchSteam(site.steamId),
    getPublicShop(profile.id),
    getPublicArticles(profile.id),
  ]);
  const shopItems = shop.products.filter((p) => p.show_on_home).slice(0, shopConfig.homeMax);
  const shopTitle = shop.settings.home_title ?? "Shop";

  const rows = listBlocks(blocks, "home");
  const projects = homeProjects(blocks);
  const writing = homeWriting(blocks);
  const showcase = homeShowcase(blocks);
  const countdown = homeCountdown(blocks);
  const media = resolveHomeMedia(site, readBackground(profile), blocks);

  const contents = [
    countdown && { id: "countdown", label: "Countdown" },
    writing.length > 0 && { id: "writing", label: site.cardsTitle ?? site.writing.title ?? "Writing" },
    articles.length > 0 && { id: "articles", label: site.articles.title ?? "Articles" },
    projects.length > 0 && { id: "projects", label: site.projects.title ?? "Projects" },
    biblia && biblia.books.length > 0 && { id: "biblia", label: site.bibliaTitle ?? "Biblia" },
    github && { id: "github", label: site.githubTitle ?? "GitHub" },
    shopItems.length > 0 && { id: "shop", label: shopTitle },
    rows.length > 0 && { id: "links", label: "Links" },
    showcase.length > 0 && { id: "showcase", label: site.showcaseTitle ?? "Showcase" },
    designs && designs.projects.length > 0 && { id: "designs", label: site.designsTitle ?? "Design" },
    site.visits.length > 0 && { id: "visit", label: site.visitTitle ?? "Visit website" },
    media.gallery.length > 0 && { id: "gallery", label: "Gallery" },
  ].filter((item): item is ContentsItem => Boolean(item));

  return (
    <StudioPreview
      profile={{ username: profile.username, displayName: profile.display_name, bio: profile.bio }}
      fonts={readFonts(profile)}
      style={readSiteStyle(profile.site_style)}
      site={site}
      media={media}
      rows={rows.slice(0, 6)}
      projects={projects.slice(0, 6)}
      showcase={showcase}
      countdown={countdown}
      articles={articles}
      cards={writing.slice(0, 6)}
      socials={socialsOf(blocks)}
      nav={buildNav(base, site, { label: shopTitle }, articles.length > 0)}
      biblia={biblia}
      designs={designs}
      github={github}
      steam={steam}
      shopItems={shopItems}
      shopOpen={shop.settings.is_open}
      shopTitle={shopTitle}
      shopBase={routes.section(profile.username, "shop")}
      contents={contents}
    />
  );
}