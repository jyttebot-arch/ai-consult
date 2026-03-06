"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { aiChat } from "@/lib/api";
import type { ChatMessage } from "@/lib/types";

interface Props {
  engagementId: number;
}

export default function AIAssistant({ engagementId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    const userMessage: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);
    setStreaming(true);

    // Stream response
    const assistantMessage: ChatMessage = { role: "assistant", content: "" };
    setMessages([...updatedMessages, assistantMessage]);

    try {
      for await (const chunk of aiChat.stream(updatedMessages, engagementId)) {
        assistantMessage.content += chunk;
        setMessages([...updatedMessages, { ...assistantMessage }]);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to get AI response";

      // Check if it's a configuration error
      if (errorMsg.includes("not configured") || errorMsg.includes("API key")) {
        setError(errorMsg);
      } else {
        setError(errorMsg);
      }

      // Remove the empty assistant message if there was an error and no content
      if (!assistantMessage.content) {
        setMessages(updatedMessages);
      }
    } finally {
      setLoading(false);
      setStreaming(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  }

  function handleClear() {
    setMessages([]);
    setError(null);
  }

  return (
    <div className="flex flex-col h-[500px] bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-sm font-medium text-gray-700">
            AI Assistant
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && !error && (
          <div className="text-center py-12 space-y-3">
            <div className="text-3xl">&#129302;</div>
            <p className="text-sm text-gray-500">
              Ask the AI anything about this engagement.
            </p>
            <p className="text-xs text-gray-400">
              The engagement context is automatically included. You can paste
              interview transcripts, ask for analysis, generate hypotheses, or
              request qualitative coding.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-[var(--navy)] text-white"
                  : "bg-gray-50 text-gray-700 border border-gray-100"
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {msg.content}
                {streaming && i === messages.length - 1 && msg.role === "assistant" && (
                  <span className="inline-block w-1.5 h-4 bg-gray-400 animate-pulse ml-0.5 align-text-bottom" />
                )}
              </div>
            </div>
          </div>
        ))}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
            {error}
            {(error.includes("not configured") ||
              error.includes("API key")) && (
              <div className="mt-2">
                <Link
                  href="/settings"
                  className="text-red-600 underline hover:text-red-800 text-xs font-medium"
                >
                  Go to Settings to configure your AI provider
                </Link>
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-100 px-4 py-3">
        <form onSubmit={handleSend} className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Shift+Enter for new line)"
            rows={1}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--navy)]/40 resize-none overflow-hidden"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[var(--navy)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--navy-light)] transition-colors disabled:opacity-50 shrink-0"
          >
            {loading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
