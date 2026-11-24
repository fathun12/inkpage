import type { ReactNode } from "react";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { itemLimits, logoLabels } from "@/config/item-data";
import { resolvePage } from "@/config/site-content";
import { readProjectItem, type ProjectItem } from "@/lib/item-data";
import { downloadLogos, type BlockView } from "@/types/block";
import type { FormAction } from "@/types/form";
import type { VideoSignAction } from "@/types/media";
import { DeleteItem, ItemBar, type BarActions } from "./ItemParts";
import { SiteMediaInput } from "./SiteMediaInput";

type Props = {
  blocks: BlockView[];
  actions: BarActions & { save: FormAction };
  sign: VideoSignAction;
};

const returnTo = "pages:projects";

function Heading({ children }: { children: ReactNode }) {
  return <p className="font-mono text-xs uppercase tracking-widest text-ink-soft">{children}</p>;
}

function Check({ name, label, hint, checked }: { name: string; label: string; hint: string; checked: boolean }) {
  return (
    <label className="flex flex-col gap-0.5 text-sm">
      <span className="flex items-center gap-2">
        <input type="checkbox" name={name} defaultChecked={checked} className="accent-accent" />
        {label}
      </span>
      <span className="pl-6 text-xs text-ink-soft">{hint}</span>
    </label>
  );
}

type FormProps = { item: ProjectItem | null; visible: boolean; save: FormAction; sign: VideoSignAction };

// One form for adding and for editing a project. Sections are numbered so it reads top to bottom.
function ProjectForm({ item, visible, save, sign }: FormProps) {
  const uid = item?.id ?? "new";
  const files = item?.files ?? [];
  return (
    <form action={save} className="flex flex-col gap-7">
      {item && <input type="hidden" name="id" value={item.id} />}

      <section className="flex flex-col gap-4">
        <Heading>1 · Basics</Heading>
        <Field label="Title" htmlFor={`p-title-${uid}`}>
          <Input id={`p-title-${uid}`} name="title" defaultValue={item?.title ?? ""} required maxLength={80} />
        </Field>
        <Field label="Description" htmlFor={`p-body-${uid}`} hint="Optional. Up to 500 characters.">
          <Textarea id={`p-body-${uid}`} name="body" defaultValue={item?.body ?? ""} rows={4} maxLength={500} />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <Heading>2 · Media</Heading>
        <Field
          label={`Photos, GIFs and videos (up to ${itemLimits.files})`}
          htmlFor={`p-files-${uid}`}
          hint="A file uploads as soon as you pick it, then press the Save button below. The label above each file says where it is used. Ratio is the frame shape: Portrait or Landscape. Credit shows small on the media."
        >
          <SiteMediaInput
            slot="files"
            inputId={`p-files-${uid}`}
            current={files.map((f) => f.url)}
            files={files}
            max={itemLimits.files}
            sign={sign}
            credits={{}}
          />
        </Field>
      </section>

      <section className="flex flex-col gap-4">
        <Heading>3 · Download buttons (up to {itemLimits.downloads})</Heading>
        <p className="text-xs text-ink-soft">
          Each filled row becomes a button with the word Download and a logo. Leave a row empty to skip it.
        </p>
        {Array.from({ length: itemLimits.downloads }, (_, i) => {
          const d = item?.downloads[i];
          return (
            <div key={i} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
              <Field label={`Link ${i + 1}`} htmlFor={`p-dl-url-${uid}-${i}`}>
                <Input
                  id={`p-dl-url-${uid}-${i}`}
                  name={`dl_url_${i}`}
                  type="url"
                  placeholder="https://"
                  defaultValue={d?.url ?? ""}
                />
              </Field>
              <Field label="Logo" htmlFor={`p-dl-logo-${uid}-${i}`}>
                <Select id={`p-dl-logo-${uid}-${i}`} name={`dl_logo_${i}`} defaultValue={d?.logo ?? "auto"}>
                  <option value="auto">Automatic (from the link)</option>
                  {downloadLogos.map((l) => (
                    <option key={l} value={l}>
                      {logoLabels[l]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-4">
        <Heading>4 · Text links (up to {itemLimits.links})</Heading>
        <p className="text-xs text-ink-soft">For example &quot;Visit website&quot;. Shown as underlined text.</p>
        {Array.from({ length: itemLimits.links }, (_, i) => {
          const l = item?.links[i];
          return (
            <div key={i} className="grid gap-3 sm:grid-cols-2">
              <Field label={`Label ${i + 1}`} htmlFor={`p-ln-label-${uid}-${i}`}>
                <Input
                  id={`p-ln-label-${uid}-${i}`}
                  name={`ln_label_${i}`}
                  defaultValue={l?.label ?? ""}
                  maxLength={itemLimits.label}
                />
              </Field>
              <Field label="Link" htmlFor={`p-ln-url-${uid}-${i}`}>
                <Input
                  id={`p-ln-url-${uid}-${i}`}
                  name={`ln_url_${i}`}
                  type="url"
                  placeholder="https://"
                  defaultValue={l?.url ?? ""}
                />
              </Field>
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-3">
        <Heading>5 · Where to show</Heading>
        <Check name="visible" label="Visible" hint="Untick to hide it everywhere." checked={visible} />
        <Check
          name="home"
          label="Also show on Home"
          hint="A card in the Projects section of Home (two media at most)."
          checked={item?.home ?? false}
        />
        <Check
          name="showcase"
          label="Show as Showcase"
          hint={`The detailed section on Home (up to ${itemLimits.homeShowcase} items).`}
          checked={item?.showcase ?? false}
        />
      </section>

      <div>
        <SubmitButton variant="accent">{item ? "Save project" : "Add project"}</SubmitButton>
      </div>
    </form>
  );
}

export function ProjectItems({ blocks, actions, sign }: Props) {
  const items = blocks.filter(
    (b) => (b.type === "project" || b.type === "link") && resolvePage(b.page) === "projects",
  );

  return (
    <div className="flex flex-col gap-5">
      <details className="ink-border rounded-md bg-surface">
        <summary className="cursor-pointer list-none px-4 py-3 font-display text-lg font-bold">+ Add project</summary>
        <div className="border-t border-line p-4">
          <ProjectForm item={null} visible save={actions.save} sign={sign} />
        </div>
      </details>

      {items.length === 0 ? (
        <p className="font-mono text-sm text-ink-soft">No projects yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((block, index) => {
            const item = readProjectItem(block);
            const first = item.files[0];
            const badges = [
              block.is_visible ? "Live" : "Hidden",
              ...(item.home ? ["On Home"] : []),
              ...(item.showcase ? ["Showcase"] : []),
            ];
            return (
              <li key={block.id} className="ink-border rounded-md bg-surface">
                <ItemBar
                  block={block}
                  thumb={first ? { src: first.url, kind: first.kind } : null}
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
                    <ProjectForm item={item} visible={block.is_visible} save={actions.save} sign={sign} />
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