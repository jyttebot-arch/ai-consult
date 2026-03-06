"use client";

import { useEffect, useState } from "react";
import { aiSettings } from "@/lib/api";
import type { AISettings } from "@/lib/types";
import { AI_PROVIDERS } from "@/lib/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("gpt-4o");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    aiSettings
      .get()
      .then((data) => {
        setSettings(data);
        setProvider(data.provider);
        setModel(data.model);
        setBaseUrl(data.base_url || "");
        setLoading(false);
      })
      .catch(() => {
        // Settings don't exist yet, use defaults
        setLoading(false);
      });
  }, []);

  const selectedProvider = AI_PROVIDERS.find((p) => p.key === provider);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const payload: Record<string, string> = { provider, model };
      if (apiKey) payload.api_key = apiKey;
      if (baseUrl || selectedProvider?.needsBaseUrl) payload.base_url = baseUrl;

      const updated = await aiSettings.update(payload);
      setSettings(updated);
      setApiKey(""); // Clear the input after save
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Say hello in one sentence." }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult({
          ok: true,
          message: `Connected successfully. Response: "${data.message.content.slice(0, 100)}"`,
        });
      } else {
        const data = await res.json().catch(() => ({ detail: "Unknown error" }));
        setTestResult({
          ok: false,
          message: data.detail || "Connection failed",
        });
      }
    } catch (err) {
      setTestResult({
        ok: false,
        message:
          err instanceof Error ? err.message : "Connection test failed",
      });
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="px-10 py-8">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-10 py-8 max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[var(--navy)]">Settings</h1>
        <p className="text-sm text-gray-500">
          Configure your AI provider to enable the AI Assistant across your
          engagements.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            AI Provider Configuration
          </h2>

          {/* Provider */}
          <div className="space-y-1.5">
            <label
              htmlFor="provider"
              className="block text-sm font-medium text-gray-700"
            >
              Provider
            </label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => {
                const newProvider = e.target.value;
                setProvider(newProvider);
                const prov = AI_PROVIDERS.find((p) => p.key === newProvider);
                if (prov && prov.models.length > 0) {
                  setModel(prov.models[0]);
                }
              }}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--navy)]/40"
            >
              {AI_PROVIDERS.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <label
              htmlFor="model"
              className="block text-sm font-medium text-gray-700"
            >
              Model
            </label>
            <div className="flex gap-2">
              <select
                value={
                  selectedProvider?.models.includes(model as never) ? model : ""
                }
                onChange={(e) => {
                  if (e.target.value) setModel(e.target.value);
                }}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--navy)]/40"
              >
                <option value="">Custom model...</option>
                {selectedProvider?.models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                id="model"
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. gpt-4o"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--navy)]/40"
              />
            </div>
            <p className="text-xs text-gray-400">
              Select a preset or type a custom model identifier.
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-1.5">
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-700"
            >
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                settings?.api_key_set
                  ? "API key is set (enter new key to change)"
                  : "Enter your API key"
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--navy)]/40"
            />
            {settings?.api_key_set && (
              <p className="text-xs text-emerald-600">
                API key is configured. Leave blank to keep the current key.
              </p>
            )}
          </div>

          {/* Base URL (conditional) */}
          {(selectedProvider?.needsBaseUrl || baseUrl) && (
            <div className="space-y-1.5">
              <label
                htmlFor="baseUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Base URL
                {selectedProvider?.needsBaseUrl && (
                  <span className="text-red-400 ml-1">*</span>
                )}
              </label>
              <input
                id="baseUrl"
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={
                  provider === "ollama"
                    ? "http://localhost:11434"
                    : "https://api.example.com/v1"
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--navy)]/40"
              />
              <p className="text-xs text-gray-400">
                {provider === "ollama"
                  ? "URL of your Ollama instance"
                  : "Custom API endpoint (optional for most providers)"}
              </p>
            </div>
          )}
        </div>

        {/* Error / Success messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg p-3">
            Settings saved successfully.
          </div>
        )}

        {/* Test result */}
        {testResult && (
          <div
            className={`text-sm rounded-lg p-3 border ${
              testResult.ok
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {testResult.message}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-[var(--navy)] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--navy-light)] transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !settings?.api_key_set}
            className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {testing ? "Testing..." : "Test Connection"}
          </button>
        </div>
      </form>
    </div>
  );
}
