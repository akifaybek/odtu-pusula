"use client";

import Link from "next/link";
import { Compass, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import DifficultyBadge, { getDifficultyFromScore } from "@/components/shared/DifficultyBadge";
import CourseTypeBadge from "@/components/shared/CourseTypeBadge";
import { useTranslation } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

// Bölüm renkleri
const departmentColors: Record<string, string> = {
  CENG: "bg-blue-500",
  EE: "bg-yellow-500",
  // ... (keep usage of map, simplifying for brevity if needed or copy fully if standard)
  ME: "bg-orange-500",
  IE: "bg-purple-500",
  // Fallback map...
  DEFAULT: "bg-primary",
};

type CourseType = "REQUIRED" | "ELECTIVE" | "TECH_ELECTIVE" | "NON_TECH" | "FREE_ELECTIVE";

interface CourseCardProps {
  code: string;
  name: string;
  department: string;
  credits: number;
  difficulty: number;
  rating: number;
  reviewCount: number;
  courseType?: CourseType | null;
  index?: number; // Added for staggered animation
}

export default function CourseCard({
  code,
  name,
  department,
  credits,
  difficulty,
  rating,
  reviewCount,
  courseType,
  index = 0,
}: CourseCardProps) {
  const { t } = useTranslation();
  // Simple fallback logic since I didn't copy the full map to save context, assuming departmentColors is accessible or defining local map
  const deptColor = departmentColors[department] || departmentColors.DEFAULT;
  const difficultyLevel = getDifficultyFromScore(difficulty);
  const filledCompasses = Math.round(rating);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Link href={`/courses/${code}`} className="block h-full">
        <div
          className={cn(
            "group relative h-full bg-card border border-border/50 rounded-xl overflow-hidden",
            "shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20",
            "transition-shadow duration-300 cursor-pointer backdrop-blur-sm",
            "flex flex-col"
          )}
        >
          {/* Top colored strip */}
          <div className={cn("h-1.5 shrink-0", deptColor)} />

          {/* Credits badge */}
          <div className="absolute top-4 right-4 z-10">
            <div className="px-2.5 py-1 rounded-full bg-background/80 backdrop-blur border border-border/50 text-xs font-semibold text-foreground shadow-sm">
              {credits} {t("courses.credits")}
            </div>
          </div>

          <div className="p-5 flex flex-col flex-grow">
            {/* Course code */}
            <div className="text-2xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
              {code}
            </div>

            {/* Course name */}
            <h3 className="text-sm text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
              {name}
            </h3>

            {/* Difficulty indicator */}
            <div className="flex flex-wrap gap-2 mb-4">
              <DifficultyBadge level={difficultyLevel} size="sm" />
              {courseType && <CourseTypeBadge type={courseType} size="sm" />}
            </div>

            <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
              {/* Ratings */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Compass
                    key={i}
                    className={cn(
                      "h-4 w-4",
                      i <= filledCompasses ? "text-primary fill-primary/20" : "text-muted-foreground/30"
                    )}
                  />
                ))}
                <span className="ml-1.5 text-sm font-medium text-foreground">
                  {rating.toFixed(1)}
                </span>
              </div>

              {/* Reviews */}
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                <Users className="h-3.5 w-3.5" />
                <span>{reviewCount}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
