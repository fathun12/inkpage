import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ItemGrid } from "@/components/site/ItemGrid";
import { PageIntro } from "@/components/site/PageIntro";
import { readSite } from "@/config/site-content";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { listBlocks } from "@/lib/site-view";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) return { title: "Not found" };
  return { title: `${readSite(profile.site).writing.title ?? "Writing"} · ${profile.display_name}` };
}

export default async function WritingPage({ params }: Props) {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) notFound();

  const site = readSite(profile.site);
  const rows = listBlocks(await getPublicBlocks(profile.id), "writing");

  return (
    <>
      <PageIntro title={site.writing.title ?? "Writing"} intro={site.writing.intro} />
      {rows.length > 0 ? (
        <ItemGrid blocks={rows} />
      ) : (
        <p className="mx-auto max-w-5xl px-5 pb-24 text-ink-soft sm:px-8">Nothing here yet.</p>
      )}
    </>
  );
}