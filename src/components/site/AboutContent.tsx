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
  style: Pick<SiteStyle, "aboutLayout" | "aboutPhoto" | "steamLayout" | "aboutSections" | "aboutOrder">;
};

// The About page: the title, then the sections in the order and with the settings of Customize.
// The public page and the Customize preview both use this one component.
export function AboutContent({ title, name, bio, body, photo, steam, style }: Props) {
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
    steam: steam ? <AboutSteam data={steam} layout={style.steamLayout} /> : null,
  };
  return (
    <>
      <PageIntro title={title} intro={null} />
      {style.aboutOrder.map((id) => {
        const setting = style.aboutSections[id];
        if (setting.hidden || !parts[id]) return null;
        return (
          <SectionBox key={id} setting={setting}>
            {parts[id]}
          </SectionBox>
        );
      })}
    </>
  );
}