"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShieldCheck, MessageSquare, Loader2, X, CheckCircle2 } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { subscribeToUserOrders } from "@/lib/firebase/orders";
import {
  subscribeToUserReviews,
  createReview,
  updateReview,
  deleteReview,
} from "@/lib/firebase/reviews";
import type { Order, Review } from "@/types";

interface ReviewablePiece {
  productId: string;
  name: string;
  image: string;
  orderId: string;
  deliveredAt: Date;
}

export default function ReviewsPage() {
  const { user, userDoc } = useAuthContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(!!user?.uid);
  const [reviewsLoading, setReviewsLoading] = useState(!!user?.uid);

  // Subscribe to the customer's orders (so we know what's delivered)
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToUserOrders(user.uid, (data) => {
      setOrders(data);
      setOrdersLoading(false);
    });
    return () => { if (unsub) unsub(); };
  }, [user?.uid]);

  // Subscribe to the customer's existing reviews
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = subscribeToUserReviews(user.uid, (data) => {
      setReviews(data);
      setReviewsLoading(false);
    });
    return () => { if (unsub) unsub(); };
  }, [user?.uid]);

  // List of delivered items the customer can leave reviews for
  const reviewablePieces: ReviewablePiece[] = useMemo(() => {
    const out: ReviewablePiece[] = [];
    const seen = new Set<string>();
    for (const order of orders) {
      if (order.status !== "delivered") continue;
      for (const item of order.items) {
        const key = `${order.id}__${item.productId}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({
          productId: item.productId,
          name: item.name,
          image: item.image,
          orderId: order.id,
          deliveredAt: order.updatedAt ?? order.createdAt,
        });
      }
    }
    return out;
  }, [orders]);

  // Bucket items into "needs review" and "already reviewed"
  const reviewedKeys = useMemo(
    () => new Set(reviews.map((r) => `${r.orderId ?? ''}__${r.productId}`)),
    [reviews]
  );
  const pending = reviewablePieces.filter((p) => !reviewedKeys.has(`${p.orderId}__${p.productId}`));

  // Active editor — either a brand-new review for a pending piece, or an edit of an existing review
  const [editor, setEditor] = useState<
    | { mode: "new"; piece: ReviewablePiece }
    | { mode: "edit"; review: Review }
    | null
  >(null);

  if (!user) {
    return (
      <div className="bg-white rounded-2xl border border-silver/40 p-10 text-center">
        <Star className="mx-auto text-silver mb-4" size={40} />
        <p className="text-warm-black font-medium mb-2">Please sign in</p>
        <p className="text-sm text-muted mb-4">You need to be signed in to leave or see your reviews.</p>
        <Link href="/login" className="inline-block px-5 py-2.5 bg-gold text-warm-black rounded-xl text-sm font-medium hover:bg-gold-light transition-colors">
          Sign In
        </Link>
      </div>
    );
  }

  const loading = ordersLoading || reviewsLoading;
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-silver/40 p-10 text-center">
        <Loader2 size={28} className="mx-auto text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-silver/40 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <Star className="text-gold" size={22} />
          <h2 className="text-xl font-[family-name:var(--font-heading)] font-semibold text-warm-black">
            My Reviews
          </h2>
        </div>
        <p className="text-xs text-muted">Reviews open up after your order is delivered.</p>
      </div>

      {/* Pending reviews — items delivered but not yet reviewed */}
      {pending.length > 0 && (
        <div className="bg-white rounded-2xl border border-silver/40 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-warm-black mb-4 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600" />
            Waiting for your review ({pending.length})
          </h3>
          <div className="space-y-3">
            {pending.map((p) => (
              <div
                key={`${p.orderId}__${p.productId}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-silver/30 hover:bg-cream/40 transition-colors"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-silver/20 shrink-0 relative">
                  {p.image ? (
                    <Image src={p.image} alt={p.name} fill className="object-cover" sizes="56px" />
                  ) : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-warm-black truncate">{p.name}</p>
                  <p className="text-[11px] text-muted">Delivered · order {p.orderId.slice(0, 8)}…</p>
                </div>
                <button
                  onClick={() => setEditor({ mode: "new", piece: p })}
                  className="px-3 py-1.5 bg-gold text-warm-black text-xs font-medium rounded-lg hover:bg-gold-light transition-colors"
                >
                  Write review
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Already-reviewed list */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-silver/40 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-warm-black mb-4 flex items-center gap-2">
            <MessageSquare size={16} className="text-gold" />
            Your reviews ({reviews.length})
          </h3>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border border-silver/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2 gap-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/product/${r.productId}`}
                      className="text-sm font-medium text-warm-black hover:text-gold transition-colors truncate"
                    >
                      Product · {r.productId.slice(0, 8)}…
                    </Link>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} className={s <= r.rating ? "fill-gold text-gold" : "text-silver"} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditor({ mode: "edit", review: r })}
                      className="text-xs text-gold-dark hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm("Delete this review?")) await deleteReview(r.id);
                      }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {r.title && <p className="text-sm font-semibold text-warm-black">{r.title}</p>}
                <p className="text-sm text-muted whitespace-pre-line">{r.comment}</p>
                {r.adminReply && (
                  <div className="mt-3 bg-gold/5 border-l-2 border-gold/40 pl-3 pr-3 py-2 rounded-r-lg">
                    <p className="text-[11px] font-semibold text-gold-dark uppercase tracking-wider mb-1">
                      {r.adminReply.adminName || "Silveri"} replied
                    </p>
                    <p className="text-xs text-warm-black/80 whitespace-pre-line">{r.adminReply.text}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state — no delivered orders yet AND no past reviews */}
      {pending.length === 0 && reviews.length === 0 && (
        <div className="bg-white rounded-2xl border border-silver/40 p-10 text-center">
          <Star size={48} className="mx-auto text-silver mb-4 opacity-50" />
          <p className="text-warm-black font-medium mb-1">No reviews yet</p>
          <p className="text-sm text-muted">
            You&apos;ll be able to review products here once your order is delivered.
          </p>
        </div>
      )}

      {/* Editor modal */}
      {editor && (
        <ReviewEditor
          editor={editor}
          userId={user.uid}
          userName={userDoc?.name || user.displayName || "Customer"}
          userPhoto={userDoc?.photoURL || user.photoURL || ""}
          onClose={() => setEditor(null)}
        />
      )}
    </div>
  );
}

function ReviewEditor({
  editor,
  userId,
  userName,
  userPhoto,
  onClose,
}: {
  editor:
    | { mode: "new"; piece: ReviewablePiece }
    | { mode: "edit"; review: Review };
  userId: string;
  userName: string;
  userPhoto: string;
  onClose: () => void;
}) {
  const initial = editor.mode === "edit" ? editor.review : null;
  const [rating, setRating] = useState(initial?.rating ?? 5);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [comment, setComment] = useState(initial?.comment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (rating < 1 || rating > 5) { setError("Please pick a rating"); return; }
    if (!comment.trim() || comment.trim().length < 5) {
      setError("Write at least a few words about the product");
      return;
    }
    setSubmitting(true);
    try {
      if (editor.mode === "edit") {
        await updateReview(editor.review.id, { rating, title: title.trim(), comment: comment.trim() });
      } else {
        await createReview({
          productId: editor.piece.productId,
          userId,
          userName,
          userPhoto,
          rating,
          title: title.trim() || undefined,
          comment: comment.trim(),
          orderId: editor.piece.orderId,
        });
      }
      setDone(true);
      setTimeout(onClose, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save review");
    } finally {
      setSubmitting(false);
    }
  };

  const headerName = editor.mode === "edit"
    ? `Product · ${editor.review.productId.slice(0, 8)}…`
    : editor.piece.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-2xl w-full max-w-md relative z-10 shadow-2xl border border-silver-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-silver-200">
          <h3 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-warm-black">
            {editor.mode === "edit" ? "Edit your review" : "Write a review"}
          </h3>
          <button onClick={onClose} className="text-silver-500 hover:text-warm-black">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="px-5 py-4 space-y-4">
          <p className="text-xs text-muted truncate">{headerName}</p>

          {/* Rating stars */}
          <div>
            <label className="block text-xs font-semibold text-silver-500 uppercase tracking-wider mb-2">
              Rating
            </label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 -m-1"
                  aria-label={`${s} star${s === 1 ? '' : 's'}`}
                >
                  <Star
                    size={28}
                    className={s <= rating ? "fill-gold text-gold" : "text-silver-300"}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-silver-500 uppercase tracking-wider mb-2">
              Title <span className="text-muted normal-case font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              placeholder="e.g. Beautifully crafted!"
              className="w-full px-4 py-2.5 border border-silver rounded-lg text-sm outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-silver-500 uppercase tracking-wider mb-2">
              Your review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Share your thoughts about quality, craftsmanship, fit…"
              className="w-full px-4 py-2.5 border border-silver rounded-lg text-sm outline-none focus:border-gold resize-none"
            />
            <p className="text-[10px] text-muted mt-1 text-right">{comment.length}/1000</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {done && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-xs rounded-lg px-3 py-2 flex items-center gap-2">
              <CheckCircle2 size={14} /> Saved!
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gold text-warm-black py-3 rounded-lg text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-50"
          >
            {submitting ? "Saving…" : editor.mode === "edit" ? "Save changes" : "Submit review"}
          </button>
        </form>
      </div>
    </div>
  );
}
