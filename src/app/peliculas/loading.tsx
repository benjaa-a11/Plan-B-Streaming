import { Skeleton } from "@/components/ui/skeleton";

export default function MoviesLoading() {
  return (
    <div className="w-full space-y-12">
      {/* Hero Skeleton */}
      <div className="w-full aspect-video md:aspect-[2.4/1] relative flex items-center justify-center bg-muted">
        <Skeleton className="h-full w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute bottom-8 left-8 md:bottom-16 md:left-16 space-y-4 text-left">
            <Skeleton className="h-10 w-48 rounded-lg" />
            <Skeleton className="h-12 w-36 rounded-md" />
        </div>
      </div>

      {/* Shelf Skeleton */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-48 rounded-md" />
            <div className="flex space-x-4">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="w-36 sm:w-40 shrink-0 space-y-2">
                  <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
