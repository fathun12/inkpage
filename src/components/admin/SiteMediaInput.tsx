"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Input, Select } from "@/components/ui/Field";
import { Img } from "@/components/ui/Img";
import { itemLimits, ratioLabels } from "@/config/item-data";
import { mediaConfig } from "@/config/media";
import { fileKey } from "@/config/site-content";
import { uploadToSignedPath } from "@/lib/direct-upload";
import { roleLabels } from "@/lib/item-data";
import { mediaKind, type MediaKind } from "@/lib/site-view";
import { itemRatios, type ItemFile, type ItemRatio } from "@/types/block";
import type { VideoSignAction } from "@/types/media";

type Props = {
  slot: string;
  current: string[];
  max: number;
  sign: VideoSignAction;
  credits: Record<string, string>;
  // Only for a Projects item: the media list with ratio and credit per file. This turns on item mode:
  // order buttons, a Ratio and a Credit per file, and a label that says where each file is used.
  files?: ItemFile[];
  inputId?: string;
};
type Added = { path: string; preview: string; kind: MediaKind };
type Entry = { token: string; preview: string; kind: MediaKind; fresh: boolean; ratio: ItemRatio; credit: string };
type Note = { tone: "info" | "error"; text: string } | null;

const MB = 1024 * 1024;
const rules = mediaConfig.siteMedia;
const accept = rules.types.map((t) => t.mime).join(",");
const creditHint = "Credit or source (shown small, bottom right)";
const smallButton =
  "border border-line px-2 py-1 font-mono text-[11px] uppercase tracking-widest hover:border-ink disabled:opacity-40";

function Thumb({ src, kind }: { src: string; kind: MediaKind }) {
  const box = "ink-border aspect-video w-full bg-surface object-cover";
  if (kind === "video") return <video src={`${src}#t=0.1`} muted preload="metadata" className={box} />;
  return <Img src={src} className={box} />;
}

