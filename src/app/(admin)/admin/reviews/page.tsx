"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Check,
  X,
  Eye,
  Filter,
  Search,
  MessageSquare,
  User,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
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

interface Review {
  id: string;
  type: "course" | "professor";
  comment: string;
  overallRating: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isAnonymous: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  course?: {
    code: string;
    name: string;
  };
  professor?: {
    name: string;
    title: string;
  };
  reportCount: number;
}

export default function AdminReviewsPage() {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [filter, typeFilter]);

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      if (typeFilter !== "all") params.set("type", typeFilter);

      const res = await fetch(`/api/admin/reviews?${params}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error("Reviews fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (reviewId: string, type: string, action: "approve" | "reject") => {
    setActionLoading(reviewId);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, type, action }),
      });

      if (res.ok) {
        toast.success(action === "approve" ? "Değerlendirme onaylandı" : "Değerlendirme reddedildi");
        fetchReviews();
      } else {
        toast.error("İşlem başarısız");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredReviews = reviews.filter((review) =>
    search
      ? review.comment.toLowerCase().includes(search.toLowerCase()) ||
        review.user.name.toLowerCase().includes(search.toLowerCase()) ||
        review.course?.code.toLowerCase().includes(search.toLowerCase()) ||
        review.professor?.name.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Onaylı</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Reddedildi</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Beklemede</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

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
        <h1 className="text-3xl font-bold">Değerlendirmeler</h1>
        <p className="text-muted-foreground mt-1">
          Tüm değerlendirmeleri görüntüle ve yönet
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="PENDING">Beklemede</SelectItem>
                <SelectItem value="APPROVED">Onaylı</SelectItem>
                <SelectItem value="REJECTED">Reddedildi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tür" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="course">Ders</SelectItem>
                <SelectItem value="professor">Hoca</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tür</TableHead>
                <TableHead>İçerik</TableHead>
                <TableHead>Kullanıcı</TableHead>
                <TableHead>Puan</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">Değerlendirme bulunamadı</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReviews.map((review) => (
                  <TableRow key={`${review.type}-${review.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {review.type === "course" ? (
                          <BookOpen className="h-4 w-4 text-blue-600" />
                        ) : (
                          <GraduationCap className="h-4 w-4 text-purple-600" />
                        )}
                        <span className="text-sm">
                          {review.type === "course" ? review.course?.code : review.professor?.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate text-sm">{review.comment}</p>
                      {review.reportCount > 0 && (
                        <Badge variant="destructive" className="mt-1">
                          {review.reportCount} rapor
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {review.isAnonymous ? "Anonim" : review.user.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{review.overallRating}/5</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(review.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString("tr-TR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedReview(review)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {review.status !== "APPROVED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-green-600 hover:text-green-700 hover:bg-green-100"
                            onClick={() => handleAction(review.id, review.type, "approve")}
                            disabled={actionLoading === review.id}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {review.status !== "REJECTED" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-100"
                            onClick={() => handleAction(review.id, review.type, "reject")}
                            disabled={actionLoading === review.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
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

      {/* Review Detail Dialog */}
      <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Değerlendirme Detayı</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tür</p>
                  <p className="font-medium">
                    {selectedReview.type === "course" ? "Ders Değerlendirmesi" : "Hoca Değerlendirmesi"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hedef</p>
                  <p className="font-medium">
                    {selectedReview.type === "course"
                      ? `${selectedReview.course?.code} - ${selectedReview.course?.name}`
                      : selectedReview.professor?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Kullanıcı</p>
                  <p className="font-medium">
                    {selectedReview.isAnonymous ? "Anonim" : selectedReview.user.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{selectedReview.user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Durum</p>
                  {getStatusBadge(selectedReview.status)}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Yorum</p>
                <div className="bg-muted p-4 rounded-lg">
                  <p>{selectedReview.comment}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                {selectedReview.status !== "APPROVED" && (
                  <Button
                    onClick={() => {
                      handleAction(selectedReview.id, selectedReview.type, "approve");
                      setSelectedReview(null);
                    }}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Onayla
                  </Button>
                )}
                {selectedReview.status !== "REJECTED" && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleAction(selectedReview.id, selectedReview.type, "reject");
                      setSelectedReview(null);
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reddet
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
