import { describe, expect, it } from "vitest";
import { sanitizeHtml } from "./sanitize";

describe("sanitizeHtml", () => {
  it("strips script tags", () => {
    const input = `<p>Hello</p><script>alert(1)</script>`;
    const out = sanitizeHtml(input);
    expect(out).not.toContain("<script");
    expect(out).toContain("<p>Hello</p>");
  });

  it("strips javascript: hrefs", () => {
    const input = `<a href="javascript:alert(1)">x</a>`;
    const out = sanitizeHtml(input);
    expect(out).not.toContain("javascript:");
  });

  it("keeps allowed tags", () => {
    const input = `<h1>T</h1><p><strong>B</strong> <em>I</em></p><ul><li>a</li></ul>`;
    const out = sanitizeHtml(input);
    expect(out).toContain("<h1>T</h1>");
    expect(out).toContain("<strong>B</strong>");
    expect(out).toContain("<em>I</em>");
    expect(out).toContain("<li>a</li>");
  });

  it("auto-adds rel + target on anchor", () => {
    const input = `<a href="https://example.com">x</a>`;
    const out = sanitizeHtml(input);
    expect(out).toMatch(/rel="noopener noreferrer"/);
    expect(out).toMatch(/target="_blank"/);
  });

  it("allows https img src", () => {
    const input = `<img src="https://example.com/a.png" alt="x" />`;
    const out = sanitizeHtml(input);
    expect(out).toContain('src="https://example.com/a.png"');
    expect(out).toContain('alt="x"');
  });

  it("blocks data:text/html img src", () => {
    const input = `<img src="data:text/html,evil" alt="x" />`;
    const out = sanitizeHtml(input);
    expect(out).not.toContain("data:text/html");
  });

  it("strips inline event handlers", () => {
    const input = `<p onclick="alert(1)">x</p>`;
    const out = sanitizeHtml(input);
    expect(out).not.toContain("onclick");
  });
});
