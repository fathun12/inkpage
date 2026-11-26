"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useCrop } from "@/components/ui/CropDialog";
import { Input } from "@/components/ui/Field";
import { cropPresets, cropQuality, type CropKind } from "@/config/crops";
import { loadImage, resizeToFile } from "@/lib/image-crop";

type Props = {
  id: string;
  name: string;
  kind: CropKind;
  accept: string;
  multiple?: boolean;
  required?: boolean;
  onFile?: (file: File | null) => void;
};

const readError = "This image could not be read. Try a JPG, PNG or WebP file.";

function putFiles(input: HTMLInputElement, files: File[]) {
  const transfer = new DataTransfer();
  for (const file of files) transfer.items.add(file);
  input.files = transfer.files;
}

// File input with a crop window (Free, 1:1, 4:5, 3:2, 16:9, Portrait or Landscape).
// The cropped, resized file replaces the chosen file, so the form sends a small file and the server action stays unchanged.
// "Use original" keeps the whole picture and only makes it smaller.
export function ImageInput({ id, name, kind, accept, multiple, required, onFile }: Props) {
  const preset = cropPresets[kind];
  const wrapRef = useRef<HTMLDivElement>(null);
  const runRef = useRef(0);
  const [previews, setPreviews] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const { ask, dialog } = useCrop();

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  // The form is reset after a successful save, so clear the previews too.
  useEffect(() => {
    const form = wrapRef.current?.closest("form");
    if (!form) return;
    function clear() {
      runRef.current += 1;
      setPreviews([]);
      setMessage("");
    }
    form.addEventListener("reset", clear);
    return () => form.removeEventListener("reset", clear);
  }, []);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []);
    runRef.current += 1;
    const run = runRef.current;
    setPreviews([]);
    if (files.length === 0) {
      onFile?.(null);
      setMessage("");
      return;
    }
    setMessage("");

    const out: File[] = [];
    try {
      for (const [index, file] of files.entries()) {
        const picked = await ask(file, {
          maxPx: preset.maxPx,
          quality: cropQuality,
          type: "jpeg",
          aspect: preset.aspect,
          note: files.length > 1 ? `Image ${index + 1} of ${files.length}` : undefined,
        });
        if (run !== runRef.current) return;
        if (!picked) continue;
        if (picked === file) {
          const url = URL.createObjectURL(file);
          try {
            const img = await loadImage(url);
            out.push(await resizeToFile(img, preset.maxPx, cropQuality, file.name));
          } finally {
            URL.revokeObjectURL(url);
          }
        } else {
          out.push(picked);
        }
      }
    } catch {
      if (run === runRef.current) {
        input.value = "";
        onFile?.(null);
        setMessage(readError);
      }
      return;
    }
    if (run !== runRef.current) return;

    if (out.length === 0) {
      input.value = "";
      onFile?.(null);
      setMessage("No image chosen.");
      return;
    }
    putFiles(input, out);
    if (!multiple) onFile?.(out[0]);
    setPreviews(out.map((file) => URL.createObjectURL(file)));
    const kb = Math.max(1, Math.round(out.reduce((sum, file) => sum + file.size, 0) / 1024));
    setMessage(`${out.length} image${out.length === 1 ? "" : "s"} ready to upload: ${kb} KB.`);
  }

  return (
    <div ref={wrapRef} className="flex flex-col gap-3">
      <Input
        id={id}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        required={required}
        onChange={handleChange}
      />
      {dialog}

      {previews.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {previews.map((url) => (
            <li
              key={url}
              className="ink-border aspect-square rounded-sm bg-contain bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${url})` }}
            />
          ))}
        </ul>
      )}

      {message && (
        <p role="status" className="font-mono text-xs text-ink-soft">
          {message}
        </p>
      )}
    </div>
  );
}