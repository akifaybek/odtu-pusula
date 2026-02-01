"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Mail, X, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function EmailVerificationBanner() {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Gösterme koşulları
  if (status !== "authenticated") return null;
  if (session?.user?.emailVerified) return null;
  if (isDismissed) return null;

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

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-full bg-amber-100">
              <Mail className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-sm text-amber-800">
              <span className="font-medium">Email adresinizi doğrulayın.</span>
              <span className="hidden sm:inline">
                {" "}
                Değerlendirme yazmak için email doğrulaması gereklidir.
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResendEmail}
              disabled={isLoading}
              className="text-amber-700 hover:text-amber-900 hover:bg-amber-100"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  <span className="hidden sm:inline">Gönderiliyor...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Tekrar gönder</span>
                </>
              )}
            </Button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded hover:bg-amber-100 text-amber-600 hover:text-amber-800 transition-colors"
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
