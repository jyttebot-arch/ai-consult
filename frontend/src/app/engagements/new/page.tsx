"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { engagements as api } from "@/lib/api";
import { SERVICE_CATEGORIES } from "@/lib/types";

export default function NewEngagementPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    title: "",
    client_name: "",
    service_category: "",
    service_type: "",
    description: "",
    scope: "",
    ambition_level: "",
    success_criteria: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill from URL params (when clicking from service grid)
  useEffect(() => {
    const category = searchParams.get("category");
    const service = searchParams.get("service");
    if (category || service) {
      setForm((prev) => ({
        ...prev,
        service_category: category || prev.service_category,
        service_type: service || prev.service_type,
      }));
    }
  }, [searchParams]);

  const selectedCategory = SERVICE_CATEGORIES.find(
    (c) => c.key === form.service_category
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const eng = await api.create(form);
      router.push(`/engagements/${eng.id}`);
    } catch (err) {
      alert("Error creating engagement: " + (err as Error).message);
      setSubmitting(false);
    }
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="px-10 py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--navy)] mb-8">
        New Engagement
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Service Category */}
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold text-gray-700">
            Service Category *
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {SERVICE_CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() =>
                  update("service_category", cat.key)
                }
                className={`text-left border rounded-lg px-4 py-3 text-sm transition-all ${
                  form.service_category === cat.key
                    ? "border-[var(--navy)] bg-[var(--navy)]/5 ring-1 ring-[var(--navy)]/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-medium text-[var(--navy)]">{cat.label}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {cat.services.length} services
                </div>
              </button>
            ))}
          </div>
        </fieldset>

        {/* Service Type */}
        {selectedCategory && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Service Type
            </label>
            <select
              value={form.service_type}
              onChange={(e) => update("service_type", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--navy)]/40"
            >
              <option value="">Select a service...</option>
              {selectedCategory.services.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Title & Client */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Engagement Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Market Strategy 2026"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--navy)]/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Client Name *
            </label>
            <input
              type="text"
              required
              value={form.client_name}
              onChange={(e) => update("client_name", e.target.value)}
              placeholder="e.g. GF Forsikring"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--navy)]/40"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={3}
            placeholder="Brief description of the engagement..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--navy)]/40"
          />
        </div>

        {/* Scope */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Scope Boundaries
          </label>
          <textarea
            value={form.scope}
            onChange={(e) => update("scope", e.target.value)}
            rows={2}
            placeholder="What is in scope and what is out of scope..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--navy)]/40"
          />
        </div>

        {/* Ambition Level */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Ambition Level
          </label>
          <select
            value={form.ambition_level}
            onChange={(e) => update("ambition_level", e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--navy)]/40"
          >
            <option value="">Select...</option>
            <option value="incremental">Incremental improvement</option>
            <option value="transformational">Transformational change</option>
            <option value="inspirational">Inspirational / thought leadership</option>
          </select>
        </div>

        {/* Success Criteria */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">
            Success Criteria
          </label>
          <textarea
            value={form.success_criteria}
            onChange={(e) => update("success_criteria", e.target.value)}
            rows={2}
            placeholder="What does success look like for this engagement?"
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--navy)]/40"
          />
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-sm text-blue-700">
          Four default phases will be created automatically: Mobilisation,
          Analysis, Working Sessions, and Consolidation. You can customize these
          after creation.
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={submitting || !form.title || !form.client_name || !form.service_category}
            className="bg-[var(--navy)] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--navy-light)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Creating..." : "Create Engagement"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
