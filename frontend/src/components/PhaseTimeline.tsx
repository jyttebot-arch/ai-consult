"use client";

import type { Phase } from "@/lib/types";

const STATUS_STYLES: Record<string, { dot: string; line: string; label: string }> = {
  completed: {
    dot: "bg-emerald-500 ring-emerald-100",
    line: "bg-emerald-400",
    label: "text-emerald-700",
  },
  in_progress: {
    dot: "bg-blue-500 ring-blue-100 animate-pulse",
    line: "bg-gray-200",
    label: "text-blue-700 font-medium",
  },
  not_started: {
    dot: "bg-gray-300 ring-gray-100",
    line: "bg-gray-200",
    label: "text-gray-400",
  },
};

export default function PhaseTimeline({ phases }: { phases: Phase[] }) {
  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2">
      {phases.map((phase, i) => {
        const style = STATUS_STYLES[phase.status] || STATUS_STYLES.not_started;
        const isLast = i === phases.length - 1;
        return (
          <div key={phase.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-4 h-4 rounded-full ring-4 ${style.dot}`}
              />
              <span className={`text-xs whitespace-nowrap ${style.label}`}>
                {phase.name}
              </span>
            </div>
            {!isLast && (
              <div className={`h-0.5 w-16 ${style.line} mx-2 -mt-5`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
