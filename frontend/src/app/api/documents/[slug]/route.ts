import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { seedSpecification } from "@/lib/seed-specification";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = getDb();

  // Auto-seed the specification document if it doesn't exist yet
  if (slug === "specification") {
    seedSpecification();
  }

  const doc = db
    .prepare("SELECT * FROM documents WHERE slug = ?")
    .get(slug) as Record<string, unknown> | undefined;

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json(doc);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = getDb();
  const body = await req.json();

  const existing = db
    .prepare("SELECT id FROM documents WHERE slug = ?")
    .get(slug) as Record<string, unknown> | undefined;

  if (existing) {
    db.prepare(
      "UPDATE documents SET title = ?, content = ?, updated_at = datetime('now') WHERE slug = ?"
    ).run(body.title, body.content, slug);
  } else {
    db.prepare(
      "INSERT INTO documents (slug, title, content) VALUES (?, ?, ?)"
    ).run(slug, body.title, body.content);
  }

  const doc = db
    .prepare("SELECT * FROM documents WHERE slug = ?")
    .get(slug);

  return NextResponse.json(doc);
}
