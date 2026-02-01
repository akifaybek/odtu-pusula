"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  delay?: number;
  isLast?: boolean;
}

export default function StepCard({
  number,
  title,
  description,
  delay = 0,
  isLast = false,
}: StepCardProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex flex-col items-center text-center",
        "transform transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Connector line */}
      {!isLast && (
        <div className="hidden md:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-gradient-to-r from-primary/40 to-accent/40" />
      )}

      {/* Number circle */}
      <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-emerald-600 text-white text-2xl font-bold mb-6 shadow-lg shadow-primary/30">
        {number}
      </div>

      {/* Content */}
      <h3 className="text-lg md:text-xl font-semibold mb-2 text-foreground">
        {title}
      </h3>
      <p className="text-sm md:text-base text-muted-foreground max-w-xs">
        {description}
      </p>
    </div>
  );
}
