import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guard";
import { setTooltip } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { field, text } = await req.json().catch(() => ({}));
  if (!field?.trim()) return NextResponse.json({ error: "field required" }, { status: 400 });
  setTooltip(field.trim(), typeof text === "string" ? text : "");
  return NextResponse.json({ ok: true });
}
