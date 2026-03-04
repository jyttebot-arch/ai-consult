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
  `);
}
