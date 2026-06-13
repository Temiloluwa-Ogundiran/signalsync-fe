"use client";

import { Image as ImageIcon, BarChart2 } from "lucide-react";

export function CreatePostWidget() {
  return (
    <div className="bg-card-bg rounded-xl border border-border-primary p-4 mb-6 shadow-sm">
      <div className="flex gap-3">
        <div className="h-10 w-10 rounded-full bg-bg-tertiary flex-shrink-0">
          <img
            src="https://picsum.photos/100/100?random=100"
            className="h-full w-full rounded-full object-cover"
            alt="User"
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Share a trade idea or market thought..."
            className="w-full bg-bg-tertiary border border-border-primary rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:bg-card-bg transition-all placeholder:text-text-tertiary"
          />
          <div className="flex justify-between items-center mt-3">
            <div className="flex gap-2">
              <button
                className="p-2 text-text-tertiary hover:text-accent hover:bg-accent-light rounded-lg transition-colors"
                title="Add Chart"
              >
                <ImageIcon className="h-4 w-4" />
              </button>
              <button
                className="p-2 text-text-tertiary hover:text-success hover:bg-success-light rounded-lg transition-colors"
                title="Link Trade"
              >
                <BarChart2 className="h-4 w-4" />
              </button>
            </div>
            <button className="bg-accent text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-accent-hover transition-colors shadow-sm">
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
