import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Mirrors the product page's hero grid (gallery on the left, details on the
 * right) so the layout shift between this and the hydrated page is zero.
 */
export default function ProductLoading() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      <Skeleton className="h-3 w-40 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-3">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
        {/* Details */}
        <div className="space-y-5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-7 w-32" />
          <div className="space-y-2 pt-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-12 w-full mt-4" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </section>
  );
}
