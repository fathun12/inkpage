import { createClient } from "@supabase/supabase-js";
import { mediaConfig } from "@/config/media";

// Uploads a file straight from the browser to storage with a one-time token made by the server.
// A token that starts with "r2:" is a signed link to Cloudflare R2. Any other token is a Supabase upload token.
// It is not tied to the login session, so it never touches the cookies. Returns an error text or null.
export async function uploadToSignedPath(
  bucket: string,
  path: string,
  token: string,
  file: File,
): Promise<string | null> {
  if (token.startsWith("r2:")) {
    try {
      const res = await fetch(token.slice(3), {
        method: "PUT",
        headers: { "Content-Type": file.type, "Cache-Control": mediaConfig.cacheHeader },
        body: file,
      });
      return res.ok ? null : `storage answered ${res.status}`;
    } catch {
      return "could not reach the storage. Check your connection.";
    }
  }

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
  const { error } = await client.storage
    .from(bucket)
    .uploadToSignedUrl(path, token, file, {
      contentType: file.type,
      // Only the public media bucket. Files in it get a new random name every time, so a year is safe.
      ...(bucket === mediaConfig.bucket ? { cacheControl: String(mediaConfig.cacheSeconds) } : {}),
    });
  return error ? error.message : null;
}