import { Badge } from "@/components/ui/badge";
import type { SubmissionStatus } from "@/generated/prisma/enums";

type SubmissionLike = {
  url: string;
  status: SubmissionStatus;
  feedback: string | null;
  updatedAt: Date;
};

const variant: Record<SubmissionStatus, "secondary" | "default" | "destructive"> = {
  PENDING: "secondary",
  PASS: "default",
  FAIL: "destructive",
};

export function SubmissionStatusCard({ submission }: { submission: SubmissionLike }) {
  return (
    <div className="rounded-md border bg-muted/30 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Your submission</span>
        <Badge variant={variant[submission.status]}>{submission.status}</Badge>
      </div>
      <a
        href={submission.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary underline-offset-4 hover:underline break-all"
      >
        {submission.url}
      </a>
      {submission.feedback ? (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          <span className="font-medium text-foreground">Feedback:</span> {submission.feedback}
        </p>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Last updated {submission.updatedAt.toLocaleString()}
      </p>
    </div>
  );
}
