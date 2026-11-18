import { Field, Input, Textarea } from "@/components/ui/Field";
import { Img } from "@/components/ui/Img";
import { ImageInput } from "@/components/ui/ImageInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { mediaConfig } from "@/config/media";
import { isoToLocalInput } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import type { BlockStatus, BlockView } from "@/types/block";
import type { FormAction } from "@/types/form";
import { SortableList } from "./SortableList";

type Actions = {
  update: FormAction;
  remove: FormAction;
  move: FormAction;
  setFlag: FormAction;
  reorder: FormAction;
};
type Props = { blocks: BlockView[]; actions: Actions };

const statusLabel: Record<BlockStatus, string> = {
  live: "Live",
  hidden: "Hidden",
  scheduled: "Scheduled",
  expired: "Expired",
};

type MiniProps = {
  action: FormAction;
  id: string;
  fields?: Record<string, string>;
  label: string;
  ariaLabel?: string;
  disabled?: boolean;
};

function MiniForm({ action, id, fields = {}, label, ariaLabel, disabled }: MiniProps) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <SubmitButton size="sm" pendingLabel="..." aria-label={ariaLabel} disabled={disabled}>
        {label}
      </SubmitButton>
    </form>
  );
}

function RemoveBox({ name, value, label }: { name: string; value?: string; label: string }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" name={name} value={value} className="accent-accent" />
      {label}
    </label>
  );
}

type CardProps = { block: BlockView; index: number; total: number; actions: Actions };

