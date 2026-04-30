import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-10 space-y-6">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}
