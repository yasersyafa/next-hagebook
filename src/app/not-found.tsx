import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-svh flex items-center justify-center px-4 py-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-semibold tracking-tight">
          <span className="text-primary">404</span>
        </h1>
        <p className="text-muted-foreground">Page not found.</p>
        <Link href="/" className={buttonVariants()}>Back home</Link>
      </div>
    </div>
  );
}
