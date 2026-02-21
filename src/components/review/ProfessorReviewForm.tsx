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
  teachingOptions,
  gradingOptions,
  accessibilityOptions,
} from "./RatingSlider";
import StarRating from "./StarRating";
import { cn } from "@/lib/utils";
import { findFirstErrorField, mapReviewSubmitErrorToForm } from "@/lib/review-form-errors";

interface ProfessorReviewFormProps {
  professorId: string;
  professorName: string;
  courses: Array<{ id: string; code: string; name: string }>;
  onClose: () => void;
  onSubmit: (data: ProfessorReviewData) => Promise<void>;
}

export interface ProfessorReviewData {
  courseId: string;
  semester: string;
  teaching: number;
  grading: number;
  accessibility: number;
  overall: number;
  wouldTakeAgain: boolean;
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

const MIN_COMMENT_LENGTH = 15;

export default function ProfessorReviewForm({
  professorName,
  courses,
  onClose,
  onSubmit,
}: ProfessorReviewFormProps) {
  const [formData, setFormData] = useState<Partial<ProfessorReviewData>>({
    anonymous: true,
    wouldTakeAgain: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [canRetry, setCanRetry] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");

  const formRef = useRef<HTMLFormElement | null>(null);
  const courseTriggerRef = useRef<HTMLButtonElement | null>(null);
  const semesterTriggerRef = useRef<HTMLButtonElement | null>(null);
  const commentRef = useRef<HTMLTextAreaElement | null>(null);
  const submitRef = useRef<HTMLButtonElement | null>(null);

  const commentLength = formData.comment?.length || 0;
  const isCommentValid = commentLength >= MIN_COMMENT_LENGTH;

  const focusField = (field: string) => {
    const fieldRefs: Record<string, HTMLElement | null> = {
      courseId: courseTriggerRef.current,
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

    if (!formData.courseId) {
      newErrors.courseId = "Ders seçmelisin";
    }
    if (!formData.semester) {
      newErrors.semester = "Dönem seçmelisin";
    }
    if (!formData.teaching) {
      newErrors.teaching = "Anlatım puanı ver";
    }
    if (!formData.grading) {
      newErrors.grading = "Notlandırma puanı ver";
    }
    if (!formData.accessibility) {
      newErrors.accessibility = "Ulaşılabilirlik puanı ver";
    }
    if (!formData.overall || formData.overall === 0) {
      newErrors.overall = "Genel puan ver";
    }
    if (formData.wouldTakeAgain === undefined) {
      newErrors.wouldTakeAgain = "Tekrar alır mıydın seç";
    }
    if (!formData.comment || formData.comment.length < MIN_COMMENT_LENGTH) {
      newErrors.comment = `En az ${MIN_COMMENT_LENGTH} karakter yazmalısın`;
    }

    setErrors(newErrors);
    setCanRetry(false);

    const firstField = findFirstErrorField(newErrors, [
      "courseId",
      "semester",
      "teaching",
      "grading",
      "accessibility",
      "overall",
      "wouldTakeAgain",
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
      await onSubmit(formData as ProfessorReviewData);
    } catch (error) {
      const mapped = mapReviewSubmitErrorToForm(error, "professor");
      const nextErrors = {
        ...mapped.fieldErrors,
        submit: mapped.submitMessage,
      };

      setErrors(nextErrors);
      setCanRetry(mapped.retryable);
      setLiveMessage(mapped.submitMessage);

      const firstField = findFirstErrorField(nextErrors, [
        "courseId",
        "semester",
        "teaching",
        "grading",
        "accessibility",
        "overall",
        "wouldTakeAgain",
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
              Rotanı Anlat
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {professorName} hakkında değerlendirme
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
            {/* Ders ve Dönem */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Hangi dersten aldın?
                  <span className="text-primary ml-1">*</span>
                </Label>
                <Select
                  value={formData.courseId}
                  onValueChange={(value) => {
                    setFormData({ ...formData, courseId: value });
                    clearFieldError("courseId");
                  }}
                >
                  <SelectTrigger
                    ref={courseTriggerRef}
                    className={cn(
                      "bg-background",
                      errors.courseId && "border-destructive"
                    )}
                    aria-invalid={Boolean(errors.courseId)}
                  >
                    <SelectValue placeholder="Ders seç..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.courseId && (
                  <p className="text-xs text-destructive">{errors.courseId}</p>
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

            {/* Anlatım */}
            <div>
              <RatingSlider
                label="Nasıl anlatıyor?"
                options={teachingOptions}
                value={formData.teaching || null}
                onChange={(value) => {
                  setFormData({ ...formData, teaching: value });
                  clearFieldError("teaching");
                }}
                required
              />
              {errors.teaching && (
                <p className="text-xs text-destructive mt-1">{errors.teaching}</p>
              )}
            </div>

            {/* Notlandırma */}
            <div>
              <RatingSlider
                label="Notlandırması adil mi?"
                options={gradingOptions}
                value={formData.grading || null}
                onChange={(value) => {
                  setFormData({ ...formData, grading: value });
                  clearFieldError("grading");
                }}
                required
              />
              {errors.grading && (
                <p className="text-xs text-destructive mt-1">{errors.grading}</p>
              )}
            </div>

            {/* Ulaşılabilirlik */}
            <div>
              <RatingSlider
                label="Ulaşılabilir mi? (mail, ofis saati)"
                options={accessibilityOptions}
                value={formData.accessibility || null}
                onChange={(value) => {
                  setFormData({ ...formData, accessibility: value });
                  clearFieldError("accessibility");
                }}
                required
              />
              {errors.accessibility && (
                <p className="text-xs text-destructive mt-1">{errors.accessibility}</p>
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

            {/* Tekrar Alır mıydın? */}
            <div className="space-y-3">
              <Label>
                Tekrar alır mıydın?
                <span className="text-primary ml-1">*</span>
              </Label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, wouldTakeAgain: true });
                    clearFieldError("wouldTakeAgain");
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl border-2 transition-all",
                    formData.wouldTakeAgain === true
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-border/50 bg-card hover:border-emerald-300 hover:bg-emerald-50/50"
                  )}
                >
                  <ThumbsUp
                    className={cn(
                      "h-6 w-6",
                      formData.wouldTakeAgain === true
                        ? "text-emerald-600"
                        : "text-muted-foreground"
                    )}
                  />
                  <span className="font-semibold text-lg">EVET</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, wouldTakeAgain: false });
                    clearFieldError("wouldTakeAgain");
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl border-2 transition-all",
                    formData.wouldTakeAgain === false
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-border/50 bg-card hover:border-red-300 hover:bg-red-50/50"
                  )}
                >
                  <ThumbsDown
                    className={cn(
                      "h-6 w-6",
                      formData.wouldTakeAgain === false
                        ? "text-red-600"
                        : "text-muted-foreground"
                    )}
                  />
                  <span className="font-semibold text-lg">HAYIR</span>
                </button>
              </div>
              {errors.wouldTakeAgain && (
                <p className="text-xs text-destructive">{errors.wouldTakeAgain}</p>
              )}
            </div>

            {/* Yorum */}
            <div className="space-y-2">
              <Label>
                Yorumun:
                <span className="text-primary ml-1">*</span>
              </Label>
              <Textarea
                placeholder="Bu hoca hakkında ne söylemek istersin?"
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
                aria-describedby={errors.comment ? "prof-comment-error" : undefined}
              />
              <div className="flex items-center justify-between">
                {errors.comment && (
                  <p id="prof-comment-error" className="text-xs text-destructive">{errors.comment}</p>
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
                id="anonymous-prof"
                checked={formData.anonymous}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, anonymous: checked as boolean })
                }
              />
              <div className="space-y-1">
                <Label
                  htmlFor="anonymous-prof"
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
                id="prof-submit-error"
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
