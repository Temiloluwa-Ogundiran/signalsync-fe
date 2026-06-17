"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2, GripVertical, Target } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppLoader } from "@/components/app-loader";
import type { Setup } from "../types";
import {
  useSetups,
  useCreateSetup,
  useDeleteSetup,
  useReorderSetups,
} from "../hooks/use-trade-detail";

function errMsg(err: unknown, fallback: string): string {
  const detail = (err as { response?: { data?: { detail?: string } } })?.response
    ?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

function SortableSetup({
  setup,
  onDelete,
}: {
  setup: Setup;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: setup.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 rounded-lg border border-hairline bg-card-bg px-3 py-2.5"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-text-tertiary"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 truncate text-sm font-medium text-text-primary">
        {setup.name}
      </span>
      <button
        type="button"
        onClick={onDelete}
        className="text-text-tertiary opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
        title="Delete setup"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function SetupsPage() {
  const { data: config = [], isLoading } = useSetups();
  const createSetup = useCreateSetup();
  const deleteSetup = useDeleteSetup();
  const reorderSetups = useReorderSetups();

  // Local mirror so drag feels instant; reconciled when the query updates.
  const [setups, setSetups] = useState<Setup[]>(config);
  useEffect(() => setSetups(config), [config]);

  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );
  const ids = useMemo(() => setups.map((s) => s.id), [setups]);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      await createSetup.mutateAsync(trimmed);
      setName("");
    } catch (err) {
      toast.error("Could not create setup", {
        description: errMsg(err, "Please try again."),
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id: string) => {
    deleteSetup.mutate(id, {
      onError: (err) =>
        toast.error("Could not delete setup", {
          description: errMsg(err, "Please try again."),
        }),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(setups, oldIndex, newIndex);
    setSetups(reordered);
    reorderSetups.mutate(reordered.map((s) => s.id), {
      onError: (err) =>
        toast.error("Could not reorder setups", {
          description: errMsg(err, "Please try again."),
        }),
    });
  };

  return (
    <div className="min-w-0 p-4 pb-20 font-sans text-text-primary md:p-8 md:pb-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight">Strategies</h1>
          <p className="text-sm text-text-secondary">
            Your playbook setups. Create the named strategies you trade, then
            tag each trade with one from the trade panel.
          </p>
        </header>

        {/* Create */}
        <div className="flex items-center gap-2 rounded-xl border border-border-secondary bg-card-bg p-4 shadow-sm">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleCreate();
              }
            }}
            placeholder="New setup name (e.g. London Breakout)…"
            className="h-9"
          />
          <Button
            type="button"
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className="shrink-0"
          >
            {creating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Add setup
          </Button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <AppLoader />
          </div>
        ) : setups.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border-secondary bg-card-bg py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand">
              <Target className="h-6 w-6" />
            </div>
            <p className="text-sm text-text-secondary">
              No setups yet. Add your first strategy above.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {setups.map((s) => (
                  <SortableSetup
                    key={s.id}
                    setup={s}
                    onDelete={() => handleDelete(s.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
