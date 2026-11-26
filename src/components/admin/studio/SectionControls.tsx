"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Field } from "@/components/ui/Field";
import {
  sectionHasSpace,
  sectionHasSurface,
  sectionLabels,
  sectionSpace,
  sectionSurfaceHints,
  sectionSurfaceLabels,
  sectionSurfaces,
  type SectionId,
  type SectionSetting,
  type SectionSettings,
} from "@/config/layout";
import { cn } from "@/lib/utils";

const pill =
  "ink-border cursor-pointer rounded-full px-3 py-1.5 text-sm has-checked:bg-ink has-checked:text-bg has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink";

type Props = {
  order: SectionId[];
  sections: SectionSettings;
  // The section picked in the preview (inspect mode). Its row gets an outline.
  selected?: SectionId | null;
  onOrder: (order: SectionId[]) => void;
  onSection: (id: SectionId, patch: Partial<SectionSetting>) => void;
};

function Space({
  id,
  label,
  value,
  hint,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  hint?: string;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={`${label}: ${value} rem`} htmlFor={id} hint={hint}>
      <input
        id={id}
        type="range"
        min={sectionSpace.min}
        max={sectionSpace.max}
        step={sectionSpace.step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </Field>
  );
}

function Row({
  id,
  index,
  count,
  setting,
  selected,
  onSection,
  onMove,
}: {
  id: SectionId;
  index: number;
  count: number;
  setting: SectionSetting;
  selected: boolean;
  onSection: (id: SectionId, patch: Partial<SectionSetting>) => void;
  onMove: (from: number, to: number) => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });
  const label = sectionLabels[id];

  const head = (
    <>
      <span className={cn("text-sm", setting.hidden && "text-ink-soft line-through")}>{label}</span>
      <label className="flex cursor-pointer items-center gap-2 font-mono text-xs uppercase tracking-wider text-ink-soft">
        <input
          type="checkbox"
          checked={!setting.hidden}
          onChange={(e) => onSection(id, { hidden: !e.target.checked })}
          className="accent-accent"
        />
        Show
      </label>
    </>
  );

  return (
    <li
      id={`studio-row-${id}`}
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-start gap-1", isDragging && "relative z-10 opacity-80")}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Drag ${label}`}
        className="mt-1.5 shrink-0 cursor-grab touch-none rounded-md px-1.5 py-1 font-mono text-sm text-ink-soft hover:text-ink active:cursor-grabbing"
      >
        ::
      </button>
      {sectionHasSpace[id] ? (
        <details
          className={cn(
            "ink-border min-w-0 flex-1 rounded-md",
            selected && "outline-2 outline-offset-2 outline-accent",
          )}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2 [&::-webkit-details-marker]:hidden">
            {head}
          </summary>
          <div className="flex flex-col gap-4 px-3 pb-3 pt-1">
            <Space
              id={`ui_sec_${id}_top`}
              label="Space above"
              value={setting.top}
              hint="0 keeps the Spacing choice as it is."
              onChange={(top) => onSection(id, { top })}
            />
            <Space
              id={`ui_sec_${id}_bottom`}
              label="Space below"
              value={setting.bottom}
              onChange={(bottom) => onSection(id, { bottom })}
            />
            {sectionHasSurface[id] && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-ink-soft">Background</span>
                <div className="flex flex-wrap gap-2">
                  {sectionSurfaces.map((s) => (
                    <label key={s} className={pill}>
                      <input
                        type="radio"
                        value={s}
                        checked={setting.surface === s}
                        onChange={() => onSection(id, { surface: s })}
                        className="sr-only"
                      />
                      {sectionSurfaceLabels[s]}
                    </label>
                  ))}
                </div>
                <p className="text-xs text-ink-soft">{sectionSurfaceHints[setting.surface]}</p>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={setting.line}
                onChange={(e) => onSection(id, { line: e.target.checked })}
                className="accent-accent"
              />
              Divider line above
            </label>
          </div>
        </details>
      ) : (
        <div
          className={cn(
            "ink-border flex min-w-0 flex-1 items-center justify-between gap-3 rounded-md px-3 py-2",
            selected && "outline-2 outline-offset-2 outline-accent",
          )}
        >
          {head}
        </div>
      )}
      <div className="flex shrink-0 flex-col">
        <button
          type="button"
          aria-label={`Move ${label} up`}
          disabled={index === 0}
          onClick={() => onMove(index, index - 1)}
          className="px-1.5 py-0.5 font-mono text-xs text-ink-soft hover:text-ink disabled:opacity-30"
        >
          ↑
        </button>
        <button
          type="button"
          aria-label={`Move ${label} down`}
          disabled={index === count - 1}
          onClick={() => onMove(index, index + 1)}
          className="px-1.5 py-0.5 font-mono text-xs text-ink-soft hover:text-ink disabled:opacity-30"
        >
          ↓
        </button>
      </div>
    </li>
  );
}

// The list of Home sections in the Customize studio: drag to reorder, Show tick, extra space per section.
export function SectionControls({ order, sections, selected = null, onOrder, onSection }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function move(from: number, to: number) {
    if (to < 0 || to >= order.length) return;
    onOrder(arrayMove(order, from, to));
  }

  function end(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = order.indexOf(active.id as SectionId);
    const to = order.indexOf(over.id as SectionId);
    if (from < 0 || to < 0) return;
    onOrder(arrayMove(order, from, to));
  }

  return (
    <DndContext id="home-sections" sensors={sensors} collisionDetection={closestCenter} onDragEnd={end}>
      <SortableContext items={order} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {order.map((id, index) => (
            <Row
              key={id}
              id={id}
              index={index}
              count={order.length}
              setting={sections[id]}
              selected={selected === id}
              onSection={onSection}
              onMove={move}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}