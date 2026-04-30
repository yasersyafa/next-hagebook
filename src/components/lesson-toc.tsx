"use client";

import { useEffect, useMemo, useState } from "react";

type Heading = { id: string; text: string; level: 1 | 2 | 3 };

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function LessonToc({ html }: { html: string }) {
  const headings = useMemo<Heading[]>(() => {
    const re = /<h([1-3])[^>]*>(.*?)<\/h[1-3]>/gi;
    const out: Heading[] = [];
    let m: RegExpExecArray | null;
    const seen = new Map<string, number>();
    while ((m = re.exec(html)) !== null) {
      const level = Number(m[1]) as 1 | 2 | 3;
      const text = m[2].replace(/<[^>]+>/g, "").trim();
      if (!text) continue;
      const baseId = slugify(text);
      const count = seen.get(baseId) ?? 0;
      seen.set(baseId, count + 1);
      const id = count === 0 ? baseId : `${baseId}-${count}`;
      out.push({ id, text, level });
    }
    return out;
  }, [html]);

  const [activeId, setActiveId] = useState<string | null>(null);

  // Inject ids into rendered headings (matches by index/text).
  useEffect(() => {
    const article = document.getElementById("lesson-body");
    if (!article) return;
    const els = Array.from(article.querySelectorAll("h1, h2, h3"));
    const seen = new Map<string, number>();
    els.forEach((el) => {
      const text = (el.textContent ?? "").trim();
      if (!text) return;
      const baseId = slugify(text);
      const count = seen.get(baseId) ?? 0;
      seen.set(baseId, count + 1);
      el.id = count === 0 ? baseId : `${baseId}-${count}`;
    });

    // Scroll-spy
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [html]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground font-medium">
        On this page
      </p>
      <ul className="space-y-1.5 border-l">
        {headings.map((h) => {
          const isActive = h.id === activeId;
          return (
            <li
              key={h.id}
              className={
                h.level === 1
                  ? "pl-3"
                  : h.level === 2
                    ? "pl-4"
                    : "pl-6"
              }
            >
              <a
                href={`#${h.id}`}
                className={`block py-0.5 -ml-px border-l-2 pl-2 transition-colors ${
                  isActive
                    ? "border-primary text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
