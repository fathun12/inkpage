"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/Field";
import { shopConfig } from "@/config/shop";
import { uploadToSignedPath } from "@/lib/direct-upload";
import type { AddedShopFile, ProductFile, ShopSignAction } from "@/types/shop";

type Props = {
  productId: string;
  current: Pick<ProductFile, "id" | "name" | "size_bytes">[];
  sign: ShopSignAction;
};
type Note = { tone: "info" | "error"; text: string } | null;

const MB = 1024 * 1024;
const limits = shopConfig.limits;

function sizeLabel(bytes: number | null): string {
  if (bytes === null) return "";
  return bytes < MB ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / MB).toFixed(1)} MB`;
}

// Picks the files that are sold. A file goes straight from the browser to the PRIVATE bucket as soon as it is picked.
// Only its storage path travels with the form. "Remove" boxes tell the server which saved files to drop.
export function ShopFileInput({ productId, current, sign }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [removed, setRemoved] = useState<string[]>([]);
  const [added, setAdded] = useState<AddedShopFile[]>([]);
  const [note, setNote] = useState<Note>(null);

  const room = limits.files - (current.length - removed.length) - added.length;

  function lockSave(locked: boolean) {
    wrapRef.current
      ?.closest("form")
      ?.querySelectorAll<HTMLButtonElement>('button[type="submit"]')
      .forEach((button) => {
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
    const done: AddedShopFile[] = [];
    const problems: string[] = [];
    let free = room;
    try {
      for (const file of picked) {
        if (free <= 0) {
          problems.push(`A product can hold up to ${limits.files} files.`);
          break;
        }
        if (file.size > limits.fileMb * MB) {
          problems.push(`${file.name} is ${(file.size / MB).toFixed(1)} MB. The limit is ${limits.fileMb} MB.`);
          continue;
        }
        setNote({ tone: "info", text: `Uploading ${file.name}... keep this page open.` });
        const signed = await sign({ productId, name: file.name, type: file.type, size: file.size });
        if ("error" in signed) {
          problems.push(`${file.name}: ${signed.error}`);
          continue;
        }
        const failure = await uploadToSignedPath(shopConfig.bucket, signed.path, signed.token, file);
        if (failure) {
          problems.push(`${file.name}: upload failed, ${failure}`);
          continue;
        }
        done.push({ path: signed.path, name: file.name.slice(0, limits.fileName), size: file.size });
        free -= 1;
      }
    } catch {
      problems.push("A file could not be uploaded. Try again.");
    } finally {
      lockSave(false);
    }

    if (done.length > 0) setAdded((list) => [...list, ...done]);
    if (problems.length > 0) setNote({ tone: "error", text: problems.join(" ") });
    else setNote({ tone: "info", text: `${done.length} uploaded. Press Save product to keep ${done.length === 1 ? "it" : "them"}.` });
  }

  return (
    <div ref={wrapRef} className="flex flex-col gap-3">
      {current.length > 0 && (
        <ul className="flex flex-col gap-2">
          {current.map((file) => (
            <li key={file.id} className="flex flex-wrap items-center justify-between gap-2 border border-line px-3 py-2 text-sm">
              <span className="min-w-0 break-all">
                {file.name} <span className="font-mono text-xs text-ink-soft">{sizeLabel(file.size_bytes)}</span>
              </span>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  name="remove_file"
                  value={file.id}
                  checked={removed.includes(file.id)}
                  onChange={(e) =>
                    setRemoved((list) => (e.target.checked ? [...list, file.id] : list.filter((x) => x !== file.id)))
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
        <ul className="flex flex-col gap-2">
          {added.map((file) => (
            <li key={file.path} className="flex flex-wrap items-center justify-between gap-2 border border-line px-3 py-2 text-sm">
              <span className="min-w-0 break-all">
                {file.name} <span className="font-mono text-xs text-ink-soft">{sizeLabel(file.size)} · uploaded, not saved</span>
              </span>
              <button
                type="button"
                onClick={() => setAdded((list) => list.filter((x) => x.path !== file.path))}
                className="text-xs underline underline-offset-4"
              >
                Discard
              </button>
            </li>
          ))}
        </ul>
      )}
      {added.map((file) => (
        <input key={file.path} type="hidden" name="add_file" value={JSON.stringify(file)} />
      ))}

      <Input id={`shop-file-${productId}`} type="file" multiple onChange={handleChange} disabled={room <= 0} />
      {note && (
        <p role="status" className={note.tone === "error" ? "text-xs text-accent" : "font-mono text-xs text-ink-soft"}>
          {note.text}
        </p>
      )}
    </div>
  );
}