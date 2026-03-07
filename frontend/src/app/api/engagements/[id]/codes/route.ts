import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  const rows = db
    .prepare(
      "SELECT c.*, COUNT(cs.id) as segment_count FROM codes c LEFT JOIN coded_segments cs ON c.id = cs.code_id WHERE c.engagement_id = ? GROUP BY c.id ORDER BY c.name"
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
      "INSERT INTO codes (engagement_id, name, description, type, parent_code_id, color) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(
      id,
      body.name,
      body.description || null,
      body.type || "free-form",
      body.parent_code_id || null,
      body.color || "#3b82f6"
    );

  const code = db
    .prepare("SELECT * FROM codes WHERE id = ?")
    .get(result.lastInsertRowid);

  return NextResponse.json(code, { status: 201 });
}
