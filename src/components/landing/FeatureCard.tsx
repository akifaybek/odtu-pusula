"use client";

import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: FeatureCardProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <div
      ref={ref}
      className={cn(
        "group p-6 md:p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur",
        "hover:border-primary/50 hover:bg-card/80 transition-all duration-500",
        "transform",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-5 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-xl font-semibold mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
