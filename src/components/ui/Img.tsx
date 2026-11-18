import type { ImgHTMLAttributes } from "react";

// The one place a plain <img> is used (user images come from Supabase Storage).
export function Img({ alt = "", ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt} loading="lazy" decoding="async" {...props} />;
}
