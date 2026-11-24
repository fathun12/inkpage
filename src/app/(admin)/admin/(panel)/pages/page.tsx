import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PagesForm } from "@/components/admin/PagesForm";
import { ButtonLink } from "@/components/ui/Button";
import { FlashNotice } from "@/components/ui/FlashNotice";
import { readSite } from "@/config/site-content";
import { routes } from "@/config/site";
import { requireUser } from "@/features/auth/queries";
import { getProfileById } from "@/features/profile/queries";
import { saveSiteAction, signSiteUploadAction } from "@/features/site/actions";
import { savedText } from "@/lib/flash";

export const metadata: Metadata = { title: "Pages" };

type Props = { searchParams: Promise<{ error?: string; saved?: string; t?: string }> };

export default async function PagesPage({ searchParams }: Props) {
  const { error, saved, t } = await searchParams;
  const user = await requireUser();
  const profile = await getProfileById(user.id);
  if (!profile) redirect(routes.setup);

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-black">Pages</h1>
        <div className="flex gap-2">
          <ButtonLink href={routes.links} size="sm">Links</ButtonLink>
          <ButtonLink href={routes.customize} variant="studio" size="sm">Customize</ButtonLink>
        </div>
      </div>
      {error && <FlashNotice key={t} tone="error">{error}</FlashNotice>}
      {saved && <FlashNotice key={t} tone="ok">{savedText(saved)}</FlashNotice>}
      <PagesForm
        key={`form-${t ?? "initial"}`}
        action={saveSiteAction}
        sign={signSiteUploadAction}
        site={readSite(profile.site)}
      />
    </div>
  );
}