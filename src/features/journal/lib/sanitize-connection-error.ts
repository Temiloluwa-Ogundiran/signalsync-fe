/**
 * Maps noisy backend / worker errors to short UI-safe text.
 * Raw messages (paths, shutil tuples, errno) must never be shown verbatim.
 */
export function sanitizeJournalConnectionError(
  raw: string | null | undefined,
): string | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/errno\s*28|no space left on device/i.test(trimmed)) {
    return "Sync machine is out of disk space. Free space on the MT5 server and retry.";
  }

  const looksTechnical =
    trimmed.length > 200 ||
    /mt5_worker_|\\\\[A-Za-z]:\\|\.mqh'|shutil\.|Errno \d+|\[\('/i.test(
      trimmed,
    );

  if (looksTechnical) {
    return "Temporary verification issue. Try sync again in a few minutes.";
  }

  if (trimmed.length > 160) {
    return `${trimmed.slice(0, 157)}…`;
  }

  return trimmed;
}
