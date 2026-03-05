import { supabase } from "./supabaseClient";

export type AppRole = "neighbor" | "moderator" | "admin";

export async function getMyRole(): Promise<{ role: AppRole; status: string } | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("role,status")
    .eq("user_id", auth.user.id)
    .single();

  if (error) return null;
  return data as any;
}
