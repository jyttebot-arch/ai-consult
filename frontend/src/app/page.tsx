"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ServiceGrid from "@/components/ServiceGrid";
import { engagements as api } from "@/lib/api";
import type { Engagement } from "@/lib/types";
import { SERVICE_CATEGORIES, ENGAGEMENT_STATUSES } from "@/lib/types";

export default function Home() {
  const [recent, setRecent] = useState<Engagement[]>([]);

  useEffect(() => {
    api.list().then((data) => setRecent(data.slice(0, 5)));
  }, []);

  return (
    <div className="px-10 py-8 max-w-6xl mx-auto space-y-10">
      {/* Hero */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[var(--navy)]">
          Consulting Platform
        </h1>
        <p className="text-gray-500 text-base max-w-2xl">
          Supporting strategy consultants across the full project lifecycle —
          from engagement setup to final board-level presentation.
        </p>
      </div>

      {/* New Engagement CTA */}
      <div className="flex items-center gap-4">
        <Link
          href="/engagements/new"
          className="inline-flex items-center gap-2 bg-[var(--navy)] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--navy-light)] transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>
          New Engagement
        </Link>
        <Link
          href="/engagements"
          className="text-sm text-[var(--navy-light)] hover:underline"
        >
          View all engagements
        </Link>
      </div>

      {/* Service Categories Grid */}
      <section className="space-y-4 pl-10">
        <h2 className="text-lg font-semibold text-[var(--navy)]">
          Start from a service area
        </h2>
        <p className="text-sm text-gray-500">
          Click a service to create a new engagement pre-configured for that
          type of work.
        </p>
        <ServiceGrid />
      </section>

      {/* Recent Engagements */}
      {recent.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--navy)]">
            Recent engagements
          </h2>
          <div className="grid gap-3">
            {recent.map((eng) => {
              const cat = SERVICE_CATEGORIES.find(
                (c) => c.key === eng.service_category
              );
              const statusDef = ENGAGEMENT_STATUSES.find(
                (s) => s.value === eng.status
              );
              return (
                <Link
                  key={eng.id}
                  href={`/engagements/${eng.id}`}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-5 py-4 hover:border-[var(--navy)]/30 hover:shadow-sm transition-all"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-[var(--navy)]">
                      {eng.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {eng.client_name}
                      {cat && (
                        <span className="ml-2 text-gray-400">
                          {cat.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusDef && (
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusDef.color}`}
                      >
                        {statusDef.label}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(eng.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
