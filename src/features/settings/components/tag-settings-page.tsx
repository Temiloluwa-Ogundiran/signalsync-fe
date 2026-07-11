"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2, GripVertical, Check } from "lucide-react";
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
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AppLoader } from "@/components/app-loader";
import {
  useJournalTagsConfig,
  useCreateTagGroup,
  useUpdateTagGroup,
  useDeleteTagGroup,
  useReorderTagGroups,
  useCreateTag,
  useDeleteTag,
  useReorderTags,
} from "@/features/journal/hooks/use-journal-tags";
import type { Tag, TagGroup } from "@/features/journal/types";
import { SettingsPageShell } from "./settings-page-shell";

const GROUP_COLORS = [
  "#ef4444", // red
  "#f59e0b", // amber
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#0ea5e9", // sky
  "#64748b", // slate
];

const DEFAULT_COLOR = "#64748b";

function errMsg(err: unknown, fallback: string): string {
  const detail = (err as { response?: { data?: { detail?: string } } })
    ?.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

// ---------------------------------------------------------------------------
// Color swatch picker
// ---------------------------------------------------------------------------

function ColorSwatches({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {GROUP_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          title={c}
          className="flex h-5 w-5 items-center justify-center rounded-full ring-offset-2 ring-offset-card-bg transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          style={{ backgroundColor: c }}
        >
          {value === c && <Check className="h-3 w-3 text-white" />}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// A single tag row (sortable within its group) — inherits the group's color
// ---------------------------------------------------------------------------

function SortableTag({
  tag,
  color,
  onDelete,
}: {
  tag: Tag;
  color: string;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: tag.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-bg-primary"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />

      <span className="flex-1 truncate text-sm text-text-primary">
        {tag.name}
      </span>

      <button
        type="button"
        onClick={onDelete}
        className="text-text-tertiary opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
        title="Delete tag"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// A group card (sortable in the grid)
// ---------------------------------------------------------------------------

function GroupCard({
  group,
  onAddTag,
  onDeleteTag,
  onRecolorGroup,
  onDeleteGroup,
  onReorderTags,
}: {
  group: TagGroup;
  onAddTag: (groupId: string, name: string) => Promise<void>;
  onDeleteTag: (tagId: string) => void;
  onRecolorGroup: (groupId: string, color: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onReorderTags: (groupId: string, orderedIds: string[]) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `group:${group.id}` });
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);

  const color = group.color || DEFAULT_COLOR;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const submitNewTag = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setAdding(true);
    try {
      await onAddTag(group.id, trimmed);
      setNewName("");
    } finally {
      setAdding(false);
    }
  };

  const handleTagDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = group.tags.map((t) => t.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorderTags(group.id, arrayMove(ids, oldIndex, newIndex));
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex flex-col rounded-xl border border-border-secondary bg-card-bg p-4 shadow-sm"
    >
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="cursor-grab touch-none text-text-tertiary"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>

          {/* Group color swatch */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setColorOpen((o) => !o)}
              className="h-3.5 w-3.5 rounded-full ring-1 ring-border-secondary"
              style={{ backgroundColor: color }}
              title="Change group color"
              disabled={group.is_system}
            />
            {colorOpen && !group.is_system && (
              <div className="absolute left-0 top-6 z-20 rounded-lg border border-border-secondary bg-bg-secondary p-2 shadow-xl">
                <ColorSwatches
                  value={color}
                  onChange={(c) => {
                    onRecolorGroup(group.id, c);
                    setColorOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          <h3 className="text-sm font-bold text-text-primary">{group.name}</h3>
          {group.is_system && (
            <span className="rounded bg-bg-primary px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase text-text-tertiary">
              Default
            </span>
          )}
        </div>
        {!group.is_system && (
          <button
            type="button"
            onClick={() => onDeleteGroup(group.id)}
            className="text-text-tertiary transition-colors hover:text-danger"
            title="Delete group"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Tags */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleTagDragEnd}
      >
        <SortableContext
          items={group.tags.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-0.5">
            {group.tags.map((tag) => (
              <SortableTag
                key={tag.id}
                tag={tag}
                color={color}
                onDelete={() => onDeleteTag(tag.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add tag */}
      <div className="mt-3 flex items-center gap-2 border-t border-hairline pt-3">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void submitNewTag();
            }
          }}
          placeholder="Add a tag…"
          className="h-8 text-xs"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={submitNewTag}
          disabled={adding || !newName.trim()}
          className="h-8 shrink-0"
        >
          {adding ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export function TagSettingsPage() {
  const { data: config = [], isLoading } = useJournalTagsConfig();

  const createGroup = useCreateTagGroup();
  const updateGroup = useUpdateTagGroup();
  const deleteGroup = useDeleteTagGroup();
  const reorderGroups = useReorderTagGroups();
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();
  const reorderTags = useReorderTags();

  // Local ordering mirror so drag feels instant; reconciled when config changes.
  const [groups, setGroups] = useState<TagGroup[]>(config);
  useEffect(() => setGroups(config), [config]);

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState(GROUP_COLORS[4]);
  const [creatingGroup, setCreatingGroup] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  const groupSortIds = useMemo(
    () => groups.map((g) => `group:${g.id}`),
    [groups]
  );

  const handleGroupDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = groups.map((g) => g.id);
    const oldIndex = ids.indexOf((active.id as string).replace("group:", ""));
    const newIndex = ids.indexOf((over.id as string).replace("group:", ""));
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(groups, oldIndex, newIndex);
    setGroups(reordered);
    reorderGroups.mutate(reordered.map((g) => g.id), {
      onError: (err) =>
        toast.error("Could not reorder groups", {
          description: errMsg(err, "Please try again."),
        }),
    });
  };

  const handleReorderTags = (groupId: string, orderedIds: string[]) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              tags: orderedIds
                .map((id) => g.tags.find((t) => t.id === id)!)
                .filter(Boolean),
            }
          : g
      )
    );
    reorderTags.mutate(orderedIds, {
      onError: (err) =>
        toast.error("Could not reorder tags", {
          description: errMsg(err, "Please try again."),
        }),
    });
  };

  const handleAddTag = async (groupId: string, name: string) => {
    try {
      await createTag.mutateAsync({ groupId, name });
    } catch (err) {
      toast.error("Could not add tag", {
        description: errMsg(err, "Please try again."),
      });
    }
  };

  const handleDeleteTag = (tagId: string) => {
    deleteTag.mutate(tagId, {
      onError: (err) =>
        toast.error("Could not delete tag", {
          description: errMsg(err, "Default tags can't be removed."),
        }),
    });
  };

  const handleRecolorGroup = (groupId: string, color: string) => {
    updateGroup.mutate(
      { groupId, color },
      {
        onError: (err) =>
          toast.error("Could not update group", {
            description: errMsg(err, "Default groups can't be edited."),
          }),
      }
    );
  };

  const handleDeleteGroup = (groupId: string) => {
    deleteGroup.mutate(groupId, {
      onError: (err) =>
        toast.error("Could not delete group", {
          description: errMsg(err, "Please try again."),
        }),
    });
  };

  const handleCreateGroup = async () => {
    const trimmed = newGroupName.trim();
    if (!trimmed) return;
    setCreatingGroup(true);
    try {
      await createGroup.mutateAsync({ name: trimmed, color: newGroupColor });
      setNewGroupName("");
      toast.success("Group created");
    } catch (err) {
      toast.error("Could not create group", {
        description: errMsg(err, "Please try again."),
      });
    } finally {
      setCreatingGroup(false);
    }
  };

  if (isLoading) {
    return (
      <SettingsPageShell title="Custom Tags">
        <div className="flex justify-center py-16">
          <AppLoader />
        </div>
      </SettingsPageShell>
    );
  }

  return (
    <SettingsPageShell
      title="Custom Tags"
      description="Organise your tags into groups, then apply them to trades from the trade row. Each group has a color its tags share."
    >
      {/* New group */}
      <div className="space-y-3 rounded-xl border border-border-secondary bg-card-bg p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Input
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleCreateGroup();
              }
            }}
            placeholder="New group name (e.g. Setup, Session, Emotion)…"
            className="h-9"
          />
          <Button
            type="button"
            onClick={handleCreateGroup}
            disabled={creatingGroup || !newGroupName.trim()}
            className="shrink-0"
          >
            {creatingGroup ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            New group
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-text-secondary">
            Group color
          </span>
          <ColorSwatches value={newGroupColor} onChange={setNewGroupColor} />
        </div>
      </div>

      {/* Group grid */}
      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border-secondary bg-card-bg py-16 text-center text-sm text-text-secondary">
          No tag groups yet. Create your first group above.
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleGroupDragEnd}
        >
          <SortableContext items={groupSortIds} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onAddTag={handleAddTag}
                  onDeleteTag={handleDeleteTag}
                  onRecolorGroup={handleRecolorGroup}
                  onDeleteGroup={handleDeleteGroup}
                  onReorderTags={handleReorderTags}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </SettingsPageShell>
  );
}
