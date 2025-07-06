import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";


export default function RadioPlayerLoading() {
  return (
    <div className="flex h-dvh flex-col bg-muted/20">
        <header className="flex h-16 shrink-0 items-center border-b bg-background px-4 md:px-6 pt-safe-top">
            <Button variant="outline" size="icon" disabled>
                <ArrowLeft className="h-5 w-5" />
            </Button>
        </header>
        <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-4 md:p-8">
                 <div className="w-full max-w-md mx-auto rounded-xl bg-card shadow-2xl overflow-hidden">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-6 text-center space-y-2">
                        <Skeleton className="h-8 w-3/4 mx-auto" />
                        <Skeleton className="h-6 w-1/2 mx-auto" />
                        <Skeleton className="h-5 w-1/3 mx-auto" />
                    </div>
                    <div className="bg-muted/50 p-4 flex items-center justify-center gap-6">
                        <Skeleton className="h-6 w-6" />
                        <Skeleton className="h-16 w-16 rounded-full" />
                        <div className="w-6 h-6" />
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
}
