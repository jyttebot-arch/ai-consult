"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { stakeholders as stakeholdersApi, interviews as interviewsApi, codes as codesApi, analysis as analysisApi } from "@/lib/api";
import { engagements as engagementsApi } from "@/lib/api";
import type { Stakeholder, Interview, Code, CodeAnalysis, Engagement } from "@/lib/types";
import { STAKEHOLDER_TYPES, SENIORITY_LEVELS, INTERVIEW_STATUSES, SENTIMENT_OPTIONS, CODE_COLORS } from "@/lib/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = "stakeholders" | "interviews" | "codes" | "analysis";

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function InterviewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const engagementId = Number(id);

  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("stakeholders");
  const [loading, setLoading] = useState(true);

  // Data
  const [stakeholderList, setStakeholderList] = useState<Stakeholder[]>([]);
  const [interviewList, setInterviewList] = useState<Interview[]>([]);
  const [codeList, setCodeList] = useState<Code[]>([]);
  const [analysisList, setAnalysisList] = useState<CodeAnalysis[]>([]);

  // Loading states
  const [loadingStakeholders, setLoadingStakeholders] = useState(false);
  const [loadingInterviews, setLoadingInterviews] = useState(false);
  const [loadingCodes, setLoadingCodes] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // ----- Load engagement -----
  useEffect(() => {
    engagementsApi.get(engagementId).then((data) => {
      setEngagement(data);
      setLoading(false);
    });
  }, [engagementId]);

  // ----- Load data per tab -----
  const loadStakeholders = useCallback(() => {
    setLoadingStakeholders(true);
    stakeholdersApi.list(engagementId).then((data) => {
      setStakeholderList(data);
      setLoadingStakeholders(false);
    }).catch(() => setLoadingStakeholders(false));
  }, [engagementId]);

  const loadInterviews = useCallback(() => {
    setLoadingInterviews(true);
    interviewsApi.list(engagementId).then((data) => {
      setInterviewList(data);
      setLoadingInterviews(false);
    }).catch(() => setLoadingInterviews(false));
  }, [engagementId]);

  const loadCodes = useCallback(() => {
    setLoadingCodes(true);
    codesApi.list(engagementId).then((data) => {
      setCodeList(data);
      setLoadingCodes(false);
    }).catch(() => setLoadingCodes(false));
  }, [engagementId]);

  const loadAnalysis = useCallback(() => {
    setLoadingAnalysis(true);
    analysisApi.get(engagementId).then((data) => {
      setAnalysisList(data);
      setLoadingAnalysis(false);
    }).catch(() => setLoadingAnalysis(false));
  }, [engagementId]);

  useEffect(() => {
    if (activeTab === "stakeholders") loadStakeholders();
    if (activeTab === "interviews") {
      loadInterviews();
      loadStakeholders(); // needed for stakeholder dropdown
    }
    if (activeTab === "codes") loadCodes();
    if (activeTab === "analysis") loadAnalysis();
  }, [activeTab, loadStakeholders, loadInterviews, loadCodes, loadAnalysis]);

  // ----- Render -----
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

  const TABS: { key: Tab; label: string }[] = [
    { key: "stakeholders", label: "Stakeholders" },
    { key: "interviews", label: "Interviews" },
    { key: "codes", label: "Codes" },
    { key: "analysis", label: "Analysis" },
  ];

  return (
    <div className="px-10 py-8 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/engagements" className="hover:text-gray-600">
          Engagements
        </Link>
        <span>/</span>
        <Link href={`/engagements/${id}`} className="hover:text-gray-600">
          {engagement.title}
        </Link>
        <span>/</span>
        <span className="text-gray-700">Intelligence Engine</span>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[var(--navy)]">Intelligence Engine</h1>
        <p className="text-sm text-gray-500">
          Manage stakeholders, interviews, qualitative coding, and analysis
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative cursor-pointer ${
              activeTab === tab.key
                ? "text-[var(--navy)]"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--navy)] rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "stakeholders" && (
        <StakeholdersTab
          engagementId={engagementId}
          stakeholders={stakeholderList}
          loading={loadingStakeholders}
          onRefresh={loadStakeholders}
        />
      )}
      {activeTab === "interviews" && (
        <InterviewsTab
          engagementId={engagementId}
          interviews={interviewList}
          stakeholders={stakeholderList}
          loading={loadingInterviews}
          onRefresh={loadInterviews}
        />
      )}
      {activeTab === "codes" && (
        <CodesTab
          engagementId={engagementId}
          codes={codeList}
          loading={loadingCodes}
          onRefresh={loadCodes}
        />
      )}
      {activeTab === "analysis" && (
        <AnalysisTab
          analysisList={analysisList}
          loading={loadingAnalysis}
        />
      )}
    </div>
  );
}

