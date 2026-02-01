"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import StarRating from "@/components/review/StarRating";

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

interface UserReviewsListWithEditProps {
  reviews: Review[];
  onDelete?: (id: string, type: "course" | "professor") => Promise<void>;
  onUpdate?: (
    id: string,
    type: "course" | "professor",
    data: Record<string, unknown>
  ) => Promise<void>;
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

export function UserReviewsListWithEdit({
  reviews,
  onDelete,
  onUpdate,
}: UserReviewsListWithEditProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    review: Review | null;
  }>({ open: false, review: null });
  const [editSheet, setEditSheet] = useState<{
    open: boolean;
    review: Review | null;
  }>({ open: false, review: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editData, setEditData] = useState<Record<string, unknown>>({});

  const handleOpenEdit = (review: Review) => {
    // Initialize edit data with current values
    if (review.type === "course") {
      setEditData({
        difficultyRating: review.difficultyRating,
        workloadRating: review.workloadRating,
        usefulnessRating: review.usefulnessRating,
        overallRating: review.overallRating,
        comment: review.comment,
        isAnonymous: review.isAnonymous,
      });
    } else {
      setEditData({
        teachingRating: review.teachingRating,
        gradingRating: review.gradingRating,
        accessRating: review.accessRating,
        overallRating: review.overallRating,
        comment: review.comment,
        wouldTakeAgain: review.wouldTakeAgain,
        isAnonymous: review.isAnonymous,
      });
    }
    setEditSheet({ open: true, review });
  };

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

  const handleUpdate = async () => {
    if (!editSheet.review || !onUpdate) return;

    // Validate comment length
    const comment = editData.comment as string;
    if (!comment || comment.length < 50) {
      toast.error("Yorum en az 50 karakter olmalıdır");
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdate(editSheet.review.id, editSheet.review.type, editData);
      toast.success("Değerlendirme güncellendi");
      setEditSheet({ open: false, review: null });
    } catch {
      toast.error("Değerlendirme güncellenemedi");
    } finally {
      setIsUpdating(false);
    }
  };

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
                    <RatingBadge
                      label="Zorluk"
                      value={review.difficultyRating}
                      inverted
                    />
                    <RatingBadge
                      label="Yük"
                      value={review.workloadRating}
                      inverted
                    />
                    <RatingBadge label="Fayda" value={review.usefulnessRating} />
                    <RatingBadge label="Genel" value={review.overallRating} />
                  </>
                ) : (
                  <>
                    <RatingBadge label="Anlatım" value={review.teachingRating} />
                    <RatingBadge
                      label="Notlandırma"
                      value={review.gradingRating}
                    />
                    <RatingBadge
                      label="Ulaşılabilirlik"
                      value={review.accessRating}
                    />
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => handleOpenEdit(review)}
                  >
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
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                "Sil"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Sheet */}
      <Sheet
        open={editSheet.open}
        onOpenChange={(open) => setEditSheet({ open, review: null })}
      >
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Değerlendirmeyi Düzenle</SheetTitle>
            <SheetDescription>
              {editSheet.review?.type === "course"
                ? `${(editSheet.review as CourseReview)?.course?.code} - ${
                    (editSheet.review as CourseReview)?.course?.name
                  }`
                : `${titleLabels[(editSheet.review as ProfessorReview)?.professor?.title || ""]} ${
                    (editSheet.review as ProfessorReview)?.professor?.name
                  }`}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {editSheet.review?.type === "course" ? (
              <>
                {/* Course Review Edit */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Zorluk (1-5)</Label>
                    <div className="mt-2">
                      <StarRating
                        value={(editData.difficultyRating as number) || 1}
                        onChange={(v) =>
                          setEditData({ ...editData, difficultyRating: v })
                        }
                        size="md"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">İş Yükü (1-5)</Label>
                    <div className="mt-2">
                      <StarRating
                        value={(editData.workloadRating as number) || 1}
                        onChange={(v) =>
                          setEditData({ ...editData, workloadRating: v })
                        }
                        size="md"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Fayda (1-5)</Label>
                    <div className="mt-2">
                      <StarRating
                        value={(editData.usefulnessRating as number) || 1}
                        onChange={(v) =>
                          setEditData({ ...editData, usefulnessRating: v })
                        }
                        size="md"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Genel (1-5)</Label>
                    <div className="mt-2">
                      <StarRating
                        value={(editData.overallRating as number) || 1}
                        onChange={(v) =>
                          setEditData({ ...editData, overallRating: v })
                        }
                        size="md"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Professor Review Edit */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Anlatım (1-5)</Label>
                    <div className="mt-2">
                      <StarRating
                        value={(editData.teachingRating as number) || 1}
                        onChange={(v) =>
                          setEditData({ ...editData, teachingRating: v })
                        }
                        size="md"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Notlandırma (1-5)
                    </Label>
                    <div className="mt-2">
                      <StarRating
                        value={(editData.gradingRating as number) || 1}
                        onChange={(v) =>
                          setEditData({ ...editData, gradingRating: v })
                        }
                        size="md"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Ulaşılabilirlik (1-5)
                    </Label>
                    <div className="mt-2">
                      <StarRating
                        value={(editData.accessRating as number) || 1}
                        onChange={(v) =>
                          setEditData({ ...editData, accessRating: v })
                        }
                        size="md"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Genel (1-5)</Label>
                    <div className="mt-2">
                      <StarRating
                        value={(editData.overallRating as number) || 1}
                        onChange={(v) =>
                          setEditData({ ...editData, overallRating: v })
                        }
                        size="md"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="wouldTakeAgain"
                      checked={(editData.wouldTakeAgain as boolean) || false}
                      onCheckedChange={(checked) =>
                        setEditData({ ...editData, wouldTakeAgain: checked })
                      }
                    />
                    <Label htmlFor="wouldTakeAgain" className="cursor-pointer">
                      Bu hocadan tekrar ders alırım
                    </Label>
                  </div>
                </div>
              </>
            )}

            {/* Common fields */}
            <div className="space-y-2">
              <Label>Yorum</Label>
              <Textarea
                value={(editData.comment as string) || ""}
                onChange={(e) =>
                  setEditData({ ...editData, comment: e.target.value })
                }
                className="min-h-[120px]"
                placeholder="En az 50 karakter..."
              />
              <p className="text-xs text-muted-foreground text-right">
                {((editData.comment as string) || "").length}/50
              </p>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <Checkbox
                id="isAnonymous"
                checked={(editData.isAnonymous as boolean) || false}
                onCheckedChange={(checked) =>
                  setEditData({ ...editData, isAnonymous: checked })
                }
              />
              <div>
                <Label htmlFor="isAnonymous" className="flex items-center gap-2 cursor-pointer">
                  {editData.isAnonymous ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  Anonim paylaş
                </Label>
                <p className="text-xs text-muted-foreground">
                  İsminiz görünmez ama ODTÜ&apos;lü olduğunuz belli olur
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setEditSheet({ open: false, review: null })}
              >
                İptal
              </Button>
              <Button
                className="flex-1"
                onClick={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  "Kaydet"
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
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
