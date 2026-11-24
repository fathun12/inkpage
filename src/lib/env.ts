function need(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing ${name}. Fill it in .env.local, then restart npm run dev.`);
  }
  return value;
}

export const env = {
  get supabaseUrl() {
    return need("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);
  },
  get supabaseKey() {
    return need(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    );
  },
  // Server only. Never give it a NEXT_PUBLIC_ name.
  get serviceRoleKey() {
    return need("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY);
  },
  // Email (Brevo), server only. Optional: without them the shop still works and just skips the emails.
  get brevoApiKey() {
    return process.env.BREVO_API_KEY || undefined;
  },
  get brevoSenderEmail() {
    return process.env.BREVO_SENDER_EMAIL || undefined;
  },
  get brevoSenderName() {
    return process.env.BREVO_SENDER_NAME || undefined;
  },
};