import type { Metadata } from "next";
import { BlockCreateForm } from "@/components/admin/BlockCreateForm";
import { BlockEditorList } from "@/components/admin/BlockEditorList";
import { Notice } from "@/components/ui/Notice";
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

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LinksPage({ searchParams }: Props) {
  const { error } = await searchParams;
  const user = await requireUser();
  const blocks = await getOwnBlocks(user.id);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-4xl font-black">Links</h1>
      {error && <Notice>{error}</Notice>}
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