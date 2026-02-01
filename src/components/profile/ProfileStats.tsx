"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, BookOpen, Users, ThumbsUp } from "lucide-react";

interface ProfileStatsProps {
  stats: {
    totalReviews: number;
    courseReviews: number;
    professorReviews: number;
    totalLikes: number;
  };
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  const statItems = [
    {
      label: "Toplam Değerlendirme",
      value: stats.totalReviews,
      icon: MessageSquare,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Ders Değerlendirmesi",
      value: stats.courseReviews,
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      label: "Hoca Değerlendirmesi",
      value: stats.professorReviews,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      label: "Toplam Beğeni",
      value: stats.totalLikes,
      icon: ThumbsUp,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <Card key={item.label} className="border">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
