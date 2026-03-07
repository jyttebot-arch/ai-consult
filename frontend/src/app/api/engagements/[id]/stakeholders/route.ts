import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  const rows = db
    .prepare("SELECT * FROM stakeholders WHERE engagement_id = ? ORDER BY created_at DESC")
    .all(id);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  const body = await req.json();

  const result = db
    .prepare(
      "INSERT INTO stakeholders (engagement_id, name, role, type, seniority_level, perspective_angle, contact_info) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .run(
      id,
      body.name,
      body.role,
      body.type || "internal",
      body.seniority_level || null,
      body.perspective_angle || null,
      body.contact_info || null
    );

  const stakeholder = db
    .prepare("SELECT * FROM stakeholders WHERE id = ?")
    .get(result.lastInsertRowid);

  return NextResponse.json(stakeholder, { status: 201 });
}
