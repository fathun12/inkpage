import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "@/config/fonts";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

// Puts the visitor's saved Light or Dark choice on <html> before the page is painted.
const modeScript = `try{var m=localStorage.getItem("site-mode");if(m==="light"||m==="dark")document.documentElement.setAttribute("data-site-mode",m)}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme={siteConfig.defaultTheme}
      className={`${fontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: modeScript }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}