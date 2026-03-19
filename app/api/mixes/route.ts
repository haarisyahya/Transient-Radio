export const runtime = "edge";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/mixes?select=*&order=index.asc`,
    {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch mixes" }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
