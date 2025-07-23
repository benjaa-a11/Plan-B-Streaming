import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChannelLoading() {
  return (
    <div className="flex h-dvh w-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div>
              <Skeleton className="h-6 w-32 rounded-md" />
              <Skeleton className="mt-1 h-4 w-20 rounded-md" />
            </div>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 md:p-8">
          <main>
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="mt-6">
              <Skeleton className="h-8 w-3/4 rounded-lg" />
              <Skeleton className="mt-4 h-5 w-1/4 rounded-lg" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-5/6 rounded-lg" />
              </div>
            </div>
          </main>
          <aside className="mt-12">
            <Skeleton className="h-8 w-1/3 rounded-lg" />
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-video w-full rounded-lg" />
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-1/2 rounded-md" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