// Picks files for one slot of the website (hero, list background, gallery, About photo, a Projects item, a Writing image).
// A file uploads straight to Storage as soon as it is picked. Only its storage path travels with the form,
// and "Remove" boxes tell the server which saved files to drop.
export function SiteMediaInput({ slot, current, max, sign, credits, files, inputId }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const item = files !== undefined;
  const [removed, setRemoved] = useState<string[]>([]);
  const [added, setAdded] = useState<Added[]>([]);
  const [note, setNote] = useState<Note>(null);
  const [entries, setEntries] = useState<Entry[]>(() =>
    (files ?? []).map((f) => ({
      token: f.url,
      preview: f.url,
      kind: mediaKind(f.url),
      fresh: false,
      ratio: f.ratio,
      credit: f.credit ?? "",
    })),
  );
  const [dropped, setDropped] = useState<string[]>([]);

  const single = max === 1;
  const room = item
    ? max - entries.length
    : single
      ? 1
      : max - (current.length - removed.length) - added.length;

  function lockSave(locked: boolean) {
    const form = wrapRef.current?.closest("form");
    form?.querySelectorAll<HTMLButtonElement>('button[type="submit"]').forEach((button) => {
      button.disabled = locked;
    });
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const picked = Array.from(input.files ?? []);
    input.value = "";
    if (picked.length === 0) return;

    setNote(null);
    lockSave(true);
    const done: Added[] = [];
    const problems: string[] = [];
    let free = room;
    try {
      for (const file of picked) {
        if (free <= 0) {
          problems.push(`This list holds up to ${max} item${max === 1 ? "" : "s"}.`);
          break;
        }
        if (!rules.types.some((t) => t.mime === file.type)) {
          problems.push(`${file.name}: use a JPG, PNG, WebP, GIF, MP4 or WebM file.`);
          continue;
        }
        if (file.size > rules.maxMb * MB) {
          problems.push(`${file.name} is ${(file.size / MB).toFixed(1)} MB. The limit is ${rules.maxMb} MB.`);
          continue;
        }
        setNote({ tone: "info", text: `Uploading ${file.name}... keep this page open.` });
        const signed = await sign({ name: file.name, type: file.type, size: file.size });
        if ("error" in signed) {
          problems.push(`${file.name}: ${signed.error}`);
          continue;
        }
        const failure = await uploadToSignedPath(mediaConfig.bucket, signed.path, signed.token, file);
        if (failure) {
          problems.push(`${file.name}: upload failed, ${failure}`);
          continue;
        }
        done.push({
          path: signed.path,
          preview: URL.createObjectURL(file),
          kind: mediaKind(`x.${signed.path.split(".").pop()}`),
        });
        free -= 1;
      }
    } catch {
      problems.push("A file could not be uploaded. Try again.");
    } finally {
      lockSave(false);
    }

    if (item) {
      setEntries((list) => [
        ...list,
        ...done.map((a): Entry => ({
          token: a.path,
          preview: a.preview,
          kind: a.kind,
          fresh: true,
          ratio: "landscape",
          credit: "",
        })),
      ]);
    } else if (done.length > 0) {
      setAdded((list) => (single ? [done[done.length - 1]] : [...list, ...done]));
    }
    if (problems.length > 0) setNote({ tone: "error", text: problems.join(" ") });
    else setNote({ tone: "info", text: `${done.length} uploaded. Press the Save button to use ${done.length === 1 ? "it" : "them"}.` });
  }

  function move(index: number, dir: -1 | 1) {
    setEntries((list) => {
      const to = index + dir;
      if (to < 0 || to >= list.length) return list;
      const copy = [...list];
      [copy[index], copy[to]] = [copy[to], copy[index]];
      return copy;
    });
  }

  function takeOut(entry: Entry) {
    setEntries((list) => list.filter((e) => e.token !== entry.token));
    if (!entry.fresh) setDropped((list) => [...list, entry.token]);
  }

  const picker = (
    <Input id={inputId ?? `site-${slot}`} type="file" accept={accept} multiple={!single} onChange={handleChange} />
  );
  const message = note && (
    <p role="status" className={note.tone === "error" ? "text-xs text-accent" : "font-mono text-xs text-ink-soft"}>
      {note.text}
    </p>
  );

  if (item) {
    const roles = roleLabels(entries.map((e) => e.kind));
    return (
      <div ref={wrapRef} className="flex flex-col gap-3">
        {entries.length > 0 && (
          <ul className="flex flex-col gap-3">
            {entries.map((e, i) => {
              const key = fileKey(e.token);
              return (
                <li key={e.token} className="flex flex-col gap-3 border border-line p-3 sm:flex-row">
                  <div className="w-full sm:w-44 sm:shrink-0">
                    <Thumb src={e.preview} kind={e.kind} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
                      {i + 1} · {roles[i]}
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Select name={`fratio__${key}`} defaultValue={e.ratio} aria-label="Ratio">
                        {itemRatios.map((r) => (
                          <option key={r} value={r}>
                            {ratioLabels[r]}
                          </option>
                        ))}
                      </Select>
                      <Input
                        name={`fcredit__${key}`}
                        defaultValue={e.credit}
                        placeholder={creditHint}
                        maxLength={itemLimits.credit}
                        aria-label="Credit"
                        className="px-2 py-1.5 text-sm"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className={smallButton}>
                        Up
                      </button>
                      <button
                        type="button"
                        onClick={() => move(i, 1)}
                        disabled={i === entries.length - 1}
                        className={smallButton}
                      >
                        Down
                      </button>
                      <button type="button" onClick={() => takeOut(e)} className={smallButton}>
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {entries.map((e) => (
          <input key={`o-${e.token}`} type="hidden" name={`order_${slot}`} value={e.token} />
        ))}
        {entries
          .filter((e) => e.fresh)
          .map((e) => (
            <input key={`a-${e.token}`} type="hidden" name={`add_${slot}`} value={e.token} />
          ))}
        {dropped.map((url) => (
          <input key={`r-${url}`} type="hidden" name={`remove_${slot}`} value={url} />
        ))}
        {picker}
        {message}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="flex flex-col gap-3">
      {current.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {current.map((url) => (
            <li key={url} className="flex flex-col gap-1">
              <Thumb src={url} kind={mediaKind(url)} />
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  name={`remove_${slot}`}
                  value={url}
                  checked={removed.includes(url)}
                  onChange={(e) =>
                    setRemoved((list) => (e.target.checked ? [...list, url] : list.filter((x) => x !== url)))
                  }
                  className="accent-accent"
                />
                Remove
              </label>
              <Input
                name={`credit__${fileKey(url)}`}
                defaultValue={credits[fileKey(url)] ?? ""}
                placeholder={creditHint}
                maxLength={120}
                aria-label="Credit"
                className="px-2 py-1.5 text-xs"
              />
            </li>
          ))}
        </ul>
      )}

      {added.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {added.map((a) => (
            <li key={a.path} className="flex flex-col gap-1">
              <Thumb src={a.preview} kind={a.kind} />
              <button
                type="button"
                onClick={() => setAdded((list) => list.filter((x) => x.path !== a.path))}
                className="self-start text-xs underline underline-offset-4"
              >
                Discard (uploaded, not saved)
              </button>
              <Input
                name={`credit__${fileKey(a.path)}`}
                placeholder={creditHint}
                maxLength={120}
                aria-label="Credit"
                className="px-2 py-1.5 text-xs"
              />
            </li>
          ))}
        </ul>
      )}
      {added.map((a) => (
        <input key={a.path} type="hidden" name={`add_${slot}`} value={a.path} />
      ))}

      {picker}
      {message}
    </div>
  );
}