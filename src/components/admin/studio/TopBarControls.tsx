import {
  topBarItemLabels,
  topBarModeHints,
  topBarModeLabels,
  topBarModes,
  topBarMotionHints,
  topBarMotionLabels,
  topBarMotions,
  topBarRanges,
  type TopBarItem,
  type TopBarStyle,
} from "@/config/topbar-style";

type Props = { value: TopBarStyle; onChange: (patch: Partial<TopBarStyle>) => void };

const pill =
  "ink-border cursor-pointer rounded-full px-3 py-1.5 text-sm has-checked:bg-ink has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";
const small =
  "border border-line px-2 py-1 font-mono text-[11px] uppercase tracking-widest hover:border-ink disabled:opacity-40";

// Settings of the top bar: which of Clock, News and Countdown show, their order from left to right,
// and how the news changes. The inputs have no form name: the studio sends the whole draft.
export function TopBarControls({ value, onChange }: Props) {
  function move(index: number, dir: -1 | 1) {
    const next = [...value.order];
    const to = index + dir;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to], next[index]];
    onChange({ order: next });
  }
  const show = (item: TopBarItem, on: boolean) => onChange({ show: { ...value.show, [item]: on } });

  return (
    <>
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink-soft">Width</span>
        <div className="flex flex-wrap gap-2">
          {topBarModes.map((m) => (
            <label key={m} className={pill}>
              <input
                type="radio"
                name="ui_topbar_mode"
                value={m}
                checked={value.mode === m}
                onChange={() => onChange({ mode: m })}
                className="sr-only"
              />
              {topBarModeLabels[m]}
            </label>
          ))}
        </div>
        <p className="text-xs text-ink-soft">{topBarModeHints[value.mode]}</p>
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">Parts</span>
        <p className="text-xs text-ink-soft">
          Untick a part to hide it. The order is from left to right. The clock also needs Show clock in Pages. The
          countdown disappears by itself when its time has come.
        </p>
        {value.order.map((item, i) => (
          <div key={item} className="ink-border flex items-center justify-between gap-2 rounded-md p-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={value.show[item]}
                onChange={(e) => show(item, e.target.checked)}
                className="accent-accent"
              />
              {i + 1} · {topBarItemLabels[item]}
            </label>
            <span className="flex gap-2">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={`Move ${topBarItemLabels[item]} left`}
                className={small}
              >
                Left
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === value.order.length - 1}
                aria-label={`Move ${topBarItemLabels[item]} right`}
                className={small}
              >
                Right
              </button>
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <span className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">News motion</span>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            {topBarMotions.map((m) => (
              <label key={m} className={pill}>
                <input
                  type="radio"
                  name="ui_topbar_motion"
                  value={m}
                  checked={value.motion === m}
                  onChange={() => onChange({ motion: m })}
                  className="sr-only"
                />
                {topBarMotionLabels[m]}
              </label>
            ))}
          </div>
          <p className="text-xs text-ink-soft">{topBarMotionHints[value.motion]}</p>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="ui_topbar_ms" className="text-xs text-ink-soft">
            Speed of the change: {value.ms} ms
          </label>
          <input
            id="ui_topbar_ms"
            type="range"
            min={topBarRanges.ms.min}
            max={topBarRanges.ms.max}
            step={topBarRanges.ms.step}
            value={value.ms}
            onChange={(e) => onChange({ ms: Number(e.target.value) })}
            className="w-full accent-accent"
          />
          <p className="text-xs text-ink-soft">A smaller number is faster.</p>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="ui_topbar_seconds" className="text-xs text-ink-soft">
            Time per line: {value.seconds === 0 ? "Same as the Hero" : `${value.seconds} s`}
          </label>
          <input
            id="ui_topbar_seconds"
            type="range"
            min={topBarRanges.seconds.min}
            max={topBarRanges.seconds.max}
            step={topBarRanges.seconds.step}
            value={value.seconds}
            onChange={(e) => onChange({ seconds: Number(e.target.value) })}
            className="w-full accent-accent"
          />
        </div>
      </div>
    </>
  );
}