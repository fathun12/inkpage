import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BibliaGrid } from "@/components/site/BibliaGrid";
import { PageIntro } from "@/components/site/PageIntro";
import { readSite } from "@/config/site-content";
import { getProfileByUsername } from "@/features/profile/queries";
import { fetchBiblia } from "@/features/site/biblia";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) return { title: "Not found" };
  return { title: `${readSite(profile.site).bibliaTitle ?? "Biblia"} · ${profile.display_name}` };
}

export default async function BibliaPage({ params }: Props) {
  const { slug } = await params;
  const profile = await getProfileByUsername(slug.toLowerCase());
  if (!profile) notFound();

  const site = readSite(profile.site);
  if (!site.bibliaUrl) notFound();
  const data = await fetchBiblia(site.bibliaUrl, 24);

  return (
    <>
      <PageIntro
        title={site.bibliaTitle ?? "Biblia"}
        intro={site.bibliaIntro ?? "A private home library. Browse the shelves here, then come by to borrow."}
      />
      <div className="mx-auto max-w-5xl px-5 pb-10 sm:px-8">
        <a
          href={site.bibliaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-ink px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors duration-(--dur-base) hover:bg-ink hover:text-bg"
        >
          Open Biblia ↗
        </a>
      </div>
      {data && data.books.length > 0 ? (
        <BibliaGrid books={data.books} bottom="pb-24" />
      ) : (
        <p className="mx-auto max-w-5xl px-5 pb-24 text-ink-soft sm:px-8">Biblia cannot be reached right now.</p>
      )}
    </>
  );
}