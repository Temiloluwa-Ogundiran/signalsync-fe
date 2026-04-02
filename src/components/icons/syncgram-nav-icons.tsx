import type { SVGProps } from "react";

const fg = (active: boolean) => (active ? "#F5F5F5" : "#737373");

type IconProps = SVGProps<SVGSVGElement> & { active?: boolean };

export function IconHome({ active = false, ...p }: IconProps) {
  const c = fg(active);
  return (
    <svg
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      {...p}
    >
      <path
        d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z"
        stroke={c}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconJournal({ active = false, ...p }: IconProps) {
  const c = fg(active);
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
      <path
        d="M7 3h8a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
        stroke={c}
        strokeWidth="1.75"
      />
      <path d="M9 8h6M9 12h6M9 16h4" stroke={c} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function IconCopyTrading({ active = false, ...p }: IconProps) {
  const c = fg(active);
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
      <rect x="8" y="8" width="12" height="12" rx="2" stroke={c} strokeWidth="1.75" />
      <path
        d="M4 16V6a2 2 0 012-2h10"
        stroke={c}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconDiscover({ active = false, ...p }: IconProps) {
  const c = fg(active);
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
      <path
        d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z"
        stroke={c}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.25" stroke={c} strokeWidth="1.75" />
    </svg>
  );
}

export function IconSpace({ active = false, ...p }: IconProps) {
  const c = fg(active);
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
      <circle cx="6" cy="12" r="2.5" stroke={c} strokeWidth="1.5" />
      <circle cx="18" cy="7" r="2.5" stroke={c} strokeWidth="1.5" />
      <circle cx="18" cy="17" r="2.5" stroke={c} strokeWidth="1.5" />
      <path d="M8.2 11.2l6.6-3.4M8.2 12.8l6.6 3.4" stroke={c} strokeWidth="1.25" />
    </svg>
  );
}

export function IconFeed({ active = false, ...p }: IconProps) {
  const c = fg(active);
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
      <path
        d="M6 4h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
        stroke={c}
        strokeWidth="1.75"
      />
      <path d="M8 9h8M8 13h5" stroke={c} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function IconNotification({ active = false, ...p }: IconProps) {
  const c = fg(active);
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
      <path
        d="M12 22a2 2 0 002-2H10a2 2 0 002 2zm8-5h-1.5A2.5 2.5 0 0117 14.5V10a5 5 0 00-10 0v4.5A2.5 2.5 0 015.5 17H4"
        stroke={c}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSettings({ active = false, ...p }: IconProps) {
  const c = fg(active);
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
      <path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        stroke={c}
        strokeWidth="1.75"
      />
      <path
        d="M19.4 15a1.8 1.8 0 00.36 2l.05.05a2 2 0 01-2.83 2.83l-.06-.06a1.8 1.8 0 00-2-.36 1.8 1.8 0 00-1.1 1.64V21a2 2 0 01-4 0v-.11a1.8 1.8 0 00-1.1-1.65 1.8 1.8 0 00-2 .36l-.06.06a2 2 0 01-2.82-2.83l.06-.06a1.8 1.8 0 00.36-2 1.8 1.8 0 00-1.64-1.1H4a2 2 0 010-4h.09a1.8 1.8 0 001.65-1.1 1.8 1.8 0 00-.36-2l-.06-.06a2 2 0 012.83-2.83l.06.06a1.8 1.8 0 002-.36 1.8 1.8 0 001.1-1.64V3a2 2 0 014 0v.09a1.8 1.8 0 001.1 1.65 1.8 1.8 0 002-.36l.06-.06a2 2 0 012.83 2.83l-.06.06a1.8 1.8 0 00-.36 2 1.8 1.8 0 001.64 1.1H20a2 2 0 010 4h-.09a1.8 1.8 0 00-1.65 1.1z"
        stroke={c}
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconReport({ active = false, ...p }: IconProps) {
  const c = fg(active);
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
      <path
        d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z"
        stroke={c}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M14 3v6h6M8 13h8M8 17h6" stroke={c} strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function IconAnalytics({ active = false, ...p }: IconProps) {
  const c = fg(active);
  return (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" aria-hidden {...p}>
      <path d="M4 19V5" stroke={c} strokeWidth="1.75" strokeLinecap="round" />
      <path d="M4 19h16" stroke={c} strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M8 16V11M12 16V8M16 16v-5"
        stroke={c}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconCalendar({ className, ...p }: SVGProps<SVGSVGElement>) {
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
      <path
        d="M7 3v3M17 3v3M4 9h16M5 7h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z"
        stroke="#F5F5F5"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

export function IconWallet({ className, ...p }: SVGProps<SVGSVGElement>) {
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
      <path
        d="M3 7a2 2 0 012-2h12v4H5a2 2 0 000 4h12v8H5a2 2 0 01-2-2V7z"
        stroke="#F5F5F5"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="17" cy="12" r="1.25" fill="#F5F5F5" />
    </svg>
  );
}

export function IconCurrency({ className, ...p }: SVGProps<SVGSVGElement>) {
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
      <path
        d="M12 3v18M16 6.5a4 4 0 010 5M8 17.5a4 4 0 010-5M16 12.5a4 4 0 01-8 0"
        stroke="#F5F5F5"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconFilter({ className, ...p }: SVGProps<SVGSVGElement>) {
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
      <path
        d="M4 6h16M7 12h10M10 18h4"
        stroke="#F5F5F5"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconAskSync({ className, ...p }: SVGProps<SVGSVGElement>) {
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
      <path
        d="M12 3l1.2 4.4L18 9l-4.8 1.6L12 15l-1.2-4.4L6 9l4.8-1.6L12 3z"
        fill="#FAFAFA"
      />
    </svg>
  );
}
