"use client";

import { AppLoader } from "@/components/app-loader";
import { useCurrentUser } from "../hooks/use-settings";
import { SettingsPageShell } from "./settings-page-shell";
import { ChangePasswordCard } from "./change-password-card";
import { ChangeEmailCard } from "./change-email-card";
import { ActiveSessionsCard } from "./active-sessions-card";
import { DeleteAccountCard } from "./delete-account-card";

export function SecuritySettingsPage() {
  const { data: user, isLoading } = useCurrentUser();

  return (
    <SettingsPageShell
      title="Security"
      description="Manage your password, email, sessions, and account."
    >
      {isLoading || !user ? (
        <div className="flex justify-center py-16">
          <AppLoader />
        </div>
      ) : (
        <>
          <ChangePasswordCard />
          <ChangeEmailCard currentEmail={user.email} />
          <ActiveSessionsCard />
          <DeleteAccountCard />
        </>
      )}
    </SettingsPageShell>
  );
}
