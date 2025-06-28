import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MovieLoading() {
  return (
    <div className="flex h-dvh w-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6 pt-safe-top">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <Skeleton className="h-6 w-48 rounded-md" />
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-4 md:p-8">
          <main>
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="mt-6 rounded-lg bg-card p-6">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-8 w-3/4 rounded-lg mt-2" />
              <div className="mt-3 flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <Skeleton className="h-5 w-12" />
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Skeleton className="h-5 w-16" />
                </div>
              </div>
                <Skeleton className="my-4 h-px w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-full rounded-lg" />
                <Skeleton className="h-4 w-5/6 rounded-lg" />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
