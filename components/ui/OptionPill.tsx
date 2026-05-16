import { cn } from '@/lib/utils/format';
import type { ReactNode } from 'react';

interface OptionPillProps {
  /** Whether this pill is the active selection. */
  active: boolean;
  /** Main pill label (e.g. "Gold Plated", "Size 11", "With Chain"). */
  label: ReactNode;
  /** Optional secondary line (typically the resulting price). */
  detail?: ReactNode;
  /** Compact mode — slimmer pill, no second line. Used for plain size selectors. */
  compact?: boolean;
  /** Click handler. */
  onClick?: () => void;
  /** Optional minimum width override (useful when stacking multi-line pills). */
  minWidth?: number;
  /** Disable the pill (greys it out, no click). */
  disabled?: boolean;
  /** Extra classes. */
  className?: string;
}

/**
 * Generic variant-selector pill used for ring sizes, chain choice, plating
 * choice, and metal choice on the product detail page. Centralises the gold-
 * border-when-active, silver-border-otherwise visual language so every variant
 * picker on the site looks identical.
 */
export default function OptionPill({
  active,
  label,
  detail,
  compact = false,
  onClick,
  minWidth,
  disabled = false,
  className,
}: OptionPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={minWidth ? { minWidth } : undefined}
      className={cn(
        'rounded-xl border-2 transition-colors duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed',
        compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5',
        active
          ? 'border-gold bg-gold/10 text-gold-dark'
          : 'border-silver-200 text-silver-700 hover:border-silver-400',
        className
      )}
    >
      <span className={cn('block', compact ? '' : 'text-sm font-medium')}>{label}</span>
      {detail && !compact && (
        <span
          className={cn(
            'block text-xs mt-0.5',
            active ? 'text-gold-dark/80' : 'text-silver-500'
          )}
        >
          {detail}
        </span>
      )}
    </button>
  );
}
