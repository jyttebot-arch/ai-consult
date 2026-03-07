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

import type {
  Hypothesis, AISettings, ChatMessage,
  Stakeholder, Interview, Code, CodedSegment, Insight, CodeAnalysis,
  AICodingResponse, AIInsightDraft, AIHypothesisValidation,
} from "./types";

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

// ---------- Stakeholders ----------

export const stakeholders = {
  list: (engagementId: number) =>
    request<Stakeholder[]>(`/api/engagements/${engagementId}/stakeholders`),
  create: (engagementId: number, data: Partial<Stakeholder>) =>
    request<Stakeholder>(`/api/engagements/${engagementId}/stakeholders`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Stakeholder>) =>
    request<Stakeholder>(`/api/stakeholders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/api/stakeholders/${id}`, { method: "DELETE" }),
};

// ---------- Interviews ----------

export const interviews = {
  list: (engagementId: number) =>
    request<Interview[]>(`/api/engagements/${engagementId}/interviews`),
  get: (id: number) =>
    request<Interview>(`/api/interviews/${id}`),
  create: (engagementId: number, data: Partial<Interview>) =>
    request<Interview>(`/api/engagements/${engagementId}/interviews`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Interview>) =>
    request<Interview>(`/api/interviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/api/interviews/${id}`, { method: "DELETE" }),
};

// ---------- Codes ----------

export const codes = {
  list: (engagementId: number) =>
    request<Code[]>(`/api/engagements/${engagementId}/codes`),
  create: (engagementId: number, data: Partial<Code>) =>
    request<Code>(`/api/engagements/${engagementId}/codes`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Code>) =>
    request<Code>(`/api/codes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/api/codes/${id}`, { method: "DELETE" }),
};

// ---------- Coded Segments ----------

export const codedSegments = {
  list: (interviewId: number) =>
    request<CodedSegment[]>(`/api/interviews/${interviewId}/coded-segments`),
  create: (interviewId: number, data: Partial<CodedSegment>) =>
    request<CodedSegment>(`/api/interviews/${interviewId}/coded-segments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<CodedSegment>) =>
    request<CodedSegment>(`/api/coded-segments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/api/coded-segments/${id}`, { method: "DELETE" }),
};

// ---------- Insights ----------

export const insights = {
  list: (engagementId: number) =>
    request<Insight[]>(`/api/engagements/${engagementId}/insights`),
  create: (engagementId: number, data: Partial<Insight>) =>
    request<Insight>(`/api/engagements/${engagementId}/insights`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<Insight>) =>
    request<Insight>(`/api/insights/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: number) =>
    request<void>(`/api/insights/${id}`, { method: "DELETE" }),
};

// ---------- Analysis ----------

export const analysis = {
  get: (engagementId: number) =>
    request<CodeAnalysis[]>(`/api/engagements/${engagementId}/analysis`),
};

// ---------- AI Intelligence Engine ----------

export const aiEngine = {
  codeInterview: (interviewId: number, opts?: { codeCount?: number; language?: string }) =>
    request<AICodingResponse>(`/api/interviews/${interviewId}/ai-code`, {
      method: "POST",
      body: JSON.stringify(opts || {}),
    }),
  applyCodes: (interviewId: number, codes: AICodingResponse["codes"]) =>
    request<{ created: number }>(`/api/interviews/${interviewId}/ai-code/apply`, {
      method: "POST",
      body: JSON.stringify({ codes }),
    }),
  summarize: (interviewId: number) =>
    request<{ summary: string }>(`/api/interviews/${interviewId}/ai-summarize`, {
      method: "POST",
    }),
  generateInsight: (engagementId: number, codeId: number) =>
    request<AIInsightDraft>(`/api/engagements/${engagementId}/ai-insights`, {
      method: "POST",
      body: JSON.stringify({ codeId }),
    }),
  validateHypothesis: (engagementId: number, hypothesisId: number) =>
    request<AIHypothesisValidation>(`/api/engagements/${engagementId}/ai-validate-hypothesis`, {
      method: "POST",
      body: JSON.stringify({ hypothesisId }),
    }),
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
