import type { CSSProperties, ReactNode } from "react";
import type { SectionSetting } from "@/config/layout";

// Gives one Home section its extra space (Customize, "Sections"). The two variables are read by the
// .site-pt / .site-pb classes in styles/site.css. With no extra space nothing is added, so the page is
// exactly as before. "contents" keeps the box out of the layout.
export function SectionBox({ setting, children }: { setting: SectionSetting; children: ReactNode }) {
  if (setting.top === 0 && setting.bottom === 0) return <>{children}</>;
  const vars = { "--off-top": `${setting.top}rem`, "--off-bottom": `${setting.bottom}rem` } as CSSProperties;
  return (
    <div className="contents" style={vars}>
      {children}
    </div>
  );
}