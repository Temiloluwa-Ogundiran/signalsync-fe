import { ChevronRight } from "lucide-react";

interface ContinueItemProps {
  type: "Stream" | "Journal" | "Space";
  title: string;
  meta: string;
  image?: string;
}

export function ContinueItem({ type, title, meta, image }: ContinueItemProps) {
  return (
    <button className="flex items-center w-full p-3 hover:bg-bg-tertiary rounded-xl transition-colors group border border-transparent hover:border-border-primary">
      <div className="h-10 w-10 rounded-lg bg-bg-tertiary flex-shrink-0 overflow-hidden relative">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-accent-light flex items-center justify-center text-accent font-bold text-xs">
            {type[0]}
          </div>
        )}
      </div>
      <div className="ml-3 text-left flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate group-hover:text-accent transition-colors">
          {title}
        </p>
        <p className="text-xs text-text-secondary truncate flex items-center">
          <span className="font-semibold text-text-tertiary mr-1.5">
            {type}
          </span>{" "}
          • {meta}
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-text-tertiary group-hover:text-accent transition-colors" />
    </button>
  );
}
