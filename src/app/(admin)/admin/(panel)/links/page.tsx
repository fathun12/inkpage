import type { Metadata } from "next";
import { BlockCreateForm } from "@/components/admin/BlockCreateForm";
import { BlockEditorList } from "@/components/admin/BlockEditorList";
import { FlashNotice } from "@/components/ui/FlashNotice";
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

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-4xl font-black">Links</h1>
      {error && <FlashNotice key={t} tone="error">{error}</FlashNotice>}
      {saved && <FlashNotice key={t} tone="ok">{savedText(saved)}</FlashNotice>}
      <BlockCreateForm action={createBlockAction} />
      <BlockEditorList
        blocks={blocks}
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