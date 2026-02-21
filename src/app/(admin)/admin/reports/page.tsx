"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Search,
  Flag,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Report {
  id: string;
  reason: string;
  description: string | null;
  status: "PENDING" | "RESOLVED" | "DISMISSED";
  createdAt: string;
  adminNote: string | null;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  courseReview?: {
    id: string;
    comment: string;
    user: { name: string; email: string };
    course: { code: string; name: string };
  };
  professorReview?: {
    id: string;
    comment: string;
    user: { name: string; email: string };
    professor: { name: string };
  };
}

const reasonLabels: Record<string, string> = {
  spam: "Spam",
  hakaret: "Hakaret",
  yanlis_bilgi: "Yanlış Bilgi",
  diger: "Diğer",
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionType, setActionType] = useState<"resolve" | "dismiss" | "view" | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);

      const res = await fetch(`/api/admin/reports?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
      }
    } catch (error) {
      console.error("Reports fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleAction = async (action: "resolve" | "dismiss") => {
    if (!selectedReport) return;
    setActionLoading(true);

    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: selectedReport.id,
          action,
          adminNote: adminNote || undefined,
        }),
      });

      if (res.ok) {
        toast.success(
          action === "resolve"
            ? "Rapor çözüldü olarak işaretlendi"
            : "Rapor reddedildi"
        );
        fetchReports();
        setSelectedReport(null);
        setActionType(null);
        setAdminNote("");
      } else {
        toast.error("İşlem başarısız");
      }
    } catch {
      toast.error("Bir hata oluştu");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            Çözüldü
          </Badge>
        );
      case "DISMISSED":
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
            <XCircle className="h-3 w-3 mr-1" />
            Reddedildi
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Beklemede
          </Badge>
        );
    }
  };

  const getReasonBadge = (reason: string) => {
    const colors: Record<string, string> = {
      spam: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      hakaret: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      yanlis_bilgi: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      diger: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    };
    return (
      <Badge className={colors[reason] || colors.diger}>
        {reasonLabels[reason] || reason}
      </Badge>
    );
  };

  const filteredReports = reports.filter((report) => {
    const searchLower = search.toLowerCase();
    return (
      report.reporter.name.toLowerCase().includes(searchLower) ||
      report.reporter.email.toLowerCase().includes(searchLower) ||
      report.courseReview?.comment.toLowerCase().includes(searchLower) ||
      report.professorReview?.comment.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Raporlar</h1>
        <p className="text-muted-foreground mt-1">
          Kullanıcı raporlarını görüntüle ve yönet
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6">
            <div className="flex border-b">
              {["PENDING", "RESOLVED", "DISMISSED", "all"].map((status) => {
                const labels: Record<string, string> = {
                  PENDING: "Bekleyenler",
                  RESOLVED: "Çözülenler",
                  DISMISSED: "Reddedilenler",
                  all: "Tümü",
                };

                const isActive = statusFilter === status;

                return (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                      }`}
                  >
                    {labels[status]}
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Raporlarda ara (Kullanıcı, E-posta, İçerik)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 max-w-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rapor Eden</TableHead>
                <TableHead>Sebep</TableHead>
                <TableHead>İçerik</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Flag className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Rapor bulunamadı</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{report.reporter.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {report.reporter.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getReasonBadge(report.reason)}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="truncate text-sm">
                          {report.courseReview?.comment ||
                            report.professorReview?.comment ||
                            "-"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString("tr-TR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedReport(report);
                            setActionType("view");
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {report.status === "PENDING" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-600 hover:text-green-700 hover:bg-green-100"
                              onClick={() => {
                                setSelectedReport(report);
                                setActionType("resolve");
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                              onClick={() => {
                                setSelectedReport(report);
                                setActionType("dismiss");
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Report Dialog */}
      <Dialog
        open={actionType === "view"}
        onOpenChange={() => {
          setActionType(null);
          setSelectedReport(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rapor Detayı</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Rapor Eden</p>
                  <p className="font-medium">{selectedReport.reporter.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedReport.reporter.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Durum</p>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sebep</p>
                  {getReasonBadge(selectedReport.reason)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tarih</p>
                  <p>
                    {new Date(selectedReport.createdAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              {selectedReport.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Açıklama</p>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm">{selectedReport.description}</p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground mb-2">Raporlanan İçerik</p>
                <div className="bg-muted p-4 rounded-lg">
                  {selectedReport.courseReview && (
                    <div>
                      <p className="text-sm font-medium mb-1">
                        Ders: {selectedReport.courseReview.course.code} -{" "}
                        {selectedReport.courseReview.course.name}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Yazan: {selectedReport.courseReview.user.name}
                      </p>
                      <p>{selectedReport.courseReview.comment}</p>
                    </div>
                  )}
                  {selectedReport.professorReview && (
                    <div>
                      <p className="text-sm font-medium mb-1">
                        Hoca: {selectedReport.professorReview.professor.name}
                      </p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Yazan: {selectedReport.professorReview.user.name}
                      </p>
                      <p>{selectedReport.professorReview.comment}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedReport.adminNote && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Admin Notu</p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <p className="text-sm">{selectedReport.adminNote}</p>
                  </div>
                </div>
              )}

              {selectedReport.status === "PENDING" && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActionType("dismiss");
                    }}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reddet
                  </Button>
                  <Button
                    onClick={() => {
                      setActionType("resolve");
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Çöz
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog
        open={actionType === "resolve" || actionType === "dismiss"}
        onOpenChange={() => {
          setActionType(null);
          setAdminNote("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "resolve" ? "Raporu Çöz" : "Raporu Reddet"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "resolve"
                ? "Bu raporu çözüldü işaretlediğinizde, **ilgili yorum otomatik olarak GİZLENECEKTİR** (Rejected). Bu işlem geri alınamaz."
                : "Bu raporu reddedeceksiniz. İçerik yayında kalmaya devam edecektir."}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Admin notu (opsiyonel)"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setActionType(null);
                setAdminNote("");
              }}
            >
              İptal
            </Button>
            <Button
              onClick={() => handleAction(actionType as "resolve" | "dismiss")}
              disabled={actionLoading}
              className={
                actionType === "resolve" ? "bg-green-600 hover:bg-green-700" : ""
              }
            >
              {actionLoading
                ? "İşleniyor..."
                : actionType === "resolve"
                  ? "Çöz"
                  : "Reddet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
