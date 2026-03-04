"use client";

import { useState } from "react";
import type { Hypothesis } from "@/lib/types";
import { HYPOTHESIS_STATUSES } from "@/lib/types";
import { hypotheses as api } from "@/lib/api";

interface Props {
  engagementId: number;
  items: Hypothesis[];
  onChange: () => void;
}

export default function HypothesisBoard({ engagementId, items, onChange }: Props) {
  const [newStatement, setNewStatement] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatement, setEditStatement] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newStatement.trim()) return;
    setAdding(true);
    await api.create(engagementId, { statement: newStatement.trim() });
    setNewStatement("");
    setAdding(false);
    onChange();
  }

  async function handleStatusChange(id: number, status: string) {
    await api.update(id, { status });
    onChange();
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this hypothesis?")) return;
    await api.delete(id);
    onChange();
  }

  async function handleEditSave(id: number) {
    await api.update(id, { statement: editStatement });
    setEditingId(null);
    onChange();
  }

  const grouped = {
    open: items.filter((h) => h.status === "open"),
    confirmed: items.filter((h) => h.status === "confirmed"),
    rejected: items.filter((h) => h.status === "rejected"),
  };

  return (
    <div className="space-y-6">
      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newStatement}
          onChange={(e) => setNewStatement(e.target.value)}
          placeholder="Add a new hypothesis..."
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--navy)]/40"
        />
        <button
          type="submit"
          disabled={adding || !newStatement.trim()}
          className="bg-[var(--navy)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[var(--navy-light)] transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {/* Kanban-style columns */}
      <div className="grid grid-cols-3 gap-4">
        {HYPOTHESIS_STATUSES.map((statusDef) => (
          <div key={statusDef.value} className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusDef.color}`}
              >
                {statusDef.label}
              </span>
              <span className="text-xs text-gray-400">
                {grouped[statusDef.value as keyof typeof grouped]?.length || 0}
              </span>
            </div>

            <div className="space-y-2 min-h-[100px]">
              {(grouped[statusDef.value as keyof typeof grouped] || []).map(
                (hyp) => (
                  <div
                    key={hyp.id}
                    className="bg-white border border-gray-200 rounded-lg p-3 space-y-2 group"
                  >
                    {editingId === hyp.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editStatement}
                          onChange={(e) => setEditStatement(e.target.value)}
                          rows={2}
                          className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSave(hyp.id)}
                            className="text-xs text-[var(--navy)] hover:underline"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs text-gray-400 hover:underline"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700">{hyp.statement}</p>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Status change buttons */}
                          {HYPOTHESIS_STATUSES.filter(
                            (s) => s.value !== hyp.status
                          ).map((s) => (
                            <button
                              key={s.value}
                              onClick={() =>
                                handleStatusChange(hyp.id, s.value)
                              }
                              className={`text-xs px-2 py-0.5 rounded-full ${s.color} hover:opacity-80`}
                              title={`Mark as ${s.label}`}
                            >
                              {s.label}
                            </button>
                          ))}
                          <button
                            onClick={() => {
                              setEditingId(hyp.id);
                              setEditStatement(hyp.statement);
                            }}
                            className="text-xs text-gray-400 hover:text-gray-600 ml-auto"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(hyp.id)}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
