import { prisma } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserDecisionButtons } from "@/components/user-decision-buttons";
import type { UserStatus } from "@/generated/prisma/enums";

const variant: Record<UserStatus, "secondary" | "default" | "destructive"> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
};

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const pending = users.filter((u) => u.status === "PENDING");
  const others = users.filter((u) => u.status !== "PENDING");

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">User approvals</h1>
        <p className="text-muted-foreground">{pending.length} pending</p>
      </div>

      <Section title="Pending" description="Awaiting your decision" rows={pending} showActions />
      <Section title="Approved & Rejected" description="Past decisions" rows={others} />
    </div>
  );
}

function Section({
  title,
  description,
  rows,
  showActions = false,
}: {
  title: string;
  description: string;
  rows: {
    id: string;
    name: string | null;
    email: string;
    role: "STUDENT" | "ADMIN";
    status: UserStatus;
    createdAt: Date;
  }[];
  showActions?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">None.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                {showActions ? <TableHead className="text-right">Actions</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name ?? "—"}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>
                    <Badge variant={variant[u.status]}>{u.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.createdAt.toLocaleDateString()}
                  </TableCell>
                  {showActions ? (
                    <TableCell className="text-right">
                      <UserDecisionButtons userId={u.id} />
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
