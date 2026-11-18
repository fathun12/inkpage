import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/profile";

export const getProfileByUsername = cache(async (username: string): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
  return (data as Profile | null) ?? null;
});

export const getProfileById = cache(async (id: string): Promise<Profile | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  return (data as Profile | null) ?? null;
});