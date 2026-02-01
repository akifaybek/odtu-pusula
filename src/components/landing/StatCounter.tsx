"use client";

import { useCountUp } from "@/hooks/useCountUp";

interface StatCounterProps {
  end: number;
  suffix?: string;
  label: string;
}

export default function StatCounter({ end, suffix = "", label }: StatCounterProps) {
  const { count, ref } = useCountUp({ end, duration: 2500 });

  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-1">
        {count}
        {suffix}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
