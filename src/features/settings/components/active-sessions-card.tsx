"use client";

import { Loader2, Monitor } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRevokeSession, useSessions } from "../hooks/use-settings";
import { errorDetail } from "../lib/error-detail";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function ActiveSessionsCard() {
  const { data: sessions = [], isLoading } = useSessions();
  const revoke = useRevokeSession();

  async function onRevoke(id: string) {
    try {
      await revoke.mutateAsync(id);
      toast.success("Session signed out");
    } catch (err) {
      toast.error("Could not sign out session", {
        description: errorDetail(err, "Please try again."),
      });
    }
  }

  return (
    <Card className="border-border-secondary bg-card-bg shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Active sessions</CardTitle>
        <CardDescription>
          Devices currently signed in to your account. Sign out any you don&apos;t
          recognise.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="size-5 animate-spin text-text-secondary" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="py-2 text-sm text-text-secondary">
            No active sessions found.
          </p>
        ) : (
          <ul className="divide-y divide-border-secondary/60">
            {sessions.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-bg-tertiary text-text-secondary">
                    <Monitor className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-medium text-text-primary">
                      Session
                      {s.is_current && (
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                          This device
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-text-secondary">
                      Signed in {formatDate(s.created_at)}
                    </p>
                  </div>
                </div>
                {!s.is_current && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={revoke.isPending}
                    onClick={() => onRevoke(s.id)}
                  >
                    {revoke.isPending &&
                    revoke.variables === s.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : null}
                    Sign out
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
