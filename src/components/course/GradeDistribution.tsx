"use client";

import { useMemo } from "react";
import { BarChart3 } from "lucide-react";

interface GradeDistributionProps {
  grades: (string | null)[];
}

const gradeOrder = ["AA", "BA", "BB", "CB", "CC", "DC", "DD", "FD", "FF"];
const gradeColors: Record<string, string> = {
  AA: "bg-emerald-500",
  BA: "bg-emerald-400",
  BB: "bg-green-400",
  CB: "bg-lime-400",
  CC: "bg-yellow-400",
  DC: "bg-amber-400",
  DD: "bg-orange-400",
  FD: "bg-red-400",
  FF: "bg-red-500",
};

export default function GradeDistribution({ grades }: GradeDistributionProps) {
  const distribution = useMemo(() => {
    const counts: Record<string, number> = {};
    gradeOrder.forEach((g) => (counts[g] = 0));

    grades.forEach((grade) => {
      if (grade && gradeOrder.includes(grade)) {
        counts[grade]++;
      }
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const maxCount = Math.max(...Object.values(counts), 1);

    return gradeOrder.map((grade) => ({
      grade,
      count: counts[grade],
      percentage: total > 0 ? Math.round((counts[grade] / total) * 100) : 0,
      heightPercent: (counts[grade] / maxCount) * 100,
    }));
  }, [grades]);

  const totalGrades = distribution.reduce((sum, d) => sum + d.count, 0);

  if (totalGrades === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border/50 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Not Dağılımı</h3>
        <span className="text-sm text-muted-foreground">({totalGrades} öğrenci)</span>
      </div>

      <div className="flex items-end justify-between gap-2 h-40">
        {distribution.map((d) => (
          <div key={d.grade} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-center">
              {d.count > 0 && (
                <span className="text-xs font-medium text-foreground mb-1">
                  {d.count}
                </span>
              )}
              <div
                className={`w-full rounded-t-md transition-all duration-300 ${gradeColors[d.grade]}`}
                style={{
                  height: `${Math.max(d.heightPercent, d.count > 0 ? 8 : 2)}%`,
                  minHeight: d.count > 0 ? "8px" : "2px",
                }}
              />
            </div>
            <div className="text-center">
              <span className="text-xs font-medium text-foreground">{d.grade}</span>
              {d.percentage > 0 && (
                <span className="block text-[10px] text-muted-foreground">
                  %{d.percentage}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span>Yüksek</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-400" />
          <span>Orta</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Düşük</span>
        </div>
      </div>
    </div>
  );
}
