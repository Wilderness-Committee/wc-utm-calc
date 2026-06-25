import db from "@/lib/db";

export type Option = {
  id: number;
  field: string;
  label: string;
  value: string;
  sort_order: number;
  created_via: string;
  created_at: string | null;
};
export type Tooltip = { field: string; text: string };
export type CampaignId = { source_value: string; otg_id: string; tbz_id: string };

export type Config = {
  options: Record<string, { label: string; value: string }[]>;
  tooltips: Record<string, string>;
  campaignIds: Record<string, { otg_id: string; tbz_id: string }>;
};

export function getConfig(): Config {
  const options = db
    .prepare("SELECT field, label, value FROM dropdown_options ORDER BY field, sort_order, id")
    .all() as Pick<Option, "field" | "label" | "value">[];
  const tooltips = db.prepare("SELECT field, text FROM field_tooltips").all() as Tooltip[];
  const campaignIds = db
    .prepare("SELECT source_value, otg_id, tbz_id FROM source_campaign_ids")
    .all() as CampaignId[];

  const grouped: Config["options"] = {};
  for (const o of options) {
    (grouped[o.field] ||= []).push({ label: o.label, value: o.value });
  }

  return {
    options: grouped,
    tooltips: Object.fromEntries(tooltips.map((t) => [t.field, t.text])),
    campaignIds: Object.fromEntries(
      campaignIds.map((c) => [c.source_value, { otg_id: c.otg_id, tbz_id: c.tbz_id }])
    ),
  };
}

export function listOptions(): Option[] {
  return db
    .prepare(
      "SELECT id, field, label, value, sort_order, created_via, created_at FROM dropdown_options ORDER BY field, sort_order, id"
    )
    .all() as Option[];
}

export function addOption(
  field: string,
  label: string,
  value: string,
  createdVia: "admin" | "user" = "admin"
): Option {
  const max = db
    .prepare("SELECT COALESCE(MAX(sort_order), -1) AS m FROM dropdown_options WHERE field = ?")
    .get(field) as { m: number };
  const info = db
    .prepare(
      "INSERT INTO dropdown_options (field, label, value, sort_order, created_via, created_at) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(field, label, value, max.m + 1, createdVia, new Date().toISOString());
  return db
    .prepare(
      "SELECT id, field, label, value, sort_order, created_via, created_at FROM dropdown_options WHERE id = ?"
    )
    .get(info.lastInsertRowid) as Option;
}

// Save-on-create from the main form. Idempotent: returns the existing option
// if a campaign with the same value already exists, so users can't create dupes.
export function addUserCampaign(name: string): Option {
  const existing = db
    .prepare(
      "SELECT id, field, label, value, sort_order, created_via, created_at FROM dropdown_options WHERE field = 'campaign' AND value = ?"
    )
    .get(name) as Option | undefined;
  if (existing) return existing;
  return addOption("campaign", name, name, "user");
}

export function deleteOption(id: number): void {
  db.prepare("DELETE FROM dropdown_options WHERE id = ?").run(id);
}

export function setTooltip(field: string, text: string): void {
  db.prepare(
    "INSERT INTO field_tooltips (field, text) VALUES (?, ?) ON CONFLICT(field) DO UPDATE SET text = excluded.text"
  ).run(field, text);
}

export function setCampaignId(source_value: string, otg_id: string, tbz_id: string): void {
  db.prepare(
    `INSERT INTO source_campaign_ids (source_value, otg_id, tbz_id) VALUES (?, ?, ?)
     ON CONFLICT(source_value) DO UPDATE SET otg_id = excluded.otg_id, tbz_id = excluded.tbz_id`
  ).run(source_value, otg_id, tbz_id);
}

export function deleteCampaignId(source_value: string): void {
  db.prepare("DELETE FROM source_campaign_ids WHERE source_value = ?").run(source_value);
}
