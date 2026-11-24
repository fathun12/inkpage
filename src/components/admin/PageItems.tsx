import type { ReactNode } from "react";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Img } from "@/components/ui/Img";
import { ImageInput } from "@/components/ui/ImageInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { mediaConfig } from "@/config/media";
import { resolvePage, type BlockPage } from "@/config/site-content";
import type { BlockView } from "@/types/block";
import type { FormAction } from "@/types/form";
import { ItemExtras } from "./ItemExtras";
import { PageSelect } from "./PageSelect";

type Actions = {
  create: FormAction;
  update: FormAction;
  remove: FormAction;
  setFlag: FormAction;
  reorder: FormAction;
};

type Props = {
  page: Exclude<BlockPage, "home">;
  title: string;
  hint: string;
  all: BlockView[];
  actions: Actions;
};

const imageHint = `Optional. JPG, PNG or WebP, up to ${mediaConfig.maxMb} MB. It is cropped to 16:9.`;

function Wide({ children }: { children: ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>;
}

type MiniProps = {
  action: FormAction;
  id: string;
  fields?: Record<string, string>;
  label: string;
  ariaLabel?: string;
  disabled?: boolean;
};

function Mini({ action, id, fields = {}, label, ariaLabel, disabled }: MiniProps) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="return_to" value="pages" />
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <SubmitButton size="sm" pendingLabel="..." aria-label={ariaLabel} disabled={disabled}>
        {label}
      </SubmitButton>
    </form>
  );
}

// New order of ALL blocks when two blocks swap places.
function swapOrder(all: BlockView[], a: string, b: string): string {
  const ids = all.map((x) => x.id);
  const i = ids.indexOf(a);
  const j = ids.indexOf(b);
  if (i < 0 || j < 0) return ids.join(",");
  [ids[i], ids[j]] = [ids[j], ids[i]];
  return ids.join(",");
}

