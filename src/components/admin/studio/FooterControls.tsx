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
  type FooterAlign,
  type FooterBlock,
  type FooterStyle,
} from "@/config/footer-style";

type Props = { value: FooterStyle; onChange: (patch: Partial<FooterStyle>) => void };

const pill =
  "ink-border cursor-pointer rounded-full px-3 py-1.5 text-sm has-checked:bg-ink has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";
const small =
  "border border-line px-2 py-1 font-mono text-[11px] uppercase tracking-widest hover:border-ink disabled:opacity-40";

function AlignPills({
  name,
  value,
  onPick,
}: {
  name: string;
  value: FooterAlign;
  onPick: (a: FooterAlign) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {footerAligns.map((a) => (
        <label key={a} className={pill}>
          <input
            type="radio"
            name={`ui_${name}`}
            value={a}
            checked={value === a}
            onChange={() => onPick(a)}
            className="sr-only"
          />
          {footerAlignLabels[a]}
        </label>
      ))}
    </div>
  );
}

// Settings of the footer: Centered or Full width, the order and alignment of Note, Explore and Connect,
// and the place of the big name. The radio inputs have no form name: the studio sends the whole draft.
export function FooterControls({ value, onChange }: Props) {
  function move(index: number, dir: -1 | 1) {
    const next = [...value.order];
    const to = index + dir;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to], next[index]];
    onChange({ order: next });
  }
  function align(block: FooterBlock, a: FooterAlign) {
    onChange({ align: { ...value.align, [block]: a } });
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Mode</span>
        <div className="flex flex-wrap gap-2">
          {footerModes.map((m) => (
            <label key={m} className={pill}>
              <input
                type="radio"
                name="ui_footer_mode"
                value={m}
                checked={value.mode === m}
                onChange={() => onChange({ mode: m })}
                className="sr-only"
              />
              {footerModeLabels[m]}
            </label>
          ))}
        </div>
        <p className="text-xs text-ink-soft">{footerModeHints[value.mode]}</p>
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Columns</span>
        <p className="text-xs text-ink-soft">
          Use the arrows to change the order. Pick where the text of each column leans. A column with nothing to
          show stays hidden.
        </p>
        {value.order.map((block, i) => (
          <div key={block} className="ink-border flex flex-col gap-2 rounded-md p-3">
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
            <AlignPills name={`footer_${block}`} value={value.align[block]} onPick={(a) => align(block, a)} />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">The big name</span>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Place</span>
          <div className="flex flex-wrap gap-2">
            {footerBrandSpots.map((s) => (
              <label key={s} className={pill}>
                <input
                  type="radio"
                  name="ui_footer_brand_spot"
                  value={s}
                  checked={value.brandSpot === s}
                  onChange={() => onChange({ brandSpot: s })}
                  className="sr-only"
                />
                {footerBrandSpotLabels[s]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">{footerBrandSpotHints[value.brandSpot]}</p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink-soft">Align</span>
          <AlignPills name="footer_brand" value={value.brandAlign} onPick={(a) => onChange({ brandAlign: a })} />
        </div>
      </div>
    </>
  );
}