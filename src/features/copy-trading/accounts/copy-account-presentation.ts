import type { CopyTradingConnection } from "../types";

type AccountState = CopyTradingConnection["state"];

export interface CopyAccountPresentation {
  label: string;
  description: string;
  progress: number | null;
  tone: "working" | "success" | "action" | "neutral";
}

const presentations: Record<AccountState, CopyAccountPresentation> = {
  submitted: {
    label: "Connection requested",
    description: "Your account details were received and setup is starting.",
    progress: 10,
    tone: "working",
  },
  provisioning: {
    label: "Finding broker server",
    description: "MetaApi is locating the broker and verifying the MT5 account details.",
    progress: 25,
    tone: "working",
  },
  deploying: {
    label: "Starting secure terminal",
    description: "A dedicated cloud terminal is being prepared for this account.",
    progress: 50,
    tone: "working",
  },
  connecting: {
    label: "Connecting to broker",
    description: "The secure terminal is signing in to the broker.",
    progress: 70,
    tone: "working",
  },
  synchronizing: {
    label: "Checking account access",
    description: "Symbols and trading permissions are being confirmed.",
    progress: 85,
    tone: "working",
  },
  ready: {
    label: "Ready to copy",
    description: "This account can receive trades from active copy routes.",
    progress: 100,
    tone: "success",
  },
  invalid_credentials: {
    label: "Sign-in details need updating",
    description: "Check the MT5 login, exact broker server, and master password.",
    progress: null,
    tone: "action",
  },
  server_not_found: {
    label: "Broker server not found",
    description: "Use the exact server name shown in the MT5 login window.",
    progress: null,
    tone: "action",
  },
  provisioning_failed: {
    label: "Setup could not finish",
    description: "Check the account details and try the connection again.",
    progress: null,
    tone: "action",
  },
  broker_disconnected: {
    label: "Broker connection interrupted",
    description: "SignalSync will retry. Check the account if this continues.",
    progress: null,
    tone: "action",
  },
  synchronization_failed: {
    label: "Account check could not finish",
    description: "Reconnect after confirming that the broker account is available.",
    progress: null,
    tone: "action",
  },
  trading_disabled: {
    label: "Trading access is unavailable",
    description: "Use the MT5 master password and confirm trading is enabled by the broker.",
    progress: null,
    tone: "action",
  },
  deleting: {
    label: "Disconnecting account",
    description: "The secure copy-trading connection is being removed.",
    progress: null,
    tone: "working",
  },
  deleted: {
    label: "Disconnected",
    description: "This account is no longer connected to copy trading.",
    progress: null,
    tone: "neutral",
  },
};

export function copyAccountPresentation(
  state: AccountState,
): CopyAccountPresentation {
  return presentations[state];
}
