export function dashboardPathForAccount(
  searchParams: URLSearchParams,
  accountId: string,
) {
  const params = new URLSearchParams(searchParams.toString());
  params.set("accountId", accountId);
  return `/dashboard?${params.toString()}`;
}
