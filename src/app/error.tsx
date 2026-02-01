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
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-md">
        {/* Error Icon */}
        <div className="mb-8">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-4">Bir Hata Oluştu</h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8">
          Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin veya ana sayfaya dönün.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tekrar Dene
          </Button>
          <Link href="/">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Ana Sayfa
            </Button>
          </Link>
        </div>

        {/* Error digest for debugging */}
        {error.digest && (
          <p className="mt-8 text-xs text-muted-foreground">
            Hata kodu: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
