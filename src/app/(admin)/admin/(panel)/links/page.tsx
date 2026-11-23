import type { Metadata } from "next";
import { BlockCreateForm } from "@/components/admin/BlockCreateForm";
import { BlockEditorList } from "@/components/admin/BlockEditorList";
import { ButtonLink } from "@/components/ui/Button";
import { FlashNotice } from "@/components/ui/FlashNotice";
import { mediaConfig } from "@/config/media";
import { routes } from "@/config/site";
import { savedText } from "@/lib/flash";
import { requireUser } from "@/features/auth/queries";
import {
  createBlockAction,
  deleteBlockAction,
  moveBlockAction,
  reorderBlocksAction,
  setBlockFlagAction,
  updateBlockAction,
} from "@/features/blocks/actions";
import { getOwnBlocks } from "@/features/blocks/queries";

export const metadata: Metadata = { title: "Links" };

type Props = { searchParams: Promise<{ error?: string; saved?: string; t?: string }> };

export default async function LinksPage({ searchParams }: Props) {
  const { error, saved, t } = await searchParams;
  const user = await requireUser();
  const blocks = await getOwnBlocks(user.id);
  const gifCount = blocks.filter((b) => b.data.media?.kind === "gif").length;
  const allowGif = gifCount < mediaConfig.cardMedia.maxAnimatedPerPage;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-4xl font-black">Links</h1>
        <div className="flex gap-2">
          <ButtonLink href={routes.pages} variant="studio">Pages</ButtonLink>
          <ButtonLink href={routes.customize} variant="studio">Customize</ButtonLink>
        </div>
      </div>
      {error && <FlashNotice key={t} tone="error">{error}</FlashNotice>}
      {saved && <FlashNotice key={t} tone="ok">{savedText(saved)}</FlashNotice>}
      <BlockCreateForm action={createBlockAction} allowGif={allowGif} />
      <BlockEditorList
        blocks={blocks}
        gifCount={gifCount}
        actions={{
          update: updateBlockAction,
          remove: deleteBlockAction,
          move: moveBlockAction,
          reorder: reorderBlocksAction,
          setFlag: setBlockFlagAction,
        }}
      />
    </div>
  );
}