import { Field, Input, Textarea } from "@/components/ui/Field";
import { Img } from "@/components/ui/Img";
import { ImageInput } from "@/components/ui/ImageInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  backgroundFades,
  backgroundLabels,
  backgroundModes,
  fadeLabels,
  gradientDirections,
  readBackground,
  tintRange,
} from "@/config/background";
import { mediaConfig } from "@/config/media";
import { resolveTheme } from "@/config/site";
import type { FormAction } from "@/types/form";
import type { Profile } from "@/types/profile";
import { ThemePicker } from "./ThemePicker";

type Props = {
  action: FormAction;
  profile: Profile;
  themes: { name: string; label: string }[];
};

const pill =
  "ink-border cursor-pointer rounded-full px-4 py-2 text-sm has-checked:bg-ink has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";

const colorInput = "ink-border h-10 w-20 cursor-pointer rounded-md bg-surface p-1";

type Option = { value: string; label: string };

function Pills({ name, options, current }: { name: string; options: Option[]; current: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label key={o.value} className={pill}>
          <input
            type="radio"
            name={name}
            value={o.value}
            defaultChecked={o.value === current}
            className="sr-only"
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}

export function ProfileForm({ action, profile, themes }: Props) {
  const bg = readBackground(profile);
  const modeOptions = backgroundModes.map((m) => ({ value: m, label: backgroundLabels[m] }));
  const angleOptions = gradientDirections.map((d) => ({ value: String(d.value), label: d.label }));
  const fadeOptions = backgroundFades.map((f) => ({ value: f, label: fadeLabels[f] }));

  return (
    <form action={action} className="flex flex-col gap-8">
      <section className="flex flex-col gap-6">
        <Field label="Username" htmlFor="username" hint="Your page address. It cannot be changed here.">
          <Input id="username" defaultValue={profile.username} readOnly />
        </Field>
        <Field label="Display name" htmlFor="display_name">
          <Input id="display_name" name="display_name" defaultValue={profile.display_name} required maxLength={60} />
        </Field>
        <Field label="Bio" htmlFor="bio">
          <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} rows={3} maxLength={240} />
        </Field>
        <div className="flex flex-col gap-2">
          {profile.avatar_url && (
            <Img src={profile.avatar_url} className="size-24 rounded-full object-cover" />
          )}
          <Field
            label="Avatar"
            htmlFor="avatar"
            hint={`JPG, PNG or WebP, up to ${mediaConfig.maxMb} MB. Leave empty to keep the current one or use your initial.`}
          >
            <ImageInput id="avatar" name="avatar" kind="avatar" accept={mediaConfig.accept} />
          </Field>
          {profile.avatar_url && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="remove_avatar" className="accent-accent" />
              Remove the current avatar
            </label>
          )}
        </div>
      </section>

      <ThemePicker current={resolveTheme(profile.theme)} options={themes} />

      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-medium">Background</h2>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-medium text-ink-soft">Style</legend>
          <Pills name="bg_mode" options={modeOptions} current={bg.mode} />
          <p className="text-xs text-ink-soft">
            Theme color uses your theme. Solid color and Gradient use the colors below. The photo styles use the photo below.
          </p>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Color"
            htmlFor="bg_color"
            hint="Used by Solid color and Gradient. Text turns light or dark by itself so it stays readable."
          >
            <input id="bg_color" name="bg_color" type="color" defaultValue={bg.color} className={colorInput} />
          </Field>
          <Field label="Second color" htmlFor="bg_color2" hint="Gradient only.">
            <input id="bg_color2" name="bg_color2" type="color" defaultValue={bg.color2} className={colorInput} />
          </Field>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-medium text-ink-soft">Gradient direction</legend>
          <Pills name="bg_angle" options={angleOptions} current={String(bg.angle)} />
        </fieldset>

        <div className="flex flex-col gap-2">
          {bg.imageUrl && <Img src={bg.imageUrl} className="ink-border h-32 w-24 rounded-md object-cover" />}
          <Field
            label="Background photo"
            htmlFor="bg_image"
            hint={`JPG, PNG or WebP, up to ${mediaConfig.maxMb} MB. Leave empty to keep the current one.`}
          >
            <ImageInput id="bg_image" name="bg_image" kind="background" accept={mediaConfig.accept} />
          </Field>
          {bg.imageUrl && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="remove_bg_image" className="accent-accent" />
              Remove the current photo
            </label>
          )}
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-medium text-ink-soft">Full page photo fade</legend>
          <Pills name="bg_fade" options={fadeOptions} current={bg.fade} />
          <p className="text-xs text-ink-soft">
            Which end of the photo melts into your theme color. Used by Full page photo.
          </p>
        </fieldset>

        <Field
          label="Photo overlay"
          htmlFor="bg_tint"
          hint="Higher makes the fade stronger so text stays readable. Used by Full page photo."
        >
          <input
            id="bg_tint"
            name="bg_tint"
            type="range"
            min={tintRange.min}
            max={tintRange.max}
            step={tintRange.step}
            defaultValue={bg.tint}
            className="w-full accent-accent"
          />
        </Field>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="bg_gray" defaultChecked={bg.gray} className="accent-accent" />
          Show the photo in black and white
        </label>
      </section>

      <div>
        <SubmitButton variant="accent">Save changes</SubmitButton>
      </div>
    </form>
  );
}