"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import enTranslations from "@/locales/en.json";
import trTranslations from "@/locales/tr.json";

export type Locale = "en" | "tr";

type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = typeof enTranslations;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Locale, Translations> = {
  en: enTranslations,
  tr: trTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getNestedValue(obj: TranslationValue, path: string): string | undefined {
  const keys = path.split(".");
  let current: TranslationValue = obj;

  for (const key of keys) {
    if (typeof current !== "object" || current === null) {
      return undefined;
    }
    current = (current as Record<string, TranslationValue>)[key];
    if (current === undefined) {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const savedLocale = localStorage.getItem("locale");
    if (savedLocale === "en" || savedLocale === "tr") {
      return savedLocale;
    }

    return "en";
  });

  // Update localStorage and html lang attribute when locale changes
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  // Translation function with parameter interpolation
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const translation = getNestedValue(translations[locale], key);

      if (!translation) {
        console.warn(`Translation missing for key: ${key}`);
        return key;
      }

      if (!params) {
        return translation;
      }

      // Replace {paramName} with actual values
      return translation.replace(/\{(\w+)\}/g, (_, paramName) => {
        const value = params[paramName];
        return value !== undefined ? String(value) : `{${paramName}}`;
      });
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Hook for just getting translations (alias for convenience)
export function useTranslation() {
  return useLanguage();
}
