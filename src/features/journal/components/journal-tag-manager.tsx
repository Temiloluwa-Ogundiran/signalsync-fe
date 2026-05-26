"use client";

import { useState } from "react";
import { Plus, Trash2, X, Tag, Settings2, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useJournalTagsConfig,
  useCreateTagCategory,
  useDeleteTagCategory,
  useCreateTagOption,
  useDeleteTagOption,
} from "../hooks/use-journal-tags";

interface JournalTagManagerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const PRESET_COLORS = [
  "#ef4444", // Red
  "#f43f5e", // Rose
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#6366f1", // Indigo
  "#3b82f6", // Blue
  "#0ea5e9", // Sky
  "#14b8a6", // Teal
  "#10b981", // Green
  "#f59e0b", // Amber
  "#f97316", // Orange
  "#64748b", // Slate
];

export function JournalTagManager({ isOpen, onOpenChange }: JournalTagManagerProps) {
  const { data: config, isLoading } = useJournalTagsConfig();
  
  const createCategory = useCreateTagCategory();
  const deleteCategory = useDeleteTagCategory();
  const createOption = useCreateTagOption();
  const deleteOption = useDeleteTagOption();

  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [newOptionValues, setNewOptionValues] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newCategoryTitle.trim();
    if (!title) return;
    try {
      await createCategory.mutateAsync(title);
      setNewCategoryTitle("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateOption = async (categoryId: string) => {
    const value = newOptionValues[categoryId]?.trim();
    const color = selectedColors[categoryId] || PRESET_COLORS[0];
    if (!value) return;

    try {
      await createOption.mutateAsync({ categoryId, value, color });
      setNewOptionValues((prev) => ({ ...prev, [categoryId]: "" }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-border-secondary bg-bg-secondary p-6 text-text-primary shadow-2xl">
        <DialogHeader className="border-b border-border-secondary pb-4">
          <div className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-brand" />
            <DialogTitle className="text-xl font-bold tracking-tight">
              Manage Tags
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-text-tertiary">
            Customize trade strategies, common mistakes, and setup contexts.
          </DialogDescription>
        </DialogHeader>

        {/* Create Category Form */}
        <form onSubmit={handleCreateCategory} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <Input
              type="text"
              placeholder="Create a custom category (e.g. Market Phase, Timeframe)..."
              value={newCategoryTitle}
              onChange={(e) => setNewCategoryTitle(e.target.value)}
              className="border-2 border-border-secondary bg-bg-primary pl-10 text-sm focus:border-brand"
            />
          </div>
          <Button
            type="submit"
            disabled={createCategory.isPending || !newCategoryTitle.trim()}
            className="flex items-center gap-1 bg-brand text-white hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </form>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-sm text-text-tertiary">
            Loading your tag configurations...
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {config?.map((category) => (
              <div
                key={category.id}
                className="rounded-xl border border-border-secondary bg-card-bg p-5 shadow-sm transition-all hover:shadow-md"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between border-b border-border-secondary pb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-text-primary">
                      {category.title}
                    </h3>
                    {category.is_system ? (
                      <span className="flex items-center gap-1 rounded-full bg-border-secondary px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-text-secondary">
                        System Default
                      </span>
                    ) : (
                      <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-indigo-400">
                        Custom
                      </span>
                    )}
                  </div>

                  {!category.is_system && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteCategory.mutate(category.id)}
                      disabled={deleteCategory.isPending}
                      className="h-8 w-8 rounded-full p-0 text-text-tertiary hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Tag Options List */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {category.options.length === 0 ? (
                    <p className="w-full text-xs italic text-text-tertiary">
                      No options created yet. Add one below.
                    </p>
                  ) : (
                    category.options.map((option) => (
                      <span
                        key={option.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border-secondary bg-bg-primary px-3 py-1 text-xs font-semibold text-text-secondary"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: option.color || "#64748b" }}
                        />
                        {option.value}
                        {option.id && !category.is_system && (
                          <button
                            onClick={() => deleteOption.mutate(option.id)}
                            disabled={deleteOption.isPending}
                            className="ml-1 rounded-full p-0.5 text-text-tertiary hover:bg-border-secondary hover:text-text-primary"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </span>
                    ))
                  )}
                </div>

                {/* Add Option Form */}
                <div className="mt-5 border-t border-border-secondary pt-4 space-y-3.5">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-text-tertiary">
                      Option Value
                    </span>
                    <Input
                      type="text"
                      placeholder={`Type option value (e.g. Trend Line, Revenge Trade)...`}
                      value={newOptionValues[category.id] || ""}
                      onChange={(e) =>
                        setNewOptionValues((prev) => ({
                          ...prev,
                          [category.id]: e.target.value,
                        }))
                      }
                      className="w-full border-2 border-border-secondary bg-bg-primary text-xs h-9 px-3 focus:border-brand"
                    />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Color Swatch Picker */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-text-tertiary">
                        Select Tag Color
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_COLORS.map((color) => {
                          const isSelected =
                            (selectedColors[category.id] || PRESET_COLORS[0]) === color;
                          return (
                            <button
                              key={color}
                              type="button"
                              onClick={() =>
                                setSelectedColors((prev) => ({
                                  ...prev,
                                  [category.id]: color,
                                }))
                              }
                              className={`h-6 w-6 rounded-full border transition-all hover:scale-110 ${
                                isSelected
                                  ? "border-text-primary scale-110 ring-2 ring-brand ring-offset-2 ring-offset-bg-secondary"
                                  : "border-transparent"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleCreateOption(category.id)}
                      disabled={
                        createOption.isPending ||
                        !newOptionValues[category.id]?.trim()
                      }
                      className="bg-brand text-white hover:bg-brand-hover self-start sm:self-end h-8 px-4 text-xs font-bold mt-2 sm:mt-0"
                    >
                      Add Option
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
