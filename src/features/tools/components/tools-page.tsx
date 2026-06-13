"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { PositionSizeCalculator } from "./position-size-calculator";
import { ComingSoonPlaceholder } from "./coming-soon-placeholder";
import { TOOLS, type ToolId } from "../types";

export function ToolsPage() {
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);

  return (
    <div className="p-4 md:p-8 pb-20 md:pb-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
            Tools
          </h1>
          <p className="text-text-secondary mt-1">
            Quick tools for sizing, risk management, and trade planning.
          </p>
        </div>
      </div>
      <div className="mb-8 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex space-x-2 min-w-max">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${activeTool === tool.id ? "bg-text-primary text-bg-primary border-text-primary shadow-md" : "bg-card-bg text-text-secondary border-border-primary hover:border-accent/30 hover:text-accent"}`}
            >
              {tool.label}
            </button>
          ))}
        </div>
      </div>

      {activeTool === null ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool) => (
            <div
              key={tool.id}
              className="bg-card-bg p-6 rounded-2xl border border-border-primary shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col h-full"
              onClick={() => setActiveTool(tool.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 rounded-xl ${tool.status === "active" ? "bg-accent-light text-accent" : "bg-bg-tertiary text-text-tertiary"}`}
                >
                  <tool.icon className="h-6 w-6" />
                </div>
                {tool.status === "coming-soon" && (
                  <span className="bg-bg-tertiary text-text-tertiary text-[10px] font-bold px-2 py-1 rounded uppercase">
                    Soon
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">
                {tool.label}
              </h3>
              <p className="text-sm text-text-secondary mb-6 flex-1">
                {tool.description}
              </p>
              <button
                className={`w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center transition-colors ${tool.status === "active" ? "bg-text-primary text-bg-primary hover:bg-accent" : "bg-bg-tertiary text-text-tertiary cursor-not-allowed"}`}
              >
                {tool.status === "active" ? "Open Tool" : "In Development"}
                {tool.status === "active" && (
                  <ChevronRight className="h-4 w-4 ml-1" />
                )}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <button
            onClick={() => setActiveTool(null)}
            className="mb-6 flex items-center text-sm font-medium text-text-tertiary hover:text-text-primary transition-colors"
          >
            <ChevronRight className="h-4 w-4 rotate-180 mr-1" /> Back to All
            Tools
          </button>
          {activeTool === "position" ? (
            <PositionSizeCalculator />
          ) : (
            <ComingSoonPlaceholder
              toolName={
                TOOLS.find((t) => t.id === activeTool)?.label || "Unknown"
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
