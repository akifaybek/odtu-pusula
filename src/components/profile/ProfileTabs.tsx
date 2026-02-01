"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BookOpen, Users } from "lucide-react";

interface ProfileTabsProps {
  activeTab: "course" | "professor";
  onTabChange: (tab: "course" | "professor") => void;
  courseCount: number;
  professorCount: number;
}

export function ProfileTabs({
  activeTab,
  onTabChange,
  courseCount,
  professorCount,
}: ProfileTabsProps) {
  const tabs = [
    {
      id: "course" as const,
      label: "Ders Değerlendirmelerim",
      icon: BookOpen,
      count: courseCount,
    },
    {
      id: "professor" as const,
      label: "Hoca Değerlendirmelerim",
      icon: Users,
      count: professorCount,
    },
  ];

  return (
    <div className="border-b">
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
            <span
              className={cn(
                "px-2 py-0.5 text-xs rounded-full",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
