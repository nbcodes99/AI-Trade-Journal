import { supabase } from "@/lib/supabaseClient";

export async function searchTradesBySetup({
  setupQuery,
  userId,
  limit = 50,
}: {
  setupQuery: string;
  userId: string;
  limit?: number;
}) {
  if (!setupQuery || !userId) return [];

  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .ilike("setup", `%${setupQuery}%`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("searchTradesBySetup error:", error);
    return [];
  }
  return data || [];
}
