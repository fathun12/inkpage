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
};