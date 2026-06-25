import { NextRequest, NextResponse } from "next/server";
import { requireSite } from "@/lib/guard";
import { addUserCampaign } from "@/lib/queries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Save-on-create from the main form: a logged-in site user types a new campaign
// name and it's persisted to the campaign dropdown for everyone. Gated by the
// site session (not admin) since any authorized user of the generator can do it.
export async function POST(req: NextRequest) {
  if (!(await requireSite())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name } = await req.json().catch(() => ({}));
  if (!name?.trim()) {
    return NextResponse.json({ error: "name required" }, { status: 400 });
  }
  return NextResponse.json({ option: addUserCampaign(name.trim()) });
}
