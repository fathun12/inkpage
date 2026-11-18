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
import { useState, useTransition, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { FormAction } from "@/types/form";

type Item = { id: string; node: ReactNode };
type Props = { items: Item[]; onReorder: FormAction };

function Row({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("ink-border relative flex rounded-md bg-surface", isDragging && "z-10 opacity-80")}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
        className="flex w-8 shrink-0 cursor-grab touch-none items-center justify-center border-r border-line font-mono text-sm text-ink-soft active:cursor-grabbing"
      >
        ::
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}

export function SortableList({ items, onReorder }: Props) {
  const [order, setOrder] = useState(() => items.map((item) => item.id));
  const [pending, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const byId = new Map(items.map((item) => [item.id, item.node] as const));

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const next = arrayMove(order, order.indexOf(String(active.id)), order.indexOf(String(over.id)));
    setOrder(next);
    const data = new FormData();
    data.set("order", next.join(","));
    startTransition(async () => {
      await onReorder(data);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="h-4 font-mono text-xs text-ink-soft" role="status">
        {pending ? "Saving order…" : ""}
      </p>
      <DndContext id="blocks-dnd" sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-3">
            {order.map((id) => (
              <Row key={id} id={id}>
                {byId.get(id)}
              </Row>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}
