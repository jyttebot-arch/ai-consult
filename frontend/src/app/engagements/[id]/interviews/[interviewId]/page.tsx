"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import {
  interviews,
  codedSegments,
  codes as codesApi,
  aiEngine,
} from "@/lib/api";
import type {
  Interview,
  CodedSegment,
  Code,
  AICodingResponse,
} from "@/lib/types";
import { INTERVIEW_STATUSES, SENTIMENT_OPTIONS } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Interview Detail Page — Intelligence Engine workspace              */
/* ------------------------------------------------------------------ */

export default function InterviewDetailPage({
  params,
}: {
  params: Promise<{ id: string; interviewId: string }>;
}) {
  const { id, interviewId } = use(params);
  const engagementId = Number(id);
  const intId = Number(interviewId);

  /* ---- core data ---- */
  const [interview, setInterview] = useState<Interview | null>(null);
  const [segments, setSegments] = useState<CodedSegment[]>([]);
  const [availableCodes, setAvailableCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);

  /* ---- transcript editing ---- */
  const [transcript, setTranscript] = useState("");
  const [impressions, setImpressions] = useState("");
  const [saving, setSaving] = useState(false);
  const [transcriptDirty, setTranscriptDirty] = useState(false);

  /* ---- edit metadata modal ---- */
  const [editMeta, setEditMeta] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaStatus, setMetaStatus] = useState("");
  const [metaInterviewer, setMetaInterviewer] = useState("");
  const [metaDate, setMetaDate] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);

  /* ---- add coded segment form ---- */
  const [showAddSegment, setShowAddSegment] = useState(false);
  const [segForm, setSegForm] = useState({
    code_id: "",
    text: "",
    sentiment: "neutral",
    is_quote: false,
    notes: "",
  });
  const [addingSegment, setAddingSegment] = useState(false);

  /* ---- AI auto-code ---- */
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState<AICodingResponse | null>(null);
  const [aiApplying, setAiApplying] = useState(false);
  const [aiError, setAiError] = useState("");

  /* ---- AI summarize ---- */
  const [summary, setSummary] = useState("");
  const [summarizing, setSummarizing] = useState(false);

  /* ================================================================ */
  /*  Data loading                                                     */
  /* ================================================================ */

  const loadInterview = useCallback(async () => {
    try {
      const data = await interviews.get(intId);
      setInterview(data);
      setTranscript(data.transcript || "");
      setImpressions(data.impressions || "");
      setTranscriptDirty(false);
    } catch (err) {
      console.error("Failed to load interview", err);
    }
  }, [intId]);

  const loadSegments = useCallback(async () => {
    try {
      const data = await codedSegments.list(intId);
      setSegments(data);
    } catch (err) {
      console.error("Failed to load coded segments", err);
    }
  }, [intId]);

  const loadCodes = useCallback(async () => {
    try {
      const data = await codesApi.list(engagementId);
      setAvailableCodes(data);
    } catch (err) {
      console.error("Failed to load codes", err);
    }
  }, [engagementId]);

  useEffect(() => {
    Promise.all([loadInterview(), loadSegments(), loadCodes()]).finally(() =>
      setLoading(false)
    );
  }, [loadInterview, loadSegments, loadCodes]);

  /* ================================================================ */
  /*  Handlers                                                         */
  /* ================================================================ */

  async function handleSaveTranscript() {
    setSaving(true);
    try {
      await interviews.update(intId, { transcript, impressions });
      setTranscriptDirty(false);
      await loadInterview();
    } catch (err) {
      console.error("Failed to save transcript", err);
    } finally {
      setSaving(false);
    }
  }

  function openEditMeta() {
    if (!interview) return;
    setMetaTitle(interview.title || "");
    setMetaStatus(interview.status);
    setMetaInterviewer(interview.interviewer_name || "");
    setMetaDate(interview.interview_date || "");
    setEditMeta(true);
  }

  async function handleSaveMeta() {
    setSavingMeta(true);
    try {
      await interviews.update(intId, {
        title: metaTitle,
        status: metaStatus,
        interviewer_name: metaInterviewer,
        interview_date: metaDate || null,
      });
      setEditMeta(false);
      await loadInterview();
    } catch (err) {
      console.error("Failed to update interview metadata", err);
    } finally {
      setSavingMeta(false);
    }
  }

  async function handleAddSegment() {
    if (!segForm.code_id || !segForm.text) return;
    setAddingSegment(true);
    try {
      // Calculate rough offsets based on transcript position
      const startOffset = transcript.indexOf(segForm.text);
      await codedSegments.create(intId, {
        code_id: Number(segForm.code_id),
        text: segForm.text,
        sentiment: segForm.sentiment,
        is_quote: segForm.is_quote ? 1 : 0,
        notes: segForm.notes || null,
        start_offset: startOffset >= 0 ? startOffset : 0,
        end_offset:
          startOffset >= 0 ? startOffset + segForm.text.length : segForm.text.length,
      });
      setSegForm({
        code_id: "",
        text: "",
        sentiment: "neutral",
        is_quote: false,
        notes: "",
      });
      setShowAddSegment(false);
      await loadSegments();
    } catch (err) {
      console.error("Failed to add coded segment", err);
    } finally {
      setAddingSegment(false);
    }
  }

  async function handleDeleteSegment(segId: number) {
    try {
      await codedSegments.delete(segId);
      await loadSegments();
    } catch (err) {
      console.error("Failed to delete segment", err);
    }
  }

  /* ---- AI auto-code ---- */
  async function handleAiCode() {
    setAiLoading(true);
    setAiError("");
    setAiPreview(null);
    try {
      const result = await aiEngine.codeInterview(intId);
      // Enable all by default
      result.codes = result.codes.map((c) => ({ ...c, enabled: true }));
      setAiPreview(result);
    } catch (err) {
      setAiError(
        err instanceof Error ? err.message : "AI coding failed. Check AI settings."
      );
    } finally {
      setAiLoading(false);
    }
  }

  function toggleAiCode(idx: number) {
    if (!aiPreview) return;
    const updated = { ...aiPreview };
    updated.codes = updated.codes.map((c, i) =>
      i === idx ? { ...c, enabled: !c.enabled } : c
    );
    setAiPreview(updated);
  }

  async function handleApplyAiCodes() {
    if (!aiPreview) return;
    const selected = aiPreview.codes.filter((c) => c.enabled);
    if (selected.length === 0) return;
    setAiApplying(true);
    try {
      await aiEngine.applyCodes(intId, selected);
      setAiPreview(null);
      await Promise.all([loadSegments(), loadCodes()]);
    } catch (err) {
      console.error("Failed to apply AI codes", err);
    } finally {
      setAiApplying(false);
    }
  }

  /* ---- AI summarize ---- */
  async function handleSummarize() {
    setSummarizing(true);
    try {
      const result = await aiEngine.summarize(intId);
      setSummary(result.summary);
    } catch (err) {
      console.error("Failed to generate summary", err);
    } finally {
      setSummarizing(false);
    }
  }

  /* ================================================================ */
  /*  Helpers                                                          */
  /* ================================================================ */

  function sentimentBadge(sentiment: string) {
    const def = SENTIMENT_OPTIONS.find((s) => s.value === sentiment);
    if (!def) return null;
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${def.color}`}
      >
        {def.icon} {def.label}
      </span>
    );
  }

  function statusBadge(status: string) {
    const def = INTERVIEW_STATUSES.find((s) => s.value === status);
    if (!def) return null;
    return (
      <span
        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${def.color}`}
      >
        {def.label}
      </span>
    );
  }

  /** Build transcript display with highlighted coded segments. */
  function renderHighlightedTranscript() {
    if (!transcript) return null;
    if (segments.length === 0) {
      return (
        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed">
          {transcript}
        </pre>
      );
    }

    // Sort segments by start_offset
    const sorted = [...segments].sort(
      (a, b) => a.start_offset - b.start_offset
    );

    const parts: React.ReactNode[] = [];
    let cursor = 0;

    sorted.forEach((seg, idx) => {
      // Add text before this segment
      if (seg.start_offset > cursor) {
        parts.push(
          <span key={`pre-${idx}`}>
            {transcript.slice(cursor, seg.start_offset)}
          </span>
        );
      }
      // Add highlighted segment
      const color = seg.code_color || "#3b82f6";
      parts.push(
        <span
          key={`seg-${seg.id}`}
          className="relative group cursor-pointer rounded px-0.5"
          style={{ backgroundColor: `${color}20`, borderBottom: `2px solid ${color}` }}
          title={`${seg.code_name || "Code"} (${seg.sentiment})`}
        >
          {transcript.slice(seg.start_offset, seg.end_offset)}
          {/* Tooltip */}
          <span className="absolute bottom-full left-0 mb-1 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
            {seg.code_name} &middot; {seg.sentiment}
          </span>
        </span>
      );
      cursor = seg.end_offset;
    });

    // Remaining text
    if (cursor < transcript.length) {
      parts.push(<span key="tail">{transcript.slice(cursor)}</span>);
    }

    return (
      <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 leading-relaxed">
        {parts}
      </pre>
    );
  }

  /* ================================================================ */
  /*  Loading / error states                                           */
  /* ================================================================ */

  if (loading) {
    return (
      <div className="px-10 py-8">
        <div className="text-gray-400 text-sm">Loading interview...</div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="px-10 py-8">
        <div className="text-gray-400 text-sm">Interview not found.</div>
      </div>
    );
  }

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="px-10 py-8 max-w-[1400px] mx-auto space-y-8">
      {/* ---- Breadcrumb ---- */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Link href="/engagements" className="hover:text-gray-600">
          Engagements
        </Link>
        <span>/</span>
        <Link
          href={`/engagements/${id}/interviews`}
          className="hover:text-gray-600"
        >
          Intelligence Engine
        </Link>
        <span>/</span>
        <span className="text-gray-700">
          {interview.title || `Interview #${interview.id}`}
        </span>
      </div>

      {/* ---- Header ---- */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[var(--navy)]">
            {interview.title || `Interview #${interview.id}`}
          </h1>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {interview.stakeholder_name && (
              <span className="font-medium">{interview.stakeholder_name}</span>
            )}
            {interview.stakeholder?.name && !interview.stakeholder_name && (
              <span className="font-medium">{interview.stakeholder.name}</span>
            )}
            {interview.interviewer_name && (
              <span className="text-gray-400">
                Interviewer: {interview.interviewer_name}
              </span>
            )}
            {interview.interview_date && (
              <span className="text-gray-400">
                {new Date(interview.interview_date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {statusBadge(interview.status)}
          <button
            onClick={openEditMeta}
            className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Edit
          </button>
        </div>
      </div>

      {/* ---- Edit Metadata Modal ---- */}
      {editMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-md p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[var(--navy)]">
              Edit Interview
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Status
                </label>
                <select
                  value={metaStatus}
                  onChange={(e) => setMetaStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
                >
                  {INTERVIEW_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Interviewer
                </label>
                <input
                  type="text"
                  value={metaInterviewer}
                  onChange={(e) => setMetaInterviewer(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Interview Date
                </label>
                <input
                  type="date"
                  value={metaDate}
                  onChange={(e) => setMetaDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditMeta(false)}
                className="text-sm px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMeta}
                disabled={savingMeta}
                className="text-sm px-4 py-2 bg-[var(--navy)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {savingMeta ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---- Two-column layout ---- */}
      <div className="flex gap-6">
        {/* ============ LEFT COLUMN — Transcript & Notes ============ */}
        <div className="w-[60%] space-y-6">
          {/* Transcript editor */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--navy)] uppercase tracking-wider">
                Transcript
              </h2>
              {transcriptDirty && (
                <span className="text-xs text-amber-600">Unsaved changes</span>
              )}
            </div>

            <textarea
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value);
                setTranscriptDirty(true);
              }}
              placeholder="Paste or type the interview transcript here..."
              rows={16}
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] resize-y"
            />

            {/* Impressions / Notes */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Impressions / Notes
              </label>
              <textarea
                value={impressions}
                onChange={(e) => {
                  setImpressions(e.target.value);
                  setTranscriptDirty(true);
                }}
                placeholder="Your impressions and field notes..."
                rows={4}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] resize-y"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveTranscript}
                disabled={saving || !transcriptDirty}
                className="text-sm px-4 py-2 bg-[var(--navy)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Saving..." : "Save Transcript"}
              </button>
            </div>
          </div>

          {/* Highlighted transcript view */}
          {transcript && segments.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
              <h2 className="text-sm font-semibold text-[var(--navy)] uppercase tracking-wider">
                Coded Transcript
              </h2>
              <p className="text-xs text-gray-400">
                Hover over highlighted segments to see code and sentiment.
              </p>
              <div className="border border-gray-100 rounded-lg p-4 bg-gray-50 max-h-[500px] overflow-y-auto">
                {renderHighlightedTranscript()}
              </div>
            </div>
          )}
        </div>

        {/* ============ RIGHT COLUMN — Coding Panel ============ */}
        <div className="w-[40%] space-y-6">
          {/* Coded segments list */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--navy)] uppercase tracking-wider">
                Coded Segments ({segments.length})
              </h2>
              <button
                onClick={() => setShowAddSegment(!showAddSegment)}
                className="text-xs px-3 py-1.5 bg-[var(--navy)] text-white rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
              >
                {showAddSegment ? "Cancel" : "+ Add Code Segment"}
              </button>
            </div>

            {/* Add segment form */}
            {showAddSegment && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Code
                  </label>
                  <select
                    value={segForm.code_id}
                    onChange={(e) =>
                      setSegForm({ ...segForm, code_id: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
                  >
                    <option value="">Select a code...</option>
                    {availableCodes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Quote / Text
                  </label>
                  <textarea
                    value={segForm.text}
                    onChange={(e) =>
                      setSegForm({ ...segForm, text: e.target.value })
                    }
                    placeholder="Paste or type the relevant quote..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)] resize-y"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Sentiment
                    </label>
                    <select
                      value={segForm.sentiment}
                      onChange={(e) =>
                        setSegForm({ ...segForm, sentiment: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
                    >
                      {SENTIMENT_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.icon} {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={segForm.is_quote}
                        onChange={(e) =>
                          setSegForm({ ...segForm, is_quote: e.target.checked })
                        }
                        className="rounded border-gray-300"
                      />
                      Direct quote
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Notes (optional)
                  </label>
                  <input
                    type="text"
                    value={segForm.notes}
                    onChange={(e) =>
                      setSegForm({ ...segForm, notes: e.target.value })
                    }
                    placeholder="Additional notes..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--navy)]/20 focus:border-[var(--navy)]"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleAddSegment}
                    disabled={addingSegment || !segForm.code_id || !segForm.text}
                    className="text-sm px-4 py-2 bg-[var(--navy)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                  >
                    {addingSegment ? "Adding..." : "Add Segment"}
                  </button>
                </div>
              </div>
            )}

            {/* Segment list */}
            {segments.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                No coded segments yet. Add one manually or use AI Auto-Code.
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {segments.map((seg) => (
                  <div
                    key={seg.id}
                    className="border border-gray-100 rounded-lg p-3 space-y-2 hover:border-gray-200 transition-colors"
                  >
                    <p className="text-sm text-gray-700 italic line-clamp-3">
                      &ldquo;{seg.text}&rdquo;
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{
                            backgroundColor: seg.code_color || "#3b82f6",
                          }}
                        />
                        <span className="text-xs font-medium text-gray-600">
                          {seg.code_name || `Code #${seg.code_id}`}
                        </span>
                        {sentimentBadge(seg.sentiment)}
                      </div>
                      <button
                        onClick={() => handleDeleteSegment(seg.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete segment"
                      >
                        Delete
                      </button>
                    </div>
                    {seg.notes && (
                      <p className="text-xs text-gray-400">{seg.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Auto-Code */}
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--navy)] uppercase tracking-wider">
                AI Coding
              </h2>
              <button
                onClick={handleAiCode}
                disabled={aiLoading || !transcript}
                className="text-xs px-3 py-1.5 bg-[var(--navy)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {aiLoading ? "Analyzing..." : "AI Auto-Code"}
              </button>
            </div>

            {!transcript && (
              <p className="text-xs text-gray-400">
                Add a transcript before using AI coding.
              </p>
            )}

            {aiLoading && (
              <div className="flex items-center gap-2 py-4">
                <div className="w-4 h-4 border-2 border-[var(--navy)] border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-500">
                  AI is analyzing the transcript...
                </span>
              </div>
            )}

            {aiError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {aiError}
              </div>
            )}

            {/* AI preview results */}
            {aiPreview && (
              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  AI suggested {aiPreview.codes.length} codes. Select which to
                  apply.
                  {aiPreview.model && (
                    <span className="text-gray-400 ml-1">
                      (Model: {aiPreview.model})
                    </span>
                  )}
                </p>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {aiPreview.codes.map((code, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-lg p-3 space-y-2 transition-colors ${
                        code.enabled
                          ? "border-[var(--navy)]/30 bg-blue-50/30"
                          : "border-gray-100 bg-gray-50/50 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={code.enabled}
                          onChange={() => toggleAiCode(idx)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-[var(--navy)]">
                          {code.name}
                        </span>
                      </div>
                      {code.description && (
                        <p className="text-xs text-gray-500 ml-6">
                          {code.description}
                        </p>
                      )}
                      {code.quotes.length > 0 && (
                        <div className="ml-6 space-y-1">
                          {code.quotes.map((q, qi) => (
                            <div
                              key={qi}
                              className="text-xs text-gray-600 bg-white border border-gray-100 rounded px-2 py-1"
                            >
                              <span className="italic">
                                &ldquo;{q.text.length > 120
                                  ? q.text.slice(0, 120) + "..."
                                  : q.text}
                                &rdquo;
                              </span>
                              <span className="ml-1">
                                {sentimentBadge(q.sentiment)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setAiPreview(null)}
                    className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={handleApplyAiCodes}
                    disabled={
                      aiApplying ||
                      aiPreview.codes.filter((c) => c.enabled).length === 0
                    }
                    className="text-sm px-4 py-2 bg-[var(--navy)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
                  >
                    {aiApplying
                      ? "Applying..."
                      : `Apply Selected (${aiPreview.codes.filter((c) => c.enabled).length})`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---- Bottom Section: Summary ---- */}
      <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--navy)] uppercase tracking-wider">
            Interview Summary
          </h2>
          <button
            onClick={handleSummarize}
            disabled={summarizing || !transcript}
            className="text-xs px-3 py-1.5 bg-[var(--navy)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            {summarizing ? "Generating..." : "AI Summarize"}
          </button>
        </div>

        {summarizing && (
          <div className="flex items-center gap-2 py-4">
            <div className="w-4 h-4 border-2 border-[var(--navy)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500">
              Generating summary...
            </span>
          </div>
        )}

        {summary ? (
          <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-4">
            <p className="whitespace-pre-wrap">{summary}</p>
          </div>
        ) : (
          !summarizing && (
            <p className="text-sm text-gray-400 py-2">
              {transcript
                ? "Click \"AI Summarize\" to generate an interview summary."
                : "Add a transcript first, then use AI to generate a summary."}
            </p>
          )
        )}
      </div>

      {/* Meta */}
      <div className="text-xs text-gray-400 pt-4 border-t border-gray-100">
        Created {new Date(interview.created_at).toLocaleString()} | Last updated{" "}
        {new Date(interview.updated_at).toLocaleString()}
      </div>
    </div>
  );
}
