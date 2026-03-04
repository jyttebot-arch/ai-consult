"use client";

import { SERVICE_CATEGORIES } from "@/lib/types";
import Link from "next/link";

/* Simple SVG icons for each category */
const ICONS: Record<string, React.ReactNode> = {
  strategy_organization: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path d="M3 21h18M3 7v14M21 7v14M6 7V4a1 1 0 011-1h10a1 1 0 011 1v3M9 21v-4a1 1 0 011-1h4a1 1 0 011 1v4" />
      <path d="M9 10h1M14 10h1M9 14h1M14 14h1" />
    </svg>
  ),
  business_transformation: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path d="M12 2l3 7h7l-5.5 4.5 2 7L12 16l-6.5 4.5 2-7L2 9h7z" />
    </svg>
  ),
  commercial_excellence: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <path d="M3 3v18h18M7 15l4-4 3 3 5-5" />
      <path d="M15 9h4v4" />
    </svg>
  ),
  data_ai: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-7 h-7">
      <rect x="2" y="3" width="20" height="4" rx="1" />
      <rect x="2" y="10" width="20" height="4" rx="1" />
      <rect x="2" y="17" width="20" height="4" rx="1" />
      <circle cx="6" cy="5" r="1" fill="currentColor" />
      <circle cx="6" cy="12" r="1" fill="currentColor" />
      <circle cx="6" cy="19" r="1" fill="currentColor" />
    </svg>
  ),
};

/* Smaller service-level icons */
function ServiceIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4 text-[var(--navy-light)] opacity-50 shrink-0 mt-0.5">
      <circle cx="8" cy="8" r="3" />
    </svg>
  );
}

export default function ServiceGrid() {
  return (
    <div className="relative border border-dashed border-[var(--navy)]/20 rounded-2xl p-8 bg-white">
      {/* Vertical label */}
      <div className="absolute -left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-4">
        <span
          className="text-xs font-semibold text-[var(--navy)] tracking-wider uppercase"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          Core services
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {SERVICE_CATEGORIES.map((cat) => (
          <div key={cat.key} className="space-y-4">
            {/* Category header */}
            <div className="flex items-center gap-3 pb-3 border-b border-[var(--navy)]/10">
              <div className="text-[var(--navy)]">{ICONS[cat.key]}</div>
              <h3 className="font-bold text-[var(--navy)] text-sm leading-tight">
                {cat.label}
              </h3>
            </div>

            {/* Services list */}
            <ul className="space-y-2.5">
              {cat.services.map((service) => (
                <li key={service}>
                  <Link
                    href={`/engagements/new?category=${cat.key}&service=${encodeURIComponent(service)}`}
                    className="flex items-start gap-2 text-sm text-gray-700 hover:text-[var(--navy)] transition-colors group"
                  >
                    <ServiceIcon />
                    <span className="group-hover:underline">{service}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
