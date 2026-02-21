"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "odtu-pusula-cookie-consent";

type ConsentStatus = "accepted" | "rejected" | null;

export function CookieConsent() {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>(() => {
    if (typeof window === "undefined") return null;
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY);
    return savedConsent === "accepted" || savedConsent === "rejected"
      ? savedConsent
      : null;
  });
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(COOKIE_CONSENT_KEY) === null;
  });

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setConsentStatus("accepted");
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "rejected");
    setConsentStatus("rejected");
    setIsVisible(false);
  };

  const handleClose = () => {
    // Just hide, don't save preference
    setIsVisible(false);
  };

  if (!isVisible || consentStatus) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom-5 duration-300">
      <div className="mx-auto max-w-4xl">
        <div className="relative rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-lg p-4 md:p-6">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Icon and Text */}
            <div className="flex items-start gap-3 flex-1 pr-6 md:pr-0">
              <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10">
                <Cookie className="h-5 w-5 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">Cerez Kullanimi</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  ODTU Pusula, oturum yonetimi ve kullanici deneyimini iyilestirmek
                  icin cerezler kullanir. Devam ederek{" "}
                  <Link
                    href="/legal"
                    className="text-primary hover:underline font-medium"
                  >
                    Gizlilik Politikamizi
                  </Link>{" "}
                  kabul etmis olursunuz.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                className="flex-1 md:flex-none"
              >
                Reddet
              </Button>
              <Button
                size="sm"
                onClick={handleAccept}
                className="flex-1 md:flex-none"
              >
                Kabul Et
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
