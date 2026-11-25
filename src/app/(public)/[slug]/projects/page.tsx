import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/site/PageIntro";
import { ProjectList } from "@/components/site/ProjectList";
import { readSite } from "@/config/site-content";
import { readSiteStyle } from "@/config/site-style";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { listBlocks } from "@/lib/site-view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) return { title: "Not found" };
  return { title: `${readSite(profile.site).projects.title ?? "Projects"} · ${profile.display_name}` };
}

export default async function ProjectsPage({ params }: Props) {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) notFound();

  const site = readSite(profile.site);
  const style = readSiteStyle(profile.site_style);
  const rows = listBlocks(await getPublicBlocks(profile.id), "projects");

  return (
    <>
      <PageIntro title={site.projects.title ?? "Projects"} intro={site.projects.intro} />
      {rows.length > 0 ? (
        <ProjectList
          blocks={rows}
          mode="page"
          slide={{ seconds: style.heroSeconds, autoplay: style.motion !== "off" }}
        />
      ) : (
        <p className="mx-auto max-w-5xl px-5 pb-24 text-ink-soft sm:px-8">Nothing here yet.</p>
      )}
    </>
  );
}