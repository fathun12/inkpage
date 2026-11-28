import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Img } from "@/components/ui/Img";
import { readBackground } from "@/config/background";
import { seo } from "@/config/seo";
import { readSite } from "@/config/site-content";
import { readSiteStyle } from "@/config/site-style";
import { routes } from "@/config/site";
import { loginAction } from "@/features/auth/actions";
import { getCurrentUser } from "@/features/auth/queries";
import { getPublicBlocks } from "@/features/blocks/queries";
import { getProfileByUsername } from "@/features/profile/queries";
import { mediaKind, resolveHomeMedia } from "@/lib/site-view";

export const metadata: Metadata = { title: "Sign in" };

type Props = { searchParams: Promise<{ error?: string }> };

// The first slide of the hero of the website, for the dark panel. Any failure gives a plain dark panel.
async function heroPanel() {
  try {
    const profile = await getProfileByUsername(seo.owner);
    if (!profile) return null;
    const blocks = await getPublicBlocks(profile.id);
    const first = resolveHomeMedia(readSite(profile.site), readBackground(profile), blocks).hero[0];
    if (!first) return null;
    const gray = readSiteStyle(profile.site_style).heroGray;
    const cls = `absolute inset-0 size-full object-cover ${gray ? "grayscale" : ""}`;
    return mediaKind(first) === "video" ? (
      <video src={first} autoPlay muted loop playsInline aria-hidden className={cls} />
    ) : (
      <Img src={first} loading="eager" className={cls} />
    );
  } catch {
    return null;
  }
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;
  if (await getCurrentUser()) redirect(routes.admin);
  return <LoginForm action={loginAction} error={error} panel={await heroPanel()} />;
}