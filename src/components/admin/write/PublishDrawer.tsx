"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { siteConfig } from "@/config/site";
import { slugify } from "@/lib/article-doc";
import type { ArticleStatus } from "@/types/article";
import type { FormAction } from "@/types/form";

// What the editor had when the drawer opened. It travels inside the form, so Publish saves the latest text too.
export type DrawerSnapshot = { title: string; subtitle: string; content: string };

type Props = {
  snapshot: DrawerSnapshot;
  status: ArticleStatus;
  slug: string | null;
  username: string;
  viewHref: string | null;
  publish: FormAction;
  unpublish: FormAction;
  remove: FormAction;
  onClose: () => void;
};

export function PublishDrawer({ snapshot, status, slug, username, viewHref, publish, unpublish, remove, onClose }: Props) {
  const published = status === "published";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Publish settings">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-ink/30" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col gap-6 overflow-y-auto border-l border-line bg-bg p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold">{published ? "Article settings" : "Publish article"}</h2>
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <p className="font-display text-xl leading-snug">{snapshot.title || "Untitled"}</p>

        <form action={publish} className="flex flex-col gap-6">
          <input type="hidden" name="title" value={snapshot.title} />
          <input type="hidden" name="subtitle" value={snapshot.subtitle} />
          <input type="hidden" name="content" value={snapshot.content} />

          <Field label="Address" htmlFor="article-slug" hint="Letters, numbers and hyphens. Leave it as is to use the title.">
            <div className="flex items-center gap-2">
              <span className="shrink-0 font-mono text-sm text-ink-soft">/{username}/writing/</span>
              <Input id="article-slug" name="slug" defaultValue={slug ?? slugify(snapshot.title)} maxLength={80} />
            </div>
          </Field>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium text-ink-soft">When</legend>
            {published && (
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="mode" value="keep" defaultChecked className="accent-accent" />
                Keep the publish date
              </label>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="mode" value="now" defaultChecked={!published} className="accent-accent" />
              {published ? "Set the date to now" : "Now"}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="mode" value="schedule" className="accent-accent" />
              Schedule
            </label>
            <Input type="datetime-local" name="when" aria-label="Schedule date and time" />
            <p className="text-xs text-ink-soft">Used only with Schedule. Time zone: {siteConfig.timezoneLabel}.</p>
          </fieldset>

          <div>
            <SubmitButton variant="accent" pendingLabel={published ? "Updating..." : "Publishing..."}>
              {published ? "Update" : "Publish"}
            </SubmitButton>
          </div>
        </form>

        {viewHref && (
          <a href={viewHref} target="_blank" rel="noopener noreferrer" className="font-mono text-sm underline underline-offset-4">
            View the article
          </a>
        )}

        {published && (
          <form action={unpublish}>
            <SubmitButton pendingLabel="Working...">Unpublish (back to draft)</SubmitButton>
          </form>
        )}

        <details className="ink-border mt-auto rounded-md">
          <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium">Delete this article</summary>
          <form action={remove} className="flex flex-col gap-3 border-t border-line p-4">
            <p className="text-sm text-ink-soft">This removes the article for good. It cannot be undone.</p>
            <div>
              <SubmitButton variant="danger" pendingLabel="Deleting...">
                Delete permanently
              </SubmitButton>
            </div>
          </form>
        </details>
      </aside>
    </div>
  );
}