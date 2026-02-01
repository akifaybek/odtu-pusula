"use client";

import { useState } from "react";
import { Compass, Calendar, User, BookOpen, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProfessorReviewCardProps {
  id: string;
  username: string | null;
  semester: string;
  courseCode: string;
  courseName: string;
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
  courseCode,
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
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    if (onLike) {
      onLike(id);
    }
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);
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
                {courseCode}
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

      {/* Ders bilgisi */}
      <div className="px-3 py-2 bg-muted/30 rounded-lg mb-4 text-sm">
        <span className="font-medium text-foreground">{courseCode}</span>
        <span className="text-muted-foreground"> · {courseName}</span>
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
          className={cn(
            "gap-1.5 text-muted-foreground hover:text-primary",
            liked && "text-primary"
          )}
        >
          <Compass className={cn("h-4 w-4", liked && "fill-primary/20")} />
          <span>{likeCount}</span>
        </Button>
      </div>
    </div>
  );
}
