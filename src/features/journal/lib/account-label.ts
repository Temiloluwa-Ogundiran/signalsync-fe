/**
 * Account display name.
 *
 * We no longer collect a custom name when connecting an account, so the label is
 * constructed as `<broker prefix>-<login>` (e.g. "Exness-436156913"). The broker
 * prefix is the part of the MT5 server before the first "-"; for servers with no
 * dash we take the leading alphabetic run (e.g. "AssexmarketsGlobal-Trade" →
 * "AssexmarketsGlobal", "FundedNext-Server 3" → "FundedNext").
 *
 * Any legacy `display_name` the user previously set still wins.
 */

function brokerPrefix(brokerServer: string | null | undefined): string {
  const server = (brokerServer ?? "").trim();
  if (!server) return "Account";
  // The broker name is the segment before the first dash (all real MT5 servers
  // are "Broker-Something"). No dash → use the whole server string as-is.
  return server.split("-")[0]?.trim() || server;
}

export function buildAccountLabel(account: {
  display_name?: string | null;
  broker_server?: string | null;
  broker_login?: string | null;
}): string {
  if (account.display_name && account.display_name.trim()) {
    return account.display_name.trim();
  }
  const prefix = brokerPrefix(account.broker_server);
  const login = (account.broker_login ?? "").trim();
  return login ? `${prefix}-${login}` : prefix;
}
