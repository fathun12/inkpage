import type { ReactNode } from "react";
import { Field } from "@/components/ui/Field";
import {
  cardKindLabels,
  cardKinds,
  cardPresetLabels,
  cardPresets,
  cardRanges,
  colorStarts,
  newDrop,
  newInner,
  textModeLabels,
  textModes,
  type CardStyle,
  type GlassSettings,
  type Range,
  type Shadow,
} from "@/config/card";
import { applyPreset, clampTo, switchKind } from "@/lib/card-style";

type Props = {
  card: CardStyle;
  onChange: (next: CardStyle) => void;
  plainBackground: boolean;
};

const pill =
  "ink-border cursor-pointer rounded-full px-3 py-1.5 text-sm has-checked:bg-ink has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";
const colorInput = "ink-border h-10 w-20 cursor-pointer rounded-md bg-surface p-1";
const textButton =
  "self-start font-mono text-xs uppercase tracking-widest text-ink-soft underline underline-offset-4 hover:text-ink";

function Sub({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="group ink-border rounded-md">
      <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2 text-sm font-medium [&::-webkit-details-marker]:hidden">
        {title}
        <span aria-hidden className="font-mono text-xs text-ink-soft transition-transform group-open:rotate-90">
          →
        </span>
      </summary>
      <div className="flex flex-col gap-4 px-3 pb-3">{children}</div>
    </details>
  );
}

function Slider({
  id,
  label,
  value,
  range,
  unit = "",
  hint,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  range: Range;
  unit?: string;
  hint?: string;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={`${label}: ${value}${unit}`} htmlFor={id} hint={hint}>
      <input
        id={id}
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </Field>
  );
}

// Enter in a number box must not submit the whole studio form.
function NumberBox({
  id,
  label,
  value,
  range,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  range: Range;
  onChange: (value: number) => void;
}) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1 text-xs text-ink-soft">
      {label}
      <input
        id={id}
        type="number"
        min={range.min}
        max={range.max}
        step={range.step}
        value={value}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        onChange={(e) => {
          const n = e.target.valueAsNumber;
          if (Number.isFinite(n)) onChange(clampTo(range, n));
        }}
        className="ink-border w-full rounded-md bg-surface px-2 py-1.5 text-sm text-ink"
      />
    </label>
  );
}

function ColorChoice({
  id,
  label,
  autoLabel,
  value,
  start,
  onChange,
}: {
  id: string;
  label: string;
  autoLabel: string;
  value: string | null;
  start: string;
  onChange: (value: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value === null}
          onChange={(e) => onChange(e.target.checked ? null : start)}
          className="accent-accent"
        />
        {autoLabel}
      </label>
      {value !== null && (
        <input
          id={id}
          type="color"
          aria-label={label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={colorInput}
        />
      )}
    </div>
  );
}

function ShadowEditor({
  id,
  title,
  items,
  max,
  start,
  onChange,
}: {
  id: string;
  title: string;
  items: Shadow[];
  max: number;
  start: Shadow;
  onChange: (items: Shadow[]) => void;
}) {
  const patch = (index: number, part: Partial<Shadow>) =>
    onChange(items.map((s, i) => (i === index ? { ...s, ...part } : s)));

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-ink-soft">{title}</span>
      {items.length === 0 && <p className="text-xs text-ink-soft">None yet.</p>}
      {items.map((s, i) => (
        <div key={i} className="ink-border flex flex-col gap-3 rounded-md p-3">
          <div className="grid grid-cols-4 gap-2">
            <NumberBox id={`${id}_${i}_x`} label="X" value={s.x} range={cardRanges.shadowOffset} onChange={(x) => patch(i, { x })} />
            <NumberBox id={`${id}_${i}_y`} label="Y" value={s.y} range={cardRanges.shadowOffset} onChange={(y) => patch(i, { y })} />
            <NumberBox id={`${id}_${i}_b`} label="Blur" value={s.blur} range={cardRanges.shadowBlur} onChange={(blur) => patch(i, { blur })} />
            <NumberBox id={`${id}_${i}_s`} label="Spread" value={s.spread} range={cardRanges.shadowSpread} onChange={(spread) => patch(i, { spread })} />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              aria-label={`${title} color`}
              value={s.color}
              onChange={(e) => patch(i, { color: e.target.value })}
              className={colorInput}
            />
            <button type="button" onClick={() => onChange(items.filter((_, k) => k !== i))} className={textButton}>
              Remove
            </button>
          </div>
          <Slider
            id={`${id}_${i}_o`}
            label="Opacity"
            unit="%"
            value={s.opacity}
            range={cardRanges.opacity}
            onChange={(opacity) => patch(i, { opacity })}
          />
        </div>
      ))}
      {items.length < max && (
        <button type="button" onClick={() => onChange([...items, { ...start }])} className={textButton}>
          Add {title.toLowerCase()}
        </button>
      )}
    </div>
  );
}

