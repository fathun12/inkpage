import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { FlashNotice } from "@/components/ui/FlashNotice";
import { routes } from "@/config/site";
import { requireUser } from "@/features/auth/queries";
import { updateProfileAction } from "@/features/profile/actions";
import { getProfileById } from "@/features/profile/queries";
import { savedText } from "@/lib/flash";

export const metadata: Metadata = { title: "Profile" };

type Props = { searchParams: Promise<{ error?: string; saved?: string; t?: string }> };

export default async function ProfilePage({ searchParams }: Props) {
  const { error, saved, t } = await searchParams;
  const user = await requireUser();
  const profile = await getProfileById(user.id);
  if (!profile) redirect(routes.setup);

  return (
    <div className="flex max-w-xl flex-col gap-8">
      <h1 className="font-display text-4xl font-black">Profile</h1>
      {error && <FlashNotice key={t} tone="error">{error}</FlashNotice>}
      {saved && <FlashNotice key={t} tone="ok">{savedText(saved)}</FlashNotice>}
      <ProfileForm action={updateProfileAction} profile={profile} />
    </div>
  );
}