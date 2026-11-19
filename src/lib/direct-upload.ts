import { createClient } from "@supabase/supabase-js";

// Uploads a file straight from the browser to Storage with a one-time token made by the server.
// It is not tied to the login session, so it never touches the cookies. Returns an error text or null.
export async function uploadToSignedPath(
  bucket: string,
  path: string,
  token: string,
  file: File,
): Promise<string | null> {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
  const { error } = await client.storage
    .from(bucket)
    .uploadToSignedUrl(path, token, file, { contentType: file.type });
  return error ? error.message : null;
}