"use client";

import { useEffect, useState } from "react";

type Option = { id: number; field: string; label: string; value: string; sort_order: number };

const FIELD_LABELS: Record<string, string> = {
  handle: "URL Handle",
  source: "UTM Source",
  medium: "UTM Medium",
};
const OPTION_FIELDS = ["handle", "source", "medium"];

const TOOLTIP_FIELDS: { field: string; label: string }[] = [
  { field: "utm_campaign", label: "UTM Campaign Name" },
  { field: "handle", label: "URL Handle" },
  { field: "source", label: "UTM Source" },
  { field: "medium", label: "UTM Medium" },
  { field: "otg_id", label: "OTG Campaign ID" },
  { field: "tbz_id", label: "TBZ Campaign ID" },
  { field: "utm_term", label: "UTM Term" },
  { field: "utm_content", label: "UTM Content" },
];

export default function AdminPanel() {
  const [options, setOptions] = useState<Option[]>([]);
  const [tooltips, setTooltips] = useState<Record<string, string>>({});
  const [campaignIds, setCampaignIds] = useState<
    Record<string, { otg_id: string; tbz_id: string }>
  >({});
  const [sources, setSources] = useState<{ label: string; value: string }[]>([]);
  const [status, setStatus] = useState("");

  const load = async () => {
    const [optRes, cfgRes] = await Promise.all([
      fetch("/api/admin/options"),
      fetch("/api/config"),
    ]);
    const optData = await optRes.json();
    const cfg = await cfgRes.json();
    setOptions(optData.options || []);
    setTooltips(cfg.tooltips || {});
    setCampaignIds(cfg.campaignIds || {});
    setSources(cfg.options?.source || []);
  };

  useEffect(() => {
    load();
  }, []);

  const flash = (m: string) => {
    setStatus(m);
    setTimeout(() => setStatus(""), 2000);
  };

  const addOption = async (field: string, label: string, value: string) => {
    const res = await fetch("/api/admin/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, label, value }),
    });
    if (res.ok) {
      await load();
      flash("Added");
    } else flash("Error adding");
  };

  const deleteOption = async (id: number) => {
    const res = await fetch(`/api/admin/options?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      await load();
      flash("Deleted");
    }
  };

  const saveTooltip = async (field: string, text: string) => {
    const res = await fetch("/api/admin/tooltips", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, text }),
    });
    flash(res.ok ? "Saved" : "Error");
  };

  const saveCampaignId = async (source_value: string, otg_id: string, tbz_id: string) => {
    const res = await fetch("/api/admin/campaign-ids", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_value, otg_id, tbz_id }),
    });
    if (res.ok) {
      await load();
      flash("Saved");
    } else flash("Error");
  };

  const logout = async () => {
    await fetch("/api/auth/logout?scope=admin", { method: "POST" });
    window.location.href = "/admin/login";
  };

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <div className="flex gap-4 items-center">
          {status && <span className="text-green-500 text-sm">{status}</span>}
          <a href="/" className="text-sm text-indigo-400 hover:underline">
            ← Generator
          </a>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-white">
            Log out
          </button>
        </div>
      </div>

      {/* Dropdown options */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Dropdown Options</h2>
        {OPTION_FIELDS.map((field) => (
          <OptionGroup
            key={field}
            field={field}
            label={FIELD_LABELS[field]}
            options={options.filter((o) => o.field === field)}
            onAdd={addOption}
            onDelete={deleteOption}
          />
        ))}
      </section>

      {/* Tooltips */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Field Tooltips</h2>
        {TOOLTIP_FIELDS.map(({ field, label }) => (
          <TooltipRow
            key={field}
            label={label}
            value={tooltips[field] || ""}
            onSave={(text) => saveTooltip(field, text)}
          />
        ))}
      </section>

      {/* Auto-fill campaign IDs */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">Source Auto-Fill Campaign IDs</h2>
        <p className="text-sm text-gray-400 mb-4">
          When a source is selected, these OTG/TBZ IDs auto-fill. Leave blank for no auto-fill.
        </p>
        {sources.map((s) => (
          <CampaignIdRow
            key={s.value}
            label={s.label}
            sourceValue={s.value}
            otg={campaignIds[s.value]?.otg_id || ""}
            tbz={campaignIds[s.value]?.tbz_id || ""}
            onSave={saveCampaignId}
          />
        ))}
      </section>
    </main>
  );
}

function OptionGroup({
  field,
  label,
  options,
  onAdd,
  onDelete,
}: {
  field: string;
  label: string;
  options: Option[];
  onAdd: (field: string, label: string, value: string) => void;
  onDelete: (id: number) => void;
}) {
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  return (
    <div className="mb-6 border border-gray-700 rounded-md p-4">
      <h3 className="font-medium mb-3">{label}</h3>
      <ul className="mb-3 space-y-1">
        {options.map((o) => (
          <li key={o.id} className="flex justify-between items-center text-sm">
            <span>
              {o.label} <span className="text-gray-500">({o.value})</span>
            </span>
            <button
              onClick={() => onDelete(o.id)}
              className="text-red-400 hover:text-red-300 text-xs"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          placeholder="Label"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-black text-sm"
        />
        <input
          placeholder="Value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-black text-sm"
        />
        <button
          onClick={() => {
            if (newLabel.trim() && newValue.trim()) {
              onAdd(field, newLabel.trim(), newValue.trim());
              setNewLabel("");
              setNewValue("");
            }
          }}
          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
        >
          Add
        </button>
      </div>
    </div>
  );
}

function TooltipRow({
  label,
  value,
  onSave,
}: {
  label: string;
  value: string;
  onSave: (text: string) => void;
}) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tooltip text…"
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-black text-sm"
        />
        <button
          onClick={() => onSave(text)}
          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function CampaignIdRow({
  label,
  sourceValue,
  otg,
  tbz,
  onSave,
}: {
  label: string;
  sourceValue: string;
  otg: string;
  tbz: string;
  onSave: (sourceValue: string, otg: string, tbz: string) => void;
}) {
  const [otgId, setOtgId] = useState(otg);
  const [tbzId, setTbzId] = useState(tbz);
  useEffect(() => setOtgId(otg), [otg]);
  useEffect(() => setTbzId(tbz), [tbz]);
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1">
        {label} <span className="text-gray-500">({sourceValue})</span>
      </label>
      <div className="flex gap-2">
        <input
          value={otgId}
          onChange={(e) => setOtgId(e.target.value)}
          placeholder="OTG ID"
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-black text-sm"
        />
        <input
          value={tbzId}
          onChange={(e) => setTbzId(e.target.value)}
          placeholder="TBZ ID"
          className="flex-1 px-2 py-1 border border-gray-300 rounded text-black text-sm"
        />
        <button
          onClick={() => onSave(sourceValue, otgId, tbzId)}
          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
