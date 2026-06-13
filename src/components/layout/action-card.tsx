import { ArrowRight, type LucideIcon } from "lucide-react";

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  colorClass: string;
  iconBgClass: string;
  onClick?: () => void;
}

export function ActionCard({
  title,
  description,
  icon: Icon,
  colorClass,
  iconBgClass,
  onClick,
}: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-start p-6 bg-card-bg rounded-2xl border border-border-primary shadow-sm hover:shadow-lg hover:border-accent/30 transition-all duration-300 text-left w-full h-full overflow-hidden"
    >
      <div
        className={`absolute top-0 right-0 w-24 h-24 ${iconBgClass} opacity-10 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110`}
      />

      <div
        className={`p-3 rounded-xl ${iconBgClass} ${colorClass} mb-4 group-hover:scale-105 transition-transform duration-300`}
      >
        <Icon className="h-6 w-6" strokeWidth={2.5} />
      </div>

      <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-accent transition-colors">
        {title}
      </h3>

      <p className="text-sm text-text-secondary leading-relaxed mb-6">
        {description}
      </p>

      <div className="mt-auto flex items-center text-sm font-medium text-accent opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        Open {title.split(" ")[0]} <ArrowRight className="ml-1 h-4 w-4" />
      </div>
    </button>
  );
}
