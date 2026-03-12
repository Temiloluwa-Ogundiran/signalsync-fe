"use client";

import { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Radio } from "lucide-react";
import { useMyStreams } from "@/features/stream/hooks/use-streams";
import { useStreamStore } from "@/features/stream/store";

export function StreamSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: streams, isLoading, error } = useMyStreams();
  const { activeStream, setActiveStream } = useStreamStore();

  // Set initial active stream if not set
  useEffect(() => {
    if (streams && streams.length > 0 && !activeStream) {
      // Find default stream or take the first one
      const defaultStream = streams.find((s) => s.is_default) || streams[0];
      setActiveStream(defaultStream);
    }
  }, [streams, activeStream, setActiveStream]);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="h-14 flex items-center px-4 mx-2 mt-2 bg-bg-tertiary rounded-lg animate-pulse">
        <div className="w-8 h-8 bg-border-primary rounded-lg mr-3"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-border-primary rounded w-2/3"></div>
          <div className="h-2 bg-border-primary rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !streams || streams.length === 0) {
    return null; // Silent fail or empty
  }

  const currentStream = activeStream || streams[0];

  return (
    <div className="px-3 pt-3 pb-1" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-bg-tertiary hover:bg-bg-tertiary/80 border border-border-primary rounded-xl transition-all group"
      >
        <div className="flex items-center overflow-hidden">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center mr-3 shrink-0 shadow-sm overflow-hidden">
            {currentStream.avatar_url ? (
              <img
                src={currentStream.avatar_url}
                alt={currentStream.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Radio className="w-4 h-4 text-white" />
            )}
          </div>
          <div className="flex flex-col items-start overflow-hidden">
            {/* <span className="text-xs text-text-tertiary font-medium">Active Stream</span> */}
            <span className="text-sm font-bold text-text-primary truncate w-32 text-left">
              {currentStream.name}
            </span>
          </div>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-text-tertiary shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-[calc(16rem-1.5rem)] bg-card-bg border border-border-primary rounded-xl shadow-lg max-h-60 overflow-y-auto no-scrollbar">
          <div className="p-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-text-tertiary uppercase tracking-wider">
              Your Streams
            </div>
            {streams.map((stream) => (
              <button
                key={stream.id}
                onClick={() => {
                  setActiveStream(stream);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center px-2 py-2 text-sm rounded-lg transition-colors ${
                  currentStream.id === stream.id
                    ? "bg-accent-light text-accent font-medium mt-1 mb-1"
                    : "text-text-secondary hover:bg-bg-tertiary hover:text-text-primary mt-1 mb-1"
                }`}
              >
                <div className="w-6 h-6 bg-border-primary rounded relative flex items-center justify-center mr-2 shrink-0 overflow-hidden">
                  {stream.avatar_url ? (
                    <img
                      src={stream.avatar_url}
                      alt={stream.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Radio className="w-3 h-3 text-text-tertiary" />
                  )}
                </div>
                <span className="truncate flex-1 text-left">{stream.name}</span>
                {currentStream.id === stream.id && (
                  <Check className="w-4 h-4 shrink-0" />
                )}
              </button>
            ))}
            
            {/* Create New Stream Button */}
            <div className="mt-2 pt-2 border-t border-border-primary px-1 pb-1">
              <button
                className="w-full flex items-center px-2 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors group"
                onClick={() => {
                  setIsOpen(false);
                  // TODO: Wire up actual routing or modal
                  console.log("Create new stream clicked");
                }}
              >
                <div className="w-6 h-6 bg-bg-secondary border border-border-primary border-dashed rounded relative flex items-center justify-center mr-2 shrink-0 group-hover:bg-bg-tertiary transition-colors">
                  <svg className="w-3 h-3 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-medium">Create new stream</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
