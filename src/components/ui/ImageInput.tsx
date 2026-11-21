"use client";

import Cropper, { type Area } from "react-easy-crop";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/Field";
import { cropPresets, cropQuality, type CropKind } from "@/config/crops";
import { centerArea, cropToFile, loadImage, type PixelArea } from "@/lib/image-crop";

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

function jpgName(name: string) {
  return `${name.replace(/\.[^.]+$/, "") || "image"}.jpg`;
}

// File input with a crop step. The cropped, resized JPEG replaces the chosen file,
// so the form sends a small file and the server action stays unchanged.
export function ImageInput({ id, name, kind, accept, multiple, required, onFile }: Props) {
  const preset = cropPresets[kind];
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const imageRef = useRef<Promise<HTMLImageElement> | null>(null);
  const nameRef = useRef("image.jpg");
  const runRef = useRef(0);

  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [previews, setPreviews] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => {
      if (source) URL.revokeObjectURL(source);
    };
  }, [source]);

  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  // The form is reset after a successful save, so clear the crop panel too.
  useEffect(() => {
    const form = wrapRef.current?.closest("form");
    if (!form) return;
    function clear() {
      runRef.current += 1;
      setSource(null);
      setPreviews([]);
      setMessage("");
    }
    form.addEventListener("reset", clear);
    return () => form.removeEventListener("reset", clear);
  }, []);

  async function apply(area: PixelArea) {
    runRef.current += 1;
    const ticket = runRef.current;
    const input = inputRef.current;
    const loading = imageRef.current;
    if (!input || !loading) return;
    try {
      const img = await loading;
      const file = await cropToFile(img, area, preset.aspect, preset.maxPx, cropQuality, nameRef.current);
      if (ticket !== runRef.current) return;
      putFiles(input, [file]);
      onFile?.(file);
      setMessage(`Ready to upload: ${Math.max(1, Math.round(file.size / 1024))} KB. Drag to move, slide to zoom.`);
    } catch {
      if (ticket === runRef.current) setMessage(readError);
    }
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    inputRef.current = input;
    const files = Array.from(input.files ?? []);
    runRef.current += 1;
    const run = runRef.current;
    setSource(null);
    setPreviews([]);
    if (files.length === 0) {
      onFile?.(null);
      setMessage("");
      return;
    }
    setMessage("Preparing image...");

    try {
      if (multiple) {
        const out: File[] = [];
        for (const file of files) {
          const url = URL.createObjectURL(file);
          try {
            const img = await loadImage(url);
            const area = centerArea(img.naturalWidth, img.naturalHeight, preset.aspect);
            out.push(await cropToFile(img, area, preset.aspect, preset.maxPx, cropQuality, jpgName(file.name)));
          } finally {
            URL.revokeObjectURL(url);
          }
        }
        if (run !== runRef.current) return;
        putFiles(input, out);
        setPreviews(out.map((file) => URL.createObjectURL(file)));
        setMessage(`${out.length} image(s) ready. Each one is cropped to the centre and resized.`);
        return;
      }

      const url = URL.createObjectURL(files[0]);
      nameRef.current = jpgName(files[0].name);
      imageRef.current = loadImage(url);
      const img = await imageRef.current;
      if (run !== runRef.current) {
        URL.revokeObjectURL(url);
        return;
      }
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setSource(url);
      await apply(centerArea(img.naturalWidth, img.naturalHeight, preset.aspect));
    } catch {
      if (run === runRef.current) {
        input.value = "";
        onFile?.(null);
        setMessage(readError);
      }
    }
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

      {source && (
        <>
          <div className="ink-border relative h-72 w-full overflow-hidden rounded-md bg-ink">
            <Cropper
              image={source}
              crop={crop}
              zoom={zoom}
              aspect={preset.aspect}
              showGrid
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_area: Area, pixels: Area) => {
                void apply(pixels);
              }}
            />
          </div>
          <label className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-ink-soft">
            Zoom
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full accent-accent"
            />
          </label>
        </>
      )}

      {previews.length > 0 && (
        <ul className="grid grid-cols-3 gap-2">
          {previews.map((url) => (
            <li
              key={url}
              className="ink-border rounded-sm bg-cover bg-center"
              style={{ aspectRatio: preset.aspect, backgroundImage: `url(${url})` }}
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