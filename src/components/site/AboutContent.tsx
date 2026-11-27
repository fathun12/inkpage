import type { ReactNode } from "react";
import type { AboutSectionId } from "@/config/about-style";
import type { SiteStyle } from "@/config/site-style";
import type { SteamData } from "@/types/steam";
import { AboutSection } from "./AboutSection";
import { AboutSteam } from "./AboutSteam";
import { PageIntro } from "./PageIntro";
import { SectionBox } from "./SectionBox";

type Props = {
  title: string;
  name?: string | null;
  bio?: string | null;
  body: string | null;
  photo: string | null;
  steam: SteamData | null;
  steamMedia: string | null;
  steamCredit: string | null;
  style: Pick<
    SiteStyle,
    | "aboutLayout"
    | "aboutPhoto"
    | "steamLayout"
    | "steamMode"
    | "steamBackground"
    | "steamOpacity"
    | "steamPosition"
    | "aboutSections"
    | "aboutOrder"
  >;
};

// The About page: the title, then the sections in the order and with the settings of Customize.
// The public page and the Customize preview both use this one component.
export function AboutContent({ title, name, bio, body, photo, steam, steamMedia, steamCredit, style }: Props) {
  const parts: Record<AboutSectionId, ReactNode> = {
    profile: (
      <AboutSection
        name={name}
        bio={bio}
        body={body}
        photo={photo}
        layout={style.aboutLayout}
        shape={style.aboutPhoto}
      />
    ),
    steam: steam ? (
      <AboutSteam
        data={steam}
        look={{
          mode: style.steamMode,
          layout: style.steamLayout,
          background: style.steamBackground,
          opacity: style.steamOpacity,
          position: style.steamPosition,
          media: steamMedia,
          credit: steamCredit,
        }}
      />
    ) : null,
  };
  return (
    <>
      <PageIntro title={title} intro={null} />
      {style.aboutOrder.map((id) => {
        const setting = style.aboutSections[id];
        if (setting.hidden || !parts[id]) return null;
        // The Steam section paints its own background, so the box only gives it space and the divider line.
        const boxed = id === "steam" ? { ...setting, surface: "page" as const } : setting;
        return (
          <SectionBox key={id} setting={boxed}>
            {parts[id]}
          </SectionBox>
        );
      })}
    </>
  );
}