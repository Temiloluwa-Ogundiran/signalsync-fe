"use client";

import { useState } from "react";
import { Plus, Trash2, X, Tag, Settings2, Palette } from "lucide-react";
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
  ColorPicker,
  ColorArea,
  ColorSlider,
  ColorField,
  ColorThumb,
  ColorSwatch,
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  SliderTrack,
  Label,
  Input as AriaInput,
  parseColor,
} from "react-aria-components";
import type { Color } from "react-aria-components";
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

const DEFAULT_COLOR = "#3b82f6";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#10b981",
  "#3b82f6", "#8b5cf6", "#ec4899", "#64748b",
];

interface ColorPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialColor: string;
  onApply: (hex: string) => void;
}

function ColorPickerDialog({ isOpen, onClose, initialColor, onApply }: ColorPickerDialogProps) {
  const safeInitial = (() => {
    try { return parseColor(initialColor).toFormat("hsb"); } catch { return parseColor(DEFAULT_COLOR).toFormat("hsb"); }
  })();
  const [pickedColor, setPickedColor] = useState<Color>(safeInitial);

  const handleApply = () => {
    onApply(pickedColor.toString("hex"));
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-[17rem] border-border-secondary bg-bg-secondary p-5 text-text-primary shadow-2xl">
        <DialogHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-brand" />
            <DialogTitle className="text-sm font-bold">Pick a Color</DialogTitle>
          </div>
        </DialogHeader>

        <ColorPicker value={pickedColor} onChange={setPickedColor}>
          {/* 2D saturation/brightness area */}
          <ColorArea
            colorSpace="hsb"
            xChannel="saturation"
            yChannel="brightness"
            className="h-36 w-full rounded-lg"
          >
            <ColorThumb className="h-4 w-4 rounded-full border-2 border-white shadow-md outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-white" />
          </ColorArea>

          {/* Hue slider */}
          <ColorSlider channel="hue" colorSpace="hsb" className="mt-3 w-full">
            <SliderTrack className="h-3 w-full rounded-full">
              <ColorThumb className="top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white shadow-md outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-brand" />
            </SliderTrack>
          </ColorSlider>

          {/* Hex field */}
          <ColorField className="mt-3 w-full">
            <Label className="sr-only">Hex</Label>
            <div className="flex items-center gap-2 rounded-lg border border-border-secondary bg-bg-primary px-3 py-1.5">
              <ColorSwatch className="h-4 w-4 flex-shrink-0 rounded-full border border-border-secondary" />
              <span className="text-xs text-text-tertiary font-medium">#</span>
              <AriaInput className="flex-1 bg-transparent font-mono text-xs text-text-primary outline-none uppercase" />
            </div>
          </ColorField>

          {/* Preset swatches */}
          <ColorSwatchPicker className="mt-3 flex flex-wrap gap-1.5">
            {PRESET_COLORS.map((c) => (
              <ColorSwatchPickerItem
                key={c}
                color={c}
                className="h-6 w-6 cursor-pointer rounded-full border-2 outline-none transition-transform hover:scale-110 data-[selected]:border-white data-[selected]:ring-2 data-[selected]:ring-brand data-[selected]:ring-offset-1 data-[selected]:ring-offset-bg-secondary border-transparent"
              >
                <ColorSwatch className="h-full w-full rounded-full" />
              </ColorSwatchPickerItem>
            ))}
          </ColorSwatchPicker>
        </ColorPicker>

        <div className="mt-4 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="flex-1 text-text-secondary"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            className="flex-1 bg-brand text-white hover:bg-brand-hover"
          >
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function JournalTagManager({ isOpen, onOpenChange }: JournalTagManagerProps) {
  const { data: config, isLoading } = useJournalTagsConfig();

  const createCategory = useCreateTagCategory();
  const deleteCategory = useDeleteTagCategory();
  const createOption = useCreateTagOption();
  const deleteOption = useDeleteTagOption();

  const [newCategoryTitle, setNewCategoryTitle] = useState("");
  const [newOptionValues, setNewOptionValues] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);

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
    const color = selectedColors[categoryId] || DEFAULT_COLOR;
    if (!value) return;
    try {
      await createOption.mutateAsync({ categoryId, value, color });
      setNewOptionValues((prev) => ({ ...prev, [categoryId]: "" }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
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
                      <h3 className="font-semibold text-text-primary">{category.title}</h3>
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
                        placeholder="Type option value (e.g. Trend Line, Revenge Trade)..."
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

                    <div className="flex items-center justify-between gap-3">
                      {/* Color trigger */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-text-tertiary">
                          Tag Color
                        </span>
                        <button
                          type="button"
                          onClick={() => setColorPickerOpen(category.id)}
                          className="flex items-center gap-2 rounded-lg border-2 border-border-secondary bg-bg-primary px-3 py-1.5 text-xs font-semibold text-text-secondary transition-all hover:border-brand hover:text-text-primary"
                        >
                          <span
                            className="h-4 w-4 flex-shrink-0 rounded-full border border-border-secondary shadow-sm"
                            style={{ backgroundColor: selectedColors[category.id] || DEFAULT_COLOR }}
                          />
                          <Palette className="h-3.5 w-3.5" />
                          <span className="font-mono uppercase tracking-tight">
                            {(selectedColors[category.id] || DEFAULT_COLOR).toUpperCase()}
                          </span>
                        </button>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleCreateOption(category.id)}
                        disabled={
                          createOption.isPending ||
                          !newOptionValues[category.id]?.trim()
                        }
                        className="self-end bg-brand text-white hover:bg-brand-hover h-8 px-4 text-xs font-bold"
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

      {colorPickerOpen && (
        <ColorPickerDialog
          isOpen={true}
          onClose={() => setColorPickerOpen(null)}
          initialColor={selectedColors[colorPickerOpen] || DEFAULT_COLOR}
          onApply={(hex) => {
            setSelectedColors((prev) => ({ ...prev, [colorPickerOpen]: hex }));
          }}
        />
      )}
    </>
  );
}
