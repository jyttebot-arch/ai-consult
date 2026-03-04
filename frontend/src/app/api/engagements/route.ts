import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const DEFAULT_PHASES = [
  { name: "Mobilisation", sort_order: 1 },
  { name: "Analysis", sort_order: 2 },
  { name: "Working Sessions", sort_order: 3 },
  { name: "Consolidation", sort_order: 4 },
];

export async function GET(req: NextRequest) {
  const db = getDb();
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q");

  let sql = "SELECT * FROM engagements WHERE 1=1";
  const params: unknown[] = [];

  if (category) {
    sql += " AND service_category = ?";
    params.push(category);
  }
  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }
  if (q) {
    sql += " AND (title LIKE ? OR client_name LIKE ?)";
    params.push(`%${q}%`, `%${q}%`);
  }

  sql += " ORDER BY updated_at DESC";

  const rows = db.prepare(sql).all(...params);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();

  const stmt = db.prepare(`
    INSERT INTO engagements (title, client_name, service_category, service_type, description, scope, ambition_level, success_criteria, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    body.title,
    body.client_name,
    body.service_category,
    body.service_type || null,
    body.description || null,
    body.scope || null,
    body.ambition_level || null,
    body.success_criteria || null,
    body.status || "draft"
  );

  const engagementId = result.lastInsertRowid;

  // Create default phases
  const phaseStmt = db.prepare(
    "INSERT INTO phases (engagement_id, name, sort_order) VALUES (?, ?, ?)"
  );
  for (const p of DEFAULT_PHASES) {
    phaseStmt.run(engagementId, p.name, p.sort_order);
  }

  const engagement = db
    .prepare("SELECT * FROM engagements WHERE id = ?")
    .get(engagementId);
  const phases = db
    .prepare("SELECT * FROM phases WHERE engagement_id = ? ORDER BY sort_order")
    .all(engagementId);
  const hypotheses = db
    .prepare("SELECT * FROM hypotheses WHERE engagement_id = ?")
    .all(engagementId);

  return NextResponse.json({ ...engagement, phases, hypotheses }, { status: 201 });
}
