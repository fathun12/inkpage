import type { CSSProperties, ReactNode } from "react";
import type { SectionSetting } from "@/config/layout";

// Gives one Home section its extra space, its background and its divider line (Customize, "Sections").
// The two space variables are read by the .site-pt / .site-pb classes in styles/site.css. The background and
// the line are the .site-box rules in the same file. With nothing set, nothing is added, so the page is
// exactly as before. "contents" keeps a box out of the layout when it only carries the space variables.
export function SectionBox({ setting, children }: { setting: SectionSetting; children: ReactNode }) {
  const painted = setting.surface !== "page" || setting.line;
  if (!painted && setting.top === 0 && setting.bottom === 0) return <>{children}</>;
  const vars = { "--off-top": `${setting.top}rem`, "--off-bottom": `${setting.bottom}rem` } as CSSProperties;
  if (!painted) {
    return (
      <div className="contents" style={vars}>
        {children}
      </div>
    );
  }
  return (
    <div
      className={setting.line ? "site-box site-box-line" : "site-box"}
      data-surface={setting.surface === "page" ? undefined : setting.surface}
      style={vars}
    >
      {children}
    </div>
  );
}