import { cn } from "@/lib/utils";
import { Inbox, FileText, BookOpen, Users, Clock } from "lucide-react";

const icons = {
  inbox: Inbox,
  page: FileText,
  lesson: BookOpen,
  user: Users,
  clock: Clock,
} as const;

export type EmptyIcon = keyof typeof icons;

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  className,
}: {
  icon?: EmptyIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  const Icon = icons[icon];
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed bg-gradient-to-b from-muted/20 to-muted/5 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="relative mb-4">
        <div
          className="absolute inset-0 -m-4 rounded-full bg-primary/10 blur-2xl"
          aria-hidden
        />
        <div className="relative flex size-14 items-center justify-center rounded-2xl border bg-background shadow-sm">
          <Icon className="size-6 text-primary" />
        </div>
      </div>
      <p className="text-base font-medium">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
