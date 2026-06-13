"use client";

import Link from "next/link";
import { Radio, Globe, Lock, DollarSign, Loader2 } from "lucide-react";
import { useMyStreams } from "@/features/stream/hooks/use-streams";

export function MyStreamsTab() {
  const { data: streams, isLoading } = useMyStreams();

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!streams || streams.length === 0) {
    return (
      <p className="text-center text-text-tertiary py-16 text-sm">
        You haven&apos;t created any streams yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {streams.map((stream) => (
        <Link
          key={stream.id}
          href={`/stream/${stream.id}`}
          className="bg-card-bg border border-border-primary rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group"
        >
          <div className="h-20 bg-linear-to-br from-bg-tertiary to-bg-secondary relative overflow-hidden">
            {stream.banner_url && (
              <img
                src={stream.banner_url}
                alt=""
                className="w-full h-full object-cover opacity-60"
              />
            )}
          </div>
          <div className="p-4 -mt-6 relative">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center overflow-hidden border-2 border-card-bg shadow-sm mb-2">
              {stream.avatar_url ? (
                <img
                  src={stream.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <Radio className="w-4 h-4 text-white" />
              )}
            </div>
            <h3 className="text-sm font-bold text-text-primary truncate group-hover:text-accent transition-colors">
              {stream.name}
            </h3>
            {stream.description && (
              <p className="text-xs text-text-tertiary mt-1 line-clamp-2">
                {stream.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-text-tertiary">
              {stream.privacy === "public" ? (
                <Globe className="h-3 w-3" />
              ) : stream.privacy === "private" ? (
                <Lock className="h-3 w-3" />
              ) : (
                <DollarSign className="h-3 w-3" />
              )}
              <span className="capitalize">{stream.privacy}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
