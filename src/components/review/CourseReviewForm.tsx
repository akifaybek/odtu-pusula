"use client";

import { useRef, useState } from "react";
import { X, Loader2, Send, Eye, EyeOff, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import RatingSlider, {
  difficultyOptions,
  workloadOptions,
  usefulnessOptions,
} from "./RatingSlider";
import StarRating from "./StarRating";
import { cn } from "@/lib/utils";
import { findFirstErrorField, mapReviewSubmitErrorToForm } from "@/lib/review-form-errors";

interface CourseReviewFormProps {
  courseCode: string;
  courseName: string;
  professors: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSubmit: (data: CourseReviewData) => Promise<void>;
}

export interface CourseReviewData {
  professorId: string;
  semester: string;
  difficulty: number;
  workload: number;
  usefulness: number;
  overall: number;
  wouldRecommend?: boolean;
  grade?: string;
  comment: string;
  anonymous: boolean;
}

// Dönem seçenekleri (veritabanı formatına uygun)
const semesters = [
  { value: "2024-2025 Guz", label: "2024-25 Güz" },
  { value: "2024-2025 Bahar", label: "2024-25 Bahar" },
  { value: "2023-2024 Guz", label: "2023-24 Güz" },
  { value: "2023-2024 Bahar", label: "2023-24 Bahar" },
  { value: "2022-2023 Guz", label: "2022-23 Güz" },
  { value: "2022-2023 Bahar", label: "2022-23 Bahar" },
];

// Not seçenekleri
const grades = [
  { value: "AA", label: "AA" },
  { value: "BA", label: "BA" },
  { value: "BB", label: "BB" },
  { value: "CB", label: "CB" },
  { value: "CC", label: "CC" },
  { value: "DC", label: "DC" },
  { value: "DD", label: "DD" },
  { value: "FD", label: "FD" },
  { value: "FF", label: "FF" },
  { value: "W", label: "W (Çekildi)" },
  { value: "S", label: "S (Devam ediyor)" },
];

const MIN_COMMENT_LENGTH = 15;

export default function CourseReviewForm({
  courseCode,
  courseName,
  professors,
  onClose,
  onSubmit,
}: CourseReviewFormProps) {
  const [formData, setFormData] = useState<Partial<CourseReviewData>>({
    anonymous: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [canRetry, setCanRetry] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");

  const formRef = useRef<HTMLFormElement | null>(null);
  const professorTriggerRef = useRef<HTMLButtonElement | null>(null);
  const semesterTriggerRef = useRef<HTMLButtonElement | null>(null);
  const commentRef = useRef<HTMLTextAreaElement | null>(null);
  const submitRef = useRef<HTMLButtonElement | null>(null);

  const commentLength = formData.comment?.length || 0;
  const isCommentValid = commentLength >= MIN_COMMENT_LENGTH;

  const focusField = (field: string) => {
    const fieldRefs: Record<string, HTMLElement | null> = {
      professorId: professorTriggerRef.current,
      semester: semesterTriggerRef.current,
      comment: commentRef.current,
      submit: submitRef.current,
    };

    fieldRefs[field]?.focus();
  };

  const clearFieldError = (field: string) => {
    if (!errors[field] && !errors.submit) {
      return;
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      delete next.submit;
      return next;
    });
    setLiveMessage("");
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.professorId) {
      newErrors.professorId = "Hoca seçmelisin";
    }
    if (!formData.semester) {
      newErrors.semester = "Dönem seçmelisin";
    }
    if (!formData.difficulty) {
      newErrors.difficulty = "Zorluk puanı ver";
    }
    if (!formData.workload) {
      newErrors.workload = "İş yükü puanı ver";
    }
    if (!formData.usefulness) {
      newErrors.usefulness = "Fayda puanı ver";
    }
    if (!formData.overall || formData.overall === 0) {
      newErrors.overall = "Genel puan ver";
    }
    if (!formData.comment || formData.comment.length < MIN_COMMENT_LENGTH) {
      newErrors.comment = `En az ${MIN_COMMENT_LENGTH} karakter yazmalısın`;
    }

    setErrors(newErrors);
    setCanRetry(false);

    const firstField = findFirstErrorField(newErrors, [
      "professorId",
      "semester",
      "difficulty",
      "workload",
      "usefulness",
      "overall",
      "comment",
    ]);

    if (firstField) {
      setLiveMessage("Formda düzeltilmesi gereken alanlar var.");
      requestAnimationFrame(() => focusField(firstField));
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setCanRetry(false);
    setLiveMessage("");

    try {
      await onSubmit(formData as CourseReviewData);
    } catch (error) {
      const mapped = mapReviewSubmitErrorToForm(error, "course");
      const nextErrors = {
        ...mapped.fieldErrors,
        submit: mapped.submitMessage,
      };
      setErrors(nextErrors);
      setCanRetry(mapped.retryable);
      setLiveMessage(mapped.submitMessage);

      const firstField = findFirstErrorField(nextErrors, [
        "professorId",
        "semester",
        "difficulty",
        "workload",
        "usefulness",
        "overall",
        "comment",
        "submit",
      ]);

      if (firstField) {
        requestAnimationFrame(() => focusField(firstField));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Deneyimini Paylaş
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {courseCode} - {courseName}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Hoca ve Dönem */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Hangi hocadan aldın?
                  <span className="text-primary ml-1">*</span>
                </Label>
                <Select
                  value={formData.professorId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, professorId: value });
                    clearFieldError("professorId");
                  }}
                >
                  <SelectTrigger
                    ref={professorTriggerRef}
                    className={cn(
                      "bg-background",
                      errors.professorId && "border-destructive"
                    )}
                    aria-invalid={Boolean(errors.professorId)}
                  >
                    <SelectValue placeholder="Hoca seç..." />
                  </SelectTrigger>
                  <SelectContent>
                    {professors.map((prof) => (
                      <SelectItem key={prof.id} value={prof.id}>
                        {prof.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.professorId && (
                  <p className="text-xs text-destructive">{errors.professorId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Hangi dönem?
                  <span className="text-primary ml-1">*</span>
                </Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => {
                    setFormData({ ...formData, semester: value });
                    clearFieldError("semester");
                  }}
                >
                  <SelectTrigger
                    ref={semesterTriggerRef}
                    className={cn(
                      "bg-background",
                      errors.semester && "border-destructive"
                    )}
                    aria-invalid={Boolean(errors.semester)}
                  >
                    <SelectValue placeholder="Dönem seç..." />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((sem) => (
                      <SelectItem key={sem.value} value={sem.value}>
                        {sem.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.semester && (
                  <p className="text-xs text-destructive">{errors.semester}</p>
                )}
              </div>
            </div>

            {/* Zorluk */}
            <div>
              <RatingSlider
                label="Zorluk nasıldı?"
                options={difficultyOptions}
                value={formData.difficulty || null}
                onChange={(value) => {
                  setFormData({ ...formData, difficulty: value });
                  clearFieldError("difficulty");
                }}
                required
              />
              {errors.difficulty && (
                <p className="text-xs text-destructive mt-1">{errors.difficulty}</p>
              )}
            </div>

            {/* İş Yükü */}
            <div>
              <RatingSlider
                label="İş yükü nasıldı?"
                options={workloadOptions}
                value={formData.workload || null}
                onChange={(value) => {
                  setFormData({ ...formData, workload: value });
                  clearFieldError("workload");
                }}
                required
              />
              {errors.workload && (
                <p className="text-xs text-destructive mt-1">{errors.workload}</p>
              )}
            </div>

            {/* Fayda */}
            <div>
              <RatingSlider
                label="Faydalı mıydı?"
                options={usefulnessOptions}
                value={formData.usefulness || null}
                onChange={(value) => {
                  setFormData({ ...formData, usefulness: value });
                  clearFieldError("usefulness");
                }}
                required
              />
              {errors.usefulness && (
                <p className="text-xs text-destructive mt-1">{errors.usefulness}</p>
              )}
            </div>

            {/* Genel Puan */}
            <div className="p-4 bg-muted/30 rounded-xl">
              <StarRating
                label="Genel puanın?"
                value={formData.overall || 0}
                onChange={(value) => {
                  setFormData({ ...formData, overall: value });
                  clearFieldError("overall");
                }}
                size="xl"
                required
              />
              {errors.overall && (
                <p className="text-xs text-destructive mt-2">{errors.overall}</p>
              )}
            </div>

            {/* Tavsiye Eder misin? */}
            <div className="space-y-2">
              <Label>
                Bu dersi arkadaşlarına tavsiye eder misin?
              </Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, wouldRecommend: true })}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                    formData.wouldRecommend === true
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                      : "border-border bg-background hover:border-emerald-300 text-muted-foreground"
                  )}
                >
                  <ThumbsUp className="h-5 w-5" />
                  <span className="font-medium">Evet</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, wouldRecommend: false })}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all",
                    formData.wouldRecommend === false
                      ? "border-red-500 bg-red-50 dark:bg-red-500/20 text-red-700 dark:text-red-400"
                      : "border-border bg-background hover:border-red-300 text-muted-foreground"
                  )}
                >
                  <ThumbsDown className="h-5 w-5" />
                  <span className="font-medium">Hayır</span>
                </button>
              </div>
            </div>

            {/* Not (Opsiyonel) */}
            <div className="space-y-2">
              <Label className="text-muted-foreground">
                Notun ne oldu? (opsiyonel)
              </Label>
              <Select
                value={formData.grade}
                onValueChange={(value) =>
                  setFormData({ ...formData, grade: value })
                }
              >
                <SelectTrigger className="bg-background w-full sm:w-48">
                  <SelectValue placeholder="Not seç..." />
                </SelectTrigger>
                <SelectContent>
                  {grades.map((grade) => (
                    <SelectItem key={grade.value} value={grade.value}>
                      {grade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Yorum */}
            <div className="space-y-2">
              <Label>
                Yorumun:
                <span className="text-primary ml-1">*</span>
              </Label>
              <Textarea
                placeholder="Dersi düşünenlere ne söylemek istersin?"
                value={formData.comment || ""}
                onChange={(e) => {
                  setFormData({ ...formData, comment: e.target.value });
                  clearFieldError("comment");
                }}
                ref={commentRef}
                className={cn(
                  "min-h-[120px] bg-background resize-none",
                  errors.comment && "border-destructive"
                )}
                aria-invalid={Boolean(errors.comment)}
                aria-describedby={errors.comment ? "course-comment-error" : undefined}
              />
              <div className="flex items-center justify-between">
                {errors.comment && (
                  <p id="course-comment-error" className="text-xs text-destructive">{errors.comment}</p>
                )}
                <span
                  className={cn(
                    "text-xs ml-auto",
                    isCommentValid ? "text-emerald-600" : "text-muted-foreground"
                  )}
                >
                  {commentLength} karakter {!isCommentValid && `(min ${MIN_COMMENT_LENGTH})`}
                </span>
              </div>
            </div>

            {/* Anonim */}
            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-xl">
              <Checkbox
                id="anonymous"
                checked={formData.anonymous}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, anonymous: checked as boolean })
                }
              />
              <div className="space-y-1">
                <Label
                  htmlFor="anonymous"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {formData.anonymous ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-primary" />
                  )}
                  {formData.anonymous ? "Anonim paylaş" : "İsmimle paylaş"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {formData.anonymous
                    ? "İsmin gizli kalır, \"Anonim Yolcu\" olarak görünürsün"
                    : "İsmin değerlendirmede görünür, diğer öğrenciler seni tanıyabilir"}
                </p>
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div
                id="course-submit-error"
                role="alert"
                aria-live="assertive"
                className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive"
              >
                <p>{errors.submit}</p>
                {canRetry && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => formRef.current?.requestSubmit()}
                    disabled={isSubmitting}
                  >
                    Tekrar Dene
                  </Button>
                )}
              </div>
            )}
            <p aria-live="polite" className="sr-only">{liveMessage}</p>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-border/50 bg-muted/20">
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Vazgeç
            </Button>
            <Button
              ref={submitRef}
              onClick={handleSubmit}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Gönder
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
