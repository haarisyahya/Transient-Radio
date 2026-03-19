export const runtime = "edge";

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    full_name,
    artist_name,
    email,
    social_media,
    concept,
    mix_url,
    photo_url,
    bio,
    anything_else,
  } = body;

  if (
    !full_name ||
    !artist_name ||
    !email ||
    !social_media ||
    !concept ||
    !mix_url ||
    !photo_url ||
    !bio
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { error } = await getSupabaseAdmin().from("submissions").insert({
    full_name,
    artist_name,
    email,
    social_media,
    concept,
    mix_url,
    photo_url,
    bio,
    anything_else: anything_else || null,
  });

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: "Failed to save submission" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
