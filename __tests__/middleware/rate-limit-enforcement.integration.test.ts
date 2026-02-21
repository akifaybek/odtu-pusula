import { readFileSync } from "fs";
import { join } from "path";

describe("Rate limit enforcement integration", () => {
  const root = join(process.cwd(), "src", "app", "api");

  const readRoute = (relativePath: string) => readFileSync(join(root, ...relativePath.split("/")), "utf-8");

  it("should keep middleware-owned endpoints free of route-level limiter calls", () => {
    const middlewareOwnedRoutes = [
      "auth/register/route.ts",
      "auth/reset-password/route.ts",
      "courses/[code]/reviews/route.ts",
      "professors/[id]/reviews/route.ts",
      "reviews/[id]/like/route.ts",
    ];

    for (const route of middlewareOwnedRoutes) {
      const source = readRoute(route);
      expect(source).not.toContain("checkRateLimit(");
      expect(source).not.toContain("checkRateLimitByPolicy(");
      expect(source).not.toContain("rateLimiters.");
    }
  });

  it("should keep route-level limiter only on email-sensitive auth endpoints", () => {
    const routeLevelOwnedRoutes = [
      "auth/forgot-password/route.ts",
      "auth/send-verification/route.ts",
    ];

    for (const route of routeLevelOwnedRoutes) {
      const source = readRoute(route);
      expect(source).toMatch(/checkRateLimitByPolicy\(\s*"email"/);
      expect(source).toContain("buildRateLimitHeaders(");
    }
  });
});
