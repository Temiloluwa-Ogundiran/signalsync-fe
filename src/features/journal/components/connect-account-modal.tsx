"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConnectAccountForm } from "./connect-account-form";
import { useJournalUiStore } from "../store/journal-ui-store";
import { toast } from "sonner";

export function ConnectAccountModal() {
  const connectModalOpen = useJournalUiStore((s) => s.connectModalOpen);
  const setConnectModalOpen = useJournalUiStore((s) => s.setConnectModalOpen);
  const setActiveAccountId = useJournalUiStore((s) => s.setActiveAccountId);

  return (
    <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
      <DialogContent className="max-w-xl border border-border-primary bg-card-bg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-text-primary">
            Connect Trading Account
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Add your MT5 investor credentials to start syncing trades
            into your journal.
          </DialogDescription>
        </DialogHeader>
        <ConnectAccountForm
          onSuccess={(account) => {
            setActiveAccountId(account.id);
            setConnectModalOpen(false);
            if (account.connection_state === "bootstrap_failed") {
              toast.warning("Account connected with warning", {
                description:
                  "Account was verified, but history sync failed. You can retry syncing manually.",
              });
            } else {
              toast.success("Account connected", {
                description: "Your trading account has been successfully connected.",
              });
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
