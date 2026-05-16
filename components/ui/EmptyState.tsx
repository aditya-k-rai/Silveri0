import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/format';

interface EmptyStateProps {
  /** Icon node — typically a lucide-react icon. */
  icon?: ReactNode;
  /** Headline ("No orders yet", "No reviews yet"). */
  title: string;
  /** Optional supporting paragraph. */
  description?: ReactNode;
  /** Optional primary CTA — renders as a gold button. */
  cta?: {
    href?: string;
    label: string;
    onClick?: () => void;
  };
  /** Container variant — bordered card (default) or just centred text. */
  variant?: 'card' | 'inline';
  className?: string;
}

/**
 * The centred icon + title + description + optional CTA pattern that appears
 * in: empty cart, empty wishlist, empty orders, empty reviews, no products
 * found, etc. Centralising it makes those empty screens visually consistent
 * and trims ~10 lines off each consumer.
 */
export default function EmptyState({
  icon,
  title,
  description,
  cta,
  variant = 'card',
  className,
}: EmptyStateProps) {
  const wrapper =
    variant === 'card'
      ? 'bg-white border border-silver/40 rounded-2xl p-10 text-center'
      : 'text-center py-10';

  return (
    <div className={cn(wrapper, className)}>
      {icon && (
        <div className="mx-auto mb-4 inline-flex items-center justify-center text-silver-400">
          {icon}
        </div>
      )}
      <p className="font-[family-name:var(--font-heading)] text-lg text-warm-black mb-2">{title}</p>
      {description && (
        <div className="text-sm text-muted mb-6 max-w-sm mx-auto">{description}</div>
      )}
      {cta && (
        cta.href ? (
          <Link
            href={cta.href}
            className="inline-block px-6 py-3 bg-gold text-white font-medium rounded-xl hover:bg-gold-dark transition-colors"
          >
            {cta.label}
          </Link>
        ) : (
          <button
            onClick={cta.onClick}
            className="inline-block px-6 py-3 bg-gold text-white font-medium rounded-xl hover:bg-gold-dark transition-colors"
          >
            {cta.label}
          </button>
        )
      )}
    </div>
  );
}
