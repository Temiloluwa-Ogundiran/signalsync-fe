"use client";

import { TrendingUp, Shield, Users } from "lucide-react";
import { Space } from "../types";

export function SpaceCard({ space, onClick }: { space: Space; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-card-bg rounded-2xl border border-border-primary overflow-hidden cursor-pointer hover:shadow-lg hover:border-accent/30 transition-all group flex flex-col h-full"
    >
      <div className="h-24 bg-bg-tertiary relative overflow-hidden">
        <img
          src={space.image}
          alt={space.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded flex items-center">
          <TrendingUp className="h-3 w-3 mr-1 text-success" /> {space.roi}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-text-primary text-lg group-hover:text-accent transition-colors flex items-center">
            {space.name}
            {space.isVerified && (
              <Shield className="h-4 w-4 text-accent ml-1 fill-accent/10" />
            )}
          </h3>
        </div>
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
          {space.description}
        </p>
        <div className="mt-auto">
          <div className="flex flex-wrap gap-2 mb-4">
            {space.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-bg-tertiary text-text-tertiary border border-border-primary text-[10px] font-bold uppercase rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border-primary">
            <div className="flex items-center text-xs text-text-tertiary font-medium">
              <Users className="h-3 w-3 mr-1" /> {space.members} Members
            </div>
            <button className="text-xs font-bold text-accent bg-accent-light px-3 py-1.5 rounded-lg hover:bg-accent/20 transition-colors">
              Join Space
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
