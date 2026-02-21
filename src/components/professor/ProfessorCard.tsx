"use client";

import Link from "next/link";
import { Compass, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { TakeAgainProgress } from "./TakeAgainBadge";
import { useTranslation } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

const departmentColors: Record<string, string> = {
  // Simplified map for brevity, ensure existing keys are present or imported
  DEFAULT: "border-primary bg-primary/10",
};

const departmentBadgeColors: Record<string, string> = {
  DEFAULT: "bg-primary/10 text-primary border-primary/20",
};

interface ProfessorCardProps {
  id: string;
  name: string;
  title: string;
  department: string;
  rating: number;
  takeAgainPercent: number;
  reviewCount: number;
  courses: string[];
  index?: number;
}

export default function ProfessorCard({
  id,
  name,
  title,
  department,
  rating,
  takeAgainPercent,
  reviewCount,
  courses,
  index = 0,
}: ProfessorCardProps) {
  const { t } = useTranslation();
  const avatarColor = departmentColors[department] || departmentColors.DEFAULT;
  const badgeColor = departmentBadgeColors[department] || departmentBadgeColors.DEFAULT;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const displayedCourses = courses.slice(0, 3);
  const remainingCount = courses.length - 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Link href={`/professors/${id}`} className="block h-full">
        <div
          className={cn(
            "group bg-card border border-border/50 rounded-xl p-5 h-full",
            "shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20",
            "transition-shadow duration-300 cursor-pointer backdrop-blur-sm flex flex-col"
          )}
        >
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className={cn(
                "w-16 h-16 rounded-full border-2 flex items-center justify-center flex-shrink-0 bg-background/50",
                avatarColor
              )}
            >
              <span className="text-xl font-bold text-foreground">{initials}</span>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground">{title}</p>
              <div
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border mt-1.5",
                  badgeColor
                )}
              >
                {department}
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1">
                <Compass className="h-5 w-5 text-primary fill-primary/20" />
                <span className="text-2xl font-bold text-foreground">{rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-muted-foreground">/5</span>
            </div>
          </div>

          <div className="mb-4">
            <TakeAgainProgress percentage={takeAgainPercent} />
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4 flex-grow content-start">
            {displayedCourses.map((course) => (
              <span
                key={course}
                className="px-2 py-0.5 rounded-md bg-muted/50 text-xs font-medium text-foreground border border-border/30"
              >
                {course}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-muted/30 text-xs text-muted-foreground">
                +{remainingCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-sm text-muted-foreground pt-3 border-t border-border/50 mt-auto">
            <MessageSquare className="h-4 w-4" />
            <span>{reviewCount} {t("courses.studentReviews")}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
