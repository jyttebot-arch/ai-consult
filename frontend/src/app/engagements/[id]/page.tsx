"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { engagements as api } from "@/lib/api";
import type { Engagement } from "@/lib/types";
import { SERVICE_CATEGORIES, ENGAGEMENT_STATUSES } from "@/lib/types";
import PhaseTimeline from "@/components/PhaseTimeline";
import HypothesisBoard from "@/components/HypothesisBoard";
import AIAssistant from "@/components/AIAssistant";

export default function EngagementDashboard({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingStatus, setEditingStatus] = useState(false);

  const load = useCallback(() => {
    api.get(Number(id)).then((data) => {
      setEngagement(data);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleStatusChange(status: string) {
    await api.update(Number(id), { status });
    setEditingStatus(false);
    load();
  }

  if (loading) {
    return (
      <div className="px-10 py-8">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!engagement) {
    return (
      <div className="px-10 py-8">
        <div className="text-gray-400 text-sm">Engagement not found</div>
      </div>
    );
  }

  const cat = SERVICE_CATEGORIES.find(
    (c) => c.key === engagement.service_category
  );
  const statusDef = ENGAGEMENT_STATUSES.find(
    (s) => s.value === engagement.status
  );

  return (
    <div className="px-10 py-8 max-w-6xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/engagements" className="hover:text-gray-600">
          Engagements
        </Link>
        <span>/</span>
        <span className="text-gray-700">{engagement.title}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[var(--navy)]">
            {engagement.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="font-medium">{engagement.client_name}</span>
            {cat && (
              <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs">
                {cat.label}
              </span>
            )}
            {engagement.service_type && (
              <span className="text-gray-400">/ {engagement.service_type}</span>
            )}
          </div>
        </div>

        {/* Status badge (clickable) */}
        <div className="relative">
          {editingStatus ? (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2 space-y-1 absolute right-0 top-0 z-10 min-w-[160px]">
              {ENGAGEMENT_STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleStatusChange(s.value)}
                  className={`w-full text-left text-xs px-3 py-1.5 rounded ${
                    s.value === engagement.status
                      ? s.color + " font-medium"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <button
                onClick={() => setEditingStatus(false)}
                className="w-full text-left text-xs px-3 py-1.5 text-gray-400 hover:text-gray-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            statusDef && (
              <button
                onClick={() => setEditingStatus(true)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusDef.color} hover:opacity-80 transition-opacity cursor-pointer`}
                title="Click to change status"
              >
                {statusDef.label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {engagement.description && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Description
            </h3>
            <p className="text-sm text-gray-700">{engagement.description}</p>
          </div>
        )}
        {engagement.scope && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Scope
            </h3>
            <p className="text-sm text-gray-700">{engagement.scope}</p>
          </div>
        )}
        {engagement.ambition_level && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Ambition Level
            </h3>
            <p className="text-sm text-gray-700 capitalize">
              {engagement.ambition_level}
            </p>
          </div>
        )}
        {engagement.success_criteria && (
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-2">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Success Criteria
            </h3>
            <p className="text-sm text-gray-700">{engagement.success_criteria}</p>
          </div>
        )}
      </div>

      {/* Phase Timeline */}
      {engagement.phases && engagement.phases.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--navy)]">
            Project Phases
          </h2>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <PhaseTimeline phases={engagement.phases} />
          </div>
        </section>
      )}

      {/* Hypothesis Board */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--navy)]">
          Hypothesis Board
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <HypothesisBoard
            engagementId={engagement.id}
            items={engagement.hypotheses || []}
            onChange={load}
          />
        </div>
      </section>

      {/* AI Assistant */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--navy)]">
          AI Assistant
        </h2>
        <AIAssistant engagementId={engagement.id} />
      </section>

      {/* Module quick links */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--navy)]">
          Modules
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Intelligence Engine — active */}
          <Link
            href={`/engagements/${id}/interviews`}
            className="bg-white border border-[var(--navy)]/20 rounded-lg p-4 space-y-1 hover:border-[var(--navy)]/40 hover:shadow-sm transition-all"
          >
            <div className="text-2xl">&#128269;</div>
            <div className="text-sm font-medium text-[var(--navy)]">
              Intelligence Engine
            </div>
            <div className="text-xs text-gray-500">Interviews, coding &amp; analysis</div>
            <div className="text-xs text-emerald-600 font-medium">Active</div>
          </Link>
          {/* Remaining modules — placeholders */}
          {[
            { name: "Framework Studio", desc: "Dilemmas & scenarios", icon: "&#9881;" },
            { name: "Presentation Builder", desc: "Slides & narrative", icon: "&#128196;" },
            { name: "Roadmap Engine", desc: "Initiatives & KPIs", icon: "&#128640;" },
            { name: "Client Collaboration", desc: "Reviews & decisions", icon: "&#129309;" },
          ].map((mod) => (
            <div
              key={mod.name}
              className="bg-white border border-gray-200 rounded-lg p-4 opacity-60 cursor-not-allowed space-y-1"
              title="Coming soon"
            >
              <div className="text-2xl" dangerouslySetInnerHTML={{ __html: mod.icon }} />
              <div className="text-sm font-medium text-[var(--navy)]">
                {mod.name}
              </div>
              <div className="text-xs text-gray-400">{mod.desc}</div>
              <div className="text-xs text-amber-500 font-medium">Coming soon</div>
            </div>
          ))}
        </div>
      </section>

      {/* Meta */}
      <div className="text-xs text-gray-400 pt-4 border-t border-gray-100">
        Created {new Date(engagement.created_at).toLocaleString()} | Last
        updated {new Date(engagement.updated_at).toLocaleString()}
      </div>
    </div>
  );
}
