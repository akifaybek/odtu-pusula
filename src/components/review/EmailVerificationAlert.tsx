"use client";

import { AlertCircle, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

interface EmailVerificationAlertProps {
  onClose?: () => void;
}

export default function EmailVerificationAlert({
  onClose,
}: EmailVerificationAlertProps) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error);
        return;
      }

      toast.success("Doğrulama emaili gönderildi!");
    } catch {
      toast.error("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return null;
  }

  if (status !== "authenticated") {
    return (
      <div className="p-4 bg-muted/50 rounded-xl text-center">
        <p className="text-muted-foreground">
          Değerlendirme yazmak için{" "}
          <a href="/login" className="text-primary hover:underline">
            giriş yapın
          </a>
          .
        </p>
      </div>
    );
  }

  if (session?.user?.emailVerified) {
    return null; // Email doğrulanmış, alert gösterme
  }

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 rounded-full shrink-0">
          <AlertCircle className="h-5 w-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-amber-800 mb-1">
            Email Doğrulaması Gerekli
          </h4>
          <p className="text-sm text-amber-700 mb-3">
            Değerlendirme yazmak için önce email adresinizi doğrulamanız
            gerekiyor. Email kutunuzu kontrol edin veya yeni doğrulama linki
            isteyin.
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleResendEmail}
              disabled={isLoading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-1" />
                  Doğrulama Emaili Gönder
                </>
              )}
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Kapat
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to check if user can write reviews
export function useCanWriteReview() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return { canWrite: false, isLoading: true, reason: null };
  }

  if (status !== "authenticated") {
    return { canWrite: false, isLoading: false, reason: "not_authenticated" };
  }

  if (!session?.user?.emailVerified) {
    return { canWrite: false, isLoading: false, reason: "not_verified" };
  }

  return { canWrite: true, isLoading: false, reason: null };
}
