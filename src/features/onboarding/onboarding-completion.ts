const SESSION_UPDATE_TIMEOUT_MS = 3_000;

export async function completeOnboardingNavigation(
  updateSession: () => Promise<unknown>,
  navigate: () => void,
  timeoutMs = SESSION_UPDATE_TIMEOUT_MS,
): Promise<void> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timeoutId = setTimeout(resolve, timeoutMs);
  });

  await Promise.race([updateSession(), timeout]);
  if (timeoutId) clearTimeout(timeoutId);
  navigate();
}
