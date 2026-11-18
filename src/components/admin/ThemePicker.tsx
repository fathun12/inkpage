type Props = { current: string; options: { name: string; label: string }[] };

export function ThemePicker({ current, options }: Props) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1.5 text-sm font-medium text-ink-soft">Theme</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {options.map((o) => (
          <label
            key={o.name}
            className="cursor-pointer rounded-lg has-checked:outline-2 has-checked:outline-offset-2 has-checked:outline-ink has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
          >
            <input
              type="radio"
              name="theme"
              value={o.name}
              defaultChecked={o.name === current}
              className="sr-only"
            />
            <span data-theme={o.name} className="ink-border block rounded-md bg-bg p-3 text-ink">
              <span className="block font-display text-lg font-medium">{o.label}</span>
              <span className="mt-2 flex gap-1.5">
                <span className="size-4 rounded-full bg-accent" />
                <span className="ink-border size-4 rounded-full bg-surface" />
                <span className="size-4 rounded-full bg-ink" />
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}