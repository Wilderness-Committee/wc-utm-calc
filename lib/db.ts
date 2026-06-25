import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// DATABASE_PATH points at a Railway volume in prod (e.g. /data/utm.db);
// falls back to a local file in dev.
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "utm.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

let db: Database.Database;

declare global {
  // eslint-disable-next-line no-var
  var __utmDb: Database.Database | undefined;
}

if (process.env.NODE_ENV === "production") {
  db = new Database(dbPath);
} else {
  if (!global.__utmDb) {
    global.__utmDb = new Database(dbPath);
  }
  db = global.__utmDb;
}

db.pragma("journal_mode = WAL");

migrate(db);
seedIfEmpty(db);

function migrate(d: Database.Database) {
  d.exec(`
    CREATE TABLE IF NOT EXISTS dropdown_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      field TEXT NOT NULL,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS field_tooltips (
      field TEXT PRIMARY KEY,
      text TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS source_campaign_ids (
      source_value TEXT PRIMARY KEY,
      otg_id TEXT NOT NULL DEFAULT '',
      tbz_id TEXT NOT NULL DEFAULT ''
    );
  `);

  // Track how/when an option was created so the admin panel can surface
  // entries that users self-created via "create new" on the main form.
  const cols = d
    .prepare("PRAGMA table_info(dropdown_options)")
    .all() as { name: string }[];
  if (!cols.some((c) => c.name === "created_via")) {
    d.exec(
      "ALTER TABLE dropdown_options ADD COLUMN created_via TEXT NOT NULL DEFAULT 'admin'"
    );
  }
  if (!cols.some((c) => c.name === "created_at")) {
    d.exec("ALTER TABLE dropdown_options ADD COLUMN created_at TEXT");
  }
}

function seedIfEmpty(d: Database.Database) {
  const count = d.prepare("SELECT COUNT(*) AS c FROM dropdown_options").get() as { c: number };
  if (count.c > 0) return;

  const insertOption = d.prepare(
    "INSERT INTO dropdown_options (field, label, value, sort_order) VALUES (?, ?, ?, ?)"
  );

  // Seeded from the original hardcoded values in app/page.tsx.
  const handles: [string, string][] = [
    ["Donate", "Donate"],
    ["DonateClimate", "DonateClimate"],
    ["DonateWilderness", "DonateWilderness"],
    ["DonateWildlife", "DonateWildlife"],
    ["EndangeredForests", "EndangeredForests"],
  ];
  const sources: [string, string][] = [
    ["Action Alert", "action_alert"],
    ["Donor Comms", "donor_comms"],
    ["Impact Report", "impact_report"],
    ["End Of Year", "end_of_year"],
    ["Fracking Engagement Journey", "fracking_ej"],
    ["Old Growth Engagement Journey", "old_growth_ej"],
    ["Action Welcome Engagement Journey", "action_welcome_ej"],
    ["Donor Welcome Engagement Journey", "donor_welcome_ej"],
  ];
  const mediums: [string, string][] = [
    ["Email", "email"],
    ["Journey", "journey"],
    ["Blog", "blog"],
    ["Facebook", "facebook"],
    ["Instagram", "instagram"],
  ];

  const seedField = (field: string, rows: [string, string][]) => {
    rows.forEach(([label, value], i) => insertOption.run(field, label, value, i));
  };

  const tx = d.transaction(() => {
    seedField("handle", handles);
    seedField("source", sources);
    seedField("medium", mediums);

    const insertTooltip = d.prepare(
      "INSERT OR IGNORE INTO field_tooltips (field, text) VALUES (?, ?)"
    );
    const fields = [
      "utm_campaign",
      "handle",
      "source",
      "medium",
      "otg_id",
      "tbz_id",
      "utm_term",
      "utm_content",
    ];
    fields.forEach((f) => insertTooltip.run(f, ""));

    // Preserve the original action_alert auto-fill IDs.
    d.prepare(
      "INSERT OR IGNORE INTO source_campaign_ids (source_value, otg_id, tbz_id) VALUES (?, ?, ?)"
    ).run("action_alert", "701Am0000009AAGIA2", "701OL000002fbgqYAA");
  });
  tx();
}

export default db;
