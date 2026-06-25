import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guard";
import { setCampaignId, deleteCampaignId } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { source_value, otg_id, tbz_id } = await req.json().catch(() => ({}));
  if (!source_value?.trim()) {
    return NextResponse.json({ error: "source_value required" }, { status: 400 });
  }
  setCampaignId(source_value.trim(), (otg_id || "").trim(), (tbz_id || "").trim());
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const source_value = req.nextUrl.searchParams.get("source_value");
  if (!source_value) return NextResponse.json({ error: "source_value required" }, { status: 400 });
  deleteCampaignId(source_value);
  return NextResponse.json({ ok: true });
}
