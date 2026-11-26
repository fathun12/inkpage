"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cropRatios, type CropRatioId } from "@/config/crops";
import { cropAreaToFile, type CropOutput } from "@/lib/crop-output";
import { loadImage, type PixelArea } from "@/lib/image-crop";
import { isAnimatedWebp } from "@/lib/site-image";
import { cn } from "@/lib/utils";

export type CropOptions = CropOutput & {
  // The ratio the window opens with (width / height). Empty = Free.
  aspect?: number;
  // A small line next to the title, for example "Image 2 of 5".
  note?: string;
};

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";
type Drag = { kind: "move" | Handle; start: PixelArea; x: number; y: number };

const stills = ["image/jpeg", "image/png", "image/webp"];
const corners: Handle[] = ["nw", "ne", "se", "sw"];
const edges: Handle[] = ["n", "e", "s", "w"];
const cursors: Record<Handle, string> = {
  nw: "nwse-resize",
  se: "nwse-resize",
  ne: "nesw-resize",
  sw: "nesw-resize",
  n: "ns-resize",
  s: "ns-resize",
  e: "ew-resize",
  w: "ew-resize",
};
const readError = "This image could not be read. Try a JPG, PNG or WebP file.";

const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

// Width / height of a ratio, or null for Free.
function ratioValue(ratio: CropRatioId, portrait: boolean): number | null {
  if (ratio === "free") return null;
  const entry = cropRatios.find((r) => r.id === ratio);
  if (!entry) return null;
  const wide = entry.a / entry.b;
  return portrait ? 1 / wide : wide;
}

// Which ratio the window opens with: the one that matches the wanted aspect, else Free.
function startChoice(aspect: number | undefined, width: number, height: number): { ratio: CropRatioId; portrait: boolean } {
  if (aspect) {
    for (const entry of cropRatios) {
      const wide = entry.a / entry.b;
      if (Math.abs(aspect - wide) < 0.001) return { ratio: entry.id, portrait: false };
      if (Math.abs(aspect - 1 / wide) < 0.001) return { ratio: entry.id, portrait: true };
    }
  }
  return { ratio: "free", portrait: height > width };
}

// The biggest area of a ratio, centred in the image. Free = the whole image.
function fitRect(width: number, height: number, r: number | null): PixelArea {
  if (r === null) return { x: 0, y: 0, width, height };
  const w = width / height >= r ? height * r : width;
  const h = w / r;
  return { x: (width - w) / 2, y: (height - h) / 2, width: w, height: h };
}

// New area while a handle is dragged. The opposite corner stays where it is. With a ratio, only corners are used.
function resizeRect(
  handle: Handle,
  start: PixelArea,
  px: number,
  py: number,
  r: number | null,
  W: number,
  H: number,
  min: number,
): PixelArea {
  const right = start.x + start.width;
  const bottom = start.y + start.height;
  if (r === null) {
    let left = start.x;
    let top = start.y;
    let rt = right;
    let bt = bottom;
    if (handle.includes("w")) left = clamp(px, 0, right - min);
    if (handle.includes("e")) rt = clamp(px, start.x + min, W);
    if (handle.includes("n")) top = clamp(py, 0, bottom - min);
    if (handle.includes("s")) bt = clamp(py, start.y + min, H);
    return { x: left, y: top, width: rt - left, height: bt - top };
  }
  const west = handle.includes("w");
  const north = handle.includes("n");
  const ax = west ? right : start.x;
  const ay = north ? bottom : start.y;
  const roomX = west ? ax : W - ax;
  const roomY = north ? ay : H - ay;
  const maxW = Math.min(roomX, roomY * r);
  const wanted = Math.max(Math.abs(px - ax), Math.abs(py - ay) * r);
  const width = Math.min(Math.max(wanted, Math.max(min, min * r)), maxW);
  const height = width / r;
  return { x: west ? ax - width : ax, y: north ? ay - height : ay, width, height };
}

const pill = (on: boolean) =>
  cn(
    "ink-border rounded-md px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40",
    on ? "bg-ink text-bg" : "hover:border-ink",
  );

type DialogProps = { file: File; options: CropOptions; onDone: (result: File | null) => void };

