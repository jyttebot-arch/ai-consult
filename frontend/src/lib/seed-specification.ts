import { getDb } from "./db";
import fs from "node:fs";
import path from "node:path";

const SPEC_SLUG = "specification";

export function seedSpecification() {
  const db = getDb();
  const existing = db
    .prepare("SELECT id FROM documents WHERE slug = ?")
    .get(SPEC_SLUG) as Record<string, unknown> | undefined;

  if (existing) return; // Already seeded

  const mdPath = path.join(process.cwd(), "data", "specification.md");
  if (!fs.existsSync(mdPath)) return; // No seed file

  const content = fs.readFileSync(mdPath, "utf-8");
  db.prepare(
    "INSERT INTO documents (slug, title, content) VALUES (?, ?, ?)"
  ).run(SPEC_SLUG, "Consulting Platform — Application Specification", content);
}
