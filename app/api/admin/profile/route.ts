import { type NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-session";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { storagePathFromPublicUrl } from "@/lib/storage-utils";

export async function PATCH(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, bio, avatarUrl, whatsapp, telegram, oldAvatarUrl } = await req.json();

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("artist_profile").upsert({
    id: "main",
    name: name ?? null,
    bio: bio ?? null,
    avatar_url: avatarUrl || null,
    whatsapp: whatsapp || null,
    telegram: telegram || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (oldAvatarUrl) {
    const path = storagePathFromPublicUrl(oldAvatarUrl, "paintings");
    if (path) {
      await supabase.storage.from("paintings").remove([path]);
    }
  }

  return NextResponse.json({ ok: true });
}
