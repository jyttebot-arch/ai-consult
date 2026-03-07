import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const db = getDb();
  const body = await req.json();

  // Load the interview and its transcript
  const interview = db.prepare("SELECT * FROM interviews WHERE id = ?").get(id) as Record<string, unknown> | undefined;
  if (!interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 });
  }
  if (!interview.transcript || (interview.transcript as string).trim().length === 0) {
    return NextResponse.json({ error: "No transcript available for coding" }, { status: 400 });
  }

  // Load stakeholder info
  const stakeholder = db
    .prepare("SELECT * FROM stakeholders WHERE id = ?")
    .get(interview.stakeholder_id) as Record<string, unknown> | undefined;

  // Load existing codes for context
  const existingCodes = db
    .prepare("SELECT name, description FROM codes WHERE engagement_id = ?")
    .all(interview.engagement_id) as Array<Record<string, unknown>>;

  const codeCount = body.codeCount || 10;
  const language = body.language || "English";

  const systemPrompt = `You are an expert qualitative researcher performing open coding on interview transcripts.

Your task is to analyze the interview transcript and identify ${codeCount} descriptive codes. For each code:
1. Give it a clear, concise name
2. Write a brief description of what the code captures
3. Extract 1-3 supporting quotes from the transcript

${existingCodes.length > 0 ? `Existing codes in this project (try to align with or extend these where relevant):
${existingCodes.map((c) => `- ${c.name}: ${c.description || "(no description)"}`).join("\n")}` : ""}

Respond in ${language}.

IMPORTANT: Return your analysis as a JSON object with this exact structure:
{
  "codes": [
    {
      "name": "Code Name",
      "description": "What this code captures",
      "quotes": [
        {
          "text": "Exact quote from transcript",
          "sentiment": "positive|negative|ambivalent|neutral",
          "isQuote": true
        }
      ]
    }
  ]
}

Return ONLY the JSON object, no other text.`;

  const userPrompt = `Interview with: ${stakeholder ? `${stakeholder.name} (${stakeholder.role}, ${stakeholder.type})` : "Unknown stakeholder"}
${interview.title ? `Topic: ${interview.title}` : ""}

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
    const content = data.message?.content || "";

    // Parse the JSON response from the LLM
    let parsed;
    try {
      // Try to extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsed = JSON.parse(jsonMatch[1].trim());
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response as structured codes", raw: content },
        { status: 500 }
      );
    }

    // Normalize the codes and add enabled flag
    const codes = (parsed.codes || []).map((c: Record<string, unknown>) => ({
      name: c.name || "Unnamed Code",
      description: c.description || "",
      quotes: ((c.quotes || []) as Array<Record<string, unknown>>).map((q) => ({
        text: q.text || "",
        sentiment: q.sentiment || "neutral",
        isQuote: q.isQuote !== false,
        startOffset: null,
        endOffset: null,
        matchType: null,
      })),
      enabled: true,
    }));

    // Try to find quote offsets in the transcript
    const transcript = interview.transcript as string;
    for (const code of codes) {
      for (const quote of code.quotes) {
        const idx = transcript.indexOf(quote.text);
        if (idx !== -1) {
          quote.startOffset = idx;
          quote.endOffset = idx + quote.text.length;
          quote.matchType = "exact";
        } else {
          // Try normalized matching (ignore whitespace differences)
          const normalizedQuote = quote.text.replace(/\s+/g, " ").trim();
          const normalizedTranscript = transcript.replace(/\s+/g, " ");
          const normIdx = normalizedTranscript.indexOf(normalizedQuote);
          if (normIdx !== -1) {
            quote.startOffset = normIdx;
            quote.endOffset = normIdx + normalizedQuote.length;
            quote.matchType = "normalized";
          }
        }
      }
    }

    return NextResponse.json({
      codes,
      model: data.model || "unknown",
      tokensNote: `Generated ${codes.length} codes with ${codes.reduce((sum: number, c: Record<string, unknown>) => sum + ((c.quotes as unknown[]) || []).length, 0)} quotes`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI coding failed" },
      { status: 500 }
    );
  }
}
