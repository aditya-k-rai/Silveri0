import { ProductCardSkeleton, Skeleton } from "@/components/ui/Skeleton";

/**
 * Streamed while the category page resolves its product list. Renders the
 * exact final layout grid so the page doesn't jump on hydration — critical
 * for CLS scores under Vercel Speed Insights.
 */
export default function CategoryLoading() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <Skeleton className="h-3 w-32 mb-4" />
      <Skeleton className="h-10 w-64 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
