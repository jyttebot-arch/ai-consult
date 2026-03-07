import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT ins.*, c.name as code_name FROM insights ins LEFT JOIN codes c ON ins.code_id = c.id WHERE ins.engagement_id = ? ORDER BY ins.frequency_count DESC"
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
      "INSERT INTO insights (engagement_id, code_id, title, interpretation, implication, frequency_count, sentiment_distribution, internal_vs_external) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      id,
      body.code_id || null,
      body.title,
      body.interpretation || null,
      body.implication || null,
      body.frequency_count ?? 0,
      body.sentiment_distribution || null,
      body.internal_vs_external || null
    );

  const insight = db
    .prepare("SELECT * FROM insights WHERE id = ?")
    .get(result.lastInsertRowid);

  return NextResponse.json(insight, { status: 201 });
}
