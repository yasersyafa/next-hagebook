import { Badge } from "@/components/ui/badge";
import type { SubmissionStatus } from "@/generated/prisma/enums";

type SubmissionLike = {
  id: string;
  url: string;
  status: SubmissionStatus;
  feedback: string | null;
  attemptNumber: number;
  updatedAt: Date;
};

const variant: Record<SubmissionStatus, "secondary" | "default" | "destructive"> = {
  PENDING: "secondary",
  PASS: "default",
  FAIL: "destructive",
};

export function SubmissionStatusCard({
  submission,
  previous = [],
}: {
  submission: SubmissionLike;
  previous?: SubmissionLike[];
}) {
  return (
    <div className="space-y-3">
      <AttemptCard submission={submission} latest />
      {previous.length > 0 ? (
        <details className="text-sm">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            {previous.length} previous attempt{previous.length === 1 ? "" : "s"}
          </summary>
          <div className="mt-3 space-y-2">
            {previous.map((p) => (
              <AttemptCard key={p.id} submission={p} />
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}

function AttemptCard({
  submission,
  latest = false,
}: {
  submission: SubmissionLike;
  latest?: boolean;
}) {
  return (
    <div className="rounded-md border bg-muted/30 p-4 space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-sm font-medium">
          Attempt #{submission.attemptNumber}
          {latest ? (
            <span className="ml-2 text-xs text-primary font-normal">Latest</span>
          ) : null}
        </span>
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
        {submission.updatedAt.toLocaleString()}
      </p>
    </div>
  );
}
