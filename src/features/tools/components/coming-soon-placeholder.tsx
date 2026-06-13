import { BookOpen } from "lucide-react";

export function ComingSoonPlaceholder({ toolName }: { toolName: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-card-bg rounded-2xl border border-dashed border-border-primary p-8 text-center">
      <div className="h-16 w-16 bg-bg-tertiary rounded-full flex items-center justify-center mb-6">
        <BookOpen className="h-8 w-8 text-text-tertiary" />
      </div>
      <h3 className="text-xl font-bold text-text-primary mb-2">
        {toolName} Tool
      </h3>
      <p className="text-text-secondary max-w-md mb-6">
        We are currently building the advanced mathematics for this calculator.
        Check back in the next update.
      </p>
      <button className="bg-text-primary text-bg-primary px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-80 transition-opacity">
        Notify Me When Ready
      </button>
    </div>
  );
}
