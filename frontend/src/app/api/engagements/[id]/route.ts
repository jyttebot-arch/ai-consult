import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  const engagement = db.prepare("SELECT * FROM engagements WHERE id = ?").get(id);
  if (!engagement) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const phases = db.prepare("SELECT * FROM phases WHERE engagement_id = ? ORDER BY sort_order").all(id);
  const hypotheses = db.prepare("SELECT * FROM hypotheses WHERE engagement_id = ? ORDER BY created_at DESC").all(id);

  return NextResponse.json({ ...(engagement as Record<string, unknown>), phases, hypotheses });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  const body = await req.json();

  const existing = db.prepare("SELECT * FROM engagements WHERE id = ?").get(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const fields: string[] = [];
  const values: unknown[] = [];
  for (const [key, value] of Object.entries(body)) {
    if (key === "id" || key === "created_at" || key === "phases" || key === "hypotheses") continue;
    fields.push(`${key} = ?`);
    values.push(value);
  }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')");
    values.push(id);
    db.prepare(`UPDATE engagements SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }

  const engagement = db.prepare("SELECT * FROM engagements WHERE id = ?").get(id);
  const phases = db.prepare("SELECT * FROM phases WHERE engagement_id = ? ORDER BY sort_order").all(id);
  const hypotheses = db.prepare("SELECT * FROM hypotheses WHERE engagement_id = ? ORDER BY created_at DESC").all(id);

  return NextResponse.json({ ...(engagement as Record<string, unknown>), phases, hypotheses });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  db.prepare("DELETE FROM engagements WHERE id = ?").run(id);
  return new NextResponse(null, { status: 204 });
}
