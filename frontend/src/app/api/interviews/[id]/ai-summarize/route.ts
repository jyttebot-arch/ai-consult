import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();

  const interview = db.prepare("SELECT * FROM interviews WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }
  if (!interview.transcript || (interview.transcript as string).trim().length === 0) {
    return NextResponse.json({ error: "No transcript available to summarize" }, { status: 400 });
  }

  const stakeholder = db
    .prepare("SELECT * FROM stakeholders WHERE id = ?")
    .get(interview.stakeholder_id) as Record<string, unknown> | undefined;

  // Load coded segments for additional context
  const segments = db
    .prepare("SELECT cs.*, c.name as code_name FROM coded_segments cs LEFT JOIN codes c ON cs.code_id = c.id WHERE cs.interview_id = ?")
    .all(id) as Array<Record<string, unknown>>;

  const systemPrompt = `You are an expert qualitative researcher. Summarize the following interview transcript.

Your summary should:
1. Capture the key themes and insights discussed
2. Note the stakeholder's main perspectives and positions
3. Highlight any notable quotes or strong opinions
4. Identify areas of agreement, disagreement, or uncertainty
5. Be structured with clear sections

${segments.length > 0 ? `The transcript has been coded with the following qualitative codes:
${[...new Set(segments.map((s) => s.code_name))].map((name) => `- ${name}`).join("\n")}
Reference these codes in your summary where relevant.` : ""}

Keep the summary concise but comprehensive (300-500 words).`;

  const userPrompt = `Interview with: ${stakeholder ? `${stakeholder.name} (${stakeholder.role}, ${stakeholder.type})` : "Unknown stakeholder"}
${interview.title ? `Topic: ${interview.title}` : ""}
${interview.impressions ? `Interviewer impressions: ${interview.impressions}` : ""}

TRANSCRIPT:
${interview.transcript}`;

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
    return NextResponse.json({ summary: data.message?.content || "" });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI summarization failed" },
      { status: 500 }
    );
  }
}
