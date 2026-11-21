import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CustomizeStudio } from "@/components/admin/CustomizeStudio";
import { FlashNotice } from "@/components/ui/FlashNotice";
import { readBackground } from "@/config/background";
import { readCustomTheme } from "@/config/custom-theme";
import { readFonts } from "@/config/font-choices";
import { resolveTheme, routes, themeLabels, themeNames } from "@/config/site";
import { createVideoUploadAction, updateAppearanceAction } from "@/features/appearance/actions";
import { requireUser } from "@/features/auth/queries";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileById } from "@/features/profile/queries";
import { readCard } from "@/lib/card-style";
import { savedText } from "@/lib/flash";

export const metadata: Metadata = { title: "Customize" };

type Props = { searchParams: Promise<{ error?: string; saved?: string; t?: string }> };

const themes = themeNames.map((name) => ({ name, label: themeLabels[name] }));

export default async function CustomizePage({ searchParams }: Props) {
  const { error, saved, t } = await searchParams;
  const user = await requireUser();
  const profile = await getProfileById(user.id);
  if (!profile) redirect(routes.setup);

  // The preview shows up to 6 live blocks. Embeds are skipped to keep it light.
  const blocks = (await getPublicBlocks(profile.id)).filter((b) => b.type !== "embed").slice(0, 6);

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
      signVideo={createVideoUploadAction}
      profile={{
        username: profile.username,
        displayName: profile.display_name,
        bio: profile.bio,
        avatarUrl: profile.avatar_url,
      }}
      theme={resolveTheme(profile.theme)}
      customTheme={readCustomTheme(profile)}
      background={readBackground(profile)}
      fonts={readFonts(profile)}
      card={readCard(profile.card)}
      blocks={blocks}
      themes={themes}
      notice={notice}
    />
  );
}