"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { AppLoader } from "@/components/app-loader";
import {
  useCurrentUser,
  useUpdateProfile,
  useUploadAvatar,
} from "../hooks/use-settings";
import { errorDetail } from "../lib/error-detail";
import { SettingsPageShell } from "./settings-page-shell";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB

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
  const uploadAvatar = useUploadAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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
    }
  }, [user, reset]);

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
  const initial = (user.display_name || user.email || "?")
    .charAt(0)
    .toUpperCase();

  return (
    <SettingsPageShell
      title="Profile"
      description="Manage how you appear across SyncTrades."
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
              <span className="text-2xl font-bold text-accent-foreground">
                {initial}
              </span>
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
    </SettingsPageShell>
  );
}
