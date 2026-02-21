import { ApiClientError, isApiClientError } from "@/lib/http-error";

export type FormErrorMap = Record<string, string>;

type ReviewFormType = "course" | "professor";

const baseNetworkMessage = "Bağlantı sorunu nedeniyle gönderilemedi. İnternetini kontrol edip tekrar dene.";

const courseFieldMap: Record<string, string> = {
  professorId: "professorId",
  semester: "semester",
  difficultyRating: "difficulty",
  workloadRating: "workload",
  usefulnessRating: "usefulness",
  overallRating: "overall",
  comment: "comment",
  grade: "grade",
};

const professorFieldMap: Record<string, string> = {
  courseId: "courseId",
  semester: "semester",
  teachingRating: "teaching",
  gradingRating: "grading",
  accessRating: "accessibility",
  overallRating: "overall",
  wouldTakeAgain: "wouldTakeAgain",
  comment: "comment",
};

function normalizeFieldErrors(
  context: Record<string, unknown> | undefined,
  formType: ReviewFormType
): FormErrorMap {
  const source = context?.fieldErrors;
  if (!source || typeof source !== "object") {
    return {};
  }

  const mapped: FormErrorMap = {};
  const fieldMap = formType === "course" ? courseFieldMap : professorFieldMap;

  Object.entries(source as Record<string, unknown>).forEach(([key, value]) => {
    const uiField = fieldMap[key] ?? key;
    if (typeof value === "string" && value.trim()) {
      mapped[uiField] = value;
    }
  });

  return mapped;
}

export function mapReviewSubmitErrorToForm(
  error: unknown,
  formType: ReviewFormType
): { fieldErrors: FormErrorMap; submitMessage: string; retryable: boolean } {
  if (!isApiClientError(error)) {
    return {
      fieldErrors: {},
      submitMessage: "İşlem sırasında beklenmeyen bir hata oluştu. Lütfen tekrar dene.",
      retryable: true,
    };
  }

  const apiError = error as ApiClientError;

  if (apiError.isNetworkError || apiError.errorCode === "NETWORK_ERROR") {
    return {
      fieldErrors: {},
      submitMessage: baseNetworkMessage,
      retryable: true,
    };
  }

  if (apiError.errorCode === "VALIDATION_ERROR") {
    const fieldErrors = normalizeFieldErrors(apiError.context, formType);
    return {
      fieldErrors,
      submitMessage:
        Object.keys(fieldErrors).length > 0
          ? "Bazı alanları düzeltmen gerekiyor. Hatalı alanları kontrol et."
          : apiError.message,
      retryable: false,
    };
  }

  if (apiError.errorCode === "CONFLICT") {
    return {
      fieldErrors: { semester: apiError.message },
      submitMessage: "Aynı dönem için birden fazla değerlendirme gönderemezsin.",
      retryable: false,
    };
  }

  if (apiError.errorCode === "RATE_LIMITED") {
    return {
      fieldErrors: {},
      submitMessage: "Kısa sürede çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.",
      retryable: true,
    };
  }

  if (apiError.errorCode === "UNAUTHORIZED") {
    return {
      fieldErrors: {},
      submitMessage: "Değerlendirme göndermek için yeniden giriş yapmalısın.",
      retryable: false,
    };
  }

  return {
    fieldErrors: {},
    submitMessage: apiError.message || "Değerlendirme gönderilemedi. Lütfen tekrar dene.",
    retryable: apiError.retryable,
  };
}

export function findFirstErrorField(errors: FormErrorMap, order: string[]): string | null {
  for (const field of order) {
    if (errors[field]) {
      return field;
    }
  }

  return errors.submit ? "submit" : null;
}