// The Card section of the studio. No control has a name: the studio sends the whole card
// as one JSON hidden input.
export function CardControls({ card, onChange, plainBackground }: Props) {
  const glass = card.kind === "glass";
  const g = card.glass;

  // Moving a glass slider turns the preset into "custom".
  function setGlass(patch: Partial<GlassSettings>) {
    onChange({ ...card, preset: "custom", glass: { ...g, ...patch } });
  }
  function setFillOpacity(opacity: number) {
    onChange({ ...card, preset: glass ? "custom" : card.preset, fill: { ...card.fill, opacity } });
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Style</span>
        <div className="flex flex-wrap gap-2">
          {cardKinds.map((kind) => (
            <label key={kind} className={pill}>
              <input
                type="radio"
                value={kind}
                checked={card.kind === kind}
                onChange={() => onChange(switchKind(card, kind))}
                className="sr-only"
              />
              {cardKindLabels[kind]}
            </label>
          ))}
        </div>
      </div>

      {glass && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Glass preset</span>
          <div className="flex flex-wrap gap-2">
            {cardPresets.map((p) => (
              <label key={p} className={pill}>
                <input
                  type="radio"
                  value={p}
                  checked={card.preset === p}
                  onChange={() => onChange(applyPreset(card, p))}
                  className="sr-only"
                />
                {cardPresetLabels[p]}
              </label>
            ))}
          </div>
          {card.preset === "custom" && <p className="text-xs text-ink-soft">Custom: you changed a setting.</p>}
          {plainBackground && (
            <p className="text-xs text-accent">
              Glass looks best on a photo, gradient, video or GIF background.
            </p>
          )}
        </div>
      )}

      <Sub title="Colors">
        <ColorChoice
          id="card_fill"
          label="Fill color"
          autoLabel={glass ? "White (default)" : "Match the theme"}
          value={card.fill.color}
          start={colorStarts.fill}
          onChange={(color) => onChange({ ...card, fill: { ...card.fill, color } })}
        />
        <Slider
          id="card_fill_o"
          label="Fill opacity"
          unit="%"
          value={card.fill.opacity}
          range={cardRanges.opacity}
          onChange={setFillOpacity}
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Text color</span>
          <div className="flex flex-wrap gap-2">
            {textModes.map((mode) => (
              <label key={mode} className={pill}>
                <input
                  type="radio"
                  value={mode}
                  checked={card.text === mode}
                  onChange={() => onChange({ ...card, text: mode })}
                  className="sr-only"
                />
                {textModeLabels[mode]}
              </label>
            ))}
          </div>
        </div>
      </Sub>

      {glass && (
        <Sub title="Glass settings">
          <Slider
            id="card_light_a"
            label="Light angle"
            unit="°"
            value={g.light.angle}
            range={cardRanges.angle}
            onChange={(angle) => setGlass({ light: { ...g.light, angle } })}
          />
          <Slider
            id="card_light_i"
            label="Light intensity"
            value={g.light.intensity}
            range={cardRanges.effect}
            onChange={(intensity) => setGlass({ light: { ...g.light, intensity } })}
          />
          <Slider
            id="card_specular"
            label="Specular highlight"
            value={g.specular}
            range={cardRanges.effect}
            hint="The bright thin edge of the glass."
            onChange={(specular) => setGlass({ specular })}
          />
          <Slider
            id="card_refraction"
            label="Refraction"
            value={g.refraction}
            range={cardRanges.effect}
            hint="Bends the background at the edges. 0 turns it off. Chrome and Edge only."
            onChange={(refraction) => setGlass({ refraction })}
          />
          <Slider id="card_depth" label="Depth" value={g.depth} range={cardRanges.effect} onChange={(depth) => setGlass({ depth })} />
          <Slider
            id="card_dispersion"
            label="Dispersion"
            value={g.dispersion}
            range={cardRanges.effect}
            hint="Splits colors at the edges."
            onChange={(dispersion) => setGlass({ dispersion })}
          />
          <Slider id="card_splay" label="Splay" value={g.splay} range={cardRanges.effect} onChange={(splay) => setGlass({ splay })} />
          <Slider
            id="card_frost"
            label="Frost"
            unit="px"
            value={g.frost}
            range={cardRanges.frost}
            hint="How much the background is blurred."
            onChange={(frost) => setGlass({ frost })}
          />
          <Slider
            id="card_vibrancy"
            label="Vibrancy"
            unit="%"
            value={g.vibrancy}
            range={cardRanges.vibrancy}
            hint="How strong the colors behind the glass look."
            onChange={(vibrancy) => setGlass({ vibrancy })}
          />
        </Sub>
      )}

      <Sub title="Shadows">
        <ShadowEditor
          id="card_drop"
          title="Drop shadow"
          items={card.drop}
          max={cardRanges.maxDrop}
          start={newDrop}
          onChange={(drop) => onChange({ ...card, drop })}
        />
        <ShadowEditor
          id="card_inner"
          title="Inner shadow"
          items={card.inner}
          max={cardRanges.maxInner}
          start={newInner}
          onChange={(inner) => onChange({ ...card, inner })}
        />
      </Sub>

      <Sub title="Stroke & radius">
        <ColorChoice
          id="card_stroke"
          label="Stroke color"
          autoLabel="Match the theme"
          value={card.stroke.color}
          start={colorStarts.stroke}
          onChange={(color) => onChange({ ...card, stroke: { ...card.stroke, color } })}
        />
        <Slider
          id="card_stroke_o"
          label="Stroke opacity"
          unit="%"
          value={card.stroke.opacity}
          range={cardRanges.opacity}
          onChange={(opacity) => onChange({ ...card, stroke: { ...card.stroke, opacity } })}
        />
        <Slider
          id="card_stroke_w"
          label="Stroke width"
          unit="px"
          value={card.stroke.width}
          range={cardRanges.strokeWidth}
          onChange={(width) => onChange({ ...card, stroke: { ...card.stroke, width } })}
        />
        <Slider
          id="card_radius"
          label="Corner radius"
          unit="px"
          value={card.radius}
          range={cardRanges.radius}
          onChange={(radius) => onChange({ ...card, radius })}
        />
      </Sub>
    </div>
  );
}