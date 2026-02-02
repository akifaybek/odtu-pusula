"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Flag,
  TrendingUp,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
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
      setRefreshing(false);
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
      href: "/admin/users",
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
      href: "/admin/reviews",
    },
    {
      title: "Hoca Değerlendirmeleri",
      value: stats?.totalProfessorReviews || 0,
      icon: MessageSquare,
      color: "text-pink-600",
      bgColor: "bg-pink-100 dark:bg-pink-900/30",
      href: "/admin/reviews",
    },
    {
      title: "Bekleyen Raporlar",
      value: stats?.pendingReports || 0,
      icon: Flag,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      href: "/admin/reports",
      alert: (stats?.pendingReports || 0) > 0,
    },
  ];

  const quickActions = [
    {
      title: "Değerlendirmeleri İncele",
      description: "Bekleyen değerlendirmeleri onayla veya reddet",
      icon: MessageSquare,
      href: "/admin/reviews",
      color: "bg-blue-500",
    },
    {
      title: "Raporları Yönet",
      description: "Kullanıcı şikayetlerini incele",
      icon: Flag,
      href: "/admin/reports",
      color: "bg-red-500",
      badge: stats?.pendingReports || 0,
    },
    {
      title: "Kullanıcıları Yönet",
      description: "Kullanıcı rollerini ve durumlarını düzenle",
      icon: Users,
      href: "/admin/users",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            ODTÜ Pusula yönetim paneline hoş geldiniz
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchStats(true)}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Yenile
        </Button>
      </div>

      {/* Alert Banner */}
      {(stats?.pendingReports || 0) > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <div className="flex-1">
            <p className="font-medium text-red-800 dark:text-red-200">
              {stats?.pendingReports} bekleyen rapor var
            </p>
            <p className="text-sm text-red-600 dark:text-red-300">
              Kullanıcı şikayetlerini incelemeniz gerekiyor
            </p>
          </div>
          <Button asChild variant="destructive" size="sm">
            <Link href="/admin/reports">
              İncele
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className={`${stat.href ? "cursor-pointer hover:border-primary/50 transition-colors" : ""} ${stat.alert ? "border-red-300 dark:border-red-700" : ""}`}
          >
            {stat.href ? (
              <Link href={stat.href}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{stat.value.toLocaleString()}</span>
                    {stat.alert && (
                      <Badge variant="destructive" className="text-xs">Dikkat</Badge>
                    )}
                  </div>
                </CardContent>
              </Link>
            ) : (
              <>
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
              </>
            )}
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Hızlı Eylemler</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="hover:border-primary/50 transition-all hover:shadow-md cursor-pointer h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{action.title}</h3>
                        {action.badge !== undefined && action.badge > 0 && (
                          <Badge variant="destructive">{action.badge}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Today's Stats & Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Bugünkü Aktivite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <span>Yeni Kullanıcılar</span>
              </div>
              <span className="text-2xl font-bold">{stats?.newUsersToday || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <MessageSquare className="h-4 w-4 text-green-600" />
                </div>
                <span>Yeni Değerlendirmeler</span>
              </div>
              <span className="text-2xl font-bold">{stats?.newReviewsToday || 0}</span>
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
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-muted-foreground text-sm">Henüz aktivite yok</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Son 7 Gün</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            {stats?.weeklyStats && stats.weeklyStats.length > 0 ? (
              <div className="w-full">
                <div className="flex justify-between items-end h-48 gap-2">
                  {stats.weeklyStats.map((day, index) => {
                    const maxReviews = Math.max(...stats.weeklyStats.map(d => d.reviews), 1);
                    const maxUsers = Math.max(...stats.weeklyStats.map(d => d.users), 1);
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex flex-col items-center gap-1">
                          <div className="text-xs text-muted-foreground mb-1">
                            {day.reviews > 0 && day.reviews}
                          </div>
                          <div
                            className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                            style={{
                              height: `${Math.max((day.reviews / maxReviews) * 100, 4)}px`,
                            }}
                          />
                          <div
                            className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-400"
                            style={{
                              height: `${Math.max((day.users / maxUsers) * 50, 4)}px`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {new Date(day.date).toLocaleDateString("tr-TR", { weekday: "short" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center gap-8 mt-6 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-primary rounded" />
                    <span className="text-sm text-muted-foreground">Değerlendirmeler</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded" />
                    <span className="text-sm text-muted-foreground">Yeni Kullanıcılar</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-muted-foreground">Henüz yeterli veri yok</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Kullanıcılar ve değerlendirmeler arttıkça grafik oluşacak
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Sistem Durumu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">Veritabanı</p>
                <p className="text-sm text-green-600 dark:text-green-300">Çalışıyor</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">API</p>
                <p className="text-sm text-green-600 dark:text-green-300">Aktif</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">Auth</p>
                <p className="text-sm text-green-600 dark:text-green-300">Aktif</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
