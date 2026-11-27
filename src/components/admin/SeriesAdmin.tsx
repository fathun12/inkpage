import Link from "next/link";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { seriesLimits } from "@/config/article";
import { routes } from "@/config/site";
import type { FormAction } from "@/types/form";
import type { OwnSeries } from "@/types/series";

type Item = OwnSeries & { update: FormAction; remove: FormAction };
type Props = { items: Item[]; create: FormAction };

export function SeriesAdmin({ items, create }: Props) {
  return (
    <div className="flex flex-col gap-5">
      <Link href={routes.write} className="text-sm underline underline-offset-4">
        &larr; Write
      </Link>
      <p className="max-w-xl text-sm text-ink-soft">
        A series groups articles about one big theme into numbered parts. Put an article in a series from its
        Publish (or Details) panel in the editor.
      </p>

      <details className="ink-border rounded-md bg-surface">
        <summary className="cursor-pointer list-none px-4 py-3 font-display text-lg font-bold">New series</summary>
        <form action={create} className="flex flex-col gap-5 border-t border-line p-4">
          <Field label="Title" htmlFor="new-series-title" hint="The big theme. The address is made from it.">
            <Input id="new-series-title" name="title" maxLength={seriesLimits.title} required />
          </Field>
          <Field label="Description" htmlFor="new-series-description" hint="Optional. Up to 400 characters.">
            <Textarea id="new-series-description" name="description" rows={3} maxLength={seriesLimits.description} />
          </Field>
          <div>
            <SubmitButton variant="accent" pendingLabel="Creating...">
              Create series
            </SubmitButton>
          </div>
        </form>
      </details>

      {items.length === 0 ? (
        <p className="font-mono text-sm text-ink-soft">No series yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((s) => (
            <li key={s.id}>
              <details className="ink-border rounded-md bg-surface">
                <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-3 px-4 py-3">
                  <span className="font-display text-lg font-medium">{s.title}</span>
                  <span className="font-mono text-xs text-ink-soft">
                    {s.articleCount} {s.articleCount === 1 ? "article" : "articles"} · /series/{s.slug}
                  </span>
                </summary>
                <div className="flex flex-col gap-5 border-t border-line p-4">
                  <form action={s.update} className="flex flex-col gap-5">
                    <Field label="Title" htmlFor={`series-title-${s.id}`}>
                      <Input id={`series-title-${s.id}`} name="title" defaultValue={s.title} maxLength={seriesLimits.title} required />
                    </Field>
                    <Field
                      label="Address"
                      htmlFor={`series-slug-${s.id}`}
                      hint="Letters, numbers and hyphens. Changing it breaks links that were already shared."
                    >
                      <Input id={`series-slug-${s.id}`} name="slug" defaultValue={s.slug} maxLength={80} required />
                    </Field>
                    <Field label="Description" htmlFor={`series-description-${s.id}`} hint="Optional.">
                      <Textarea
                        id={`series-description-${s.id}`}
                        name="description"
                        defaultValue={s.description ?? ""}
                        rows={3}
                        maxLength={seriesLimits.description}
                      />
                    </Field>
                    <div>
                      <SubmitButton variant="accent" pendingLabel="Saving...">
                        Save
                      </SubmitButton>
                    </div>
                  </form>

                  <details className="ink-border rounded-md">
                    <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium">Delete this series</summary>
                    <form action={s.remove} className="flex flex-col gap-3 border-t border-line p-4">
                      <p className="text-sm text-ink-soft">The articles are kept. They only leave the series.</p>
                      <div>
                        <SubmitButton variant="danger" pendingLabel="Deleting...">
                          Delete series
                        </SubmitButton>
                      </div>
                    </form>
                  </details>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}