// @ts-expect-error -- node:sqlite is experimental in Node 22
import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "consult.db");

let _db: InstanceType<typeof DatabaseSync> | null = null;

export function getDb(): InstanceType<typeof DatabaseSync> {
  if (!_db) {
    _db = new DatabaseSync(DB_PATH);
    _db.exec("PRAGMA journal_mode=WAL");
    _db.exec("PRAGMA foreign_keys=ON");
    migrate(_db);
  }
  return _db;
}

function migrate(db: InstanceType<typeof DatabaseSync>) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS engagements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      client_name TEXT NOT NULL,
      service_category TEXT NOT NULL,
      service_type TEXT,
      description TEXT,
      scope TEXT,
      ambition_level TEXT,
      success_criteria TEXT,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS phases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      engagement_id INTEGER NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      start_date TEXT,
      end_date TEXT,
      status TEXT NOT NULL DEFAULT 'not_started'
    );

    CREATE TABLE IF NOT EXISTS hypotheses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      engagement_id INTEGER NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
      statement TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      evidence_summary TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS stakeholders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      engagement_id INTEGER NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'internal',
      seniority_level TEXT,
      perspective_angle TEXT,
      contact_info TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS interviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      engagement_id INTEGER NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
      stakeholder_id INTEGER NOT NULL REFERENCES stakeholders(id) ON DELETE CASCADE,
      title TEXT,
      interview_date TEXT,
      status TEXT NOT NULL DEFAULT 'scheduled',
      notes TEXT,
      transcript TEXT,
      interviewer_name TEXT,
      impressions TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      engagement_id INTEGER NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'free-form',
      parent_code_id INTEGER REFERENCES codes(id) ON DELETE SET NULL,
      color TEXT NOT NULL DEFAULT '#3b82f6',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS coded_segments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      interview_id INTEGER NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
      code_id INTEGER NOT NULL REFERENCES codes(id) ON DELETE CASCADE,
      start_offset INTEGER NOT NULL,
      end_offset INTEGER NOT NULL,
      text TEXT NOT NULL,
      sentiment TEXT NOT NULL DEFAULT 'neutral',
      is_quote INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      engagement_id INTEGER NOT NULL REFERENCES engagements(id) ON DELETE CASCADE,
      code_id INTEGER REFERENCES codes(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      interpretation TEXT,
      implication TEXT,
      frequency_count INTEGER NOT NULL DEFAULT 0,
      sentiment_distribution TEXT,
      internal_vs_external TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_stakeholders_engagement ON stakeholders(engagement_id);
    CREATE INDEX IF NOT EXISTS idx_interviews_engagement ON interviews(engagement_id);
    CREATE INDEX IF NOT EXISTS idx_interviews_stakeholder ON interviews(stakeholder_id);
    CREATE INDEX IF NOT EXISTS idx_codes_engagement ON codes(engagement_id);
    CREATE INDEX IF NOT EXISTS idx_coded_segments_interview ON coded_segments(interview_id);
    CREATE INDEX IF NOT EXISTS idx_coded_segments_code ON coded_segments(code_id);
    CREATE INDEX IF NOT EXISTS idx_insights_engagement ON insights(engagement_id);
  `);
}
