import type { CopyTradingConnection } from "../types";
import { StatusLabel } from "../shared/status-label";

export function MetaApiAccountStatus({ account }: { account: CopyTradingConnection }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusLabel state={account.state} />
      {account.last_error_message ? (
        <span className="text-xs text-danger">{account.last_error_message}</span>
      ) : null}
    </div>
  );
}
