import { Img } from "@/components/ui/Img";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { MediaKind } from "@/lib/site-view";
import type { BlockView } from "@/types/block";
import type { FormAction } from "@/types/form";

export type BarActions = { remove: FormAction; setFlag: FormAction; reorder: FormAction };
type Thumb = { src: string; kind: MediaKind } | null;

type MiniProps = {
  action: FormAction;
  id: string;
  returnTo: string;
  fields?: Record<string, string>;
  label: string;
  ariaLabel?: string;
  disabled?: boolean;
};

function Mini({ action, id, returnTo, fields = {}, label, ariaLabel, disabled }: MiniProps) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="return_to" value={returnTo} />
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <SubmitButton size="sm" pendingLabel="..." aria-label={ariaLabel} disabled={disabled}>
        {label}
      </SubmitButton>
    </form>
  );
}

// New order of ALL blocks when two blocks swap places.
function swapOrder(all: BlockView[], a: string, b: string): string {
  const ids = all.map((x) => x.id);
  const i = ids.indexOf(a);
  const j = ids.indexOf(b);
  if (i < 0 || j < 0) return ids.join(",");
  [ids[i], ids[j]] = [ids[j], ids[i]];
  return ids.join(",");
}

type BarProps = {
  block: BlockView;
  thumb: Thumb;
  badges: string[];
  all: BlockView[];
  prev: BlockView | undefined;
  next: BlockView | undefined;
  actions: BarActions;
  returnTo: string;
};

// The one-line header of an item: thumbnail, title, badges and the move and hide buttons.
export function ItemBar({ block, thumb, badges, all, prev, next, actions, returnTo }: BarProps) {
  const box = "ink-border size-12 shrink-0 object-cover";
  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3">
      {thumb &&
        (thumb.kind === "video" ? (
          <video src={`${thumb.src}#t=0.1`} muted preload="metadata" className={box} />
        ) : (
          <Img src={thumb.src} className={box} />
        ))}
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-lg font-bold">{block.title}</p>
        <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">{badges.join(" · ")}</p>
      </div>
      <div className="flex items-center gap-2">
        <Mini
          action={actions.reorder}
          id={block.id}
          returnTo={returnTo}
          fields={{ order: prev ? swapOrder(all, block.id, prev.id) : "" }}
          label={"\u2191"}
          ariaLabel="Move up"
          disabled={!prev}
        />
        <Mini
          action={actions.reorder}
          id={block.id}
          returnTo={returnTo}
          fields={{ order: next ? swapOrder(all, block.id, next.id) : "" }}
          label={"\u2193"}
          ariaLabel="Move down"
          disabled={!next}
        />
        <Mini
          action={actions.setFlag}
          id={block.id}
          returnTo={returnTo}
          fields={{ flag: "is_visible", value: String(!block.is_visible) }}
          label={block.is_visible ? "Hide" : "Show"}
        />
      </div>
    </div>
  );
}

export function DeleteItem({ id, remove, returnTo }: { id: string; remove: FormAction; returnTo: string }) {
  return (
    <details>
      <summary className="cursor-pointer list-none font-mono text-xs uppercase tracking-widest text-ink-soft">
        Delete this item
      </summary>
      <form action={remove} className="mt-2">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="return_to" value={returnTo} />
        <SubmitButton size="sm" variant="danger">
          Confirm delete
        </SubmitButton>
      </form>
    </details>
  );
}