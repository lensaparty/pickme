import { beforeEach, describe, expect, it } from "vitest";

beforeEach(() => {
  process.env.APP_SECRET = "vitest-secret";
});

describe("secrets", () => {
  it("encrypts and decrypts secret values", async () => {
    const { decryptSecretValue, encryptSecretValue, isEncryptedValue } = await import("@/lib/secrets");
    const encrypted = encryptSecretValue("LUNA2026");
    expect(isEncryptedValue(encrypted)).toBe(true);
    expect(encrypted).not.toContain("LUNA2026");
    expect(decryptSecretValue(encrypted)).toBe("LUNA2026");
  });

  it("keeps plain values readable for backwards compatibility", async () => {
    const { decryptSecretValue } = await import("@/lib/secrets");
    expect(decryptSecretValue("plain-text")).toBe("plain-text");
  });

  it("compares strings safely", async () => {
    const { secureCompare } = await import("@/lib/secrets");
    expect(secureCompare("hello", "hello")).toBe(true);
    expect(secureCompare("hello", "world")).toBe(false);
  });

  it("creates stable signed tokens", async () => {
    const { createSignedToken } = await import("@/lib/secrets");
    const first = createSignedToken("admin", "password");
    const second = createSignedToken("admin", "password");
    expect(first).toBe(second);
  });
});
