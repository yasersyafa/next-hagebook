"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { gradeSubmission } from "@/actions/grade-submission";

export function GradeForm({
  id,
  currentStatus,
  currentFeedback,
}: {
  id: string;
  currentStatus: "PENDING" | "PASS" | "FAIL";
  currentFeedback: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState(currentFeedback);

  function decide(status: "PASS" | "FAIL") {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("status", status);
    fd.set("feedback", feedback);
    startTransition(async () => {
      const result = await gradeSubmission(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(`Marked ${status}`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-3 pt-3 border-t">
      <div className="space-y-2">
        <Label htmlFor={`feedback-${id}`}>Feedback (optional)</Label>
        <Textarea
          id={`feedback-${id}`}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Notes for the student..."
          rows={3}
        />
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => decide("PASS")}
          disabled={pending}
        >
          {currentStatus === "PASS" ? "Re-mark PASS" : "Mark PASS"}
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => decide("FAIL")}
          disabled={pending}
        >
          {currentStatus === "FAIL" ? "Re-mark FAIL" : "Mark FAIL"}
        </Button>
      </div>
    </div>
  );
}
