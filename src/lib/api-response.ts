import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export function errorResponse(
  status: number,
  errorCode: ApiErrorCode,
  message: string,
  context?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      error: message,
      errorCode,
      message,
      context: context ?? {},
    },
    { status }
  );
}
