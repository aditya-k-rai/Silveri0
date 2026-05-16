import { cn } from '@/lib/utils/format';

interface SectionHeadingProps {
  /** Small all-caps line above the title (e.g. "Curated Selection"). */
  eyebrow?: string;
  /** Main heading text. */
  title: string;
  /** Optional supporting line below the title. */
  subtitle?: string;
  /** Theme — controls colour on light vs dark backgrounds. */
  tone?: 'light' | 'dark';
  /** Horizontal alignment. */
  align?: 'left' | 'center';
  /** Optional extra classes for the wrapping div. */
  className?: string;
}

/**
 * The eyebrow → title → subtitle stack that appears at the top of every major
 * section on the homepage, category, and product pages. Replaces 6+ near-
 * identical blocks across the app.
 */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  tone = 'light',
  align = 'center',
  className,
}: SectionHeadingProps) {
  const isDark = tone === 'dark';
  return (
    <div
      className={cn(
        align === 'center' ? 'text-center' : 'text-left',
        className
      )}
    >
      {eyebrow && (
        <p
          className={cn(
            'text-xs uppercase tracking-[0.25em] mb-2 md:mb-3',
            isDark ? 'text-gold/70' : 'text-silver-400'
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'font-[family-name:var(--font-heading)] text-3xl md:text-4xl lg:text-5xl font-light',
          isDark ? 'text-white' : 'text-silver-900'
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            'text-sm mt-3',
            isDark ? 'text-silver-500' : 'text-silver-500'
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
