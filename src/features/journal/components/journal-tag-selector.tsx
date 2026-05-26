"use client";

import { useMemo, useState } from "react";
import { Check, Search, Settings, Tag, Plus, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateTagOption } from "../hooks/use-journal-tags";
import type { TagCategory, TagOption } from "../types";

interface JournalTagSelectorProps {
  category: TagCategory;
  selectedOptions: TagOption[];
  onSelectChange: (selectedIds: string[]) => void;
  onOpenTagManager: () => void;
  trigger: React.ReactNode;
}

export function JournalTagSelector({
  category,
  selectedOptions,
  onSelectChange,
  onOpenTagManager,
  trigger,
}: JournalTagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const createOption = useCreateTagOption();

  const filteredOptions = category.options.filter((opt) =>
    opt.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedIds = selectedOptions.map((opt) => opt.id);

  const handleToggleOption = (optionId: string) => {
    let nextIds: string[];
    if (selectedIds.includes(optionId)) {
      nextIds = selectedIds.filter((id) => id !== optionId);
    } else {
      nextIds = [...selectedIds, optionId];
    }
    onSelectChange(nextIds);
  };

  const hasExactMatch = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return category.options.some((opt) => opt.value.toLowerCase() === query);
  }, [category.options, searchQuery]);

  const handleCreateAndSelectOption = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    try {
      // Create the new option under this category
      const newOpt = await createOption.mutateAsync({
        categoryId: category.id,
        value: trimmed,
        color: "#64748b", // Default premium slate grey color
      });

      // Automatically tag this trade with the newly created option
      const nextIds = [...selectedIds, newOpt.id];
      onSelectChange(nextIds);

      // Reset search filter
      setSearchQuery("");
    } catch (err) {
      console.error("Failed to quick create tag option", err);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80 border-border-secondary bg-bg-secondary p-0 text-text-primary shadow-xl">
        {/* Search Header */}
        <div className="flex items-center gap-2 border-b border-border-secondary px-3 py-2.5">
          <Search className="h-4 w-4 text-text-tertiary" />
          <Input
            type="text"
            placeholder={`Search or type to create custom...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 border-0 bg-transparent p-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
          />
        </div>

        {/* Options List */}
        <div className="max-h-60 overflow-y-auto px-1 py-1.5 space-y-0.5">
          {filteredOptions.length === 0 && hasExactMatch ? (
            <div className="flex h-16 flex-col items-center justify-center gap-1 py-2 text-center text-xs text-text-tertiary">
              <Tag className="h-4 w-4 text-text-tertiary" />
              <span>No options found</span>
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isChecked = selectedIds.includes(option.id);
              return (
                <button
                  key={option.id}
                  onClick={() => handleToggleOption(option.id)}
                  className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs font-semibold hover:bg-bg-primary transition-all focus:outline-none"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: option.color || "#64748b" }}
                    />
                    <span className="text-text-primary">{option.value}</span>
                  </div>

                  {isChecked && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/10 text-brand">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })
          )}

          {/* Quick Create Action Row */}
          {!hasExactMatch && searchQuery.trim() !== "" && (
            <button
              onClick={handleCreateAndSelectOption}
              disabled={createOption.isPending}
              className="flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-xs font-bold text-brand hover:bg-brand/10 transition-all border border-dashed border-brand/20 mt-1 focus:outline-none disabled:opacity-60"
            >
              <div className="flex items-center gap-2">
                {createOption.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                <span>Create "{searchQuery.trim()}"</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-brand/60 pr-1">
                Quick Add
              </span>
            </button>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-border-secondary bg-bg-primary p-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsOpen(false);
              onOpenTagManager();
            }}
            className="flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-center text-xs font-semibold text-text-secondary hover:bg-border-secondary focus:outline-none"
          >
            <Settings className="h-3.5 w-3.5" />
            Manage custom {category.title.toLowerCase()}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
