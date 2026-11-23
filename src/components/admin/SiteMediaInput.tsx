"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/Field";
import { Img } from "@/components/ui/Img";
import { mediaConfig } from "@/config/media";
import { uploadToSignedPath } from "@/lib/direct-upload";
import { mediaKind, type MediaKind } from "@/lib/site-view";
import type { VideoSignAction } from "@/types/media";

type Props = { slot: string; current: string[]; max: number; sign: VideoSignAction };
type Added = { path: string; preview: string; kind: MediaKind };
type Note = { tone: "info" | "error"; text: string } | null;

const MB = 1024 * 1024;
const rules = mediaConfig.siteMedia;
const accept = rules.types.map((t) => t.mime).join(",");

function Thumb({ src, kind }: { src: string; kind: MediaKind }) {
  const box = "ink-border aspect-video w-full bg-surface object-cover";
  if (kind === "video") return <video src={`${src}#t=0.1`} muted preload="metadata" className={box} />;
  return <Img src={src} className={box} />;
}

// Picks files for one slot of the website (hero, list background, gallery, About photo).
// A file uploads straight to Storage as soon as it is picked. Only its storage path travels with the form,
// and "Remove" boxes tell the server which saved files to drop.
export function SiteMediaInput({ slot, current, max, sign }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [removed, setRemoved] = useState<string[]>([]);
  const [added, setAdded] = useState<Added[]>([]);
  const [note, setNote] = useState<Note>(null);

  const single = max === 1;
  const room = single ? 1 : max - (current.length - removed.length) - added.length;

  function lockSave(locked: boolean) {
    const form = wrapRef.current?.closest("form");
    form?.querySelectorAll<HTMLButtonElement>('button[type="submit"]').forEach((button) => {
      button.disabled = locked;
    });
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    input.value = "";
    if (files.length === 0) return;

    setNote(null);
    lockSave(true);
    const done: Added[] = [];
    const problems: string[] = [];
    let free = room;
    try {
      for (const file of files) {
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
        done.push({ path: signed.path, preview: URL.createObjectURL(file), kind: mediaKind(`x.${signed.path.split(".").pop()}`) });
        free -= 1;
      }
    } catch {
      problems.push("A file could not be uploaded. Try again.");
    } finally {
      lockSave(false);
    }

    if (done.length > 0) setAdded((list) => (single ? [done[done.length - 1]] : [...list, ...done]));
    if (problems.length > 0) setNote({ tone: "error", text: problems.join(" ") });
    else setNote({ tone: "info", text: `${done.length} uploaded. Press Save changes to use ${done.length === 1 ? "it" : "them"}.` });
  }

  return (
    <div ref={wrapRef} className="flex flex-col gap-3">
      {current.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
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
            </li>
          ))}
        </ul>
      )}

      {added.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
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
            </li>
          ))}
        </ul>
      )}
      {added.map((a) => (
        <input key={a.path} type="hidden" name={`add_${slot}`} value={a.path} />
      ))}

      <Input id={`site-${slot}`} type="file" accept={accept} multiple={!single} onChange={handleChange} />

      {note && (
        <p role="status" className={note.tone === "error" ? "text-xs text-accent" : "font-mono text-xs text-ink-soft"}>
          {note.text}
        </p>
      )}
    </div>
  );
}