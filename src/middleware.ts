import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import {
  buildRateLimitHeaders,
  checkRateLimitByPolicy,
  getClientIp,
  getRateLimitPolicy,
  shouldEnforceRateLimitInMiddleware,
} from "@/lib/rate-limit";

function getOrCreateRequestIds(req: { headers: Headers }) {
  const requestId = req.headers.get("x-request-id")?.trim() || crypto.randomUUID();
  const correlationId = req.headers.get("x-correlation-id")?.trim() || requestId;
  return { requestId, correlationId };
}

function withTraceHeaders(response: NextResponse, requestId: string, correlationId: string) {
  response.headers.set("x-request-id", requestId);
  response.headers.set("x-correlation-id", correlationId);
  return response;
}

export default withAuth(
  async function middleware(req) {
    const startedAt = Date.now();
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const { requestId, correlationId } = getOrCreateRequestIds(req);

    if (pathname.startsWith("/api") && shouldEnforceRateLimitInMiddleware(pathname)) {
      const ip = getClientIp(req);
      const identifier = token?.sub || ip;
      const policy = getRateLimitPolicy(pathname);

      try {
        const result = await checkRateLimitByPolicy(policy, identifier);

        if (!result.success) {
          const response = NextResponse.json(
            {
              error: "Too Many Requests",
              errorCode: "RATE_LIMITED",
              message: "Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.",
              context: {
                policy,
                endpoint: pathname,
                requestId,
                correlationId,
              },
            },
            {
              status: 429,
              headers: buildRateLimitHeaders(result),
            }
          );

          const durationMs = Date.now() - startedAt;
          console.warn(
            JSON.stringify({
              level: "warn",
              event: "middleware.rate_limited",
              requestId,
              correlationId,
              endpoint: pathname,
              policy,
              durationMs,
              ts: new Date().toISOString(),
            })
          );

          return withTraceHeaders(response, requestId, correlationId);
        }
      } catch (error) {
        console.error(
          JSON.stringify({
            level: "error",
            event: "middleware.rate_limit_error",
            requestId,
            correlationId,
            endpoint: pathname,
            message: error instanceof Error ? error.message : String(error),
            ts: new Date().toISOString(),
          })
        );
      }
    }

    if (token && (pathname === "/login" || pathname === "/register" || pathname === "/")) {
      const response = NextResponse.redirect(new URL("/home", req.url));
      return withTraceHeaders(response, requestId, correlationId);
    }

    if (token?.isBanned) {
      const response = NextResponse.redirect(new URL("/account-suspended", req.url));
      return withTraceHeaders(response, requestId, correlationId);
    }

    const response = NextResponse.next();
    response.headers.set("x-response-time-ms", (Date.now() - startedAt).toString());
    return withTraceHeaders(response, requestId, correlationId);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        const publicPaths = ["/", "/login", "/register", "/forgot-password", "/account-suspended"];
        if (publicPaths.some((path) => pathname === path)) {
          return true;
        }

        if (pathname.startsWith("/reset-password")) {
          return true;
        }

        if (pathname.startsWith("/api")) {
          return true;
        }

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/home/:path*",
    "/courses/:path*",
    "/professors/:path*",
    "/dersler/:path*",
    "/hocalar/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/assistant/:path*",
    "/login",
    "/register",
    "/",
    "/api/:path*",
  ],
};
