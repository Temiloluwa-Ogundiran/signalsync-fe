import type { SVGProps } from "react";

export function IconChevronDown({ className, ...p }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      {...p}
    >
      <path d="M6 9l6 6 6-6" stroke="#F5F5F5" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
