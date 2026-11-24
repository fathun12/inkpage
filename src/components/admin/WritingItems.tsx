import { Field, Input, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { resolvePage } from "@/config/site-content";
import { mediaKind } from "@/lib/site-view";
import { readWritingItem, type WritingItem } from "@/lib/item-data";
import type { BlockView } from "@/types/block";
import type { FormAction } from "@/types/form";
import type { VideoSignAction } from "@/types/media";
import { DeleteItem, ItemBar, type BarActions } from "./ItemParts";
import { SiteMediaInput } from "./SiteMediaInput";

type Props = {
  blocks: BlockView[];
  actions: BarActions & { save: FormAction };
  sign: VideoSignAction;
};

const returnTo = "pages:writing";

type FormProps = { item: WritingItem | null; visible: boolean; save: FormAction; sign: VideoSignAction };

function WritingForm({ item, visible, save, sign }: FormProps) {
  const uid = item?.id ?? "new";
  return (
    <form action={save} className="flex flex-col gap-5">
      {item && <input type="hidden" name="id" value={item.id} />}
      <Field label="Title" htmlFor={`w-title-${uid}`}>
        <Input id={`w-title-${uid}`} name="title" defaultValue={item?.title ?? ""} required maxLength={80} />
      </Field>
      <Field label="Link" htmlFor={`w-url-${uid}`} hint="The article. A click opens it (Blogspot, Medium, skrib.my.id ...).">
        <Input id={`w-url-${uid}`} name="url" type="url" placeholder="https://" defaultValue={item?.url ?? ""} required />
      </Field>
      <Field label="Short text" htmlFor={`w-body-${uid}`} hint="Optional. Up to 500 characters.">
        <Textarea id={`w-body-${uid}`} name="body" defaultValue={item?.body ?? ""} rows={3} maxLength={500} />
      </Field>
      <Field
        label="Image"
        htmlFor={`w-image-${uid}`}
        hint="Optional. Uploads as soon as you pick it, then press the Save button below. Picking a new one replaces the old one."
      >
        <SiteMediaInput
          slot="wimg"
          inputId={`w-image-${uid}`}
          current={item?.image ? [item.image] : []}
          max={1}
          sign={sign}
          credits={{}}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="home" defaultChecked={item?.home ?? false} className="accent-accent" />
        Also show on Home (the sliding cards)
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="visible" defaultChecked={visible} className="accent-accent" />
        Visible
      </label>
      <div>
        <SubmitButton variant="accent">{item ? "Save item" : "Add item"}</SubmitButton>
      </div>
    </form>
  );
}

export function WritingItems({ blocks, actions, sign }: Props) {
  const items = blocks.filter(
    (b) => (b.type === "project" || b.type === "link") && resolvePage(b.page) === "writing",
  );

  return (
    <div className="flex flex-col gap-5">
      <details className="ink-border rounded-md bg-surface">
        <summary className="cursor-pointer list-none px-4 py-3 font-display text-lg font-bold">+ Add writing</summary>
        <div className="border-t border-line p-4">
          <WritingForm item={null} visible save={actions.save} sign={sign} />
        </div>
      </details>

      {items.length === 0 ? (
        <p className="font-mono text-sm text-ink-soft">No writing yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((block, index) => {
            const item = readWritingItem(block);
            const badges = [
              block.is_visible ? "Live" : "Hidden",
              ...(item.source ? [item.source] : []),
              ...(item.home ? ["On Home"] : []),
            ];
            return (
              <li key={block.id} className="ink-border rounded-md bg-surface">
                <ItemBar
                  block={block}
                  thumb={item.image ? { src: item.image, kind: mediaKind(item.image) } : null}
                  badges={badges}
                  all={blocks}
                  prev={items[index - 1]}
                  next={items[index + 1]}
                  actions={actions}
                  returnTo={returnTo}
                />
                <details className="border-t border-line">
                  <summary className="cursor-pointer list-none px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink-soft">
                    Edit
                  </summary>
                  <div className="flex flex-col gap-5 border-t border-line p-4">
                    <WritingForm item={item} visible={block.is_visible} save={actions.save} sign={sign} />
                    <DeleteItem id={block.id} remove={actions.remove} returnTo={returnTo} />
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}