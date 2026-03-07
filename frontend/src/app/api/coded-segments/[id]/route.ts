import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  const body = await req.json();

  const existing = db.prepare("SELECT * FROM coded_segments WHERE id = ?").get(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fields: string[] = [];
  const values: unknown[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (key === "id" || key === "interview_id" || key === "created_at") continue;
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')");
    values.push(id);
    db.prepare(`UPDATE coded_segments SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }

  const segment = db.prepare("SELECT * FROM coded_segments WHERE id = ?").get(id);
  return NextResponse.json(segment);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  db.prepare("DELETE FROM coded_segments WHERE id = ?").run(id);
  return new NextResponse(null, { status: 204 });
}