function BlockCard({ block, index, total, actions }: CardProps) {
  const type = block.type;
  const hasUrl = type === "link" || type === "project" || type === "embed";
  const hasBody = type === "link" || type === "project" || type === "text";
  const hasImage = type === "link" || type === "project";
  const images = block.data.images ?? [];
  const socialLines = (block.data.items ?? []).map((item) => item.url).join("\n");
  const imageHint = `JPG, PNG or WebP, up to ${mediaConfig.maxMb} MB.`;
  const thumb = block.image_url ?? images[0] ?? null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 px-4 py-3">
        {thumb && <Img src={thumb} className="ink-border size-12 shrink-0 rounded-sm object-cover" />}
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-bold">{block.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">{type}</span>
            <span
              className={cn(
                "ink-border rounded-sm px-2 py-0.5 font-mono text-[11px] uppercase",
                block.status === "live" ? "bg-highlight" : "bg-bg text-ink-soft",
              )}
            >
              {statusLabel[block.status]}
            </span>
            {block.is_pinned && (
              <span className="ink-border rounded-sm bg-accent px-2 py-0.5 font-mono text-[11px] uppercase text-accent-ink">
                Pinned
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MiniForm action={actions.move} id={block.id} fields={{ direction: "up" }} label={"\u2191"} ariaLabel="Move up" disabled={index === 0} />
          <MiniForm action={actions.move} id={block.id} fields={{ direction: "down" }} label={"\u2193"} ariaLabel="Move down" disabled={index === total - 1} />
          <MiniForm action={actions.setFlag} id={block.id} fields={{ flag: "is_visible", value: String(!block.is_visible) }} label={block.is_visible ? "Hide" : "Show"} />
          <MiniForm action={actions.setFlag} id={block.id} fields={{ flag: "is_pinned", value: String(!block.is_pinned) }} label={block.is_pinned ? "Unpin" : "Pin"} />
        </div>
      </div>

      <details className="border-t border-line">
        <summary className="cursor-pointer list-none px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink-soft">
          Edit
        </summary>
        <div className="flex flex-col gap-4 border-t border-line p-4">
          <form action={actions.update} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={block.id} />
            <input type="hidden" name="type" value={type} />
            <div className="sm:col-span-2">
              <Field label="Title" htmlFor={`title-${block.id}`}>
                <Input id={`title-${block.id}`} name="title" defaultValue={block.title} required maxLength={80} />
              </Field>
            </div>

            {hasUrl && (
              <div className="sm:col-span-2">
                <Field
                  label={type === "embed" ? "YouTube or Spotify link" : "URL"}
                  htmlFor={`url-${block.id}`}
                  hint={type === "project" ? "Optional. Makes the card clickable." : undefined}
                >
                  <Input id={`url-${block.id}`} name="url" type="url" defaultValue={block.url ?? ""} required={type !== "project"} />
                </Field>
              </div>
            )}

            {hasBody && (
              <div className="sm:col-span-2">
                <Field label={type === "text" ? "Text" : "Description (optional)"} htmlFor={`body-${block.id}`}>
                  <Textarea
                    id={`body-${block.id}`}
                    name="body"
                    defaultValue={block.body ?? ""}
                    rows={type === "text" ? 4 : 2}
                    maxLength={500}
                    required={type === "text"}
                  />
                </Field>
              </div>
            )}

            {hasImage && (
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Field
                  label={type === "project" ? "Cover image" : "Photo"}
                  htmlFor={`image-${block.id}`}
                  hint={`${block.image_url ? "Choose a file to replace it. " : "Optional. "}${imageHint}`}
                >
                  <ImageInput
                    id={`image-${block.id}`}
                    name="image"
                    kind={type === "project" ? "cover" : "photo"}
                    accept={mediaConfig.accept}
                  />
                </Field>
                {block.image_url && <RemoveBox name="remove_image" label="Remove the current image" />}
              </div>
            )}

            {type === "gallery" && (
              <div className="flex flex-col gap-3 sm:col-span-2">
                {images.length > 0 && (
                  <ul className="grid grid-cols-3 gap-2">
                    {images.map((src) => (
                      <li key={src} className="flex flex-col gap-1">
                        <Img src={src} className="ink-border aspect-square w-full rounded-sm object-cover" />
                        <RemoveBox name="remove_images" value={src} label="Remove" />
                      </li>
                    ))}
                  </ul>
                )}
                <Field
                  label="Add images"
                  htmlFor={`images-${block.id}`}
                  hint={`${images.length} of ${mediaConfig.maxGallery} used. ${imageHint}`}
                >
                  <ImageInput
                    id={`images-${block.id}`}
                    name="images"
                    kind="gallery"
                    accept={mediaConfig.accept}
                    multiple
                  />
                </Field>
              </div>
            )}

            {type === "socials" && (
              <div className="sm:col-span-2">
                <Field label="Links" htmlFor={`links-${block.id}`} hint={`One link per line, up to ${mediaConfig.maxSocials}.`}>
                  <Textarea id={`links-${block.id}`} name="links" defaultValue={socialLines} rows={4} required />
                </Field>
              </div>
            )}

            {type === "countdown" && (
              <div className="sm:col-span-2">
                <Field label="Counts down to" htmlFor={`target-${block.id}`}>
                  <Input
                    id={`target-${block.id}`}
                    name="target"
                    type="datetime-local"
                    defaultValue={isoToLocalInput(block.data.target ?? null)}
                    required
                  />
                </Field>
              </div>
            )}

            <Field label="Show from" htmlFor={`pub-${block.id}`}>
              <Input id={`pub-${block.id}`} name="publish_at" type="datetime-local" defaultValue={isoToLocalInput(block.publish_at)} />
            </Field>
            <Field label="Hide after" htmlFor={`exp-${block.id}`}>
              <Input id={`exp-${block.id}`} name="expire_at" type="datetime-local" defaultValue={isoToLocalInput(block.expire_at)} />
            </Field>
            <div className="sm:col-span-2">
              <SubmitButton variant="accent" size="sm">Save changes</SubmitButton>
            </div>
          </form>

          <details>
            <summary className="cursor-pointer list-none font-mono text-xs uppercase tracking-widest text-ink-soft">
              Delete this block
            </summary>
            <form action={actions.remove} className="mt-2">
              <input type="hidden" name="id" value={block.id} />
              <SubmitButton size="sm" variant="danger">Confirm delete</SubmitButton>
            </form>
          </details>
        </div>
      </details>
    </>
  );
}

export function BlockEditorList({ blocks, actions }: Props) {
  if (blocks.length === 0) {
    return <p className="font-mono text-sm text-ink-soft">No blocks yet. Add your first one above.</p>;
  }

  const items = blocks.map((block, index) => ({
    id: block.id,
    node: <BlockCard block={block} index={index} total={blocks.length} actions={actions} />,
  }));

  // The key resets the list whenever the saved order changes.
  return (
    <SortableList
      key={blocks.map((b) => b.id).join(",")}
      items={items}
      onReorder={actions.reorder}
    />
  );
}