"use client";

import { Info } from "lucide-react";

import { JournalHoverHelpIcon } from "./journal-hover-help-icon";

interface JournalKpiInfoProps {
  title: string;
  description: string;
}

export function JournalKpiInfo({ title, description }: JournalKpiInfoProps) {
  const ariaLabel = `${title}. ${description}`;

  return (
    <JournalHoverHelpIcon
      ariaLabel={ariaLabel}
      side="below"
      icon={Info}
      iconClassName="text-footnote-online opacity-80 group-hover:opacity-100"
      tooltip={
        <>
          <p className="text-sm font-semibold text-text-primary">{title}</p>
          <p className="mt-1 text-xs font-normal leading-relaxed text-text-secondary">
            {description}
          </p>
        </>
      }
    />
  );
}
