"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 pattern-grid">
      <div className="text-center max-w-lg space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Error Icon */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-destructive/10 blur-3xl rounded-full" />
          <div className="relative bg-card p-6 rounded-3xl border border-border/50 shadow-xl">
            <AlertTriangle className="h-20 w-20 text-destructive animate-pulse" />
          </div>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
            Bir Şeyler Ters Gitti
          </h1>

          {/* Description */}
          <p className="text-lg text-muted-foreground">
            Beklenmedik bir hata oluştu. Sayfayı yenilemeyi deneyebilir veya ana sayfaya dönebilirsin.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset} size="lg" className="gap-2 w-full sm:w-auto text-base rounded-xl h-12 shadow-md">
            <RefreshCw className="h-5 w-5" />
            Tekrar Dene
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto text-base rounded-xl h-12 border-2">
              <Home className="h-5 w-5" />
              Ana Sayfa
            </Button>
          </Link>
        </div>

        {/* Error digest for debugging */}
        {error.digest && (
          <div className="mt-8 p-4 rounded-lg bg-muted text-left">
            <p className="text-xs text-muted-foreground font-mono">
              Hata Kodu: {error.digest}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
