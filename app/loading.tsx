import { Tv2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        <Tv2 className="h-16 w-16 animate-pulse text-primary" />
        <div className="absolute h-24 w-24 animate-ping rounded-full border-2 border-primary/50"></div>
      </div>
    </div>
  );
}
