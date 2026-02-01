"use client";

import { cn } from "@/lib/utils";

export interface RatingOption {
  value: number;
  label: string;
  emoji?: string;
}

interface RatingSliderProps {
  options: RatingOption[];
  value: number | null;
  onChange: (value: number) => void;
  label: string;
  required?: boolean;
}

export default function RatingSlider({
  options,
  value,
  onChange,
  label,
  required = false,
}: RatingSliderProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </label>
      <div className="flex gap-2">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all",
                "hover:border-primary/50 hover:bg-primary/5",
                isSelected
                  ? "border-primary bg-primary/10 scale-105 shadow-sm"
                  : "border-border/50 bg-card"
              )}
            >
              {option.emoji && (
                <span
                  className={cn(
                    "text-xl transition-transform",
                    isSelected && "scale-125"
                  )}
                >
                  {option.emoji}
                </span>
              )}
              <span
                className={cn(
                  "text-xs text-center leading-tight",
                  isSelected
                    ? "text-primary font-medium"
                    : "text-muted-foreground"
                )}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Preset options for common use cases
export const difficultyOptions: RatingOption[] = [
  { value: 1, label: "Çocuk oyuncağı", emoji: "😎" },
  { value: 2, label: "Rahat", emoji: "😊" },
  { value: 3, label: "Ortalama", emoji: "😐" },
  { value: 4, label: "Ter döktüm", emoji: "😰" },
  { value: 5, label: "Hayatta kalma", emoji: "💀" },
];

export const workloadOptions: RatingOption[] = [
  { value: 1, label: "Neredeyse hiç", emoji: "🎉" },
  { value: 2, label: "Makul", emoji: "👍" },
  { value: 3, label: "Normal", emoji: "📚" },
  { value: 4, label: "Yoğun", emoji: "📝" },
  { value: 5, label: "Uyku nedir?", emoji: "😵" },
];

export const usefulnessOptions: RatingOption[] = [
  { value: 1, label: "Hiç", emoji: "👎" },
  { value: 2, label: "Biraz", emoji: "🤷" },
  { value: 3, label: "İdare eder", emoji: "👌" },
  { value: 4, label: "Bayağı", emoji: "👏" },
  { value: 5, label: "Çok değerli", emoji: "🌟" },
];

export const teachingOptions: RatingOption[] = [
  { value: 1, label: "Anlamıyorum", emoji: "😕" },
  { value: 2, label: "Zor takip", emoji: "😓" },
  { value: 3, label: "İdare eder", emoji: "🤔" },
  { value: 4, label: "İyi anlatıyor", emoji: "😊" },
  { value: 5, label: "Efsane hoca", emoji: "🌟" },
];

export const gradingOptions: RatingOption[] = [
  { value: 1, label: "Çok haksız", emoji: "😤" },
  { value: 2, label: "Biraz keyfi", emoji: "😒" },
  { value: 3, label: "İdare eder", emoji: "😐" },
  { value: 4, label: "Adil", emoji: "👍" },
  { value: 5, label: "Çok adil", emoji: "⚖️" },
];

export const accessibilityOptions: RatingOption[] = [
  { value: 1, label: "Ulaşılmaz", emoji: "🚫" },
  { value: 2, label: "Zor bulursun", emoji: "😕" },
  { value: 3, label: "Normal", emoji: "📧" },
  { value: 4, label: "Ulaşılabilir", emoji: "👋" },
  { value: 5, label: "Kapısı açık", emoji: "🚪" },
];
