import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  const interview = db
    .prepare(
      "SELECT i.*, s.name as stakeholder_name, s.type as stakeholder_type FROM interviews i LEFT JOIN stakeholders s ON i.stakeholder_id = s.id WHERE i.id = ?"
    )
    .get(id);
  if (!interview) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(interview);
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  const body = await req.json();

  const existing = db.prepare("SELECT * FROM interviews WHERE id = ?").get(id);
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
    db.prepare(`UPDATE interviews SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }

  const interview = db.prepare("SELECT * FROM interviews WHERE id = ?").get(id);
  return NextResponse.json(interview);
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  db.prepare("DELETE FROM interviews WHERE id = ?").run(id);
  return new NextResponse(null, { status: 204 });
}
