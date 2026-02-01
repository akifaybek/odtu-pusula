"use client";

import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Flag,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalProfessors: number;
  totalCourseReviews: number;
  totalProfessorReviews: number;
  pendingReports: number;
  newUsersToday: number;
  newReviewsToday: number;
  recentActivity: {
    type: string;
    description: string;
    time: string;
  }[];
  weeklyStats: {
    date: string;
    users: number;
    reviews: number;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Stats fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Toplam Kullanıcı",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Toplam Ders",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Toplam Hoca",
      value: stats?.totalProfessors || 0,
      icon: GraduationCap,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Ders Değerlendirmeleri",
      value: stats?.totalCourseReviews || 0,
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      title: "Hoca Değerlendirmeleri",
      value: stats?.totalProfessorReviews || 0,
      icon: MessageSquare,
      color: "text-pink-600",
      bgColor: "bg-pink-100 dark:bg-pink-900/30",
    },
    {
      title: "Bekleyen Raporlar",
      value: stats?.pendingReports || 0,
      icon: Flag,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          ODTÜ Pusula yönetim paneline hoş geldiniz
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Today's Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Bugünkü Aktivite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Yeni Kullanıcılar</span>
              <Badge variant="secondary">{stats?.newUsersToday || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Yeni Değerlendirmeler</span>
              <Badge variant="secondary">{stats?.newReviewsToday || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Son Aktiviteler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === "review"
                          ? "bg-green-500"
                          : activity.type === "user"
                          ? "bg-blue-500"
                          : "bg-red-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p>{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Henüz aktivite yok</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Son 7 Gün</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            {stats?.weeklyStats && stats.weeklyStats.length > 0 ? (
              <div className="w-full">
                <div className="flex justify-between items-end h-48 gap-2">
                  {stats.weeklyStats.map((day, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex flex-col items-center gap-1">
                        <div
                          className="w-full bg-primary/20 rounded-t"
                          style={{
                            height: `${Math.max((day.reviews / Math.max(...stats.weeklyStats.map(d => d.reviews), 1)) * 120, 4)}px`,
                          }}
                        />
                        <div
                          className="w-full bg-blue-500/40 rounded-t"
                          style={{
                            height: `${Math.max((day.users / Math.max(...stats.weeklyStats.map(d => d.users), 1)) * 60, 4)}px`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(day.date).toLocaleDateString("tr-TR", { weekday: "short" })}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary/20 rounded" />
                    <span className="text-sm text-muted-foreground">Değerlendirmeler</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500/40 rounded" />
                    <span className="text-sm text-muted-foreground">Kullanıcılar</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Grafik verisi yükleniyor...</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
