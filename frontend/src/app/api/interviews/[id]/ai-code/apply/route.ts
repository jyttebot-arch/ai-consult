import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

interface QuoteData {
  text: string;
  sentiment: string;
  isQuote: boolean;
  startOffset?: number | null;
  endOffset?: number | null;
}

interface CodeData {
  name: string;
  description: string;
  quotes: QuoteData[];
  enabled: boolean;
}

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id: interviewId } = await ctx.params;
  const db = getDb();
  const body = await req.json();

  const interview = db.prepare("SELECT * FROM interviews WHERE id = ?").get(interviewId) as Record<string, unknown> | undefined;
  if (!interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }

  const engagementId = interview.engagement_id as number;
  const codesToApply: CodeData[] = (body.codes || []).filter((c: CodeData) => c.enabled !== false);

  let created = 0;

  for (const codeData of codesToApply) {
    // Check if code already exists for this engagement
    let code = db
      .prepare("SELECT * FROM codes WHERE engagement_id = ? AND name = ?")
      .get(engagementId, codeData.name) as Record<string, unknown> | undefined;

    if (!code) {
      // Create the code
      const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6"];
      const existingCount = (db.prepare("SELECT COUNT(*) as cnt FROM codes WHERE engagement_id = ?").get(engagementId) as Record<string, unknown>).cnt as number;
      const color = colors[existingCount % colors.length];

      const result = db
        .prepare("INSERT INTO codes (engagement_id, name, description, color) VALUES (?, ?, ?, ?)")
        .run(engagementId, codeData.name, codeData.description || "", color);
      code = db.prepare("SELECT * FROM codes WHERE id = ?").get(result.lastInsertRowid) as Record<string, unknown>;
    }

    // Create coded segments for each quote
    for (const quote of codeData.quotes) {
      db.prepare(
        "INSERT INTO coded_segments (interview_id, code_id, start_offset, end_offset, text, sentiment, is_quote) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).run(
        interviewId,
        code!.id,
        quote.startOffset || 0,
        quote.endOffset || 0,
        quote.text,
        quote.sentiment || "neutral",
        quote.isQuote ? 1 : 0
      );
      created++;
    }
  }

  return NextResponse.json({ created });
}
