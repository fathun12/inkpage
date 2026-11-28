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
  // Secret of the daily cron call. Vercel sends it as "Authorization: Bearer ...".
  get cronSecret() {
    return process.env.CRON_SECRET || undefined;
  },
  // Dodo Payments, server only. Optional: without the key, paid checkout answers "not connected yet".
  get dodoApiKey() {
    return process.env.DODO_PAYMENTS_API_KEY || undefined;
  },
  // Must be exactly test_mode or live_mode (anything else counts as not set).
  get dodoEnvironment() {
    const value = process.env.DODO_PAYMENTS_ENVIRONMENT;
    return value === "test_mode" || value === "live_mode" ? value : undefined;
  },
  // The signing secret of the webhook endpoint (starts with whsec_).
  get dodoWebhookKey() {
    return process.env.DODO_PAYMENTS_WEBHOOK_KEY || undefined;
  },
  // Steam Web API key, server only. Optional: without it the Steam section stays hidden.
  get steamApiKey() {
    return process.env.STEAM_API_KEY || undefined;
  },
  // Cloudflare R2 for public media, server only. Without all five, uploads stay on Supabase.
  get r2Ready() {
    return Boolean(
      process.env.R2_ACCOUNT_ID &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY &&
        process.env.R2_BUCKET &&
        process.env.R2_PUBLIC_URL,
    );
  },
  get r2AccountId() {
    return need("R2_ACCOUNT_ID", process.env.R2_ACCOUNT_ID);
  },
  get r2AccessKeyId() {
    return need("R2_ACCESS_KEY_ID", process.env.R2_ACCESS_KEY_ID);
  },
  get r2SecretAccessKey() {
    return need("R2_SECRET_ACCESS_KEY", process.env.R2_SECRET_ACCESS_KEY);
  },
  get r2Bucket() {
    return need("R2_BUCKET", process.env.R2_BUCKET);
  },
  get r2PublicUrl() {
    return need("R2_PUBLIC_URL", process.env.R2_PUBLIC_URL);
  },
};