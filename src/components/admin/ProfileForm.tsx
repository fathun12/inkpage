import { Field, Input, Textarea } from "@/components/ui/Field";
import { Img } from "@/components/ui/Img";
import { ImageInput } from "@/components/ui/ImageInput";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { mediaConfig } from "@/config/media";
import type { FormAction } from "@/types/form";
import type { Profile } from "@/types/profile";

type Props = { action: FormAction; profile: Profile };

// Profile only: name, bio and avatar. Looks of the page live in the Customize studio.
export function ProfileForm({ action, profile }: Props) {
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

      <div>
        <SubmitButton variant="accent">Save changes</SubmitButton>
      </div>
    </form>
  );
}