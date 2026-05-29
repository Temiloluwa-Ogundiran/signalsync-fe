"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Tag,
  Loader2,
  Settings,
  Shield,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useJournalTagsConfig,
  useTradeTags,
  useUpdateTradeTags,
} from "../hooks/use-journal-tags";
import { JournalTagSelector } from "./journal-tag-selector";
import { JournalTagManager } from "./journal-tag-manager";
import type { TagCategory, TagOption } from "../types";

interface JournalTradeChatTagsCardProps {
  tradeId?: string;
  accountId?: string;
}

export function JournalTradeChatTagsCard({
  tradeId,
  accountId,
}: JournalTradeChatTagsCardProps) {
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);

  // Fetch tag config & trade tags
  const { data: config, isLoading: isLoadingConfig } = useJournalTagsConfig();
  const { data: activeTags, isLoading: isLoadingActiveTags } = useTradeTags(
    tradeId,
    !!tradeId,
  );
  const updateTradeTags = useUpdateTradeTags(accountId);

  const handleUpdateTags = async (
    category: TagCategory,
    nextOptionIdsForCategory: string[],
  ) => {
    if (!tradeId) return;

    // Filter out options from other categories to preserve them
    const otherCategoriesOptionIds =
      activeTags
        ?.filter((t) => t.category_id !== category.id)
        .map((t) => t.id) ?? [];

    const finalOptionIds = [
      ...otherCategoriesOptionIds,
      ...nextOptionIdsForCategory,
    ];

    try {
      await updateTradeTags.mutateAsync({
        tradeId,
        optionIds: finalOptionIds,
      });
    } catch (err) {
      console.error("Failed to update trade tags", err);
    }
  };

  const isLoadingTags = isLoadingConfig || isLoadingActiveTags;

  return (
    <Card className="h-full border-0 bg-card-bg text-text-primary shadow-sm flex flex-col justify-between xl:max-h-[calc(100vh-6rem)] overflow-hidden">
      <div className="flex flex-col min-h-0 overflow-y-auto scrollbar-thin">
        <CardHeader className="border-b border-border-secondary p-6 flex flex-row items-center justify-between sticky top-0 bg-card-bg z-10 shrink-0">
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-brand" />
            <CardTitle className="text-lg font-bold tracking-tight">
              Trade Tags
            </CardTitle>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsTagManagerOpen(true)}
            className="h-8 gap-1.5 text-xs text-text-secondary hover:bg-border-secondary hover:text-text-primary"
          >
            <Settings className="h-3.5 w-3.5" />
            Configure
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-6 flex-1 min-h-0">
          {isLoadingTags ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-xs text-text-tertiary">
              <Loader2 className="h-5 w-5 animate-spin text-brand" />
              <span>Loading trade tags config...</span>
            </div>
          ) : config && config.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-xs text-text-tertiary">
              <Tag className="h-8 w-8 text-text-tertiary/40" />
              <p>No tag categories configured.</p>
              <Button
                size="sm"
                onClick={() => setIsTagManagerOpen(true)}
                className="mt-2 bg-brand text-white hover:bg-brand-hover text-xs font-semibold"
              >
                Create Tag Category
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {config?.map((category) => {
                // Get selected options belonging to this category
                const selectedOptionsForCat =
                  activeTags?.filter(
                    (opt) => opt.category_id === category.id,
                  ) ?? [];

                return (
                  <div
                    key={category.id}
                    className="border-b border-border-secondary/40 pb-5 last:border-0 last:pb-0"
                  >
                    {/* Category Title Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-text-secondary">
                          {category.title}
                        </span>
                        {category.is_system && (
                          <span className="rounded-full bg-border-secondary px-2 py-0.5 text-[9px] font-bold text-text-tertiary tracking-wider">
                            System
                          </span>
                        )}
                      </div>

                      <JournalTagSelector
                        category={category}
                        selectedOptions={selectedOptionsForCat}
                        onSelectChange={(nextIds) =>
                          handleUpdateTags(category, nextIds)
                        }
                        onOpenTagManager={() => setIsTagManagerOpen(true)}
                        trigger={
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 gap-1 px-2.5 text-xs text-brand hover:bg-brand/10 hover:text-brand-hover"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Select
                          </Button>
                        }
                      />
                    </div>

                    {/* Tag Pills List */}
                    <div className="flex flex-wrap gap-2">
                      {selectedOptionsForCat.length === 0 ? (
                        <JournalTagSelector
                          category={category}
                          selectedOptions={selectedOptionsForCat}
                          onSelectChange={(nextIds) =>
                            handleUpdateTags(category, nextIds)
                          }
                          onOpenTagManager={() => setIsTagManagerOpen(true)}
                          trigger={
                            <button className="flex cursor-pointer w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-secondary p-3 text-center text-xs font-semibold text-text-tertiary transition-all hover:border-brand/40 hover:text-text-secondary bg-bg-primary/30">
                              <Plus className="h-4 w-4" />
                              No {category.title} tags assigned
                            </button>
                          }
                        />
                      ) : (
                        selectedOptionsForCat.map((opt) => (
                          <JournalTagSelector
                            key={opt.id}
                            category={category}
                            selectedOptions={selectedOptionsForCat}
                            onSelectChange={(nextIds) =>
                              handleUpdateTags(category, nextIds)
                            }
                            onOpenTagManager={() => setIsTagManagerOpen(true)}
                            trigger={
                              <button
                                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-white transition-all shadow-sm hover:scale-105"
                                style={{
                                  backgroundColor: opt.color || "#64748b",
                                }}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                                {opt.value}
                                <ChevronDown className="h-3 w-3 opacity-60" />
                              </button>
                            }
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </div>

      <div className="p-6 border-t border-border-secondary/40 bg-bg-primary/20 rounded-b-xl">
        <Button
          variant="outline"
          onClick={() => setIsTagManagerOpen(true)}
          className="w-full justify-center gap-2 border-border-secondary bg-transparent text-xs text-text-secondary hover:bg-border-secondary hover:text-text-primary"
        >
          <Settings className="h-4 w-4" />
          Manage Categories &amp; Options
        </Button>
      </div>

      {/* Tag manager modal */}
      <JournalTagManager
        isOpen={isTagManagerOpen}
        onOpenChange={setIsTagManagerOpen}
      />
    </Card>
  );
}
