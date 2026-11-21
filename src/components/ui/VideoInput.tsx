"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/Field";
import { Notice } from "@/components/ui/Notice";
import { mediaConfig } from "@/config/media";
import { videoAccept, videoConfig, videoTypes } from "@/config/video";
import { uploadToSignedPath } from "@/lib/direct-upload";
import type { VideoSignAction } from "@/types/media";

type Props = {
  id: string;
  name: string;
  sign: VideoSignAction;
  onFile?: (file: File | null) => void;
};
type Note = { tone: "info" | "error"; text: string } | null;

const MB = 1024 * 1024;

function readDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    let timer = 0;
    const done = (finish: () => void) => {
      window.clearTimeout(timer);
      video.removeAttribute("src");
      URL.revokeObjectURL(url);
      finish();
    };
    timer = window.setTimeout(() => done(() => reject(new Error("timeout"))), 8000);
    video.preload = "metadata";
    video.onloadedmetadata = () => done(() => resolve(video.duration));
    video.onerror = () => done(() => reject(new Error("unreadable")));
    video.src = url;
  });
}

// The file itself is NOT part of the form (the input has no name). It is uploaded straight to
// Storage as soon as it is picked, and only its storage path travels with the form.
export function VideoInput({ id, name, sign, onFile }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const runRef = useRef(0);
  const [path, setPath] = useState("");
  const [note, setNote] = useState<Note>(null);

  function lockSave(locked: boolean) {
    const form = wrapRef.current?.closest("form");
    form?.querySelectorAll<HTMLButtonElement>('button[type="submit"]').forEach((button) => {
      button.disabled = locked;
    });
  }

  function fail(input: HTMLInputElement, text: string) {
    input.value = "";
    setPath("");
    onFile?.(null);
    setNote({ tone: "error", text });
    lockSave(false);
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    runRef.current += 1;
    const run = runRef.current;
    setPath("");

    if (!file) {
      onFile?.(null);
      setNote(null);
      lockSave(false);
      return;
    }

    const kind = videoTypes.find((t) => t.mime === file.type);
    if (!kind) return fail(input, "Use an MP4, WebM or GIF file.");
    const isGif = kind.ext === "gif";
    const maxMb = isGif ? videoConfig.gifMaxMb : videoConfig.videoMaxMb;
    if (file.size > maxMb * MB) {
      return fail(input, `This file is ${(file.size / MB).toFixed(1)} MB. The limit is ${maxMb} MB.`);
    }

    lockSave(true);
    try {
      if (!isGif) {
        setNote({ tone: "info", text: "Checking the video..." });
        const seconds = await readDuration(file);
        if (run !== runRef.current) return;
        if (Number.isFinite(seconds) && seconds > videoConfig.maxSeconds + 0.5) {
          return fail(
            input,
            `This video is ${Math.round(seconds)} seconds long. The limit is ${videoConfig.maxSeconds} seconds.`,
          );
        }
      }

      setNote({ tone: "info", text: "Uploading... keep this page open." });
      const signed = await sign({ name: file.name, type: file.type, size: file.size });
      if (run !== runRef.current) return;
      if ("error" in signed) return fail(input, signed.error);

      const failure = await uploadToSignedPath(mediaConfig.bucket, signed.path, signed.token, file);
      if (run !== runRef.current) return;
      if (failure) return fail(input, `Upload failed: ${failure}`);

      setPath(signed.path);
      onFile?.(file);
      setNote({
        tone: "info",
        text: `Uploaded (${(file.size / MB).toFixed(1)} MB). Now press Save changes to use it.`,
      });
      lockSave(false);
    } catch {
      if (run === runRef.current) fail(input, "This file could not be read. Try an MP4 (H.264) file.");
    }
  }

  return (
    <div ref={wrapRef} className="flex flex-col gap-2">
      <Input id={id} type="file" accept={videoAccept} onChange={handleChange} />
      <input type="hidden" name={name} value={path} />
      {note?.tone === "error" && <Notice>{note.text}</Notice>}
      {note?.tone === "info" && (
        <p role="status" className="font-mono text-xs text-ink-soft">
          {note.text}
        </p>
      )}
    </div>
  );
}