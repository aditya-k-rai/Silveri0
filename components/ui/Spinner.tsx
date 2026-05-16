import { cn } from '@/lib/utils/format';

interface SpinnerProps {
  /** Diameter in pixels — defaults to 32. */
  size?: number;
  /** Stroke colour. Tailwind colour name or any CSS colour. Defaults to gold. */
  tone?: 'gold' | 'silver' | 'white' | 'black';
  /** Optional extra classes. */
  className?: string;
}

const toneMap = {
  gold: 'border-gold',
  silver: 'border-silver-400',
  white: 'border-white',
  black: 'border-warm-black',
} as const;

/**
 * A single, consistent loading spinner. Replaces every variation of
 *   <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
 * scattered through the app.
 */
export default function Spinner({ size = 32, tone = 'gold', className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      style={{ width: size, height: size }}
      className={cn(
        'inline-block border-2 border-t-transparent rounded-full animate-spin',
        toneMap[tone],
        className
      )}
    />
  );
}
