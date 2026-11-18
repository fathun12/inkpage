import { Field, Input, Textarea } from "@/components/ui/Field";
import { Img } from "@/components/ui/Img";
import { ImageInput } from "@/components/ui/ImageInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { backgroundLabels, backgroundModes, readBackground, tintRange } from "@/config/background";
import { mediaConfig } from "@/config/media";
import type { FormAction } from "@/types/form";
import type { Profile } from "@/types/profile";
import { ThemePicker } from "./ThemePicker";

type Props = {
  action: FormAction;
  profile: Profile;
  themes: { name: string; label: string }[];
};

export function ProfileForm({ action, profile, themes }: Props) {
  const bg = readBackground(profile);
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

      <ThemePicker current={profile.theme} options={themes} />

      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-medium">Background</h2>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1.5 text-sm font-medium text-ink-soft">Style</legend>
          <div className="flex flex-wrap gap-2">
            {backgroundModes.map((m) => (
              <label
                key={m}
                className="ink-border cursor-pointer rounded-full px-4 py-2 text-sm has-checked:bg-ink has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
              >
                <input
                  type="radio"
                  name="bg_mode"
                  value={m}
                  defaultChecked={m === bg.mode}
                  className="sr-only"
                />
                {backgroundLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">
            Plain color uses your theme. Full page, Banner and Frame use the photo below.
          </p>
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

        <Field
          label="Photo overlay"
          htmlFor="bg_tint"
          hint="Higher covers the photo with your theme color so text stays readable. Used by Full page."
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