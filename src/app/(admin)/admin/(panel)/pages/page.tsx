import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageItems } from "@/components/admin/PageItems";
import { PagesForm } from "@/components/admin/PagesForm";
import { ButtonLink } from "@/components/ui/Button";
import { FlashNotice } from "@/components/ui/FlashNotice";
import { readSite } from "@/config/site-content";
import { routes } from "@/config/site";
import { requireUser } from "@/features/auth/queries";
import {
  createBlockAction,
  deleteBlockAction,
  reorderBlocksAction,
  setBlockFlagAction,
  updateBlockAction,
} from "@/features/blocks/actions";
import { getOwnBlocks } from "@/features/blocks/queries";
import { getProfileById } from "@/features/profile/queries";
import { saveSiteAction, signSiteUploadAction } from "@/features/site/actions";
import { savedText } from "@/lib/flash";

export const metadata: Metadata = { title: "Pages" };

type Props = { searchParams: Promise<{ error?: string; saved?: string; t?: string }> };

const itemActions = {
  create: createBlockAction,
  update: updateBlockAction,
  remove: deleteBlockAction,
  setFlag: setBlockFlagAction,
  reorder: reorderBlocksAction,
};

export default async function PagesPage({ searchParams }: Props) {
  const { error, saved, t } = await searchParams;
  const user = await requireUser();
  const profile = await getProfileById(user.id);
  if (!profile) redirect(routes.setup);
  const blocks = await getOwnBlocks(user.id);

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

      <section className="flex flex-col gap-4">
        <p className="text-sm text-ink-soft">
          Items of the Projects and Writing pages are added here. Each item saves with its own button.
          Tick &quot;Also show on Home&quot; to put an item on Home as well.
        </p>
        <PageItems
          page="projects"
          title="Projects items"
          hint="Shown on the Projects page."
          all={blocks}
          actions={itemActions}
        />
        <PageItems
          page="writing"
          title="Writing items"
          hint="Shown on the Writing page."
          all={blocks}
          actions={itemActions}
        />
      </section>

      <PagesForm
        key={`form-${t ?? "initial"}`}
        action={saveSiteAction}
        sign={signSiteUploadAction}
        site={readSite(profile.site)}
      />
    </div>
  );
}