"use server";

import { redirect } from "next/navigation";
import { routes } from "@/config/site";
import { redirectWithError } from "@/lib/flash";
import { field } from "@/lib/form";
import { createClient } from "@/lib/supabase/server";
import { firstError } from "@/lib/validation";
import { loginSchema } from "./schema";

export async function loginAction(formData: FormData): Promise<void> {
  const parsed = loginSchema.safeParse({
    email: field(formData, "email"),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) return redirectWithError(routes.login, firstError(parsed.error));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return redirectWithError(routes.login, "Wrong email or password.");

  redirect(routes.admin);
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect(routes.login);
}