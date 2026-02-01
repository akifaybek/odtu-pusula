"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Users,
  Calendar,
  Pencil,
  Trash2,
  ThumbsUp,
  GraduationCap,
  User,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

interface CourseReview {
  id: string;
  type: "course";
  semester: string;
  difficultyRating: number;
  workloadRating: number;
  usefulnessRating: number;
  overallRating: number;
  grade?: string | null;
  comment: string;
  isAnonymous: boolean;
  likes: number;
  createdAt: string;
  course: {
    id: string;
    code: string;
    name: string;
  };
  professor?: {
    id: string;
    name: string;
    title: string;
  } | null;
}

interface ProfessorReview {
  id: string;
  type: "professor";
  semester: string;
  teachingRating: number;
  gradingRating: number;
  accessRating: number;
  overallRating: number;
  comment: string;
  isAnonymous: boolean;
  wouldTakeAgain: boolean;
  likes: number;
  createdAt: string;
  professor: {
    id: string;
    name: string;
    title: string;
  };
  course?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

type Review = CourseReview | ProfessorReview;

interface UserReviewsListProps {
  reviews: Review[];
  onDelete?: (id: string, type: "course" | "professor") => void;
}

const gradeColors: Record<string, string> = {
  AA: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
  BA: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25",
  BB: "bg-lime-500/20 text-lime-600 border-lime-500/30",
  CB: "bg-lime-500/15 text-lime-600 border-lime-500/25",
  CC: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  DC: "bg-amber-500/20 text-amber-600 border-amber-500/30",
  DD: "bg-orange-500/20 text-orange-600 border-orange-500/30",
  FD: "bg-red-500/15 text-red-600 border-red-500/25",
  FF: "bg-red-500/20 text-red-600 border-red-500/30",
};

const titleLabels: Record<string, string> = {
  PROF_DR: "Prof. Dr.",
  ASSOC_PROF_DR: "Doç. Dr.",
  ASST_PROF_DR: "Dr. Öğr. Üyesi",
  LECTURER: "Öğr. Gör.",
  RES_ASST: "Araş. Gör.",
};

export function UserReviewsList({ reviews, onDelete }: UserReviewsListProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    review: Review | null;
  }>({ open: false, review: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteDialog.review || !onDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(deleteDialog.review.id, deleteDialog.review.type);
      toast.success("Değerlendirme silindi");
      setDeleteDialog({ open: false, review: null });
    } catch {
      toast.error("Değerlendirme silinemedi");
    } finally {
      setIsDeleting(false);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Henüz değerlendirme yapmadınız.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id} className="border">
            <CardContent className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      review.type === "course"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-green-100 text-green-600"
                    )}
                  >
                    {review.type === "course" ? (
                      <BookOpen className="h-5 w-5" />
                    ) : (
                      <Users className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    {review.type === "course" ? (
                      <>
                        <Link
                          href={`/dersler/${review.course.code}`}
                          className="font-semibold hover:text-primary transition-colors"
                        >
                          {review.course.code} - {review.course.name}
                        </Link>
                        {review.professor && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {titleLabels[review.professor.title]}{" "}
                            {review.professor.name}
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <Link
                          href={`/hocalar/${review.professor.id}`}
                          className="font-semibold hover:text-primary transition-colors"
                        >
                          {titleLabels[review.professor.title]}{" "}
                          {review.professor.name}
                        </Link>
                        {review.course && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {review.course.code}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {review.type === "course" && review.grade && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-bold",
                        gradeColors[review.grade] || ""
                      )}
                    >
                      {review.grade}
                    </Badge>
                  )}
                  {review.type === "professor" && (
                    <Badge
                      variant="outline"
                      className={cn(
                        review.wouldTakeAgain
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-red-100 text-red-700 border-red-300"
                      )}
                    >
                      {review.wouldTakeAgain ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <X className="h-3 w-3 mr-1" />
                      )}
                      Tekrar Alır
                    </Badge>
                  )}
                </div>
              </div>

              {/* Ratings */}
              <div className="flex flex-wrap gap-2 mb-4">
                {review.type === "course" ? (
                  <>
                    <RatingBadge label="Zorluk" value={review.difficultyRating} inverted />
                    <RatingBadge label="Yük" value={review.workloadRating} inverted />
                    <RatingBadge label="Fayda" value={review.usefulnessRating} />
                    <RatingBadge label="Genel" value={review.overallRating} />
                  </>
                ) : (
                  <>
                    <RatingBadge label="Anlatım" value={review.teachingRating} />
                    <RatingBadge label="Notlandırma" value={review.gradingRating} />
                    <RatingBadge label="Ulaşılabilirlik" value={review.accessRating} />
                    <RatingBadge label="Genel" value={review.overallRating} />
                  </>
                )}
              </div>

              {/* Comment */}
              <p className="text-foreground/90 leading-relaxed mb-4">
                {review.comment}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {review.semester}
                  </span>
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="h-3 w-3" />
                    {review.likes} beğeni
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {review.isAnonymous ? "Anonim" : "Açık"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="gap-1" disabled>
                    <Pencil className="h-4 w-4" />
                    Düzenle
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 text-destructive hover:text-destructive"
                    onClick={() => setDeleteDialog({ open: true, review })}
                  >
                    <Trash2 className="h-4 w-4" />
                    Sil
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, review: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Değerlendirmeyi Sil</DialogTitle>
            <DialogDescription>
              Bu değerlendirmeyi silmek istediğinizden emin misiniz? Bu işlem
              geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, review: null })}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Siliniyor..." : "Sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function RatingBadge({
  label,
  value,
  inverted = false,
}: {
  label: string;
  value: number;
  inverted?: boolean;
}) {
  const getColor = () => {
    if (inverted) {
      return value > 3.5
        ? "text-red-600"
        : value > 2.5
        ? "text-amber-600"
        : "text-emerald-600";
    }
    return value > 3.5
      ? "text-emerald-600"
      : value > 2.5
      ? "text-amber-600"
      : "text-red-600";
  };

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-semibold", getColor())}>{value.toFixed(1)}</span>
    </div>
  );
}
