import { type NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, price, dimensions, technique, imageUrl } = await req.json();

  const id = crypto.randomUUID();
  const { error } = await getSupabaseAdmin().from("paintings").insert({
    id,
    title,
    description: description || null,
    price: Number(price),
    dimensions,
    technique,
    image_url: imageUrl,
    sold: false,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id });
}
