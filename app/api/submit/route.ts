export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    full_name,
    artist_name,
    email,
    social_media,
    concept,
    mix_title,
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
    !mix_title ||
    !mix_url ||
    !photo_url ||
    !bio
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/submissions`,
    {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        full_name,
        artist_name,
        email,
        social_media,
        mix_concept: concept,
        mix_title,
        mix_url,
        photo_url,
        bio,
        anything_else: anything_else || null,
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text || "Failed to save submission" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
