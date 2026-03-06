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
    key: "ollama",
    label: "Ollama (Local)",
    models: ["ollama/llama3", "ollama/mistral", "ollama/codellama"],
    needsBaseUrl: true,
  },
] as const;
