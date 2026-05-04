'use client';

import { Star, ShieldCheck } from 'lucide-react';
import type { AdminReply } from '@/types';

interface ReviewCardProps {
  userName: string;
  userPhoto?: string;
  rating: number;
  title?: string;
  comment: string;
  date: Date | string;
  verified?: boolean;
  adminReply?: AdminReply;
}

function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function ReviewCard({
  userName,
  userPhoto,
  rating,
  title,
  comment,
  date,
  verified,
  adminReply,
}: ReviewCardProps) {
  return (
    <div className="border-b border-silver/30 pb-5 mb-5 last:border-0 last:mb-0 last:pb-0">
      {/* Header — avatar, name, verified badge, date */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2.5">
          {userPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userPhoto} alt="" className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 bg-gold/20 rounded-full flex items-center justify-center text-gold text-sm font-semibold shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-warm-black">{userName}</span>
              {verified && (
                <span title="Verified Purchase" className="inline-flex items-center text-emerald-600">
                  <ShieldCheck size={13} />
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted">{formatDate(date)}</span>
          </div>
        </div>
        <div className="flex gap-0.5 mt-1 shrink-0">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              size={13}
              className={s <= rating ? 'fill-gold text-gold' : 'text-silver'}
            />
          ))}
        </div>
      </div>

      {title && (
        <p className="text-sm font-semibold text-warm-black mb-1">{title}</p>
      )}
      <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{comment}</p>

      {/* Admin reply */}
      {adminReply && (
        <div className="mt-3 ml-12 bg-gold/5 border-l-2 border-gold/40 pl-3 pr-3 py-2.5 rounded-r-lg">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[11px] font-semibold text-gold-dark uppercase tracking-wider">
              {adminReply.adminName || 'Silveri'}
            </span>
            <span className="text-[10px] text-muted">·</span>
            <span className="text-[10px] text-muted">{formatDate(adminReply.repliedAt)}</span>
          </div>
          <p className="text-xs text-warm-black/80 leading-relaxed whitespace-pre-line">
            {adminReply.text}
          </p>
        </div>
      )}
    </div>
  );
}
