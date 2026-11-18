import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { mediaConfig } from "@/config/media";
import { siteConfig } from "@/config/site";
import type { BlockType } from "@/types/block";
import type { FormAction } from "@/types/form";

type CardProps = {
  type: BlockType;
  label: string;
  hint: string;
  action: FormAction;
  open?: boolean;
  children?: ReactNode;
};

function Wide({ children }: { children: ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>;
}

function Schedule({ id }: { id: string }) {
  return (
    <>
      <Field label="Show from" htmlFor={`${id}-pub`} hint={`Optional. Time in ${siteConfig.timezoneLabel}.`}>
        <Input id={`${id}-pub`} name="publish_at" type="datetime-local" />
      </Field>
      <Field label="Hide after" htmlFor={`${id}-exp`} hint="Optional.">
        <Input id={`${id}-exp`} name="expire_at" type="datetime-local" />
      </Field>
    </>
  );
}

function TypeCard({ type, label, hint, action, open, children }: CardProps) {
  const id = `new-${type}`;
  return (
    <details open={open} className="ink-border rounded-md bg-surface">
      <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 px-4 py-3">
        <span className="font-display text-lg font-bold">{label}</span>
        <span className="font-mono text-xs text-ink-soft">{hint}</span>
      </summary>
      <form action={action} className="grid gap-4 border-t border-line p-4 sm:grid-cols-2">
        <input type="hidden" name="type" value={type} />
        <Wide>
          <Field label="Title" htmlFor={`${id}-title`}>
            <Input id={`${id}-title`} name="title" required maxLength={80} />
          </Field>
        </Wide>
        {children}
        <Schedule id={id} />
        <Wide>
          <Button type="submit" variant="accent">Add {label.toLowerCase()}</Button>
        </Wide>
      </form>
    </details>
  );
}

const imageHint = `JPG, PNG or WebP, up to ${mediaConfig.maxMb} MB.`;

export function BlockCreateForm({ action }: { action: FormAction }) {
  return (
    <details>
      <summary className="ink-border press inline-flex cursor-pointer list-none items-center rounded-md bg-accent px-5 py-3 font-body font-semibold text-accent-ink">
        + Add block
      </summary>
      <div className="mt-3 flex flex-col gap-3">
      <TypeCard type="link" label="Link" hint="A button with an optional photo." action={action}>
        <Wide>
          <Field label="URL" htmlFor="new-link-url">
            <Input id="new-link-url" name="url" type="url" placeholder="https://" required />
          </Field>
        </Wide>
        <Wide>
          <Field label="Description" htmlFor="new-link-body" hint="Optional.">
            <Textarea id="new-link-body" name="body" rows={2} maxLength={500} />
          </Field>
        </Wide>
        <Wide>
          <Field label="Photo" htmlFor="new-link-image" hint={`Optional. ${imageHint}`}>
            <Input id="new-link-image" name="image" type="file" accept={mediaConfig.accept} />
          </Field>
        </Wide>
      </TypeCard>

      <TypeCard type="project" label="Project card" hint="A large cover image with text." action={action}>
        <Wide>
          <Field label="Cover image" htmlFor="new-project-image" hint={`Optional. ${imageHint}`}>
            <Input id="new-project-image" name="image" type="file" accept={mediaConfig.accept} />
          </Field>
        </Wide>
        <Wide>
          <Field label="Description" htmlFor="new-project-body" hint="Optional.">
            <Textarea id="new-project-body" name="body" rows={3} maxLength={500} />
          </Field>
        </Wide>
        <Wide>
          <Field label="Project URL" htmlFor="new-project-url" hint="Optional. Makes the card clickable.">
            <Input id="new-project-url" name="url" type="url" placeholder="https://" />
          </Field>
        </Wide>
      </TypeCard>

      <TypeCard type="embed" label="Embed" hint="YouTube or Spotify player." action={action}>
        <Wide>
          <Field label="YouTube or Spotify link" htmlFor="new-embed-url">
            <Input id="new-embed-url" name="url" type="url" placeholder="https://" required />
          </Field>
        </Wide>
      </TypeCard>

      <TypeCard type="gallery" label="Gallery" hint="A grid of photos." action={action}>
        <Wide>
          <Field
            label="Images"
            htmlFor="new-gallery-images"
            hint={`Up to ${mediaConfig.maxGallery} images. ${imageHint}`}
          >
            <Input id="new-gallery-images" name="images" type="file" accept={mediaConfig.accept} multiple required />
          </Field>
        </Wide>
      </TypeCard>

      <TypeCard type="socials" label="Social links" hint="A row of small buttons." action={action}>
        <Wide>
          <Field
            label="Links"
            htmlFor="new-socials-links"
            hint={`One link per line, up to ${mediaConfig.maxSocials}. The name is detected from the address.`}
          >
            <Textarea
              id="new-socials-links"
              name="links"
              rows={4}
              placeholder={"https://instagram.com/yourname\nhttps://github.com/yourname"}
              required
            />
          </Field>
        </Wide>
      </TypeCard>

      <TypeCard type="countdown" label="Countdown" hint="Counts down to a date." action={action}>
        <Wide>
          <Field label="Counts down to" htmlFor="new-countdown-target" hint={`Time in ${siteConfig.timezoneLabel}.`}>
            <Input id="new-countdown-target" name="target" type="datetime-local" required />
          </Field>
        </Wide>
      </TypeCard>

      <TypeCard type="header" label="Header" hint="A section title." action={action} />

      <TypeCard type="text" label="Text" hint="A short note." action={action}>
        <Wide>
          <Field label="Text" htmlFor="new-text-body">
            <Textarea id="new-text-body" name="body" rows={3} maxLength={500} required />
          </Field>
        </Wide>
      </TypeCard>
      </div>
    </details>
  );
}
