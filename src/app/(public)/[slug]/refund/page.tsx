import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalText } from "@/components/shop/LegalText";
import { PageIntro } from "@/components/site/PageIntro";
import { getLegal } from "@/features/shop/public";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const legal = await getLegal(slug, "refund");
  return { title: legal ? `${legal.title} · ${legal.profile.display_name}` : "Not found" };
}

export default async function RefundPage({ params }: Props) {
  const { slug } = await params;
  const legal = await getLegal(slug, "refund");
  if (!legal) notFound();
  return (
    <>
      <PageIntro title={legal.title} intro={null} />
      <LegalText text={legal.text} email={legal.email} shopHref={legal.shopHref} />
    </>
  );
}