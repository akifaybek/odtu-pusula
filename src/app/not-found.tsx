"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Compass, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 pattern-grid">
      <div className="text-center max-w-lg space-y-8 animate-in fade-in zoom-in duration-500">
        {/* 404 Icon */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative bg-card p-6 rounded-3xl border border-border/50 shadow-xl">
            <Compass className="h-24 w-24 text-primary animate-pulse" />
          </div>
          <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground font-bold px-4 py-1.5 rounded-full text-lg shadow-lg rotate-12">
            404
          </div>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Kaybolmuş Gibisin
          </h1>

          {/* Description */}
          <p className="text-lg text-muted-foreground">
            Aradığın sayfa kampüsün diğer ucunda kalmış olabilir veya hiç var olmamış olabilir. Pusula ile yolunu bul.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button size="lg" className="gap-2 w-full sm:w-auto text-base rounded-xl h-12 shadow-primary/25 shadow-lg hover:shadow-primary/40 transition-shadow">
              <Home className="h-5 w-5" />
              Ana Sayfa
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="gap-2 w-full sm:w-auto text-base rounded-xl h-12 border-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
            Geri Dön
          </Button>
        </div>
      </div>
    </div>
  );
}
