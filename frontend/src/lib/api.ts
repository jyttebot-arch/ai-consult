const BASE = "";

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`API ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---------- Engagements ----------

import type { Engagement } from "./types";

export const engagements = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<Engagement[]>(`/api/engagements${qs}`);
  },
  get: (id: number) => request<Engagement>(`/api/engagements/${id}`),
  create: (data: Partial<Engagement>) =>
    request<Engagement>("/api/engagements", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Engagement>) =>
    request<Engagement>(`/api/engagements/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/api/engagements/${id}`, { method: "DELETE" }),
};

// ---------- Hypotheses ----------

import type { Hypothesis } from "./types";

export const hypotheses = {
  list: (engagementId: number) =>
    request<Hypothesis[]>(`/api/engagements/${engagementId}/hypotheses`),
  create: (engagementId: number, data: Partial<Hypothesis>) =>
    request<Hypothesis>(`/api/engagements/${engagementId}/hypotheses`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Hypothesis>) =>
    request<Hypothesis>(`/api/hypotheses/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/api/hypotheses/${id}`, { method: "DELETE" }),
};
