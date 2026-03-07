import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id: engagementId } = await ctx.params;
  const db = getDb();
  const body = await req.json();
  const { hypothesisId } = body;

  if (!hypothesisId) {
    return NextResponse.json({ error: "hypothesisId is required" }, { status: 400 });
  }

  const hypothesis = db.prepare("SELECT * FROM hypotheses WHERE id = ? AND engagement_id = ?").get(hypothesisId, engagementId) as Record<string, unknown> | undefined;
  if (!hypothesis) {
    return NextResponse.json({ error: "Hypothesis not found" }, { status: 404 });
  }

  // Gather all evidence: coded segments across all interviews for this engagement
  const segments = db.prepare(`
    SELECT cs.text, cs.sentiment, c.name as code_name,
           s.name as stakeholder_name, s.type as stakeholder_type
    FROM coded_segments cs
    JOIN codes c ON cs.code_id = c.id
    JOIN interviews i ON cs.interview_id = i.id
    JOIN stakeholders s ON i.stakeholder_id = s.id
    WHERE i.engagement_id = ?
    ORDER BY c.name, cs.created_at
  `).all(engagementId) as Array<Record<string, unknown>>;

  const systemPrompt = `You are an expert qualitative researcher validating a hypothesis against interview evidence.

Given a hypothesis and coded interview data, assess whether the evidence supports or contradicts the hypothesis.

Provide:
1. An assessment: detailed analysis of how the evidence relates to the hypothesis
2. A confidence level: "strong", "moderate", "weak", or "contradicted"
3. A summary: one-sentence conclusion

Respond as JSON:
{
  "assessment": "Detailed analysis...",
  "confidence": "strong|moderate|weak|contradicted",
  "summary": "One-sentence conclusion"
}

Return ONLY the JSON object.`;

  const userPrompt = `Hypothesis: "${hypothesis.statement}"
${hypothesis.evidence_summary ? `Current evidence summary: ${hypothesis.evidence_summary}` : ""}

Available evidence from ${segments.length} coded segments across interviews:
${segments.slice(0, 50).map((s, i) => `${i + 1}. [${s.code_name}] "${s.text}" - ${s.stakeholder_name} (${s.stakeholder_type}), sentiment: ${s.sentiment}`).join("\n")}
${segments.length > 50 ? `\n... and ${segments.length - 50} more segments` : ""}`;

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
      assessment: parsed.assessment || "",
      confidence: parsed.confidence || "weak",
      summary: parsed.summary || "",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI hypothesis validation failed" },
      { status: 500 }
    );
  }
}