// The items of one page (Projects or Writing): add, edit, reorder, hide, delete.
// Each item has "Also show on Home". These forms save on their own, not with the Save button of the settings.
export function PageItems({ page, title, hint, all, actions }: Props) {
  const items = all.filter(
    (b) => (b.type === "project" || b.type === "link") && resolvePage(b.page) === page,
  );

  return (
    <details open className="ink-border rounded-md bg-surface">
      <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 px-4 py-3">
        <span className="font-display text-lg font-bold">{title}</span>
        <span className="font-mono text-xs text-ink-soft">{hint}</span>
      </summary>

      <div className="flex flex-col gap-5 border-t border-line p-4">
        <form action={actions.create} className="grid gap-4 sm:grid-cols-2">
          <input type="hidden" name="type" value="project" />
          <input type="hidden" name="page" value={page} />
          <input type="hidden" name="return_to" value="pages" />
          <Wide>
            <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">Add an item</p>
          </Wide>
          <Wide>
            <Field label="Title" htmlFor={`${page}-new-title`}>
              <Input id={`${page}-new-title`} name="title" required maxLength={80} />
            </Field>
          </Wide>
          <Wide>
            <Field label="Link" htmlFor={`${page}-new-url`} hint="Where the item goes when it is clicked. Optional.">
              <Input id={`${page}-new-url`} name="url" type="url" placeholder="https://" />
            </Field>
          </Wide>
          <Wide>
            <Field label="Description" htmlFor={`${page}-new-body`} hint="Optional.">
              <Textarea id={`${page}-new-body`} name="body" rows={3} maxLength={500} />
            </Field>
          </Wide>
          <Wide>
            <Field label="Image" htmlFor={`${page}-new-image`} hint={imageHint}>
              <ImageInput id={`${page}-new-image`} name="image" kind="cover" accept={mediaConfig.accept} />
            </Field>
          </Wide>
          <ItemExtras id={`${page}-new`} />
          <Wide>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="home" className="accent-accent" />
              Also show on Home
            </label>
          </Wide>
          <Wide>
            <SubmitButton variant="accent">Add item</SubmitButton>
          </Wide>
        </form>

        {items.length === 0 ? (
          <p className="font-mono text-sm text-ink-soft">No items yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((block, index) => {
              const prev = items[index - 1];
              const next = items[index + 1];
              return (
                <li key={block.id} className="ink-border rounded-md">
                  <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                    {block.image_url && (
                      <Img src={block.image_url} className="ink-border size-12 shrink-0 rounded-sm object-cover" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-lg font-bold">{block.title}</p>
                      <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                        {block.is_visible ? "Live" : "Hidden"}
                        {block.data.home ? " · On Home" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mini
                        action={actions.reorder}
                        id={block.id}
                        fields={{ order: prev ? swapOrder(all, block.id, prev.id) : "" }}
                        label={"\u2191"}
                        ariaLabel="Move up"
                        disabled={!prev}
                      />
                      <Mini
                        action={actions.reorder}
                        id={block.id}
                        fields={{ order: next ? swapOrder(all, block.id, next.id) : "" }}
                        label={"\u2193"}
                        ariaLabel="Move down"
                        disabled={!next}
                      />
                      <Mini
                        action={actions.setFlag}
                        id={block.id}
                        fields={{ flag: "is_visible", value: String(!block.is_visible) }}
                        label={block.is_visible ? "Hide" : "Show"}
                      />
                    </div>
                  </div>

                  <details className="border-t border-line">
                    <summary className="cursor-pointer list-none px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink-soft">
                      Edit
                    </summary>
                    <div className="flex flex-col gap-4 border-t border-line p-4">
                      <form action={actions.update} className="grid gap-3 sm:grid-cols-2">
                        <input type="hidden" name="id" value={block.id} />
                        <input type="hidden" name="type" value={block.type} />
                        <input type="hidden" name="return_to" value="pages" />
                        <Wide>
                          <Field label="Title" htmlFor={`title-${block.id}`}>
                            <Input id={`title-${block.id}`} name="title" defaultValue={block.title} required maxLength={80} />
                          </Field>
                        </Wide>
                        <Wide>
                          <PageSelect id={`page-${block.id}`} value={resolvePage(block.page)} />
                        </Wide>
                        <Wide>
                          <Field label="Link" htmlFor={`url-${block.id}`}>
                            <Input
                              id={`url-${block.id}`}
                              name="url"
                              type="url"
                              defaultValue={block.url ?? ""}
                              required={block.type !== "project"}
                            />
                          </Field>
                        </Wide>
                        <Wide>
                          <Field label="Description" htmlFor={`body-${block.id}`}>
                            <Textarea id={`body-${block.id}`} name="body" defaultValue={block.body ?? ""} rows={3} maxLength={500} />
                          </Field>
                        </Wide>
                        <Wide>
                          <Field
                            label="Image"
                            htmlFor={`image-${block.id}`}
                            hint={block.image_url ? "Choose a file to replace the current image." : imageHint}
                          >
                            <ImageInput id={`image-${block.id}`} name="image" kind="cover" accept={mediaConfig.accept} />
                          </Field>
                          {block.image_url && (
                            <label className="mt-2 flex items-center gap-2 text-sm">
                              <input type="checkbox" name="remove_image" className="accent-accent" />
                              Remove the current image
                            </label>
                          )}
                        </Wide>
                        <ItemExtras id={`edit-${block.id}`} data={block.data} />
                        <Wide>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              name="home"
                              defaultChecked={block.data.home === true}
                              className="accent-accent"
                            />
                            Also show on Home
                          </label>
                        </Wide>
                        <Wide>
                          <SubmitButton variant="accent" size="sm">
                            Save item
                          </SubmitButton>
                        </Wide>
                      </form>

                      <details>
                        <summary className="cursor-pointer list-none font-mono text-xs uppercase tracking-widest text-ink-soft">
                          Delete this item
                        </summary>
                        <form action={actions.remove} className="mt-2">
                          <input type="hidden" name="id" value={block.id} />
                          <input type="hidden" name="return_to" value="pages" />
                          <SubmitButton size="sm" variant="danger">
                            Confirm delete
                          </SubmitButton>
                        </form>
                      </details>
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </details>
  );
}