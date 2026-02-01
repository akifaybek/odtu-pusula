"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function MainError({
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
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Bir Hata Oluştu</h2>
        <p className="text-muted-foreground mb-6">
          Sayfa yüklenirken bir sorun oluştu.
        </p>

        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tekrar Dene
          </Button>
          <Link href="/anasayfa">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Ana Sayfa
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
