import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id: engagementId } = await ctx.params;
  const db = getDb();
  const body = await req.json();
  const { codeId } = body;

  if (!codeId) {
    return NextResponse.json({ error: "codeId is required" }, { status: 400 });
  }

  const code = db.prepare("SELECT * FROM codes WHERE id = ? AND engagement_id = ?").get(codeId, engagementId) as Record<string, unknown> | undefined;
  if (!code) {
    return NextResponse.json({ error: "Code not found" }, { status: 404 });
  }

  // Get all segments for this code with stakeholder context
  const segments = db.prepare(`
    SELECT cs.*, s.name as stakeholder_name, s.type as stakeholder_type
    FROM coded_segments cs
    JOIN interviews i ON cs.interview_id = i.id
    JOIN stakeholders s ON i.stakeholder_id = s.id
    WHERE cs.code_id = ? AND i.engagement_id = ?
    ORDER BY cs.created_at
  `).all(codeId, engagementId) as Array<Record<string, unknown>>;

  if (segments.length === 0) {
    return NextResponse.json({ error: "No coded segments found for this code" }, { status: 400 });
  }

  const systemPrompt = `You are an expert qualitative researcher generating insights from coded interview data.

Given a qualitative code and its supporting evidence (coded segments from interviews), generate a research insight.

The insight should:
1. Have a clear, actionable title
2. Include an interpretation: what does this pattern mean?
3. Include an implication: what should be done about it?

Respond as JSON:
{
  "title": "Insight title",
  "interpretation": "What this pattern means...",
  "implication": "What should be done..."
}

Return ONLY the JSON object.`;

  const userPrompt = `Code: "${code.name}"
Description: ${code.description || "(none)"}

Supporting evidence (${segments.length} segments):
${segments.map((s, i) => `
${i + 1}. "${s.text}"
   - Stakeholder: ${s.stakeholder_name} (${s.stakeholder_type})
   - Sentiment: ${s.sentiment}
`).join("")}`;

  try {
    const res = await fetch(`${BACKEND}/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "Unknown error");
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    const data = await res.json();
    const content = data.message?.content || "";

    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response", raw: content }, { status: 500 });
    }

    return NextResponse.json({
      title: parsed.title || "Untitled Insight",
      interpretation: parsed.interpretation || "",
      implication: parsed.implication || "",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI insight generation failed" },
      { status: 500 }
    );
  }
}