// ===========================================================================
// Stakeholders Tab
// ===========================================================================

function StakeholdersTab({
  engagementId,
  stakeholders,
  loading,
  onRefresh,
}: {
  engagementId: number;
  stakeholders: Stakeholder[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    name: "",
    role: "",
    type: "internal",
    seniority_level: "mid",
    perspective_angle: "",
    contact_info: "",
  };
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(s: Stakeholder) {
    setEditingId(s.id);
    setForm({
      name: s.name,
      role: s.role,
      type: s.type,
      seniority_level: s.seniority_level || "mid",
      perspective_angle: s.perspective_angle || "",
      contact_info: s.contact_info || "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await stakeholdersApi.update(editingId, form);
      } else {
        await stakeholdersApi.create(engagementId, form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this stakeholder?")) return;
    await stakeholdersApi.delete(id);
    onRefresh();
  }

  const typeBadge = (type: string) => {
    const def = STAKEHOLDER_TYPES.find((t) => t.value === type);
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${def?.color || "bg-gray-100 text-gray-600"}`}>
        {def?.label || type}
      </span>
    );
  };

  const seniorityLabel = (level: string | null) => {
    const def = SENIORITY_LEVELS.find((s) => s.value === level);
    return def?.label || level || "-";
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--navy)]">Stakeholders</h2>
        <button
          onClick={openCreate}
          className="bg-[var(--navy)] text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          + Add Stakeholder
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[var(--navy)]">
            {editingId ? "Edit Stakeholder" : "New Stakeholder"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
                placeholder="Full name"
              />
            </div>
            {/* Role */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Role *</label>
              <input
                required
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
                placeholder="e.g. CFO, Product Manager"
              />
            </div>
            {/* Type */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
              >
                {STAKEHOLDER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            {/* Seniority */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Seniority Level</label>
              <select
                value={form.seniority_level}
                onChange={(e) => setForm({ ...form, seniority_level: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
              >
                {SENIORITY_LEVELS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            {/* Perspective Angle */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Perspective Angle</label>
              <input
                value={form.perspective_angle}
                onChange={(e) => setForm({ ...form, perspective_angle: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
                placeholder="e.g. Finance, Operations"
              />
            </div>
            {/* Contact Info */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Contact Info</label>
              <input
                value={form.contact_info}
                onChange={(e) => setForm({ ...form, contact_info: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
                placeholder="Email or phone"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[var(--navy)] text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-sm text-gray-400">Loading stakeholders...</div>
      ) : stakeholders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-sm text-gray-400">No stakeholders yet. Add your first stakeholder to get started.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Seniority</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stakeholders.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                  <td className="px-4 py-3 text-gray-600">{s.role}</td>
                  <td className="px-4 py-3">{typeBadge(s.type)}</td>
                  <td className="px-4 py-3 text-gray-600">{seniorityLabel(s.seniority_level)}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => openEdit(s)}
                      className="text-xs text-[var(--navy)] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-xs text-red-500 hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Interviews Tab
// ===========================================================================

function InterviewsTab({
  engagementId,
  interviews,
  stakeholders,
  loading,
  onRefresh,
}: {
  engagementId: number;
  interviews: Interview[];
  stakeholders: Stakeholder[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    title: "",
    stakeholder_id: "",
    interview_date: "",
    status: "scheduled",
    notes: "",
  };
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setForm(emptyForm);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await interviewsApi.create(engagementId, {
        ...form,
        stakeholder_id: Number(form.stakeholder_id),
        interview_date: form.interview_date || null,
        notes: form.notes || null,
      });
      setShowForm(false);
      setForm(emptyForm);
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this interview?")) return;
    await interviewsApi.delete(id);
    onRefresh();
  }

  const statusBadge = (status: string) => {
    const def = INTERVIEW_STATUSES.find((s) => s.value === status);
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${def?.color || "bg-gray-100 text-gray-600"}`}>
        {def?.label || status}
      </span>
    );
  };

  const stakeholderName = (stakeholderId: number) => {
    const s = stakeholders.find((st) => st.id === stakeholderId);
    return s?.name || "Unknown";
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--navy)]">Interviews</h2>
        <button
          onClick={openCreate}
          className="bg-[var(--navy)] text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          + Add Interview
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[var(--navy)]">New Interview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
                placeholder="Interview title"
              />
            </div>
            {/* Stakeholder */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Stakeholder *</label>
              <select
                required
                value={form.stakeholder_id}
                onChange={(e) => setForm({ ...form, stakeholder_id: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
              >
                <option value="">Select stakeholder...</option>
                {stakeholders.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} - {s.role}</option>
                ))}
              </select>
            </div>
            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Interview Date</label>
              <input
                type="date"
                value={form.interview_date}
                onChange={(e) => setForm({ ...form, interview_date: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
              />
            </div>
            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
              >
                {INTERVIEW_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            {/* Notes */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-500">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
                placeholder="Preparation notes, topics to cover..."
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[var(--navy)] text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Interview list */}
      {loading ? (
        <div className="text-sm text-gray-400">Loading interviews...</div>
      ) : interviews.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-sm text-gray-400">No interviews yet. Add stakeholders first, then schedule interviews.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {interviews.map((iv) => (
            <Link
              key={iv.id}
              href={`/engagements/${engagementId}/interviews/${iv.id}`}
              className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-[var(--navy)]/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-800">
                      {iv.title || "Untitled Interview"}
                    </span>
                    {statusBadge(iv.status)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{iv.stakeholder_name || stakeholderName(iv.stakeholder_id)}</span>
                    {iv.interview_date && (
                      <>
                        <span>|</span>
                        <span>{new Date(iv.interview_date).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(iv.id);
                    }}
                    className="text-xs text-red-500 hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-300">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Codes Tab
// ===========================================================================

function CodesTab({
  engagementId,
  codes,
  loading,
  onRefresh,
}: {
  engagementId: number;
  codes: Code[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    name: "",
    description: "",
    type: "descriptive",
    color: CODE_COLORS[0] as string,
  };
  const [form, setForm] = useState(emptyForm);

  function openCreate() {
    setForm(emptyForm);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await codesApi.create(engagementId, {
        ...form,
        description: form.description || null,
      });
      setShowForm(false);
      setForm(emptyForm);
      onRefresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this code? Associated segments will also be removed.")) return;
    await codesApi.delete(id);
    onRefresh();
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--navy)]">Qualitative Codes</h2>
        <button
          onClick={openCreate}
          className="bg-[var(--navy)] text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
        >
          + Add Code
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[var(--navy)]">New Code</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
                placeholder="e.g. Change Resistance"
              />
            </div>
            {/* Type */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
              >
                <option value="descriptive">Descriptive</option>
                <option value="interpretive">Interpretive</option>
                <option value="pattern">Pattern</option>
              </select>
            </div>
            {/* Description */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-500">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
                placeholder="What does this code represent?"
              />
            </div>
            {/* Color picker */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-gray-500">Color</label>
              <div className="flex gap-2 flex-wrap">
                {CODE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                      form.color === color ? "border-[var(--navy)] scale-110" : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-[var(--navy)] text-white text-sm px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Code list */}
      {loading ? (
        <div className="text-sm text-gray-400">Loading codes...</div>
      ) : codes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-sm text-gray-400">No codes defined yet. Create codes to categorize interview segments.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {codes.map((code) => (
            <div
              key={code.id}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: code.color }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{code.name}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                      {code.type}
                    </span>
                  </div>
                  {code.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{code.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">
                  {code.segment_count ?? 0} segment{(code.segment_count ?? 0) !== 1 ? "s" : ""}
                </span>
                <button
                  onClick={() => handleDelete(code.id)}
                  className="text-xs text-red-500 hover:underline cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// Analysis Tab
// ===========================================================================

function AnalysisTab({
  analysisList,
  loading,
}: {
  analysisList: CodeAnalysis[];
  loading: boolean;
}) {
  if (loading) {
    return <div className="text-sm text-gray-400">Loading analysis...</div>;
  }

  if (analysisList.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-sm text-gray-400">
          No analysis data yet. Code interview segments first, then return here for insights.
        </p>
      </div>
    );
  }

  const maxFrequency = Math.max(...analysisList.map((a) => a.frequency), 1);

  // Collect all key quotes across codes
  const allQuotes = analysisList.flatMap((a) =>
    a.quotes
      .filter((q) => q.is_quote)
      .map((q) => ({
        text: q.text,
        codeName: a.code_name,
        codeColor: a.code_color,
        sentiment: q.sentiment,
        stakeholderName: q.stakeholder_name,
      }))
  );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[var(--navy)]">Analysis</h2>

      {/* Code frequency chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-600">Code Frequency</h3>
        <div className="space-y-3">
          {analysisList
            .sort((a, b) => b.frequency - a.frequency)
            .map((a) => (
            <div key={a.code_id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: a.code_color }}
                  />
                  <span className="font-medium text-gray-700">{a.code_name}</span>
                </div>
                <span className="text-gray-400">{a.frequency} segment{a.frequency !== 1 ? "s" : ""}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all"
                  style={{
                    width: `${(a.frequency / maxFrequency) * 100}%`,
                    backgroundColor: a.code_color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sentiment distribution per code */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-600">Sentiment Distribution</h3>
        <div className="space-y-4">
          {analysisList.map((a) => {
            const total = a.sentiment.positive + a.sentiment.negative + a.sentiment.ambivalent + a.sentiment.neutral;
            if (total === 0) return null;
            return (
              <div key={a.code_id} className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: a.code_color }}
                  />
                  <span className="font-medium text-gray-700">{a.code_name}</span>
                </div>
                {/* Stacked horizontal bar */}
                <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                  {a.sentiment.positive > 0 && (
                    <div
                      className="bg-emerald-400 transition-all"
                      style={{ width: `${(a.sentiment.positive / total) * 100}%` }}
                      title={`Positive: ${a.sentiment.positive}`}
                    />
                  )}
                  {a.sentiment.neutral > 0 && (
                    <div
                      className="bg-gray-300 transition-all"
                      style={{ width: `${(a.sentiment.neutral / total) * 100}%` }}
                      title={`Neutral: ${a.sentiment.neutral}`}
                    />
                  )}
                  {a.sentiment.ambivalent > 0 && (
                    <div
                      className="bg-amber-400 transition-all"
                      style={{ width: `${(a.sentiment.ambivalent / total) * 100}%` }}
                      title={`Ambivalent: ${a.sentiment.ambivalent}`}
                    />
                  )}
                  {a.sentiment.negative > 0 && (
                    <div
                      className="bg-red-400 transition-all"
                      style={{ width: `${(a.sentiment.negative / total) * 100}%` }}
                      title={`Negative: ${a.sentiment.negative}`}
                    />
                  )}
                </div>
                {/* Legend */}
                <div className="flex gap-3 text-xs text-gray-400">
                  {a.sentiment.positive > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Positive ({a.sentiment.positive})
                    </span>
                  )}
                  {a.sentiment.neutral > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-300" />
                      Neutral ({a.sentiment.neutral})
                    </span>
                  )}
                  {a.sentiment.ambivalent > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      Ambivalent ({a.sentiment.ambivalent})
                    </span>
                  )}
                  {a.sentiment.negative > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      Negative ({a.sentiment.negative})
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key quotes */}
      {allQuotes.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
          <h3 className="text-sm font-semibold text-gray-600">Key Quotes</h3>
          <div className="space-y-3">
            {allQuotes.slice(0, 20).map((q, i) => {
              const sentimentDef = SENTIMENT_OPTIONS.find((s) => s.value === q.sentiment);
              return (
                <div key={i} className="border-l-3 pl-4 py-1" style={{ borderColor: q.codeColor }}>
                  <p className="text-sm text-gray-700 italic">&ldquo;{q.text}&rdquo;</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: q.codeColor }}
                    />
                    <span>{q.codeName}</span>
                    {q.stakeholderName && (
                      <>
                        <span>|</span>
                        <span>{q.stakeholderName}</span>
                      </>
                    )}
                    {sentimentDef && (
                      <>
                        <span>|</span>
                        <span className={`px-1.5 py-0.5 rounded ${sentimentDef.color}`}>
                          {sentimentDef.label}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
