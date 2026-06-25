import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guard";
import { listOptions, addOption, deleteOption } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FIELDS = ["handle", "source", "medium"];

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ options: listOptions() });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { field, label, value } = await req.json().catch(() => ({}));
  if (!FIELDS.includes(field) || !label?.trim() || !value?.trim()) {
    return NextResponse.json({ error: "field, label, value required" }, { status: 400 });
  }
  return NextResponse.json({ option: addOption(field, label.trim(), value.trim()) });
}

export async function DELETE(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!Number.isInteger(id)) return NextResponse.json({ error: "id required" }, { status: 400 });
  deleteOption(id);
  return NextResponse.json({ ok: true });
}
