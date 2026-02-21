"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, BookOpen, User, Check, X, Clock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface Suggestion {
  id: string;
  type: "course" | "professor";
  courseCode: string | null;
  courseName: string | null;
  professorName: string | null;
  department: string | null;
  additionalInfo: string | null;
  contactEmail: string | null;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  } | null;
}

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");

  const fetchSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/suggestions?status=${statusFilter}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions);
      }
    } catch {
      toast.error("Öneriler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/suggestions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast.success(`Öneri ${status === "approved" ? "onaylandı" : "reddedildi"}`);
        fetchSuggestions();
      }
    } catch {
      toast.error("İşlem başarısız");
    }
  };

  const stats = {
    pending: suggestions.filter((s) => s.status === "pending").length,
    course: suggestions.filter((s) => s.type === "course").length,
    professor: suggestions.filter((s) => s.type === "professor").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Öneriler</h1>
        <p className="text-muted-foreground">
          Kullanıcıların gönderdiği eksik ders ve hoca önerileri
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Bekleyen</CardDescription>
            <CardTitle className="text-3xl">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ders Önerisi</CardDescription>
            <CardTitle className="text-3xl">{stats.course}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Hoca Önerisi</CardDescription>
            <CardTitle className="text-3xl">{stats.professor}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Durum seç" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Bekleyen</SelectItem>
            <SelectItem value="approved">Onaylanan</SelectItem>
            <SelectItem value="rejected">Reddedilen</SelectItem>
            <SelectItem value="all">Tümü</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchSuggestions}>
          Yenile
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : suggestions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Bu kategoride öneri bulunmuyor
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      {suggestion.type === "course" ? (
                        <BookOpen className="h-5 w-5 text-blue-500" />
                      ) : (
                        <User className="h-5 w-5 text-green-500" />
                      )}
                      <Badge variant="secondary">
                        {suggestion.type === "course" ? "Ders" : "Hoca"}
                      </Badge>
                      <Badge
                        variant={
                          suggestion.status === "pending"
                            ? "outline"
                            : suggestion.status === "approved"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {suggestion.status === "pending"
                          ? "Bekliyor"
                          : suggestion.status === "approved"
                          ? "Onaylandı"
                          : "Reddedildi"}
                      </Badge>
                    </div>

                    {suggestion.type === "course" ? (
                      <div>
                        <p className="font-medium">
                          {suggestion.courseCode && (
                            <span className="text-primary">{suggestion.courseCode}</span>
                          )}
                          {suggestion.courseCode && suggestion.courseName && " - "}
                          {suggestion.courseName}
                        </p>
                      </div>
                    ) : (
                      <p className="font-medium">{suggestion.professorName}</p>
                    )}

                    {suggestion.department && (
                      <p className="text-sm text-muted-foreground">
                        Bölüm: {suggestion.department}
                      </p>
                    )}

                    {suggestion.additionalInfo && (
                      <p className="text-sm text-muted-foreground">
                        Ek bilgi: {suggestion.additionalInfo}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(suggestion.createdAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {suggestion.user && (
                        <span>Gönderen: {suggestion.user.name}</span>
                      )}
                      {suggestion.contactEmail && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {suggestion.contactEmail}
                        </span>
                      )}
                    </div>
                  </div>

                  {suggestion.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 hover:bg-green-50"
                        onClick={() => updateStatus(suggestion.id, "approved")}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Onayla
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => updateStatus(suggestion.id, "rejected")}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reddet
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
