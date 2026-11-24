import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AboutForm, FooterForm, HomeForm, PageTextForm } from "@/components/admin/PagesForm";
import { PagesTabs } from "@/components/admin/PagesTabs";
import { ProjectItems } from "@/components/admin/ProjectItems";
import { WritingItems } from "@/components/admin/WritingItems";
import { ButtonLink } from "@/components/ui/Button";
import { FlashNotice } from "@/components/ui/FlashNotice";
import { resolveTab } from "@/config/item-data";
import { readSite } from "@/config/site-content";
import { routes } from "@/config/site";
import { requireUser } from "@/features/auth/queries";
import { deleteBlockAction, reorderBlocksAction, setBlockFlagAction } from "@/features/blocks/actions";
import { getOwnBlocks } from "@/features/blocks/queries";
import { getProfileById } from "@/features/profile/queries";
import { saveSiteAction, signSiteUploadAction } from "@/features/site/actions";
import { saveProjectAction, saveWritingAction } from "@/features/site/items";
import { savedText } from "@/lib/flash";

export const metadata: Metadata = { title: "Pages" };

type Props = { searchParams: Promise<{ error?: string; saved?: string; t?: string; tab?: string }> };

const barActions = { remove: deleteBlockAction, setFlag: setBlockFlagAction, reorder: reorderBlocksAction };

export default async function PagesPage({ searchParams }: Props) {
  const { error, saved, t, tab: rawTab } = await searchParams;
  const tab = resolveTab(rawTab);
  const user = await requireUser();
  const profile = await getProfileById(user.id);
  if (!profile) redirect(routes.setup);
  const blocks = await getOwnBlocks(user.id);
  const site = readSite(profile.site);
  const formKey = `${tab}-${t ?? "initial"}`;

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-black">Pages</h1>
        <div className="flex gap-2">
          <ButtonLink href={routes.links} size="sm">Links</ButtonLink>
          <ButtonLink href={routes.customize} variant="studio" size="sm">Customize</ButtonLink>
        </div>
      </div>
      <PagesTabs current={tab} />
      {error && <FlashNotice key={t} tone="error">{error}</FlashNotice>}
      {saved && <FlashNotice key={t} tone="ok">{savedText(saved)}</FlashNotice>}

      {tab === "home" && <HomeForm key={formKey} action={saveSiteAction} sign={signSiteUploadAction} site={site} />}

      {tab === "projects" && (
        <>
          <PageTextForm key={formKey} tab="projects" name="Projects" value={site.projects} action={saveSiteAction} />
          <ProjectItems
            key={`items-${formKey}`}
            blocks={blocks}
            actions={{ ...barActions, save: saveProjectAction }}
            sign={signSiteUploadAction}
          />
        </>
      )}

      {tab === "writing" && (
        <>
          <PageTextForm key={formKey} tab="writing" name="Writing" value={site.writing} action={saveSiteAction} />
          <WritingItems
            key={`items-${formKey}`}
            blocks={blocks}
            actions={{ ...barActions, save: saveWritingAction }}
            sign={signSiteUploadAction}
          />
        </>
      )}

      {tab === "about" && <AboutForm key={formKey} action={saveSiteAction} sign={signSiteUploadAction} site={site} />}
      {tab === "footer" && <FooterForm key={formKey} action={saveSiteAction} site={site} />}
    </div>
  );
}