import { Star } from 'lucide-react';

interface ReviewCardProps {
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ReviewCard({ userName, rating, comment, date }: ReviewCardProps) {
  return (
    <div className="border-b border-silver/30 pb-4 mb-4 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gold/20 rounded-full flex items-center justify-center text-gold text-sm font-medium">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium text-warm-black">{userName}</span>
        </div>
        <span className="text-xs text-muted">{date}</span>
      </div>
      <div className="flex gap-0.5 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={star <= rating ? 'fill-gold text-gold' : 'text-silver'}
          />
        ))}
      </div>
      <p className="text-sm text-muted leading-relaxed">{comment}</p>
    </div>
  );
}
