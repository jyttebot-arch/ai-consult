export interface Engagement {
  id: number;
  title: string;
  client_name: string;
  service_category: string;
  service_type: string | null;
  description: string | null;
  scope: string | null;
  ambition_level: string | null;
  success_criteria: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  phases?: Phase[];
  hypotheses?: Hypothesis[];
}

export interface Phase {
  id: number;
  engagement_id: number;
  name: string;
  sort_order: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

export interface Hypothesis {
  id: number;
  engagement_id: number;
  statement: string;
  status: string;
  evidence_summary: string | null;
  created_at: string;
  updated_at: string;
}

export const SERVICE_CATEGORIES = [
  {
    key: "strategy_organization",
    label: "Strategy & Organization",
    services: [
      "Ownership strategy & governance",
      "Strategy infusion",
      "Corporate & business strategy",
      "Operating model",
    ],
  },
  {
    key: "business_transformation",
    label: "Business Transformation",
    services: [
      "Strategy deployment and PMO support",
      "Leadership & culture",
      "Cost-out",
      "Organizational & digital transformation",
    ],
  },
  {
    key: "commercial_excellence",
    label: "Commercial Excellence",
    services: [
      "Commercial & customer strategy",
      "Customer structure and culture",
      "Customer journey",
      "Sales Excellence",
    ],
  },
  {
    key: "data_ai",
    label: "Data & AI",
    services: [
      "Complex analyses & forecasting",
      "AI & Machine Learning Operations",
      "Churn funneling & text analyses",
      "Intelligent Process Automation",
    ],
  },
] as const;

export const ENGAGEMENT_STATUSES = [
  { value: "draft", label: "Draft", color: "bg-gray-100 text-gray-700" },
  { value: "active", label: "Active", color: "bg-emerald-100 text-emerald-700" },
  { value: "on_hold", label: "On Hold", color: "bg-amber-100 text-amber-700" },
  { value: "completed", label: "Completed", color: "bg-blue-100 text-blue-700" },
  { value: "archived", label: "Archived", color: "bg-gray-100 text-gray-500" },
] as const;

export const HYPOTHESIS_STATUSES = [
  { value: "open", label: "Open", color: "bg-blue-100 text-blue-700" },
  { value: "confirmed", label: "Confirmed", color: "bg-emerald-100 text-emerald-700" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-700" },
] as const;

// ---------- Qualitative Research (Intelligence Engine) ----------

export interface Stakeholder {
  id: number;
  engagement_id: number;
  name: string;
  role: string;
  type: string;
  seniority_level: string | null;
  perspective_angle: string | null;
  contact_info: string | null;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: number;
  engagement_id: number;
  stakeholder_id: number;
  title: string | null;
  interview_date: string | null;
  status: string;
  notes: string | null;
  transcript: string | null;
  interviewer_name: string | null;
  impressions: string | null;
  created_at: string;
  updated_at: string;
  stakeholder?: Stakeholder;
  coded_segments?: CodedSegment[];
  stakeholder_name?: string;
  stakeholder_type?: string;
}

export interface Code {
  id: number;
  engagement_id: number;
  name: string;
  description: string | null;
  type: string;
  parent_code_id: number | null;
  color: string;
  created_at: string;
  updated_at: string;
  segment_count?: number;
}

export interface CodedSegment {
  id: number;
  interview_id: number;
  code_id: number;
  start_offset: number;
  end_offset: number;
  text: string;
  sentiment: string;
  is_quote: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  code_name?: string;
  code_color?: string;
  stakeholder_name?: string;
  stakeholder_type?: string;
}

export interface Insight {
  id: number;
  engagement_id: number;
  code_id: number | null;
  title: string;
  interpretation: string | null;
  implication: string | null;
  frequency_count: number;
  sentiment_distribution: string | null;
  internal_vs_external: string | null;
  created_at: string;
  updated_at: string;
  code_name?: string;
}

export interface CodeAnalysis {
  code_id: number;
  code_name: string;
  code_color: string;
  frequency: number;
  total_segments: number;
  sentiment: { positive: number; negative: number; ambivalent: number; neutral: number };
  internal_count: number;
  external_count: number;
  quotes: CodedSegment[];
}

export const STAKEHOLDER_TYPES = [
  { value: "internal", label: "Internal", color: "bg-indigo-100 text-indigo-700" },
  { value: "external", label: "External", color: "bg-orange-100 text-orange-700" },
] as const;

export const SENIORITY_LEVELS = [
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
  { value: "executive", label: "Executive" },
] as const;

export const INTERVIEW_STATUSES = [
  { value: "scheduled", label: "Scheduled", color: "bg-blue-100 text-blue-700" },
  { value: "completed", label: "Completed", color: "bg-emerald-100 text-emerald-700" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-100 text-gray-500" },
] as const;

export const SENTIMENT_OPTIONS = [
  { value: "positive", label: "Positive", color: "bg-emerald-100 text-emerald-700", icon: "+" },
  { value: "negative", label: "Negative", color: "bg-red-100 text-red-700", icon: "-" },
  { value: "ambivalent", label: "Ambivalent", color: "bg-amber-100 text-amber-700", icon: "~" },
  { value: "neutral", label: "Neutral", color: "bg-gray-100 text-gray-600", icon: "=" },
] as const;

export const CODE_COLORS = [
  "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6",
] as const;

// ---------- AI Coding Types ----------

export interface AICodeQuote {
  text: string;
  sentiment: "positive" | "negative" | "ambivalent" | "neutral";
  isQuote: boolean;
  startOffset?: number | null;
  endOffset?: number | null;
  matchType?: "exact" | "normalized" | "partial" | null;
}

export interface AICodePreview {
  name: string;
  description: string;
  quotes: AICodeQuote[];
  enabled: boolean;
}

export interface AICodingResponse {
  codes: AICodePreview[];
  model: string;
  tokensNote: string;
}

export interface AIInsightDraft {
  title: string;
  interpretation: string;
  implication: string;
}

export interface AIHypothesisValidation {
  assessment: string;
  confidence: "strong" | "moderate" | "weak" | "contradicted";
  summary: string;
}

// ---------- AI ----------

export interface AISettings {
  id: number;
  provider: string;
  model: string;
  api_key_set: boolean;
  base_url: string | null;
  updated_at: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const AI_PROVIDERS = [
  {
    key: "openai",
    label: "OpenAI",
    models: ["gpt-4o", "gpt-4o-mini", "o1", "o3-mini"],
    needsBaseUrl: false,
  },
  {
    key: "anthropic",
    label: "Anthropic",
    models: ["claude-sonnet-4-20250514", "claude-haiku-35-20241022", "claude-opus-4-20250514"],
    needsBaseUrl: false,
  },
  {
    key: "google",
    label: "Google",
    models: ["gemini/gemini-2.0-flash", "gemini/gemini-2.5-pro"],
    needsBaseUrl: false,
  },
  {
    key: "mistral",
    label: "Mistral",
    models: ["mistral/mistral-large-latest", "mistral/mistral-small-latest"],
    needsBaseUrl: false,
  },
  {
    key: "openrouter",
    label: "OpenRouter",
    models: [
      "openrouter/anthropic/claude-sonnet-4",
      "openrouter/anthropic/claude-haiku-4",
      "openrouter/google/gemini-2.5-pro",
      "openrouter/openai/gpt-4o",
      "openrouter/meta-llama/llama-4-maverick",
    ],
    needsBaseUrl: false,
  },
  {
    key: "ollama",
    label: "Ollama (Local)",
    models: ["ollama/llama3", "ollama/mistral", "ollama/codellama"],
    needsBaseUrl: true,
  },
] as const;
