import {
  footerAlignLabels,
  footerAligns,
  footerBlockLabels,
  footerBrandSpotHints,
  footerBrandSpotLabels,
  footerBrandSpots,
  footerModeHints,
  footerModeLabels,
  footerModes,
  footerShift,
  footerSlotLabels,
  footerSlots,
  type FooterAlign,
  type FooterBlock,
  type FooterSlot,
  type FooterStyle,
} from "@/config/footer-style";

type Props = { value: FooterStyle; onChange: (patch: Partial<FooterStyle>) => void };

const pill =
  "ink-border cursor-pointer rounded-full px-3 py-1.5 text-sm has-checked:bg-ink has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";
const small =
  "border border-line px-2 py-1 font-mono text-[11px] uppercase tracking-widest hover:border-ink disabled:opacity-40";

function Pills<T extends string>({
  name,
  items,
  labels,
  value,
  onPick,
}: {
  name: string;
  items: readonly T[];
  labels: Record<T, string>;
  value: T;
  onPick: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((a) => (
        <label key={a} className={pill}>
          <input
            type="radio"
            name={`ui_${name}`}
            value={a}
            checked={value === a}
            onChange={() => onPick(a)}
            className="sr-only"
          />
          {labels[a]}
        </label>
      ))}
    </div>
  );
}

// Settings of the footer: Centered or Full width, the order, column, alignment and height of Note, Explore and
// Connect, and the place of the big name. The inputs have no form name: the studio sends the whole draft.
export function FooterControls({ value, onChange }: Props) {
  function move(index: number, dir: -1 | 1) {
    const next = [...value.order];
    const to = index + dir;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to], next[index]];
    onChange({ order: next });
  }
  const align = (block: FooterBlock, a: FooterAlign) => onChange({ align: { ...value.align, [block]: a } });
  const slot = (block: FooterBlock, s: FooterSlot) => onChange({ slot: { ...value.slot, [block]: s } });
  const shift = (block: FooterBlock, n: number) => onChange({ shift: { ...value.shift, [block]: n } });

  return (
    <>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Mode</span>
        <Pills
          name="footer_mode"
          items={footerModes}
          labels={footerModeLabels}
          value={value.mode}
          onPick={(m) => onChange({ mode: m })}
        />
        <p className="text-xs text-ink-soft">{footerModeHints[value.mode]}</p>
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Columns</span>
        <p className="text-xs text-ink-soft">
          Pick the column of each block (Left, Middle or Right). Blocks in the same column are stacked, in the order
          below. Move down pushes a block lower (minus pushes it higher). A block with nothing to show stays hidden.
        </p>
        {value.order.map((block, i) => (
          <div key={block} className="ink-border flex flex-col gap-3 rounded-md p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {i + 1} · {footerBlockLabels[block]}
              </span>
              <span className="flex gap-2">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Move ${footerBlockLabels[block]} earlier`}
                  className={small}
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === value.order.length - 1}
                  aria-label={`Move ${footerBlockLabels[block]} later`}
                  className={small}
                >
                  Down
                </button>
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-ink-soft">Column</span>
              <Pills
                name={`footer_slot_${block}`}
                items={footerSlots}
                labels={footerSlotLabels}
                value={value.slot[block]}
                onPick={(s) => slot(block, s)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor={`ui_footer_shift_${block}`} className="text-xs text-ink-soft">
                Move down: {value.shift[block] === 0 ? "Normal" : `${value.shift[block] > 0 ? "+" : ""}${value.shift[block]} rem`}
              </label>
              <input
                id={`ui_footer_shift_${block}`}
                type="range"
                min={footerShift.min}
                max={footerShift.max}
                step={footerShift.step}
                value={value.shift[block]}
                onChange={(e) => shift(block, Number(e.target.value))}
                className="w-full accent-accent"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-ink-soft">Text leans</span>
              <Pills
                name={`footer_${block}`}
                items={footerAligns}
                labels={footerAlignLabels}
                value={value.align[block]}
                onPick={(a) => align(block, a)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">The big name</span>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Place</span>
          <Pills
            name="footer_brand_spot"
            items={footerBrandSpots}
            labels={footerBrandSpotLabels}
            value={value.brandSpot}
            onPick={(s) => onChange({ brandSpot: s })}
          />
          <p className="text-xs text-ink-soft">{footerBrandSpotHints[value.brandSpot]}</p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Align</span>
          <Pills
            name="footer_brand"
            items={footerAligns}
            labels={footerAlignLabels}
            value={value.brandAlign}
            onPick={(a) => onChange({ brandAlign: a })}
          />
        </div>
      </div>
    </>
  );
}