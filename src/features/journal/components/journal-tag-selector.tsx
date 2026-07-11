"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Search, Settings, Tag as TagIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Tag, TagGroup } from "../types";

interface JournalTagSelectorProps {
  /** The full tag config (all groups + their tags). */
  groups: TagGroup[];
  /** Tags currently applied to the trade. */
  selectedTags: Tag[];
  /** Called with the next full set of selected tag ids. */
  onSelectChange: (selectedIds: string[]) => void;
  trigger: React.ReactNode;
}

export function JournalTagSelector({
  groups,
  selectedTags,
  onSelectChange,
  trigger,
}: JournalTagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedIds = selectedTags.map((t) => t.id);

  const handleToggle = (tagId: string) => {
    const next = selectedIds.includes(tagId)
      ? selectedIds.filter((id) => id !== tagId)
      : [...selectedIds, tagId];
    onSelectChange(next);
  };

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        tags: q
          ? g.tags.filter((t) => t.name.toLowerCase().includes(q))
          : g.tags,
      }))
      .filter((g) => g.tags.length > 0);
  }, [groups, searchQuery]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80 border-border-secondary bg-bg-secondary p-0 text-text-primary shadow-xl">
        {/* Search header */}
        <div className="flex items-center gap-2 border-b border-border-secondary px-3 py-2.5">
          <Search className="h-4 w-4 text-text-tertiary" />
          <Input
            type="text"
            placeholder="Search tags…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 border-0 bg-transparent p-0 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
        </div>

        {/* Grouped tag list */}
        <div className="max-h-72 overflow-y-auto px-1 py-1.5">
          {filteredGroups.length === 0 ? (
            <div className="flex h-16 flex-col items-center justify-center gap-1 py-2 text-center text-xs text-text-tertiary">
              <TagIcon className="h-4 w-4 text-text-tertiary" />
              <span>No tags found</span>
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.id} className="mb-1.5 last:mb-0">
                <div className="px-2.5 pb-1 pt-1.5 text-[0.6rem] font-bold uppercase text-text-tertiary">
                  {group.name}
                </div>
                <div className="space-y-0.5">
                  {group.tags.map((tag) => {
                    const isChecked = selectedIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleToggle(tag.id)}
                        className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs font-semibold transition-colors hover:bg-bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: group.color || "#64748b" }}
                          />
                          <span className="text-text-primary">{tag.name}</span>
                        </div>
                        {isChecked && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/10 text-brand">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border-secondary bg-bg-primary p-2">
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-center text-xs font-semibold text-text-secondary hover:bg-border-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Link href="/settings/tags" onClick={() => setIsOpen(false)}>
              <Settings className="h-3.5 w-3.5" />
              Manage tags
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
