"use client";

import Link from "next/link";
import { Bell, Check, CheckCheck, AlertTriangle, Info, XCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/features/notifications/hooks";
import type {
  AppNotification,
  NotificationType,
} from "@/features/notifications/types";

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const TYPE_ICON: Record<NotificationType, typeof Info> = {
  info: Info,
  success: Check,
  warning: AlertTriangle,
  error: XCircle,
};

const TYPE_TONE: Record<NotificationType, string> = {
  info: "text-text-secondary",
  success: "text-kpi-metric-positive",
  warning: "text-warning",
  error: "text-danger",
};

function NotificationRow({
  n,
  onRead,
}: {
  n: AppNotification;
  onRead: (id: string) => void;
}) {
  const Icon = TYPE_ICON[n.type] ?? Info;
  const unread = !n.read_at;

  const body = (
    <div
      className={cn(
        "flex gap-3 px-3 py-2.5 transition-colors hover:bg-surface-subtle",
        unread && "bg-ai-soft-bg/40",
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", TYPE_TONE[n.type])} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-text-primary">
          {n.title}
        </p>
        {n.body && (
          <p className="mt-0.5 line-clamp-2 text-xs text-text-secondary">
            {n.body}
          </p>
        )}
        <p className="mt-1 text-[0.65rem] text-text-tertiary">
          {timeAgo(n.created_at)}
        </p>
      </div>
      {unread && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
      )}
    </div>
  );

  const handleClick = () => {
    if (unread) onRead(n.id);
  };

  return n.link ? (
    <Link href={n.link} onClick={handleClick} className="block">
      {body}
    </Link>
  ) : (
    <button type="button" onClick={handleClick} className="block w-full text-left">
      {body}
    </button>
  );
}

export function NotificationBell() {
  const { data: unreadCount = 0 } = useUnreadCount();
  const { data } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = data?.items ?? [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-border-secondary bg-chrome-bar-bg text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text-primary cursor-pointer"
        >
          <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[0.6rem] font-bold leading-none text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 border-border-secondary bg-bg-secondary p-0 text-text-primary shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border-secondary px-3 py-2.5">
          <span className="text-sm font-bold">Notifications</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              className="flex items-center gap-1 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-96 divide-y divide-hairline overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
              <Bell className="h-5 w-5 text-text-tertiary" />
              <p className="text-xs text-text-tertiary">No notifications yet</p>
            </div>
          ) : (
            items.map((n) => (
              <NotificationRow key={n.id} n={n} onRead={(id) => markRead.mutate(id)} />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
