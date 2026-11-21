import type { CardStyle } from "@/config/card";
import { glassCss, lensParams } from "@/lib/card-style";

// Pure and server-rendered. Only glass cards need it: the backdrop-filter rules as plain CSS,
// and (when Refraction is above 0) one SVG filter for the lens. No JavaScript.
// The <svg> must NOT be display:none, or the filter does not run.
const only = {
  r: "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
  g: "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
  b: "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
};

export function GlassDefs({ card }: { card: CardStyle }) {
  const css = glassCss(card);
  if (!css) return null;
  const lens = lensParams(card);
  const map = lens && lens.blur > 0 ? "soft" : "map";

  return (
    <>
      <style>{css}</style>
      {lens && (
        <svg width={0} height={0} aria-hidden focusable="false" className="absolute">
          <defs>
            <filter id="ink-lens" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
              <feImage href={lens.map} preserveAspectRatio="none" result="map" />
              {lens.blur > 0 && <feGaussianBlur in="map" stdDeviation={lens.blur} result="soft" />}
              {lens.dispersed ? (
                <>
                  <feDisplacementMap in="SourceGraphic" in2={map} scale={lens.red} xChannelSelector="R" yChannelSelector="G" result="dispR" />
                  <feColorMatrix in="dispR" type="matrix" values={only.r} result="chanR" />
                  <feDisplacementMap in="SourceGraphic" in2={map} scale={lens.green} xChannelSelector="R" yChannelSelector="G" result="dispG" />
                  <feColorMatrix in="dispG" type="matrix" values={only.g} result="chanG" />
                  <feDisplacementMap in="SourceGraphic" in2={map} scale={lens.blue} xChannelSelector="R" yChannelSelector="G" result="dispB" />
                  <feColorMatrix in="dispB" type="matrix" values={only.b} result="chanB" />
                  <feBlend in="chanR" in2="chanG" mode="screen" result="rg" />
                  <feBlend in="rg" in2="chanB" mode="screen" />
                </>
              ) : (
                <feDisplacementMap in="SourceGraphic" in2={map} scale={lens.green} xChannelSelector="R" yChannelSelector="G" />
              )}
            </filter>
          </defs>
        </svg>
      )}
    </>
  );
}