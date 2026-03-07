import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT i.*, s.name as stakeholder_name, s.type as stakeholder_type FROM interviews i LEFT JOIN stakeholders s ON i.stakeholder_id = s.id WHERE i.engagement_id = ? ORDER BY i.created_at DESC"
    )
    .all(id);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  const body = await req.json();

  const result = db
    .prepare(
      "INSERT INTO interviews (engagement_id, stakeholder_id, title, interview_date, status, notes, transcript, interviewer_name, impressions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      id,
      body.stakeholder_id || null,
      body.title,
      body.interview_date || null,
      body.status || "scheduled",
      body.notes || null,
      body.transcript || null,
      body.interviewer_name || null,
      body.impressions || null
    );

  const interview = db
    .prepare("SELECT * FROM interviews WHERE id = ?")
    .get(result.lastInsertRowid);

  return NextResponse.json(interview, { status: 201 });
}
