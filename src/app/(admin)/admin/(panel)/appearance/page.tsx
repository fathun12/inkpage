import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { Notice } from "@/components/ui/Notice";
import { routes, themeLabels, themeNames } from "@/config/site";
import { requireUser } from "@/features/auth/queries";
import { updateProfileAction } from "@/features/profile/actions";
import { getProfileById } from "@/features/profile/queries";

export const metadata: Metadata = { title: "Appearance" };

type Props = { searchParams: Promise<{ error?: string; saved?: string }> };

const themes = themeNames.map((name) => ({ name, label: themeLabels[name] }));

export default async function AppearancePage({ searchParams }: Props) {
  const { error, saved } = await searchParams;
  const user = await requireUser();
  const profile = await getProfileById(user.id);
  if (!profile) redirect(routes.setup);

  return (
    <div className="flex max-w-xl flex-col gap-8">
      <h1 className="font-display text-4xl font-black">Appearance</h1>
      {error && <Notice>{error}</Notice>}
      {saved && <Notice tone="ok">Saved.</Notice>}
      <ProfileForm action={updateProfileAction} profile={profile} themes={themes} />
    </div>
  );
}