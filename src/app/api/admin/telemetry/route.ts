import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import {
  classifyThrownError,
  completeRequestTrace,
  getMetricsSnapshot,
  startRequestTrace,
} from "@/lib/observability";

export async function GET(request: NextRequest) {
  const trace = startRequestTrace(request, "/api/admin/telemetry");

  try {
    const { error } = await requireAdmin();
    if (error) {
      return completeRequestTrace(trace, error, { errorClass: "auth" });
    }

    return completeRequestTrace(
      trace,
      NextResponse.json({
        generatedAt: new Date().toISOString(),
        metrics: getMetricsSnapshot(),
      })
    );
  } catch (error) {
    const response = NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });

    return completeRequestTrace(trace, response, {
      error,
      errorClass: classifyThrownError(error),
    });
  }
}
