import { NextRequest } from "next/server";

export type ErrorClass = "validation" | "auth" | "rate-limit" | "db" | "internal";

interface RequestTraceContext {
  requestId: string;
  correlationId: string;
  method: string;
  endpoint: string;
  path: string;
  startedAtMs: number;
}

interface MetricSample {
  durationMs: number;
  status: number;
  ts: number;
}

interface MetricBucket {
  total: number;
  errors: number;
  samples: MetricSample[];
}

const METRIC_SAMPLE_LIMIT = 300;

const metricsStore =
  (globalThis as typeof globalThis & { __odtuApiMetrics?: Map<string, MetricBucket> })
    .__odtuApiMetrics ?? new Map<string, MetricBucket>();

(globalThis as typeof globalThis & { __odtuApiMetrics?: Map<string, MetricBucket> }).__odtuApiMetrics =
  metricsStore;

function nowMs() {
  return Date.now();
}

function randomId() {
  return crypto.randomUUID();
}

function safePathname(url: string) {
  try {
    return new URL(url).pathname;
  } catch {
    return "unknown";
  }
}

function getMetricKey(endpoint: string, method: string) {
  return `${method.toUpperCase()} ${endpoint}`;
}

function percentile(values: number[], p: number) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1));
  return sorted[idx];
}

export function classifyError(status: number): ErrorClass {
  if (status === 400 || status === 404 || status === 409 || status === 422) {
    return "validation";
  }

  if (status === 401 || status === 403) {
    return "auth";
  }

  if (status === 429) {
    return "rate-limit";
  }

  return "internal";
}

export function classifyThrownError(error: unknown): ErrorClass {
  if (error instanceof Error) {
    const name = error.name.toLowerCase();
    const message = error.message.toLowerCase();

    if (name.includes("prisma") || message.includes("prisma") || message.includes("database")) {
      return "db";
    }

    if (name.includes("zod") || message.includes("validation") || message.includes("invalid")) {
      return "validation";
    }

    if (
      message.includes("unauthorized") ||
      message.includes("forbidden") ||
      message.includes("auth")
    ) {
      return "auth";
    }

    if (message.includes("rate limit") || message.includes("too many requests")) {
      return "rate-limit";
    }
  }

  return "internal";
}

export function startRequestTrace(
  request: NextRequest,
  endpoint: string
): RequestTraceContext {
  const incomingRequestId = request.headers.get("x-request-id")?.trim();
  const incomingCorrelationId = request.headers.get("x-correlation-id")?.trim();

  const requestId = incomingRequestId || randomId();
  const correlationId = incomingCorrelationId || requestId;

  return {
    requestId,
    correlationId,
    method: request.method,
    endpoint,
    path: safePathname(request.url),
    startedAtMs: nowMs(),
  };
}

export function recordApiMetric(
  endpoint: string,
  method: string,
  status: number,
  durationMs: number
) {
  const key = getMetricKey(endpoint, method);
  const bucket = metricsStore.get(key) ?? { total: 0, errors: 0, samples: [] };

  bucket.total += 1;
  if (status >= 400) {
    bucket.errors += 1;
  }

  bucket.samples.push({ durationMs, status, ts: nowMs() });
  if (bucket.samples.length > METRIC_SAMPLE_LIMIT) {
    bucket.samples = bucket.samples.slice(bucket.samples.length - METRIC_SAMPLE_LIMIT);
  }

  metricsStore.set(key, bucket);
}

export function completeRequestTrace(
  trace: RequestTraceContext,
  response: Response,
  details?: { error?: unknown; errorClass?: ErrorClass }
) {
  const durationMs = nowMs() - trace.startedAtMs;
  const status = response.status;
  const computedErrorClass = details?.errorClass ?? (status >= 400 ? classifyError(status) : undefined);

  recordApiMetric(trace.endpoint, trace.method, status, durationMs);

  response.headers.set("x-request-id", trace.requestId);
  response.headers.set("x-correlation-id", trace.correlationId);
  response.headers.set("x-response-time-ms", durationMs.toString());
  response.headers.set("server-timing", `app;dur=${durationMs}`);

  if (computedErrorClass) {
    response.headers.set("x-error-class", computedErrorClass);
  }

  const logPayload = {
    level: status >= 500 ? "error" : status >= 400 ? "warn" : "info",
    event: "api.request.completed",
    requestId: trace.requestId,
    correlationId: trace.correlationId,
    method: trace.method,
    endpoint: trace.endpoint,
    path: trace.path,
    status,
    durationMs,
    errorClass: computedErrorClass ?? null,
    timestamp: new Date().toISOString(),
    error: details?.error
      ? {
          message: details.error instanceof Error ? details.error.message : String(details.error),
        }
      : null,
  };

  const line = JSON.stringify(logPayload);
  if (status >= 500) {
    console.error(line);
  } else if (status >= 400) {
    console.warn(line);
  } else {
    console.info(line);
  }

  return response;
}

export function getMetricsSnapshot() {
  return Array.from(metricsStore.entries()).map(([key, bucket]) => {
    const durations = bucket.samples.map((s) => s.durationMs);
    const p95 = percentile(durations, 0.95);

    return {
      key,
      totalRequests: bucket.total,
      errorRequests: bucket.errors,
      errorRate: bucket.total > 0 ? bucket.errors / bucket.total : 0,
      p95LatencyMs: p95,
      recentCount: bucket.samples.length,
      lastUpdatedAt: bucket.samples[bucket.samples.length - 1]?.ts ?? null,
    };
  });
}
