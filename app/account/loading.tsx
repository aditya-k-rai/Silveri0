import { Skeleton } from "@/components/ui/Skeleton";

export default function AccountLoading() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <Skeleton className="h-9 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  );
}
