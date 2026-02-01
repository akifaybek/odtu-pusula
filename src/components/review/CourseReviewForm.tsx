"use client";

import { useState } from "react";
import { X, Loader2, Send, Eye, EyeOff } from "lucide-react";
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

const MIN_COMMENT_LENGTH = 50;

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

  const commentLength = formData.comment?.length || 0;
  const isCommentValid = commentLength >= MIN_COMMENT_LENGTH;

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
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData as CourseReviewData);
    } catch {
      setErrors({ submit: "Bir hata oluştu. Tekrar dene." });
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
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
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
                  onValueChange={(value) =>
                    setFormData({ ...formData, professorId: value })
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "bg-background",
                      errors.professorId && "border-destructive"
                    )}
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
                  onValueChange={(value) =>
                    setFormData({ ...formData, semester: value })
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "bg-background",
                      errors.semester && "border-destructive"
                    )}
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
                onChange={(value) =>
                  setFormData({ ...formData, difficulty: value })
                }
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
                onChange={(value) =>
                  setFormData({ ...formData, workload: value })
                }
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
                onChange={(value) =>
                  setFormData({ ...formData, usefulness: value })
                }
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
                onChange={(value) =>
                  setFormData({ ...formData, overall: value })
                }
                size="xl"
                required
              />
              {errors.overall && (
                <p className="text-xs text-destructive mt-2">{errors.overall}</p>
              )}
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
                placeholder="Dersi düşünenlere ne söylemek istersin? En az 50 karakter..."
                value={formData.comment || ""}
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
                className={cn(
                  "min-h-[120px] bg-background resize-none",
                  errors.comment && "border-destructive"
                )}
              />
              <div className="flex items-center justify-between">
                {errors.comment && (
                  <p className="text-xs text-destructive">{errors.comment}</p>
                )}
                <span
                  className={cn(
                    "text-xs ml-auto",
                    isCommentValid ? "text-muted-foreground" : "text-destructive"
                  )}
                >
                  {commentLength}/{MIN_COMMENT_LENGTH}
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
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  Anonim paylaş
                </Label>
                <p className="text-xs text-muted-foreground">
                  İsmin görünmez ama ODTÜ&apos;lü olduğun belli olur
                </p>
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
                {errors.submit}
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-border/50 bg-muted/20">
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Vazgeç
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
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
