"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AppLoader } from "@/components/app-loader";
import { useCurrentUser, useUpdatePreferences } from "../hooks/use-settings";
import { errorDetail } from "../lib/error-detail";
import { SettingsPageShell } from "./settings-page-shell";

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-border-primary bg-bg-input px-3 py-2 text-sm ring-offset-bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

// Sentinel for "use my local/account timezone" (no explicit preference).
const TZ_AUTO = "__auto__";

function listTimezones(): string[] {
  // Intl.supportedValuesOf is widely supported in modern runtimes; fall back to
  // a small common set if unavailable.
  const intl = Intl as typeof Intl & {
    supportedValuesOf?: (key: string) => string[];
  };
  if (typeof intl.supportedValuesOf === "function") {
    try {
      return intl.supportedValuesOf("timeZone");
    } catch {
      /* fall through */
    }
  }
  return [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Kolkata",
    "Australia/Sydney",
  ];
}

export function GlobalSettingsPage() {
  const { data: user, isLoading } = useCurrentUser();
  const updatePrefs = useUpdatePreferences();
  const timezones = useMemo(() => listTimezones(), []);

  const [timezone, setTimezone] = useState<string>(TZ_AUTO);

  // Seed local form state once the user loads.
  useEffect(() => {
    if (user) {
      setTimezone(user.display_timezone ?? TZ_AUTO);
    }
  }, [user]);

  const browserTz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  if (isLoading || !user) {
    return (
      <SettingsPageShell title="Global settings">
        <div className="flex justify-center py-16">
          <AppLoader />
        </div>
      </SettingsPageShell>
    );
  }

  const isDirty = (user.display_timezone ?? TZ_AUTO) !== timezone;

  async function onSave() {
    try {
      await updatePrefs.mutateAsync({
        display_timezone: timezone === TZ_AUTO ? null : timezone,
      });
      toast.success("Settings saved", {
        description:
          "Depending on your data, changes may take a few moments to appear everywhere.",
      });
    } catch (err) {
      toast.error("Could not save settings", {
        description: errorDetail(err, "Please try again."),
      });
    }
  }

  return (
    <SettingsPageShell
      title="Global settings"
      description="Tailor how times are displayed across SyncTrades."
    >
      {/* Timezone */}
      <Card className="border-border-secondary bg-card-bg shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Timezone</CardTitle>
          <CardDescription>
            All timestamps — charts, running PnL, and trading stats — are shown in
            this timezone. Popular with traders who prefer their session&apos;s time
            over their local time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="timezone-select">Display timezone</Label>
            <select
              id="timezone-select"
              className={SELECT_CLASS}
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              disabled={updatePrefs.isPending}
            >
              <option value={TZ_AUTO}>
                Automatic — your device ({browserTz})
              </option>
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <p className="text-xs text-text-secondary">
              Amounts are shown in each account&apos;s own currency, set by your
              broker.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={onSave}
          disabled={updatePrefs.isPending || !isDirty}
        >
          {updatePrefs.isPending && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
      </div>
    </SettingsPageShell>
  );
}
