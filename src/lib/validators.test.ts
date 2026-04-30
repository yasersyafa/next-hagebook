import { describe, expect, it } from "vitest";
import {
  pageBaseSchema,
  registerSchema,
  submitAssignmentSchema,
  resetPasswordSchema,
} from "./validators";

describe("registerSchema", () => {
  it("rejects short password", () => {
    const r = registerSchema.safeParse({
      name: "x",
      email: "a@b.co",
      password: "short",
    });
    expect(r.success).toBe(false);
  });
  it("accepts valid input", () => {
    const r = registerSchema.safeParse({
      name: "Alice",
      email: "a@b.co",
      password: "longenough",
    });
    expect(r.success).toBe(true);
  });
});

describe("submitAssignmentSchema", () => {
  it("rejects non-http URL", () => {
    const r = submitAssignmentSchema.safeParse({ pageSlug: "x", url: "ftp://x.com" });
    expect(r.success).toBe(false);
  });
  it("accepts https URL", () => {
    const r = submitAssignmentSchema.safeParse({
      pageSlug: "x",
      url: "https://github.com/u/r",
    });
    expect(r.success).toBe(true);
  });
});

describe("pageBaseSchema slug", () => {
  it("rejects spaces in slug", () => {
    const r = pageBaseSchema.safeParse({
      slug: "my lesson",
      title: "T",
      contentHtml: "x",
    });
    expect(r.success).toBe(false);
  });
  it("accepts kebab slug", () => {
    const r = pageBaseSchema.safeParse({
      slug: "my-lesson-01",
      title: "T",
      contentHtml: "x",
    });
    expect(r.success).toBe(true);
  });
});

describe("resetPasswordSchema confirm match", () => {
  it("fails on mismatch", () => {
    const r = resetPasswordSchema.safeParse({
      token: "t",
      password: "longenough",
      confirm: "different",
    });
    expect(r.success).toBe(false);
  });
  it("passes on match", () => {
    const r = resetPasswordSchema.safeParse({
      token: "t",
      password: "longenough",
      confirm: "longenough",
    });
    expect(r.success).toBe(true);
  });
});
