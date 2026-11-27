"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Img } from "@/components/ui/Img";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { articleImages, articleLimits } from "@/config/article";
import { mediaConfig } from "@/config/media";
import { siteConfig } from "@/config/site";
import { slugify } from "@/lib/article-doc";
import { prepareCover } from "@/lib/article-image";
import { uploadToSignedPath } from "@/lib/direct-upload";
import type { ArticleStatus, SignArticleImageAction } from "@/types/article";
import type { FormAction } from "@/types/form";
import type { SeriesOption } from "@/types/series";

// What the editor had when the drawer opened. It travels inside the form, so Publish saves the latest text too.
export type DrawerSnapshot = { title: string; subtitle: string; content: string };

type Props = {
  snapshot: DrawerSnapshot;
  status: ArticleStatus;
  slug: string | null;
  cover: string | null;
  tags: string[];
  seriesId: string | null;
  seriesPosition: number | null;
  seriesOptions: SeriesOption[];
  signImage: SignArticleImageAction;
  username: string;
  viewHref: string | null;
  publish: FormAction;
  unpublish: FormAction;
  remove: FormAction;
  onClose: () => void;
};

export function PublishDrawer({
  snapshot,
  status,
  slug,
  cover: startCover,
  tags,
  seriesId,
  seriesPosition,
  seriesOptions,
  signImage,
  username,
  viewHref,
  publish,
  unpublish,
  remove,
  onClose,
}: Props) {
  const published = status === "published";
  const [cover, setCover] = useState<string | null>(startCover);
  const [coverStatus, setCoverStatus] = useState<{ text: string; error: boolean } | null>(null);

  // Cuts the picture to 2:1 in the browser and uploads it straight to Storage. Publish or Update saves the address.
  async function onCover(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    setCoverStatus({ text: "Preparing cover...", error: false });
    const prepared = await prepareCover(file);
    if ("error" in prepared) {
      setCoverStatus({ text: prepared.error, error: true });
      return;
    }
    let sign: Awaited<ReturnType<SignArticleImageAction>>;
    try {
      sign = await signImage({ kind: "cover", type: prepared.file.type, size: prepared.file.size });
    } catch {
      sign = { error: "Could not reach the server. Check your connection." };
    }
    if ("error" in sign) {
      setCoverStatus({ text: sign.error, error: true });
      return;
    }
    const failure = await uploadToSignedPath(mediaConfig.bucket, sign.path, sign.token, prepared.file);
    if (failure) {
      setCoverStatus({ text: `Upload failed: ${failure}`, error: true });
      return;
    }
    setCover(sign.url);
    setCoverStatus({ text: "Cover ready. Press Publish or Update to keep it.", error: false });
  }

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

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-ink-soft">Cover picture</span>
            <input type="hidden" name="cover_url" value={cover ?? ""} />
            {cover ? (
              <Img src={cover} className="ink-border aspect-2/1 w-full rounded-sm bg-surface object-cover" />
            ) : (
              <div className="ink-border flex aspect-2/1 w-full items-center justify-center rounded-sm bg-surface text-sm text-ink-soft">
                No cover
              </div>
            )}
            <div className="flex flex-wrap items-center gap-4">
              <label className="cursor-pointer text-sm underline underline-offset-4">
                {cover ? "Replace" : "Add a cover"}
                <input type="file" accept={articleImages.accept} onChange={onCover} className="sr-only" />
              </label>
              {cover && (
                <button type="button" onClick={() => setCover(null)} className="text-sm underline underline-offset-4">
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-ink-soft">Cut to 2:1 from the middle of the picture. Saved with Publish or Update.</p>
            {coverStatus && (
              <p role="status" className={coverStatus.error ? "text-xs text-accent" : "font-mono text-xs text-ink-soft"}>
                {coverStatus.text}
              </p>
            )}
          </div>

          <Field
            label="Tags"
            htmlFor="article-tags"
            hint={`Separate with commas, up to ${articleLimits.tags}. Saved in lowercase.`}
          >
            <Input id="article-tags" name="tags" defaultValue={tags.join(", ")} placeholder="philosophy, essay" />
          </Field>

          <Field
            label="Series"
            htmlFor="article-series"
            hint={
              seriesOptions.length === 0
                ? "No series yet. Make one under Write, Manage series."
                : "Optional. Articles of one series are shown together, in part order."
            }
          >
            <select
              id="article-series"
              name="series_id"
              defaultValue={seriesId ?? ""}
              className="ink-border w-full rounded-sm bg-bg px-3 py-2 text-sm"
            >
              <option value="">Not in a series</option>
              {seriesOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Part number" htmlFor="article-part" hint="Only with a series. Empty = at the end of the series.">
            <Input
              id="article-part"
              name="series_position"
              type="number"
              min={1}
              max={articleLimits.seriesPart}
              defaultValue={seriesPosition ?? ""}
            />
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