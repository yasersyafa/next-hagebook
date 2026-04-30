import { Skeleton } from "@/components/ui/skeleton";

export default function PageLoading() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-8">
      <Skeleton className="h-4 w-32" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <Skeleton className="h-40 w-full rounded-lg" />
    </div>
  );
}
