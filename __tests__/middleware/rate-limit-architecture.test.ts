import { readFileSync } from "fs";
import { join } from "path";

describe("Rate limit architecture", () => {
  const rateLimitLibPath = join(process.cwd(), "src", "lib", "rate-limit.ts");
  const source = readFileSync(rateLimitLibPath, "utf-8");

  it("should define deterministic endpoint rule ordering", () => {
    const forgotIdx = source.indexOf('id: "auth.forgot-password"');
    const sendVerificationIdx = source.indexOf('id: "auth.send-verification"');
    const authAllIdx = source.indexOf('id: "auth.all"');
    const defaultIdx = source.indexOf('id: "api.default"');

    expect(forgotIdx).toBeGreaterThan(-1);
    expect(sendVerificationIdx).toBeGreaterThan(-1);
    expect(authAllIdx).toBeGreaterThan(-1);
    expect(defaultIdx).toBeGreaterThan(-1);

    expect(forgotIdx).toBeLessThan(authAllIdx);
    expect(sendVerificationIdx).toBeLessThan(authAllIdx);
    expect(authAllIdx).toBeLessThan(defaultIdx);
  });

  it("should encode enforcement ownership in rules", () => {
    expect(source).toContain('id: "auth.forgot-password"');
    expect(source).toContain('id: "auth.send-verification"');
    expect(source).toContain('enforcedBy: "route"');

    expect(source).toContain('id: "auth.all"');
    expect(source).toContain('id: "reviews.like"');
    expect(source).toContain('id: "reviews.create"');
    expect(source).toContain('id: "api.default"');
    expect(source).toContain('enforcedBy: "middleware"');
  });

  it("should standardize X-RateLimit headers in a single helper", () => {
    expect(source).toContain('export function buildRateLimitHeaders');
    expect(source).toContain('"X-RateLimit-Limit"');
    expect(source).toContain('"X-RateLimit-Remaining"');
    expect(source).toContain('"X-RateLimit-Reset"');
    expect(source).toContain('"Retry-After"');
  });

  it("should include redis fallback behavior for policy checks", () => {
    expect(source).toContain('event: "rate_limit.redis_fallback"');
    expect(source).toContain('return checkRateLimit(inMemoryFallbackLimiters[policy], key, configuredLimit);');
  });
});
