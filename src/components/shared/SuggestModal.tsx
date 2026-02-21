"use client";

import { useState } from "react";
import { X, Send, Loader2, BookOpen, User, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SuggestModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: "course" | "professor";
  initialSearch?: string;
}

export default function SuggestModal({
  isOpen,
  onClose,
  initialType = "course",
  initialSearch = "",
}: SuggestModalProps) {
  const [type, setType] = useState<"course" | "professor">(initialType);
  const [formData, setFormData] = useState({
    courseCode: initialType === "course" ? initialSearch : "",
    courseName: "",
    professorName: initialType === "professor" ? initialSearch : "",
    department: "",
    additionalInfo: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (type === "course" && !formData.courseCode && !formData.courseName) {
      toast.error("Ders kodu veya adı gerekli");
      return;
    }
    if (type === "professor" && !formData.professorName) {
      toast.error("Hoca adı gerekli");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          ...formData,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Bir hata oluştu");
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({
          courseCode: "",
          courseName: "",
          professorName: "",
          department: "",
          additionalInfo: "",
          email: "",
        });
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Teşekkürler!</h2>
          <p className="text-muted-foreground">
            Öneriniz başarıyla gönderildi. En kısa sürede değerlendireceğiz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h2 className="text-xl font-bold">Eksik Ders/Hoca Bildir</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Aradığını bulamadın mı? Bize bildir, ekleyelim!
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted/50 transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Type Selection */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("course")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all",
                type === "course"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border/50 hover:border-primary/50"
              )}
            >
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">Ders</span>
            </button>
            <button
              type="button"
              onClick={() => setType("professor")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all",
                type === "professor"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border/50 hover:border-primary/50"
              )}
            >
              <User className="h-5 w-5" />
              <span className="font-medium">Hoca</span>
            </button>
          </div>

          {type === "course" ? (
            <>
              <div className="space-y-2">
                <Label>Ders Kodu</Label>
                <Input
                  placeholder="örn: CENG242"
                  value={formData.courseCode}
                  onChange={(e) =>
                    setFormData({ ...formData, courseCode: e.target.value.toUpperCase() })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Ders Adı (opsiyonel)</Label>
                <Input
                  placeholder="örn: Programming Language Concepts"
                  value={formData.courseName}
                  onChange={(e) =>
                    setFormData({ ...formData, courseName: e.target.value })
                  }
                />
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Label>Hoca Adı</Label>
              <Input
                placeholder="örn: Ahmet Yılmaz"
                value={formData.professorName}
                onChange={(e) =>
                  setFormData({ ...formData, professorName: e.target.value })
                }
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Bölüm (opsiyonel)</Label>
            <Input
              placeholder="örn: Bilgisayar Mühendisliği"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Ek Bilgi (opsiyonel)</Label>
            <Textarea
              placeholder="Eklemek istediğin başka bir şey var mı?"
              value={formData.additionalInfo}
              onChange={(e) =>
                setFormData({ ...formData, additionalInfo: e.target.value })
              }
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Email (opsiyonel)</Label>
            <Input
              type="email"
              placeholder="Eklendiğinde haber verelim mi?"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground">
              Email adresinizi verirseniz, ekleme yapıldığında sizi bilgilendiririz.
            </p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Gönder
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
