import type { JournalAccount, JournalAccountSyncStatus } from "../types";

export function getAccountSyncStatus(
  account: Pick<
    JournalAccount,
    | "import_method"
    | "connection_state"
    | "last_sync_outcome"
    | "sync_error_message"
    | "bootstrap_error_message"
    | "sync_status"
  >,
): JournalAccountSyncStatus {
  if (account.sync_status) return account.sync_status;

  if (account.import_method === "csv_upload") {
    return {
      code: "imported",
      severity: "success",
      headline: "Imported",
      detail: "Trade history was imported from a file.",
      action: null,
    };
  }

  if (account.connection_state === "pending_verification") {
    return {
      code: "pending_verification",
      severity: "pending",
      headline: "Verifying credentials",
      detail: "We are checking the MT5 account credentials.",
      action: null,
    };
  }

  if (account.connection_state === "bootstrapping") {
    return {
      code: "bootstrapping",
      severity: "pending",
      headline: "Syncing history",
      detail: "Initial trade history import is running.",
      action: null,
    };
  }

  if (account.connection_state === "verification_failed") {
    return {
      code: "verification_failed",
      severity: "error",
      headline: "Account authorization failed",
      detail:
        account.sync_error_message ||
        "Check the account number, broker server, and investor password.",
      action: "Update the credentials, then reconnect the account.",
    };
  }

  if (account.connection_state === "bootstrap_failed") {
    return {
      code: "bootstrap_failed",
      severity: "warning",
      headline: "Connected with sync warning",
      detail:
        account.bootstrap_error_message ||
        account.sync_error_message ||
        "History sync did not complete.",
      action: "Try resyncing the account.",
    };
  }

  if (account.last_sync_outcome === "success_empty") {
    return {
      code: "ready_empty",
      severity: "info",
      headline: "Connected",
      detail: "No closed trades found yet.",
      action: "Close a trade in MT5, then resync.",
    };
  }

  return {
    code: "ready",
    severity: "success",
    headline: "Connected",
    detail: "Account is connected and ready.",
    action: null,
  };
}

export function isAccountSyncBusy(status: JournalAccountSyncStatus) {
  return status.severity === "pending";
}

export function isAccountSyncFailed(status: JournalAccountSyncStatus) {
  return status.severity === "warning" || status.severity === "error";
}
