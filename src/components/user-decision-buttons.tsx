"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { decideUser } from "@/actions/approve-user";

export function UserDecisionButtons({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function decide(action: "APPROVE" | "REJECT") {
    const fd = new FormData();
    fd.set("userId", userId);
    fd.set("action", action);
    startTransition(async () => {
      const result = await decideUser(fd);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(action === "APPROVE" ? "Approved" : "Rejected");
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Decide"
            disabled={pending}
          />
        }
      >
        ⋮
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => decide("APPROVE")}>
          Approve
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => decide("REJECT")}
          className="text-destructive focus:text-destructive"
        >
          Reject
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
