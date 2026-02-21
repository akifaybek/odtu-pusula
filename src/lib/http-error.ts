export interface ApiErrorResponse {
  errorCode?: string;
  message?: string;
  error?: string;
  context?: Record<string, unknown>;
}

interface ApiClientErrorOptions {
  status?: number;
  errorCode?: string;
  context?: Record<string, unknown>;
  isNetworkError?: boolean;
  retryable?: boolean;
}

export class ApiClientError extends Error {
  status: number;
  errorCode?: string;
  context: Record<string, unknown>;
  isNetworkError: boolean;
  retryable: boolean;

  constructor(message: string, options: ApiClientErrorOptions = {}) {
    super(message);
    this.name = "ApiClientError";
    this.status = options.status ?? 0;
    this.errorCode = options.errorCode;
    this.context = options.context ?? {};
    this.isNetworkError = options.isNetworkError ?? false;
    this.retryable = options.retryable ?? false;
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}

export async function toApiClientErrorFromResponse(
  response: Response,
  fallbackMessage: string
): Promise<ApiClientError> {
  let payload: ApiErrorResponse | null = null;

  try {
    payload = (await response.json()) as ApiErrorResponse;
  } catch {
    payload = null;
  }

  const message = payload?.message || payload?.error || fallbackMessage;
  const errorCode = payload?.errorCode;
  const context = payload?.context ?? {};
  const retryable = response.status >= 500 || response.status === 429;

  return new ApiClientError(message, {
    status: response.status,
    errorCode,
    context,
    retryable,
  });
}

export function toApiClientError(error: unknown, fallbackMessage: string): ApiClientError {
  if (isApiClientError(error)) {
    return error;
  }

  if (error instanceof TypeError) {
    return new ApiClientError("İnternet bağlantısı kurulamadı. Lütfen bağlantını kontrol et.", {
      errorCode: "NETWORK_ERROR",
      isNetworkError: true,
      retryable: true,
    });
  }

  if (error instanceof Error) {
    return new ApiClientError(error.message || fallbackMessage, {
      retryable: false,
    });
  }

  return new ApiClientError(fallbackMessage, {
    retryable: false,
  });
}
