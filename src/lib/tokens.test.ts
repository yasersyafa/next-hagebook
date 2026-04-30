import { describe, expect, it } from "vitest";
import { hashToken, randomToken, tokenExpiry } from "./tokens";

describe("tokens", () => {
  it("randomToken produces unique non-empty strings", () => {
    const a = randomToken();
    const b = randomToken();
    expect(a).not.toBe(b);
    expect(a.length).toBeGreaterThan(20);
  });

  it("hashToken is deterministic", () => {
    expect(hashToken("abc")).toBe(hashToken("abc"));
    expect(hashToken("abc")).not.toBe(hashToken("abd"));
  });

  it("hashToken outputs hex sha256 (64 chars)", () => {
    expect(hashToken("x")).toHaveLength(64);
    expect(hashToken("x")).toMatch(/^[0-9a-f]+$/);
  });

  it("tokenExpiry returns date in the future", () => {
    const now = Date.now();
    const exp = tokenExpiry(1).getTime();
    expect(exp).toBeGreaterThan(now);
    expect(exp - now).toBeGreaterThan(60 * 60 * 1000 - 1000);
    expect(exp - now).toBeLessThan(60 * 60 * 1000 + 1000);
  });
});
