"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { engagements as api } from "@/lib/api";
import type { Engagement } from "@/lib/types";
import { SERVICE_CATEGORIES, ENGAGEMENT_STATUSES } from "@/lib/types";

export default function EngagementListPage() {
  const [items, setItems] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filterCategory) params.category = filterCategory;
    if (filterStatus) params.status = filterStatus;
    if (search) params.q = search;

    setLoading(true);
    api.list(params).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [filterCategory, filterStatus, search]);

  return (
    <div className="px-10 py-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--navy)]">Engagements</h1>
        <Link
          href="/engagements/new"
          className="inline-flex items-center gap-2 bg-[var(--navy)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--navy-light)] transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
          </svg>
          New
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by title or client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:border-[var(--navy)]/40"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--navy)]/40"
        >
          <option value="">All categories</option>
          {SERVICE_CATEGORIES.map((cat) => (
            <option key={cat.key} value={cat.key}>
              {cat.label}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--navy)]/40"
        >
          <option value="">All statuses</option>
          {ENGAGEMENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-gray-400 text-sm py-10 text-center">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="text-gray-400 text-4xl">&#128218;</div>
          <p className="text-gray-500">No engagements yet</p>
          <Link
            href="/engagements/new"
            className="inline-block text-sm text-[var(--navy)] hover:underline"
          >
            Create your first engagement
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((eng) => {
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
                      <span className="ml-3 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {cat.label}
                      </span>
                    )}
                    {eng.service_type && (
                      <span className="ml-2 text-xs text-gray-400">
                        / {eng.service_type}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
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
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-300">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
