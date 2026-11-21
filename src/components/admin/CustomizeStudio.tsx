"use client";

import Link from "next/link";
import { useCallback, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { ProfileHeader } from "@/components/layout/ProfileHeader";
import { PublicFrame } from "@/components/layout/PublicFrame";
import { Field } from "@/components/ui/Field";
import { Img } from "@/components/ui/Img";
import { ImageInput } from "@/components/ui/ImageInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { VideoInput } from "@/components/ui/VideoInput";
import {
  backgroundDefaults,
  backgroundFades,
  backgroundLabels,
  backgroundModes,
  fadeLabels,
  gradientDirections,
  photoModes,
  tintRange,
  type BackgroundFade,
  type BackgroundMode,
  type BackgroundView,
} from "@/config/background";
import {
  defaultFont,
  fontChoices,
  fontGroups,
  fontIds,
  type FontId,
  type FontPair,
} from "@/config/font-choices";
import { cardDefaults, type CardStyle } from "@/config/card";
import { mediaConfig } from "@/config/media";
import { resolveTheme, routes, siteConfig, type ThemeName } from "@/config/site";
import { videoConfig } from "@/config/video";
import { cn } from "@/lib/utils";
import type { Block } from "@/types/block";
import type { FormAction } from "@/types/form";
import type { VideoSignAction } from "@/types/media";
import { CardControls } from "./studio/CardControls";
import { ThemePicker } from "./ThemePicker";

type Props = {
  action: FormAction;
  signVideo: VideoSignAction;
  profile: { username: string; displayName: string; bio: string | null; avatarUrl: string | null };
  theme: ThemeName;
  background: BackgroundView;
  fonts: FontPair;
  card: CardStyle;
  blocks: Block[];
  themes: { name: string; label: string }[];
  notice?: ReactNode;
};

// Everything the sidebar can change. Sent to the server as hidden inputs (see the form below).
type Draft = {
  theme: ThemeName;
  mode: BackgroundMode;
  fade: BackgroundFade;
  color: string;
  color2: string;
  angle: number;
  tint: number;
  gray: boolean;
  fontHeading: FontId;
  fontBody: FontId;
  card: CardStyle;
};

const modeOptions = backgroundModes.map((m) => ({ value: m, label: backgroundLabels[m] }));
const fadeOptions = backgroundFades.map((f) => ({ value: f, label: fadeLabels[f] }));
const angleOptions = gradientDirections.map((d) => ({ value: String(d.value), label: d.label }));

const modeHints: Record<BackgroundMode, string> = {
  color: "Uses the colors of your theme.",
  solid: "One color of your choice.",
  gradient: "Two colors blending into each other.",
  full: "Your photo fills the whole page.",
  banner: "Your photo as a strip at the top.",
  frame: "Your photo in a frame.",
  video: "Your video or GIF fills the whole page.",
};

const pill =
  "ink-border cursor-pointer rounded-full px-3 py-1.5 text-sm has-checked:bg-ink has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";
const colorInput = "ink-border h-10 w-20 cursor-pointer rounded-md bg-surface p-1";
const resetButton =
  "self-start font-mono text-xs uppercase tracking-widest text-ink-soft underline underline-offset-4 hover:text-ink";

// Shown in the preview when you have no live blocks yet.
function sampleBlocks(): Block[] {
  return ["Your first link", "Another link", "One more link"].map(
    (title, index): Block => ({
      id: `sample-${index}`,
      user_id: "",
      type: "link",
      title,
      url: "https://example.com",
      body: null,
      image_url: null,
      data: {},
      position: index,
      is_visible: true,
      is_pinned: false,
      publish_at: null,
      expire_at: null,
      created_at: "",
    }),
  );
}

// Temporary preview address for a file picked on this page. A GIF gets "#.gif" so the public
// components still recognise it as a GIF (they look at how the address ends).
function useLocalUrl(): [string | null, (file: File | null) => void] {
  const ref = useRef<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const pick = useCallback((file: File | null) => {
    if (ref.current) URL.revokeObjectURL(ref.current);
    ref.current = file ? URL.createObjectURL(file) : null;
    setUrl(ref.current ? (file?.type === "image/gif" ? `${ref.current}#.gif` : ref.current) : null);
  }, []);
  return [url, pick];
}

function Section({
  title,
  open,
  onReset,
  children,
}: {
  title: string;
  open?: boolean;
  onReset?: () => void;
  children: ReactNode;
}) {
  return (
    <details open={open} className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 font-medium [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden className="font-mono text-xs text-ink-soft transition-transform group-open:rotate-90">
          →
        </span>
      </summary>
      <div className="flex flex-col gap-5 px-5 pb-5">
        {children}
        {onReset && (
          <button type="button" onClick={onReset} className={resetButton}>
            Reset {title.toLowerCase()}
          </button>
        )}
      </div>
    </details>
  );
}

function Pills({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label key={o.value} className={pill}>
          <input
            type="radio"
            value={o.value}
            checked={o.value === value}
            onChange={() => onChange(o.value)}
            className="sr-only"
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

function FontPicker({
  legend,
  value,
  onChange,
}: {
  legend: string;
  value: FontId;
  onChange: (id: FontId) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 text-sm font-medium text-ink-soft">{legend}</legend>
      {fontGroups.map((group) => (
        <div key={group.id} className="flex flex-col gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">{group.label}</span>
          <div className="grid grid-cols-2 gap-2">
            {fontIds
              .filter((id) => fontChoices[id].group === group.id)
              .map((id) => (
                <label
                  key={id}
                  className="ink-border cursor-pointer rounded-md px-3 py-2 has-checked:bg-ink has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
                >
                  <input
                    type="radio"
                    value={id}
                    checked={id === value}
                    onChange={() => onChange(id)}
                    className="sr-only"
                  />
                  <span
                    className="block text-2xl leading-none"
                    style={{ fontFamily: `var(${fontChoices[id].cssVar}), system-ui, sans-serif` }}
                  >
                    Aa
                  </span>
                  <span className="mt-1 block text-xs">{fontChoices[id].label}</span>
                </label>
              ))}
          </div>
        </div>
      ))}
    </fieldset>
  );
}

export function CustomizeStudio({
  action,
  signVideo,
  profile,
  theme,
  background,
  fonts,
  card,
  blocks,
  themes,
  notice,
}: Props) {
  const [initial] = useState<Draft>(() => ({
    theme,
    mode: background.mode,
    fade: background.fade,
    color: background.color,
    color2: background.color2,
    angle: background.angle,
    tint: background.tint,
    gray: background.gray,
    fontHeading: fonts.heading,
    fontBody: fonts.body,
    card,
  }));
  const [draft, setDraft] = useState<Draft>(initial);
  const [device, setDevice] = useState<"phone" | "desktop">("phone");
  const [photo, pickPhoto] = useLocalUrl();
  const [video, pickVideo] = useLocalUrl();
  const [removePhoto, setRemovePhoto] = useState(false);
  const [removeVideo, setRemoveVideo] = useState(false);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  const photoSrc = photo ?? (removePhoto ? null : background.imageUrl);
  const videoSrc = video ?? (removeVideo ? null : background.videoUrl);

  // Same rule as the server: picking a photo or video while the style is "Theme color" switches to it.
  let mode: BackgroundMode = draft.mode;
  if (photo && mode === "color") mode = "full";
  if (video && mode === "color") mode = "video";

  const view: BackgroundView = {
    mode,
    fade: draft.fade,
    imageUrl: photoSrc,
    videoUrl: videoSrc,
    tint: draft.tint,
    gray: draft.gray,
    color: draft.color,
    color2: draft.color2,
    angle: draft.angle,
  };

  const dirty =
    JSON.stringify(draft) !== JSON.stringify(initial) ||
    photo !== null ||
    video !== null ||
    removePhoto ||
    removeVideo;

  const needsPhoto = photoModes.includes(draft.mode) && !photoSrc;
  const needsVideo = draft.mode === "video" && !videoSrc;
  const previewBlocks = blocks.length > 0 ? blocks : sampleBlocks();
  const plainBg = view.mode === "color" || view.mode === "solid";

  // Links in the preview must not leave the studio.
  function stopLinks(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("a")) event.preventDefault();
  }

  return (
    <form action={action} className="flex h-dvh flex-col">
      {/* The sidebar controls have no name. These hidden inputs are what the server receives. */}
      <input type="hidden" name="theme" value={draft.theme} />
      <input type="hidden" name="bg_mode" value={draft.mode} />
      <input type="hidden" name="bg_fade" value={draft.fade} />
      <input type="hidden" name="bg_color" value={draft.color} />
      <input type="hidden" name="bg_color2" value={draft.color2} />
      <input type="hidden" name="bg_angle" value={draft.angle} />
      <input type="hidden" name="bg_tint" value={draft.tint} />
      <input type="hidden" name="font_heading" value={draft.fontHeading} />
      <input type="hidden" name="font_body" value={draft.fontBody} />
      <input type="hidden" name="card" value={JSON.stringify(draft.card)} />
      {draft.gray && <input type="hidden" name="bg_gray" value="on" />}
      {removePhoto && <input type="hidden" name="remove_bg_image" value="on" />}
      {removeVideo && <input type="hidden" name="remove_bg_video" value="on" />}

      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-5 py-3">
        <Link
          href={routes.admin}
          className="font-mono text-sm uppercase tracking-wider text-ink-soft hover:text-ink"
        >
          ← Back
        </Link>
        <span className="font-display text-lg font-medium">Customize</span>
        {dirty && <span className="font-mono text-xs text-accent">● Unsaved changes</span>}
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden gap-1 lg:flex" role="group" aria-label="Preview size">
            {(["phone", "desktop"] as const).map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={device === d}
                onClick={() => setDevice(d)}
                className={cn(
                  "rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-wider",
                  device === d ? "bg-ink text-bg" : "text-ink-soft hover:text-ink",
                )}
              >
                {d}
              </button>
            ))}
          </div>
          <a
            href={routes.profile(profile.username)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm underline underline-offset-4"
          >
            View page
          </a>
          <SubmitButton variant="accent" size="sm">
            Save changes
          </SubmitButton>
        </div>
      </header>

      {notice && <div className="px-5 pt-3">{notice}</div>}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="order-2 min-h-0 flex-1 overflow-y-auto border-t border-line lg:order-1 lg:w-[360px] lg:flex-none lg:border-r lg:border-t-0">
          <Section title="Theme" open onReset={() => set("theme", siteConfig.defaultTheme)}>
            <ThemePicker value={draft.theme} options={themes} onChange={(v) => set("theme", resolveTheme(v))} />
          </Section>

          <Section title="Background" open onReset={() => setDraft((d) => ({ ...d, ...backgroundDefaults }))}>
            <div className="flex flex-col gap-2">
              <Pills options={modeOptions} value={draft.mode} onChange={(v) => set("mode", v as BackgroundMode)} />
              <p className="text-xs text-ink-soft">{modeHints[draft.mode]}</p>
              {needsPhoto && (
                <p className="text-xs text-accent">Upload a photo below to use this style, or pick another one.</p>
              )}
              {needsVideo && (
                <p className="text-xs text-accent">Upload a video or GIF below to use this style, or pick another one.</p>
              )}
            </div>

            {(draft.mode === "solid" || draft.mode === "gradient") && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="Color" htmlFor="ui_color" hint="Text turns light or dark by itself.">
                  <input
                    id="ui_color"
                    type="color"
                    value={draft.color}
                    onChange={(e) => set("color", e.target.value)}
                    className={colorInput}
                  />
                </Field>
                {draft.mode === "gradient" && (
                  <Field label="Second color" htmlFor="ui_color2">
                    <input
                      id="ui_color2"
                      type="color"
                      value={draft.color2}
                      onChange={(e) => set("color2", e.target.value)}
                      className={colorInput}
                    />
                  </Field>
                )}
              </div>
            )}

            {draft.mode === "gradient" && (
              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium text-ink-soft">Gradient direction</span>
                <Pills
                  options={angleOptions}
                  value={String(draft.angle)}
                  onChange={(v) => set("angle", Number(v))}
                />
                <Field label={`Angle: ${draft.angle}°`} htmlFor="ui_angle">
                  <input
                    id="ui_angle"
                    type="range"
                    min={0}
                    max={359}
                    step={5}
                    value={draft.angle}
                    onChange={(e) => set("angle", Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </Field>
              </div>
            )}

            {(draft.mode === "full" || draft.mode === "video") && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-ink-soft">Fade</span>
                  <Pills
                    options={fadeOptions}
                    value={draft.fade}
                    onChange={(v) => set("fade", v as BackgroundFade)}
                  />
                </div>
                <Field
                  label={`Photo overlay: ${draft.tint}`}
                  htmlFor="ui_tint"
                  hint="Higher makes the fade stronger so text stays readable."
                >
                  <input
                    id="ui_tint"
                    type="range"
                    min={tintRange.min}
                    max={tintRange.max}
                    step={tintRange.step}
                    value={draft.tint}
                    onChange={(e) => set("tint", Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.gray}
                    onChange={(e) => set("gray", e.target.checked)}
                    className="accent-accent"
                  />
                  Show the photo or video in black and white
                </label>
              </div>
            )}

            {/* The file inputs are always on the page (never hidden by the style), so a picked file is not lost. */}
            <div className="flex flex-col gap-2">
              {background.imageUrl && !photo && !removePhoto && (
                <Img src={background.imageUrl} className="ink-border h-24 w-20 rounded-md object-cover" />
              )}
              <Field
                label="Background photo"
                htmlFor="bg_image"
                hint={`JPG, PNG or WebP, up to ${mediaConfig.maxMb} MB. Leave empty to keep the current one.`}
              >
                <ImageInput id="bg_image" name="bg_image" kind="background" accept={mediaConfig.accept} onFile={pickPhoto} />
              </Field>
              {background.imageUrl && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={removePhoto}
                    onChange={(e) => setRemovePhoto(e.target.checked)}
                    className="accent-accent"
                  />
                  Remove the current photo
                </label>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {background.videoUrl && !video && !removeVideo && (
                <p className="text-xs text-ink-soft">A video or GIF is saved.</p>
              )}
              <Field
                label="Background video or GIF"
                htmlFor="bg_video"
                hint={`MP4, WebM or GIF. Videos: up to ${videoConfig.maxSeconds} seconds and ${videoConfig.videoMaxMb} MB. GIFs: up to ${videoConfig.gifMaxMb} MB. It uploads as soon as you pick it, then press Save changes.`}
              >
                <VideoInput id="bg_video" name="bg_video_path" sign={signVideo} onFile={pickVideo} />
              </Field>
              {background.videoUrl && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={removeVideo}
                    onChange={(e) => setRemoveVideo(e.target.checked)}
                    className="accent-accent"
                  />
                  Remove the current video
                </label>
              )}
            </div>
          </Section>

          <Section
            title="Font"
            onReset={() => setDraft((d) => ({ ...d, fontHeading: defaultFont, fontBody: defaultFont }))}
          >
            <FontPicker
              legend="Heading font"
              value={draft.fontHeading}
              onChange={(id) => set("fontHeading", id)}
            />
            <FontPicker legend="Body font" value={draft.fontBody} onChange={(id) => set("fontBody", id)} />
          </Section>

          <Section title="Card" onReset={() => set("card", cardDefaults)}>
            <CardControls card={draft.card} onChange={(next) => set("card", next)} plainBackground={plainBg} />
          </Section>
        </aside>

        <section
          aria-label="Preview"
          className="order-1 h-[45dvh] shrink-0 bg-highlight p-3 lg:order-2 lg:h-auto lg:min-w-0 lg:flex-1 lg:shrink lg:p-6"
        >
          {/* translateZ(0) keeps the "fixed" background of the page inside this box. */}
          <div
            className="relative mx-auto h-full overflow-hidden rounded-lg border border-line [transform:translateZ(0)]"
            style={{ maxWidth: device === "phone" ? 390 : undefined }}
          >
            <div className="absolute inset-0 overflow-y-auto" onClickCapture={stopLinks}>
              <PublicFrame
                theme={draft.theme}
                background={view}
                fonts={{ heading: draft.fontHeading, body: draft.fontBody }}
                card={draft.card}
              >
                <ProfileHeader
                  displayName={profile.displayName}
                  username={profile.username}
                  bio={profile.bio}
                  avatarUrl={profile.avatarUrl}
                />
                <BlockRenderer blocks={previewBlocks} glass={draft.card.kind === "glass"} />
              </PublicFrame>
            </div>
          </div>
        </section>
      </div>
    </form>
  );
}