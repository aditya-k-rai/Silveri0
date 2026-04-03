"use client";

import { Star } from "lucide-react";

export default function ReviewsPage() {
  return (
    <div className="bg-white rounded-2xl border border-silver/40 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <Star className="text-gold" size={24} />
        <h2 className="text-xl font-[family-name:var(--font-heading)] font-semibold text-warm-black">
          My Reviews
        </h2>
      </div>

      <div className="text-center py-12 px-4 border-2 border-dashed border-silver/50 rounded-xl">
        <Star size={48} className="mx-auto text-silver mb-4 opacity-50" />
        <p className="text-warm-black font-medium mb-1">No reviews yet</p>
        <p className="text-sm text-muted">
          Items you review will appear here. Share your thoughts on your favorite jewelry!
        </p>
      </div>
    </div>
  );
}
