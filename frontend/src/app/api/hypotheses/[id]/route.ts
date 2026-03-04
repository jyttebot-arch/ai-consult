import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  const body = await req.json();

  const existing = db.prepare("SELECT * FROM hypotheses WHERE id = ?").get(id);
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
    db.prepare(`UPDATE hypotheses SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }

  const hypothesis = db.prepare("SELECT * FROM hypotheses WHERE id = ?").get(id);
  return NextResponse.json(hypothesis);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  db.prepare("DELETE FROM hypotheses WHERE id = ?").run(id);
  return new NextResponse(null, { status: 204 });
}
