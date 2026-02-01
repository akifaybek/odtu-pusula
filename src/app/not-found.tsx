"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-md">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="relative inline-block">
            <Compass className="h-24 w-24 text-primary/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary">404</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-4">Sayfa Bulunamadı</h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          Pusula ile yolunuzu kaybetmeyin!
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Ana Sayfa
            </Button>
          </Link>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Geri Dön
          </Button>
        </div>
      </div>
    </div>
  );
}
