import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CustomizeStudio } from "@/components/admin/CustomizeStudio";
import { FlashNotice } from "@/components/ui/FlashNotice";
import { readFonts } from "@/config/font-choices";
import { readSiteStyle } from "@/config/site-style";
import { routes } from "@/config/site";
import { updateAppearanceAction } from "@/features/appearance/actions";
import { requireUser } from "@/features/auth/queries";
import { getProfileById } from "@/features/profile/queries";
import { savedText } from "@/lib/flash";

export const metadata: Metadata = { title: "Customize" };

type Props = { searchParams: Promise<{ error?: string; saved?: string; t?: string }> };

export default async function CustomizePage({ searchParams }: Props) {
  const { error, saved, t } = await searchParams;
  const user = await requireUser();
  const profile = await getProfileById(user.id);
  if (!profile) redirect(routes.setup);

  const notice = error ? (
    <FlashNotice tone="error">{error}</FlashNotice>
  ) : saved ? (
    <FlashNotice tone="ok">{savedText(saved)}</FlashNotice>
  ) : null;

  // key={t}: after every save or error the studio starts fresh from the saved data.
  // The preview is a separate page (/admin/preview) shown in a frame; it loads the same data as Home.
  return (
    <CustomizeStudio
      key={t ?? "initial"}
      action={updateAppearanceAction}
      username={profile.username}
      fonts={readFonts(profile)}
      style={readSiteStyle(profile.site_style)}
      notice={notice}
    />
  );
}