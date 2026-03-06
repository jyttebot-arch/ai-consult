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

import type { Hypothesis, AISettings, ChatMessage } from "./types";

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

// ---------- AI Settings ----------

export const aiSettings = {
  get: () => request<AISettings>("/api/ai/settings"),
  update: (data: Partial<AISettings> & { api_key?: string }) =>
    request<AISettings>("/api/ai/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  models: () => request<Record<string, string[]>>("/api/ai/models"),
};

// ---------- AI Chat ----------

export const aiChat = {
  send: (messages: ChatMessage[], engagementId?: number) =>
    request<{ message: ChatMessage; model: string; provider: string }>(
      "/api/ai/chat",
      {
        method: "POST",
        body: JSON.stringify({ messages, engagement_id: engagementId }),
      }
    ),

  stream: async function* (
    messages: ChatMessage[],
    engagementId?: number
  ): AsyncGenerator<string> {
    const res = await fetch("/api/ai/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, engagement_id: engagementId }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "Unknown error");
      throw new Error(`AI stream error ${res.status}: ${text}`);
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") return;
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.content) yield parsed.content;
          } catch (e) {
            if (e instanceof Error && e.message !== "Unexpected end of JSON input") {
              throw e;
            }
          }
        }
      }
    }
  },
};
