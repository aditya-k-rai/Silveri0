/**
 * Shared formatting + utility helpers used across the customer site and the
 * admin panel. Keep these pure and tree-shake-friendly — no React imports.
 */

/** "₹1,599" — INR amount, no decimals, Indian-grouping. */
export function formatINR(amount: number | null | undefined): string {
  const n = Number(amount ?? 0);
  if (!Number.isFinite(n)) return '₹0';
  return `₹${n.toLocaleString('en-IN')}`;
}

/** Loosely-typed date — Firestore Timestamp, JS Date, ISO string, or epoch ms. */
export type DateLike = Date | { toDate: () => Date } | string | number | null | undefined;

/** Best-effort normalise to a JS Date. Returns the current Date for falsy / invalid input. */
export function toSafeDate(d: DateLike): Date {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  if (typeof d === 'object' && 'toDate' in d && typeof d.toDate === 'function') {
    return d.toDate();
  }
  const parsed = new Date(d as string | number);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/** "26 Apr 2026" — Indian locale short date. */
export function formatShortDate(d: DateLike): string {
  return toSafeDate(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** "3m ago" / "2h ago" / "5d ago" — compact relative time. */
export function timeAgo(d: DateLike): string {
  const date = toSafeDate(d);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${Math.max(0, diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 30 * 86400) return `${Math.floor(diff / 86400)}d ago`;
  return formatShortDate(date);
}

/** Whole-percentage change from `previous` to `current`. Handles zero-baseline gracefully. */
export function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/** Tiny className merger — keeps Tailwind utility lists readable. */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(' ');
}
