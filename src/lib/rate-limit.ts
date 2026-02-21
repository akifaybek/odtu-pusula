import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export type RateLimitPolicyKey = "auth" | "email" | "review" | "like" | "api";
export type RateLimitEnforcementLayer = "middleware" | "route";

interface RatePolicy {
  maxRequests: number;
  windowMs: number;
  upstashWindow: Parameters<typeof Ratelimit.slidingWindow>[1];
  prefix: string;
}

interface EndpointRateLimitRule {
  id: string;
  pattern: RegExp;
  policy: RateLimitPolicyKey;
  enforcedBy: RateLimitEnforcementLayer;
  identifierHint: "ip" | "userOrIp" | "user" | "ip+email";
}

const RATE_LIMIT_POLICIES: Record<RateLimitPolicyKey, RatePolicy> = {
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    upstashWindow: "15 m",
    prefix: "ratelimit:auth",
  },
  email: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
    upstashWindow: "1 h",
    prefix: "ratelimit:email",
  },
  review: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000,
    upstashWindow: "1 h",
    prefix: "ratelimit:review",
  },
  like: {
    maxRequests: 100,
    windowMs: 60 * 60 * 1000,
    upstashWindow: "1 h",
    prefix: "ratelimit:like",
  },
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000,
    upstashWindow: "1 m",
    prefix: "ratelimit:api",
  },
};

const ENDPOINT_RATE_LIMIT_RULES: EndpointRateLimitRule[] = [
  {
    id: "auth.forgot-password",
    pattern: /^\/api\/auth\/forgot-password(?:\/|$)/,
    policy: "email",
    enforcedBy: "route",
    identifierHint: "ip+email",
  },
  {
    id: "auth.send-verification",
    pattern: /^\/api\/auth\/send-verification(?:\/|$)/,
    policy: "email",
    enforcedBy: "route",
    identifierHint: "ip+email",
  },
  {
    id: "auth.all",
    pattern: /^\/api\/auth\/(?:.*)$/,
    policy: "auth",
    enforcedBy: "middleware",
    identifierHint: "userOrIp",
  },
  {
    id: "reviews.like",
    pattern: /^\/api\/reviews\/[^/]+\/like(?:\/|$)/,
    policy: "like",
    enforcedBy: "middleware",
    identifierHint: "userOrIp",
  },
  {
    id: "reviews.create",
    pattern: /^\/api\/(courses|professors)\/[^/]+\/reviews(?:\/|$)/,
    policy: "review",
    enforcedBy: "middleware",
    identifierHint: "userOrIp",
  },
  {
    id: "api.default",
    pattern: /^\/api\/(?:.*)$/,
    policy: "api",
    enforcedBy: "middleware",
    identifierHint: "userOrIp",
  },
];

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const inMemoryStore = new Map<string, { count: number; resetAt: number }>();

function createInMemoryLimiter(maxRequests: number, windowMs: number) {
  return {
    limit: async (identifier: string) => {
      const now = Date.now();
      const record = inMemoryStore.get(identifier);

      if (!record || now > record.resetAt) {
        inMemoryStore.set(identifier, { count: 1, resetAt: now + windowMs });
        return { success: true, remaining: maxRequests - 1, reset: now + windowMs };
      }

      if (record.count >= maxRequests) {
        return { success: false, remaining: 0, reset: record.resetAt };
      }

      record.count++;
      return { success: true, remaining: maxRequests - record.count, reset: record.resetAt };
    },
  };
}

function buildLimiter(policy: RatePolicy) {
  if (redis) {
    return new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(policy.maxRequests, policy.upstashWindow),
      prefix: policy.prefix,
    });
  }

  return createInMemoryLimiter(policy.maxRequests, policy.windowMs);
}

function buildInMemoryFallbackLimiter(policy: RatePolicy) {
  return createInMemoryLimiter(policy.maxRequests, policy.windowMs);
}

export const rateLimiters = {
  auth: buildLimiter(RATE_LIMIT_POLICIES.auth),
  email: buildLimiter(RATE_LIMIT_POLICIES.email),
  review: buildLimiter(RATE_LIMIT_POLICIES.review),
  like: buildLimiter(RATE_LIMIT_POLICIES.like),
  api: buildLimiter(RATE_LIMIT_POLICIES.api),
};

const inMemoryFallbackLimiters = {
  auth: buildInMemoryFallbackLimiter(RATE_LIMIT_POLICIES.auth),
  email: buildInMemoryFallbackLimiter(RATE_LIMIT_POLICIES.email),
  review: buildInMemoryFallbackLimiter(RATE_LIMIT_POLICIES.review),
  like: buildInMemoryFallbackLimiter(RATE_LIMIT_POLICIES.like),
  api: buildInMemoryFallbackLimiter(RATE_LIMIT_POLICIES.api),
};

type RateLimiter = (typeof rateLimiters)[keyof typeof rateLimiters];

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

export async function checkRateLimit(
  limiter: RateLimiter,
  identifier: string,
  limit = 0
): Promise<RateLimitResult> {
  const result = await limiter.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
    reset: result.reset,
    limit,
  };
}

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function resolveRateLimitRule(pathname: string): EndpointRateLimitRule | null {
  if (!pathname.startsWith("/api/")) {
    return null;
  }

  return ENDPOINT_RATE_LIMIT_RULES.find((rule) => rule.pattern.test(pathname)) ?? null;
}

export function getRateLimitPolicy(pathname: string): RateLimitPolicyKey {
  const rule = resolveRateLimitRule(pathname);
  return rule?.policy ?? "api";
}

export function shouldEnforceRateLimitInMiddleware(pathname: string): boolean {
  const rule = resolveRateLimitRule(pathname);
  return !!rule && rule.enforcedBy === "middleware";
}

export function getRateLimitPolicyConfig(policy: RateLimitPolicyKey): RatePolicy {
  return RATE_LIMIT_POLICIES[policy];
}

export async function checkRateLimitByPolicy(
  policy: RateLimitPolicyKey,
  identifier: string
): Promise<RateLimitResult> {
  const key = `${policy}:${identifier}`;
  const configuredLimit = RATE_LIMIT_POLICIES[policy].maxRequests;

  try {
    return await checkRateLimit(rateLimiters[policy], key, configuredLimit);
  } catch (error) {
    if (!redis) {
      throw error;
    }

    console.warn(
      JSON.stringify({
        level: "warn",
        event: "rate_limit.redis_fallback",
        policy,
        identifier,
        message: error instanceof Error ? error.message : String(error),
        ts: new Date().toISOString(),
      })
    );

    return checkRateLimit(inMemoryFallbackLimiters[policy], key, configuredLimit);
  }
}

export function buildRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
    "Retry-After": Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)).toString(),
  };
}

export function getRateLimitRuleTable() {
  return ENDPOINT_RATE_LIMIT_RULES.map((rule) => ({
    id: rule.id,
    pattern: rule.pattern.source,
    policy: rule.policy,
    enforcedBy: rule.enforcedBy,
    identifierHint: rule.identifierHint,
    limit: RATE_LIMIT_POLICIES[rule.policy].maxRequests,
    windowMs: RATE_LIMIT_POLICIES[rule.policy].windowMs,
  }));
}
