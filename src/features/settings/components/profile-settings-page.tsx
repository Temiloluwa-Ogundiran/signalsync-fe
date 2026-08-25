"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, User } from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  useCurrentUser,
  useUpdateProfile,
  useUpdatePreferences,
  useUploadAvatar,
} from "../hooks/use-settings";
import { errorDetail } from "../lib/error-detail";
import { SettingsPageShell } from "./settings-page-shell";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-border-primary bg-bg-input px-3 py-2 text-sm ring-offset-bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

// Sentinel for "use my local/account timezone" (no explicit preference).
const TZ_AUTO = "__auto__";

function listTimezones(): string[] {
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

const schema = z.object({
  display_name: z
    .string()
    .trim()
    .min(1, { message: "Display name is required." })
    .max(100, { message: "Display name must be 100 characters or fewer." }),
  bio: z
    .string()
    .max(500, { message: "Bio must be 500 characters or fewer." })
    .optional(),
});

type FormValues = z.infer<typeof schema>;

export function ProfileSettingsPage() {
  const { data: user, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const updatePrefs = useUpdatePreferences();
  const uploadAvatar = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const timezones = useMemo(() => listTimezones(), []);
  const [timezone, setTimezone] = useState<string>(TZ_AUTO);
  const browserTz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {
      return "UTC";
    }
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { display_name: "", bio: "" },
  });

  // Seed the form once the user loads (and whenever the cached user changes).
  const { reset } = form;
  useEffect(() => {
    if (user) {
      reset({
        display_name: user.display_name ?? "",
        bio: user.bio ?? "",
      });
      setTimezone(user.display_timezone ?? TZ_AUTO);
    }
  }, [user, reset]);

  const tzDirty = (user?.display_timezone ?? TZ_AUTO) !== timezone;

  async function onSaveTimezone() {
    try {
      await updatePrefs.mutateAsync({
        display_timezone: timezone === TZ_AUTO ? null : timezone,
      });
      toast.success("Timezone saved", {
        description:
          "Depending on your data, changes may take a few moments to appear everywhere.",
      });
    } catch (err) {
      toast.error("Could not save timezone", {
        description: errorDetail(err, "Please try again."),
      });
    }
  }

  async function onSubmit(values: FormValues) {
    try {
      await updateProfile.mutateAsync({
        display_name: values.display_name.trim(),
        bio: values.bio?.trim() ?? "",
      });
      toast.success("Profile updated");
      form.reset(values);
    } catch (err) {
      toast.error("Could not update profile", {
        description: errorDetail(err, "Please try again."),
      });
    }
  }

  async function onAvatarSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error("Image is too large", { description: "Maximum size is 5MB." });
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setAvatarPreview(localPreview);
    try {
      await uploadAvatar.mutateAsync(file);
      toast.success("Avatar updated");
    } catch (err) {
      setAvatarPreview(null);
      toast.error("Could not upload avatar", {
        description: errorDetail(err, "Please try again."),
      });
    } finally {
      URL.revokeObjectURL(localPreview);
    }
  }

  if (isLoading || !user) {
    return (
      <SettingsPageShell title="Profile">
        <div className="flex justify-center py-16">
          <AppLoader />
        </div>
      </SettingsPageShell>
    );
  }

  const shownAvatar = avatarPreview ?? user.avatar_url;

  return (
    <SettingsPageShell
      title="Profile"
      description="Manage how you appear across SignalSync."
    >
      {/* Avatar */}
      <Card className="border-border-secondary bg-card-bg shadow-sm">
        <CardContent className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:items-center sm:gap-6">
          <div className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg-tertiary ring-1 ring-border-secondary/60">
            {shownAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shownAvatar}
                alt="Your avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <User
                className="size-9 text-text-tertiary"
                strokeWidth={1.75}
                aria-label="No profile photo"
              />
            )}
          </div>
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <p className="text-sm font-semibold text-text-primary">
              Profile photo
            </p>
            <p className="text-xs text-text-secondary">
              JPG, PNG, WebP or GIF. Max 5MB.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={uploadAvatar.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadAvatar.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {uploadAvatar.isPending ? "Uploading…" : "Change photo"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarSelected}
            />
          </div>
        </CardContent>
      </Card>

      {/* Profile details */}
      <Card className="border-border-secondary bg-card-bg shadow-sm">
        <CardContent className="py-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="display_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Your name"
                        disabled={updateProfile.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        placeholder="A short bio about your trading…"
                        disabled={updateProfile.isPending}
                      />
                    </FormControl>
                    <p className="text-xs text-text-secondary">
                      {(field.value?.length ?? 0)}/500
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email is read-only here — change it on the Security page. */}
              <div className="space-y-1.5">
                <span className="text-sm font-medium text-text-primary">
                  Email
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-text-secondary">
                    {user.email}
                  </span>
                  {user.is_email_verified ? (
                    <span className="rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                      Verified
                    </span>
                  ) : (
                    <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                      Unverified
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  disabled={
                    updateProfile.isPending || !form.formState.isDirty
                  }
                >
                  {updateProfile.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  Save changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Timezone */}
      <Card className="border-border-secondary bg-card-bg shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Timezone</CardTitle>
          <CardDescription>
            All timestamps — charts, running PnL, and trading stats — are shown in
            this timezone. Popular with traders who prefer their session&apos;s
            time over their local time.
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
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              onClick={onSaveTimezone}
              disabled={updatePrefs.isPending || !tzDirty}
            >
              {updatePrefs.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Save timezone
            </Button>
          </div>
        </CardContent>
      </Card>
    </SettingsPageShell>
  );
}
