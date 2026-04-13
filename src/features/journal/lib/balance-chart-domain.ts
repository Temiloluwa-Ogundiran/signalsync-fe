/**
 * Recharts Y-axis domain for balance-style series so small moves stay visible
 * when values cluster near a large account size.
 */
export function computePaddedBalanceDomain(
  values: number[],
  options?: { padRatio?: number; minAbsoluteSpread?: number },
): [number, number] | undefined {
  const padRatio = options?.padRatio ?? 0.12;
  const minAbsoluteSpread = options?.minAbsoluteSpread ?? 50;

  const nums = values.filter((n) => typeof n === "number" && Number.isFinite(n));
  if (!nums.length) return undefined;

  let lo = Math.min(...nums);
  let hi = Math.max(...nums);
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return undefined;
  if (hi < lo) [lo, hi] = [hi, lo];

  const span = hi - lo;
  const mid = (hi + lo) / 2;
  const scaleRef = Math.max(Math.abs(mid), Math.abs(lo), Math.abs(hi), 1);
  const spread =
    span < 1e-9
      ? Math.max(minAbsoluteSpread, 0.00015 * scaleRef)
      : Math.max(span * (1 + 2 * padRatio), minAbsoluteSpread);

  const half = spread / 2;
  return [mid - half, mid + half];
}
