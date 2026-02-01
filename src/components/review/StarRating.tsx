"use client";

import { useState } from "react";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: "sm" | "md" | "lg" | "xl";
  readonly?: boolean;
  showValue?: boolean;
  label?: string;
  required?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
  xl: "h-10 w-10",
};

const gapClasses = {
  sm: "gap-0.5",
  md: "gap-1",
  lg: "gap-1.5",
  xl: "gap-2",
};

export default function StarRating({
  value,
  onChange,
  max = 5,
  size = "md",
  readonly = false,
  showValue = false,
  label,
  required = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(null);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-primary ml-1">*</span>}
        </label>
      )}
      <div className="flex items-center gap-3">
        <div className={cn("flex", gapClasses[size])}>
          {Array.from({ length: max }, (_, i) => {
            const rating = i + 1;
            const isFilled = rating <= displayValue;

            return (
              <button
                key={rating}
                type="button"
                onClick={() => handleClick(rating)}
                onMouseEnter={() => handleMouseEnter(rating)}
                onMouseLeave={handleMouseLeave}
                disabled={readonly}
                className={cn(
                  "transition-all duration-150",
                  !readonly && "cursor-pointer hover:scale-110",
                  readonly && "cursor-default"
                )}
              >
                <Compass
                  className={cn(
                    sizeClasses[size],
                    "transition-colors duration-150",
                    isFilled
                      ? "text-primary fill-primary"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            );
          })}
        </div>
        {showValue && (
          <span
            className={cn(
              "font-semibold text-foreground",
              size === "xl" && "text-2xl",
              size === "lg" && "text-xl",
              size === "md" && "text-base",
              size === "sm" && "text-sm"
            )}
          >
            {value > 0 ? value.toFixed(1) : "-"}
          </span>
        )}
      </div>
    </div>
  );
}