function CropDialog({ file, options, onDone }: DialogProps) {
  const frame = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ratio, setRatio] = useState<CropRatioId>("free");
  const [portrait, setPortrait] = useState(false);
  const [rect, setRect] = useState<PixelArea | null>(null);

  useEffect(() => {
    const source = URL.createObjectURL(file);
    let alive = true;
    loadImage(source).then(
      (loaded) => {
        if (!alive) return;
        const choice = startChoice(options.aspect, loaded.naturalWidth, loaded.naturalHeight);
        setRatio(choice.ratio);
        setPortrait(choice.portrait);
        setRect(fitRect(loaded.naturalWidth, loaded.naturalHeight, ratioValue(choice.ratio, choice.portrait)));
        setUrl(source);
        setImg(loaded);
      },
      () => {
        if (alive) setError(readError);
      },
    );
    return () => {
      alive = false;
      URL.revokeObjectURL(source);
    };
  }, [file, options.aspect]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onDone(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onDone]);

  const W = img?.naturalWidth ?? 1;
  const H = img?.naturalHeight ?? 1;
  const r = ratioValue(ratio, portrait);
  const min = Math.max(16, Math.round(Math.min(W, H) * 0.04));
  const canTurn = ratio !== "free" && ratio !== "1:1";

  function choose(nextRatio: CropRatioId, nextPortrait: boolean = portrait) {
    setRatio(nextRatio);
    setPortrait(nextPortrait);
    const value = ratioValue(nextRatio, nextPortrait);
    if (value !== null && img) setRect(fitRect(W, H, value));
  }

  function point(event: ReactPointerEvent<HTMLElement>) {
    const box = frame.current?.getBoundingClientRect();
    if (!box || box.width === 0 || box.height === 0) return { x: 0, y: 0 };
    return { x: ((event.clientX - box.left) / box.width) * W, y: ((event.clientY - box.top) / box.height) * H };
  }

  // One set of handlers for the move area and for every handle. An element says which one it is in data-grab.
  function onDown(event: ReactPointerEvent<HTMLElement>) {
    if (!rect) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const p = point(event);
    const kind = (event.currentTarget.dataset.grab ?? "move") as Drag["kind"];
    drag.current = { kind, start: rect, x: p.x, y: p.y };
  }

  function onMove(event: ReactPointerEvent<HTMLElement>) {
    const d = drag.current;
    if (!d) return;
    const p = point(event);
    if (d.kind === "move") {
      setRect({
        ...d.start,
        x: clamp(d.start.x + p.x - d.x, 0, W - d.start.width),
        y: clamp(d.start.y + p.y - d.y, 0, H - d.start.height),
      });
    } else {
      setRect(resizeRect(d.kind, d.start, p.x, p.y, r, W, H, min));
    }
  }

  function onUp() {
    drag.current = null;
  }

  async function apply() {
    if (!img || !rect) return;
    setBusy(true);
    try {
      onDone(await cropAreaToFile(img, rect, options, file.name));
    } catch {
      setBusy(false);
      setError("This image could not be cropped. Try Use original.");
    }
  }

  const pct = (value: number, total: number) => `${(value / total) * 100}%`;
  const box = rect
    ? { left: pct(rect.x, W), top: pct(rect.y, H), width: pct(rect.width, W), height: pct(rect.height, H) }
    : undefined;

  return createPortal(
    <div
      role="presentation"
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Crop image"
        className="my-auto flex w-full max-w-2xl flex-col gap-4 rounded-md bg-bg p-5 text-ink shadow-xl"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl font-bold">Crop image</h2>
          {options.note && <span className="font-mono text-xs text-ink-soft">{options.note}</span>}
        </div>

        <div className="flex min-h-40 items-center justify-center rounded-md bg-surface p-3">
          {error ? (
            <p role="alert" className="text-sm text-accent">
              {error}
            </p>
          ) : url && img && rect && box ? (
            <div
              ref={frame}
              role="img"
              aria-label="Image to crop"
              className="relative touch-none select-none"
              style={{
                width: `min(100%, calc(50dvh * ${W / H}))`,
                aspectRatio: `${W} / ${H}`,
                backgroundImage: `url("${url}")`,
                backgroundSize: "100% 100%",
              }}
            >
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute border border-white" style={{ ...box, boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)" }} />
              </div>
              <div
                aria-hidden
                data-grab="move"
                onPointerDown={onDown}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={onUp}
                className="absolute cursor-move"
                style={box}
              />
              {(r === null ? [...corners, ...edges] : corners).map((handle) => {
                const fx = handle.includes("w") ? 0 : handle.includes("e") ? 1 : 0.5;
                const fy = handle.includes("n") ? 0 : handle.includes("s") ? 1 : 0.5;
                return (
                  <div
                    key={handle}
                    aria-hidden
                    data-grab={handle}
                    onPointerDown={onDown}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onPointerCancel={onUp}
                    className="absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/30 bg-white shadow"
                    style={{
                      left: pct(rect.x + rect.width * fx, W),
                      top: pct(rect.y + rect.height * fy, H),
                      cursor: cursors[handle],
                    }}
                  />
                );
              })}
            </div>
          ) : (
            <p className="font-mono text-xs text-ink-soft">Opening the image...</p>
          )}
        </div>

        <p className="text-center font-mono text-xs text-ink-soft">
          Drag to move. Pull a corner to resize.
          {rect ? ` Crop: ${Math.round(rect.width)} × ${Math.round(rect.height)} px.` : ""}
        </p>

        <div role="group" aria-label="Crop ratio" className="flex flex-wrap items-center justify-center gap-2">
          <button type="button" aria-pressed={ratio === "free"} onClick={() => choose("free")} className={pill(ratio === "free")}>
            Free
          </button>
          {cropRatios.map((entry) => (
            <button
              key={entry.id}
              type="button"
              aria-pressed={ratio === entry.id}
              onClick={() => choose(entry.id)}
              className={pill(ratio === entry.id)}
            >
              {portrait ? `${entry.b}:${entry.a}` : `${entry.a}:${entry.b}`}
            </button>
          ))}
        </div>

        <div role="group" aria-label="Orientation" className="flex items-center justify-center gap-2">
          {([true, false] as const).map((wantPortrait) => (
            <button
              key={String(wantPortrait)}
              type="button"
              disabled={!canTurn}
              aria-pressed={canTurn && portrait === wantPortrait}
              onClick={() => choose(ratio, wantPortrait)}
              className={pill(canTurn && portrait === wantPortrait)}
            >
              {wantPortrait ? "Portrait" : "Landscape"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <button
            type="button"
            onClick={() => onDone(file)}
            disabled={busy || Boolean(error)}
            className="font-mono text-xs uppercase tracking-widest underline underline-offset-4 disabled:opacity-40"
          >
            Use original
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onDone(null)}
              className="font-mono text-xs uppercase tracking-widest text-ink-soft hover:text-ink"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={apply}
              disabled={!rect || busy || Boolean(error)}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-bg disabled:opacity-50"
            >
              {busy ? "Cropping..." : "Use crop"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

type Pending = { file: File; options: CropOptions; resolve: (file: File | null) => void };

// Opens the crop window for one picture and waits for the answer.
// The answer is: the cropped file, the SAME file (Use original), or null (Cancel).
// GIF, video and animated WebP are returned at once, untouched.
export function useCrop(): {
  ask: (file: File, options: CropOptions) => Promise<File | null>;
  dialog: ReactNode;
} {
  const [pending, setPending] = useState<Pending | null>(null);

  const ask = useCallback(async (file: File, options: CropOptions): Promise<File | null> => {
    if (!stills.includes(file.type)) return file;
    if (file.type === "image/webp" && (await isAnimatedWebp(file))) return file;
    return new Promise<File | null>((resolve) => setPending({ file, options, resolve }));
  }, []);

  const dialog = pending ? (
    <CropDialog
      key={`${pending.file.name}-${pending.file.size}-${pending.file.lastModified}`}
      file={pending.file}
      options={pending.options}
      onDone={(result) => {
        pending.resolve(result);
        setPending(null);
      }}
    />
  ) : null;

  return { ask, dialog };
}