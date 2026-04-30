"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  FileText,
  Users,
  Inbox,
  History,
  UserCircle,
  BookOpen,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useTheme } from "@/components/theme-provider";

type Lesson = { slug: string; title: string };

export function CommandPalette({
  user,
  lessons,
}: {
  user: { role: "STUDENT" | "ADMIN"; status: string } | null;
  lessons: Lesson[];
}) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  const isAdmin = user?.role === "ADMIN";
  const approved = user?.status === "APPROVED" && !isAdmin;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search lessons, navigate, run actions..." />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => go("/")}>
            <Home className="mr-2 size-4" />
            Home
          </CommandItem>
          {approved ? (
            <CommandItem onSelect={() => go("/dashboard")}>
              <LayoutDashboard className="mr-2 size-4" />
              Dashboard
            </CommandItem>
          ) : null}
          {user && !isAdmin ? (
            <CommandItem onSelect={() => go("/account")}>
              <UserCircle className="mr-2 size-4" />
              Account
            </CommandItem>
          ) : null}
          {isAdmin ? (
            <>
              <CommandItem onSelect={() => go("/admin/pages")}>
                <FileText className="mr-2 size-4" />
                Admin: Pages
              </CommandItem>
              <CommandItem onSelect={() => go("/admin/pages/new")}>
                <FileText className="mr-2 size-4" />
                New page
              </CommandItem>
              <CommandItem onSelect={() => go("/admin/users")}>
                <Users className="mr-2 size-4" />
                Admin: Users
              </CommandItem>
              <CommandItem onSelect={() => go("/admin/submissions")}>
                <Inbox className="mr-2 size-4" />
                Admin: Submissions
              </CommandItem>
              <CommandItem onSelect={() => go("/admin/audit")}>
                <History className="mr-2 size-4" />
                Admin: Audit log
              </CommandItem>
            </>
          ) : null}
        </CommandGroup>

        {lessons.length > 0 ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Lessons">
              {lessons.slice(0, 20).map((l) => (
                <CommandItem
                  key={l.slug}
                  value={`lesson ${l.title} ${l.slug}`}
                  onSelect={() => go(`/pages/${l.slug}`)}
                >
                  <BookOpen className="mr-2 size-4" />
                  {l.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}

        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem
            onSelect={() => {
              setTheme("light");
              setOpen(false);
            }}
          >
            <Sun className="mr-2 size-4" />
            Light
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setTheme("dark");
              setOpen(false);
            }}
          >
            <Moon className="mr-2 size-4" />
            Dark
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setTheme("system");
              setOpen(false);
            }}
          >
            <Monitor className="mr-2 size-4" />
            System
          </CommandItem>
        </CommandGroup>
      </CommandList>
      <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <span>Tip: Cmd+K anywhere</span>
        <CommandShortcut>↵ to go</CommandShortcut>
      </div>
    </CommandDialog>
  );
}
