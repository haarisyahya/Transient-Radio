export const runtime = "edge";
export const dynamic = "force-dynamic";

import { getSupabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("mixes")
    .select("*")
    .order("index", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json({ error: "Failed to fetch mixes" }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
