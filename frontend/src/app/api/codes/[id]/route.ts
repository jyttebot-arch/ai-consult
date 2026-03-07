import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  const body = await req.json();

  const existing = db.prepare("SELECT * FROM codes WHERE id = ?").get(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fields: string[] = [];
  const values: unknown[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (key === "id" || key === "engagement_id" || key === "created_at") continue;
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')");
    values.push(id);
    db.prepare(`UPDATE codes SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }

  const code = db.prepare("SELECT * FROM codes WHERE id = ?").get(id);
  return NextResponse.json(code);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  db.prepare("DELETE FROM codes WHERE id = ?").run(id);
  return new NextResponse(null, { status: 204 });
}
