type Props = { current: string; options: { name: string; label: string }[] };

export function ThemePicker({ current, options }: Props) {
  return (
    <fieldset className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <legend className="sr-only">Theme</legend>
      {options.map((o) => (
        <label
          key={o.name}
          data-theme={o.name}
          className="ink-border cursor-pointer rounded-md bg-bg p-3 text-ink transition-transform has-checked:-translate-y-0.5 has-checked:shadow-hard has-focus-visible:outline-3 has-focus-visible:outline-offset-2"
        >
          <input
            type="radio"
            name="theme"
            value={o.name}
            defaultChecked={o.name === current}
            className="sr-only"
          />
          <span className="block font-display text-lg font-bold">{o.label}</span>
          <span className="mt-2 flex gap-1">
            <span className="size-4 bg-accent" />
            <span className="size-4 bg-highlight" />
            <span className="size-4 bg-ink" />
          </span>
        </label>
      ))}
    </fieldset>
  );
}