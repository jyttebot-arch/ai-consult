import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM hypotheses WHERE engagement_id = ? ORDER BY created_at DESC")
    .all(id);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  const body = await req.json();

  const result = db
    .prepare(
      "INSERT INTO hypotheses (engagement_id, statement, status, evidence_summary) VALUES (?, ?, ?, ?)"
    )
    .run(id, body.statement, body.status || "open", body.evidence_summary || null);

  const hypothesis = db
    .prepare("SELECT * FROM hypotheses WHERE id = ?")
    .get(result.lastInsertRowid);

  return NextResponse.json(hypothesis, { status: 201 });
}
