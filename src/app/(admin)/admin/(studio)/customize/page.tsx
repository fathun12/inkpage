import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CustomizeStudio } from "@/components/admin/CustomizeStudio";
import { FlashNotice } from "@/components/ui/FlashNotice";
import { readBackground } from "@/config/background";
import { readFonts } from "@/config/font-choices";
import { readSite } from "@/config/site-content";
import { readSiteStyle } from "@/config/site-style";
import { routes } from "@/config/site";
import { updateAppearanceAction } from "@/features/appearance/actions";
import { requireUser } from "@/features/auth/queries";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileById } from "@/features/profile/queries";
import { savedText } from "@/lib/flash";
import { buildNav, listBlocks, resolveHomeMedia, socialsOf } from "@/lib/site-view";

export const metadata: Metadata = { title: "Customize" };

type Props = { searchParams: Promise<{ error?: string; saved?: string; t?: string }> };

export default async function CustomizePage({ searchParams }: Props) {
  const { error, saved, t } = await searchParams;
  const user = await requireUser();
  const profile = await getProfileById(user.id);
  if (!profile) redirect(routes.setup);

  const blocks = await getPublicBlocks(profile.id);
  const site = readSite(profile.site);
  const base = routes.profile(profile.username);

  const notice = error ? (
    <FlashNotice tone="error">{error}</FlashNotice>
  ) : saved ? (
    <FlashNotice tone="ok">{savedText(saved)}</FlashNotice>
  ) : null;

  // key={t}: after every save or error the studio starts fresh from the saved data.
  return (
    <CustomizeStudio
      key={t ?? "initial"}
      action={updateAppearanceAction}
      profile={{ username: profile.username, displayName: profile.display_name, bio: profile.bio }}
      fonts={readFonts(profile)}
      style={readSiteStyle(profile.site_style)}
      site={site}
      media={resolveHomeMedia(site, readBackground(profile), blocks)}
      rows={listBlocks(blocks, "home").slice(0, 6)}
      socials={socialsOf(blocks)}
      nav={buildNav(base, site)}
      notice={notice}
    />
  );
}