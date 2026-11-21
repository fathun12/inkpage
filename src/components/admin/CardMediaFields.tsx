import { Field, Select } from "@/components/ui/Field";
import { Img } from "@/components/ui/Img";
import { MediaInput } from "@/components/ui/MediaInput";
import { cardRanges, mediaDefaults, mediaLabels } from "@/config/card";
import { mediaConfig } from "@/config/media";
import {
  mediaFits,
  mediaHeights,
  mediaPlacements,
  mediaPositions,
  type CardMedia,
} from "@/types/block";

type Props = { id: string; media: CardMedia | null; allowGif: boolean };

// The "Card media" panel of link and project blocks. It sits inside the block's own form,
// so its fields are sent with it. The panel is closed by default.
export function CardMediaFields({ id, media, allowGif }: Props) {
  const cm = mediaConfig.cardMedia;
  const v = media ?? mediaDefaults;

  return (
    <details className="ink-border rounded-md">
      <summary className="cursor-pointer list-none px-3 py-2 font-mono text-xs uppercase tracking-widest text-ink-soft">
        Card media
      </summary>
      <div className="flex flex-col gap-4 border-t border-line p-3">
        {media && (
          <div className="flex items-center gap-3">
            <Img src={media.url} className="ink-border h-16 w-24 shrink-0 rounded-sm bg-surface object-contain" />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="remove_media" className="accent-accent" />
              Remove the current {media.kind === "gif" ? "GIF" : "image"}
            </label>
          </div>
        )}

        <Field
          label={media ? "Replace image or GIF" : "Image or GIF"}
          htmlFor={`${id}-file`}
          hint={`JPG, PNG, WebP or GIF. Images up to ${cm.maxImageMb} MB, GIFs up to ${cm.maxGifMb} MB (${cm.maxAnimatedPerPage} GIFs per page). The whole file is kept, it is not cropped.`}
        >
          <MediaInput id={`${id}-file`} name="media" allowGif={allowGif} />
        </Field>

        <Field
          label="Opacity"
          htmlFor={`${id}-opacity`}
          hint="Right is fully visible. Lower it so the card color shows through and the text stays readable."
        >
          <input
            id={`${id}-opacity`}
            name="media_opacity"
            type="range"
            min={cardRanges.opacity.min}
            max={cardRanges.opacity.max}
            step={cardRanges.opacity.step}
            defaultValue={v.opacity}
            className="w-full accent-accent"
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Placement" htmlFor={`${id}-placement`}>
            <Select id={`${id}-placement`} name="media_placement" defaultValue={v.placement}>
              {mediaPlacements.map((o) => (
                <option key={o} value={o}>
                  {mediaLabels.placement[o]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Height" htmlFor={`${id}-height`} hint="Only used when the media is below the text.">
            <Select id={`${id}-height`} name="media_height" defaultValue={v.height}>
              {mediaHeights.map((o) => (
                <option key={o} value={o}>
                  {mediaLabels.height[o]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Fit" htmlFor={`${id}-fit`}>
            <Select id={`${id}-fit`} name="media_fit" defaultValue={v.fit}>
              {mediaFits.map((o) => (
                <option key={o} value={o}>
                  {mediaLabels.fit[o]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Position" htmlFor={`${id}-position`}>
            <Select id={`${id}-position`} name="media_position" defaultValue={v.position}>
              {mediaPositions.map((o) => (
                <option key={o} value={o}>
                  {mediaLabels.position[o]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>
    </details>
  );
}