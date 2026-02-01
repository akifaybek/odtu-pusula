"use client";

import { useState } from "react";
import { Heart, Calendar, User, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

// Not renkleri
const gradeColors: Record<string, string> = {
  AA: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  BA: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  BB: "bg-lime-500/20 text-lime-400 border-lime-500/30",
  CB: "bg-lime-500/15 text-lime-400 border-lime-500/25",
  CC: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  DC: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  DD: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  FD: "bg-red-500/15 text-red-400 border-red-500/25",
  FF: "bg-red-500/20 text-red-400 border-red-500/30",
  DEFAULT: "bg-muted text-muted-foreground border-border",
};

interface ReviewCardProps {
  id: string;
  username: string | null; // null = anonim
  semester: string; // "2023-24 Güz"
  professorName: string;
  difficulty: number;
  workload: number;
  usefulness: number;
  overall: number;
  grade?: string;
  comment: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  onLike?: (id: string) => void;
}

export default function ReviewCard({
  id,
  username,
  semester,
  professorName,
  difficulty,
  workload,
  usefulness,
  overall,
  grade,
  comment,
  createdAt,
  likes,
  isLiked = false,
  onLike,
}: ReviewCardProps) {
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
        body: JSON.stringify({ reviewType: "course" }),
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
    { label: "Zorluk", value: difficulty, color: difficulty > 3.5 ? "text-red-400" : difficulty > 2.5 ? "text-amber-400" : "text-emerald-400" },
    { label: "Yük", value: workload, color: workload > 3.5 ? "text-red-400" : workload > 2.5 ? "text-amber-400" : "text-emerald-400" },
    { label: "Fayda", value: usefulness, color: usefulness > 3.5 ? "text-emerald-400" : usefulness > 2.5 ? "text-amber-400" : "text-red-400" },
    { label: "Genel", value: overall, color: "text-primary" },
  ];

  const gradeClass = grade ? gradeColors[grade] || gradeColors.DEFAULT : null;

  const formattedDate = new Date(createdAt).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="bg-card border border-border/50 rounded-xl p-5 hover:border-border transition-colors">
      {/* Üst kısım - Kullanıcı bilgisi */}
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
                <GraduationCap className="h-3 w-3" />
                {professorName}
              </span>
            </div>
          </div>
        </div>

        {/* Not badge */}
        {grade && (
          <div className={cn("px-3 py-1 rounded-lg text-sm font-bold border", gradeClass)}>
            {grade}
          </div>
        )}
      </div>

      {/* Mini puan göstergeleri */}
      <div className="flex flex-wrap gap-2 mb-4">
        {scores.map((score) => (
          <div
            key={score.label}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 text-xs"
          >
            <span className="text-muted-foreground">{score.label}</span>
            <span className={cn("font-semibold", score.color)}>
              {score.value.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Yorum metni */}
      <p className="text-foreground/90 leading-relaxed mb-4">
        {comment}
      </p>

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
