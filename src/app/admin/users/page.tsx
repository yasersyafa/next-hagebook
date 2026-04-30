import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Users · Admin",
  robots: { index: false, follow: false },
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserDecisionButtons } from "@/components/user-decision-buttons";
import type { UserStatus } from "@/generated/prisma/enums";

const variant: Record<UserStatus, "secondary" | "default" | "destructive" | "outline"> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
  DEACTIVATED: "outline",
};

type Row = {
  id: string;
  name: string | null;
  email: string;
  role: "STUDENT" | "ADMIN";
  status: UserStatus;
  createdAt: Date;
};

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") notFound();

  const users = await prisma.user.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const pending = users.filter((u) => u.status === "PENDING");
  const approved = users.filter((u) => u.status === "APPROVED");
  const rejected = users.filter((u) => u.status === "REJECTED");
  const deactivated = users.filter((u) => u.status === "DEACTIVATED");

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          {pending.length} pending · {approved.length} approved ·{" "}
          {rejected.length} rejected · {deactivated.length} deactivated
        </p>
      </div>

      <Section title="Pending" description="Awaiting your decision" rows={pending} />
      <Section title="Approved" description="Active users with lesson access" rows={approved} />
      <Section title="Deactivated" description="Access blocked, data retained" rows={deactivated} />
      <Section title="Rejected" description="Never approved" rows={rejected} />
    </div>
  );
}

function Section({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: Row[];
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{u.email}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>
                    <Badge variant={variant[u.status]}>{u.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {u.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <UserDecisionButtons
                      userId={u.id}
                      email={u.email}
                      name={u.name}
                      role={u.role}
                      status={u.status}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
