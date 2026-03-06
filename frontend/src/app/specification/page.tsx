"use client";

import { useEffect, useState, useRef } from "react";

interface Document {
  id: number;
  slug: string;
  title: string;
  content: string;
  updated_at: string;
}

export default function SpecificationPage() {
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [success, setSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch("/api/documents/specification")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        setDoc(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function handleEdit() {
    if (doc) {
      setEditContent(doc.content);
      setEditTitle(doc.title);
    }
    setEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 100);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/documents/specification", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
        }),
      });
      const updated = await res.json();
      setDoc(updated);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      // error handling
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setEditing(false);
    setEditContent("");
    setEditTitle("");
  }

  if (loading) {
    return (
      <div className="px-10 py-8">
        <div className="text-gray-400 text-sm">Loading specification...</div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="px-10 py-8 max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-[var(--navy)]">
          Solution Specification
        </h1>
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg p-4">
          <p>
            No specification document found. You can create one by clicking the
            button below.
          </p>
        </div>
        <button
          onClick={() => {
            setEditTitle("Consulting Platform — Application Specification");
            setEditContent("# Consulting Platform\n\nStart writing your specification here...");
            setEditing(true);
          }}
          className="bg-[var(--navy)] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--navy-light)] transition-colors"
        >
          Create Specification
        </button>
        {editing && (
          <EditView
            title={editTitle}
            content={editContent}
            saving={saving}
            textareaRef={textareaRef}
            onTitleChange={setEditTitle}
            onContentChange={setEditContent}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        )}
      </div>
    );
  }

  return (
    <div className="px-10 py-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[var(--navy)]">
            {editing ? "Edit Specification" : doc.title}
          </h1>
          <p className="text-xs text-gray-400">
            Last updated {new Date(doc.updated_at).toLocaleString()}
          </p>
        </div>
        {!editing && (
          <button
            onClick={handleEdit}
            className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg p-3">
          Specification saved successfully.
        </div>
      )}

      {editing ? (
        <EditView
          title={editTitle}
          content={editContent}
          saving={saving}
          textareaRef={textareaRef}
          onTitleChange={setEditTitle}
          onContentChange={setEditContent}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <MarkdownView content={doc.content} />
        </div>
      )}
    </div>
  );
}

/* ---------- Edit View ---------- */

function EditView({
  title,
  content,
  saving,
  textareaRef,
  onTitleChange,
  onContentChange,
  onSave,
  onCancel,
}: {
  title: string;
  content: string;
  saving: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onTitleChange: (v: string) => void;
  onContentChange: (v: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--navy)]/40"
        />
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-gray-700">
          Content{" "}
          <span className="text-gray-400 font-normal">(Markdown supported)</span>
        </label>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          rows={40}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:border-[var(--navy)]/40 resize-y leading-relaxed"
          spellCheck={false}
        />
      </div>
      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={saving}
          className="bg-[var(--navy)] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[var(--navy-light)] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={onCancel}
          className="border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ---------- Markdown Renderer ---------- */

function MarkdownView({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Headings
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          className="text-base font-semibold text-[var(--navy)] mt-6 mb-2"
        >
          {line.slice(4)}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="text-lg font-semibold text-[var(--navy)] mt-8 mb-3 pb-2 border-b border-gray-100"
        >
          {line.slice(3)}
        </h2>
      );
      i++;
      continue;
    }
    if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={i}
          className="text-xl font-bold text-[var(--navy)] mt-10 mb-4 first:mt-0"
        >
          {line.slice(2)}
        </h1>
      );
      i++;
      continue;
    }

    // Blockquotes
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <blockquote
          key={`q${i}`}
          className="border-l-4 border-[var(--navy)]/20 pl-4 py-2 my-4 bg-gray-50 rounded-r-lg pr-4"
        >
          {quoteLines.map((ql, qi) => (
            <p key={qi} className="text-sm text-gray-600 italic leading-relaxed">
              <InlineMarkdown text={ql} />
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Table detection
    if (line.includes("|") && i + 1 < lines.length && lines[i + 1]?.match(/^\|[\s-:|]+\|$/)) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].includes("|")) {
        tableLines.push(lines[i]);
        i++;
      }
      elements.push(<MarkdownTable key={`t${i}`} lines={tableLines} />);
      continue;
    }

    // Bullet list
    if (line.match(/^[-*→] /)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*→] /)) {
        listItems.push(lines[i].replace(/^[-*→] /, ""));
        i++;
      }
      elements.push(
        <ul key={`l${i}`} className="list-disc list-inside space-y-1.5 my-3 ml-2">
          {listItems.map((item, li) => (
            <li key={li} className="text-sm text-gray-700 leading-relaxed">
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list
    if (line.match(/^\d+\.\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={`ol${i}`} className="list-decimal list-inside space-y-1.5 my-3 ml-2">
          {listItems.map((item, li) => (
            <li key={li} className="text-sm text-gray-700 leading-relaxed">
              <InlineMarkdown text={item} />
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Horizontal rule
    if (line.match(/^---+$/)) {
      elements.push(<hr key={i} className="my-6 border-gray-200" />);
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph
    elements.push(
      <p key={i} className="text-sm text-gray-700 leading-relaxed my-2">
        <InlineMarkdown text={line} />
      </p>
    );
    i++;
  }

  return <div className="spec-content">{elements}</div>;
}

/* ---------- Inline Markdown ---------- */

function InlineMarkdown({ text }: { text: string }) {
  // Parse bold (**text**), italic (*text*), and code (`text`)
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Code
    const codeMatch = remaining.match(/`(.+?)`/);

    if (boldMatch && (!codeMatch || boldMatch.index! <= codeMatch.index!)) {
      if (boldMatch.index! > 0) {
        parts.push(remaining.slice(0, boldMatch.index));
      }
      parts.push(
        <strong key={key++} className="font-semibold text-gray-900">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch.index! + boldMatch[0].length);
    } else if (codeMatch) {
      if (codeMatch.index! > 0) {
        parts.push(remaining.slice(0, codeMatch.index));
      }
      parts.push(
        <code
          key={key++}
          className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-xs font-mono"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch.index! + codeMatch[0].length);
    } else {
      parts.push(remaining);
      break;
    }
  }

  return <>{parts}</>;
}

/* ---------- Table ---------- */

function MarkdownTable({ lines }: { lines: string[] }) {
  const parseRow = (line: string) =>
    line
      .split("|")
      .filter((_, i, arr) => i > 0 && i < arr.length - 1)
      .map((cell) => cell.trim());

  const headers = parseRow(lines[0]);
  const rows = lines
    .slice(2) // Skip header and separator
    .map(parseRow);

  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left px-3 py-2 bg-gray-50 border border-gray-200 font-semibold text-gray-700 text-xs uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className="px-3 py-2 border border-gray-200 text-gray-700"
                >
                  <InlineMarkdown text={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
