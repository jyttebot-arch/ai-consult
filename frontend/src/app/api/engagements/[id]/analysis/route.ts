import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();

  const codes = db
    .prepare("SELECT * FROM codes WHERE engagement_id = ? ORDER BY name")
    .all(id) as { id: number; name: string; color: string }[];

  const analysis = codes.map((code) => {
    const totalSegments = db
      .prepare("SELECT COUNT(*) as count FROM coded_segments WHERE code_id = ?")
      .get(code.id) as { count: number };

    const sentimentRows = db
      .prepare(
        "SELECT sentiment, COUNT(*) as count FROM coded_segments WHERE code_id = ? GROUP BY sentiment"
      )
      .all(code.id) as { sentiment: string; count: number }[];

    const sentiment: Record<string, number> = {
      positive: 0,
      negative: 0,
      ambivalent: 0,
      neutral: 0,
    };
    for (const row of sentimentRows) {
      sentiment[row.sentiment] = row.count;
    }

    const internalCount = db
      .prepare(
        "SELECT COUNT(*) as count FROM coded_segments cs JOIN interviews i ON cs.interview_id = i.id JOIN stakeholders s ON i.stakeholder_id = s.id WHERE cs.code_id = ? AND s.type = 'internal'"
      )
      .get(code.id) as { count: number };

    const externalCount = db
      .prepare(
        "SELECT COUNT(*) as count FROM coded_segments cs JOIN interviews i ON cs.interview_id = i.id JOIN stakeholders s ON i.stakeholder_id = s.id WHERE cs.code_id = ? AND s.type = 'external'"
      )
      .get(code.id) as { count: number };

    const quotes = db
      .prepare(
        "SELECT cs.* FROM coded_segments cs WHERE cs.code_id = ? AND cs.is_quote = 1 ORDER BY cs.created_at DESC"
      )
      .all(code.id);

    return {
      code_id: code.id,
      code_name: code.name,
      code_color: code.color,
      frequency: sentimentRows.reduce((sum, r) => sum + r.count, 0),
      total_segments: totalSegments.count,
      sentiment,
      internal_count: internalCount.count,
      external_count: externalCount.count,
      quotes,
    };
  });

  return NextResponse.json(analysis);
}
