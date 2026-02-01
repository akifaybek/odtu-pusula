"use client";

import { useState } from "react";
import { Heart, Calendar, User, BookOpen, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface ProfessorReviewCardProps {
  id: string;
  username: string | null;
  semester: string;
  courseName: string; // course code olarak kullanılacak
  teaching: number;
  grading: number;
  accessibility: number;
  overall: number;
  wouldTakeAgain: boolean;
  comment: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  onLike?: (id: string) => void;
}

export default function ProfessorReviewCard({
  id,
  username,
  semester,
  courseName,
  teaching,
  grading,
  accessibility,
  overall,
  wouldTakeAgain,
  comment,
  createdAt,
  likes,
  isLiked = false,
  onLike,
}: ProfessorReviewCardProps) {
  const { status } = useSession();
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    if (status !== "authenticated") {
      toast.error("Beğenmek için giriş yapmalısınız");
      return;
    }

    // Optimistic update
    const newLiked = !liked;
    const newCount = newLiked ? likeCount + 1 : likeCount - 1;
    setLiked(newLiked);
    setLikeCount(newCount);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/reviews/${id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewType: "professor" }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Beğeni işlemi başarısız");
      }

      const data = await response.json();
      setLiked(data.liked);
      setLikeCount(data.likeCount);

      if (onLike) {
        onLike(id);
      }
    } catch (error) {
      // Rollback on error
      setLiked(!newLiked);
      setLikeCount(newLiked ? newCount - 1 : newCount + 1);
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  const scores = [
    { label: "Anlatım", value: teaching },
    { label: "Notlandırma", value: grading },
    { label: "Ulaşılabilirlik", value: accessibility },
    { label: "Genel", value: overall, isPrimary: true },
  ];

  const formattedDate = new Date(createdAt).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-card border border-border/50 rounded-xl p-5 hover:border-border transition-colors">
      {/* Üst kısım - Kullanıcı ve ders bilgisi */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-medium text-foreground">
              {username || "Anonim Yolcu"}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {semester}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {courseName}
              </span>
            </div>
          </div>
        </div>

        {/* Tekrar Alırım Badge */}
        <div
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border",
            wouldTakeAgain
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          )}
        >
          {wouldTakeAgain ? (
            <>
              <ThumbsUp className="h-4 w-4" />
              <span>Tekrar Alırdım</span>
            </>
          ) : (
            <>
              <ThumbsDown className="h-4 w-4" />
              <span>Almam Bir Daha</span>
            </>
          )}
        </div>
      </div>

      {/* Mini puan göstergeleri */}
      <div className="flex flex-wrap gap-2 mb-4">
        {scores.map((score) => (
          <div
            key={score.label}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 text-xs"
          >
            <span className="text-muted-foreground">{score.label}</span>
            <span
              className={cn(
                "font-semibold",
                score.isPrimary ? "text-primary" : "text-foreground"
              )}
            >
              {score.value.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Yorum metni */}
      <p className="text-foreground/90 leading-relaxed mb-4">{comment}</p>

      {/* Alt kısım - Tarih ve beğeni */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <span className="text-xs text-muted-foreground">{formattedDate}</span>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLoading}
          className={cn(
            "gap-1.5 text-muted-foreground hover:text-red-500",
            liked && "text-red-500"
          )}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-red-500")} />
          <span>{likeCount}</span>
        </Button>
      </div>
    </div>
  );
}
