import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT cs.*, c.name as code_name, c.color as code_color FROM coded_segments cs LEFT JOIN codes c ON cs.code_id = c.id WHERE cs.interview_id = ? ORDER BY cs.start_offset"
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
      "INSERT INTO coded_segments (interview_id, code_id, start_offset, end_offset, text, sentiment, is_quote, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      id,
      body.code_id,
      body.start_offset,
      body.end_offset,
      body.text || null,
      body.sentiment || "neutral",
      body.is_quote ?? 0,
      body.notes || null
    );

  const segment = db
    .prepare("SELECT * FROM coded_segments WHERE id = ?")
    .get(result.lastInsertRowid);

  return NextResponse.json(segment, { status: 201 });
}
