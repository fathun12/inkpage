import {
  DeleteObjectsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

// Cloudflare R2 (S3 compatible). Server only. New public uploads go here; older files stay in Supabase.

let client: S3Client | null = null;

function s3(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${env.r2AccountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: env.r2AccessKeyId, secretAccessKey: env.r2SecretAccessKey },
      // R2 does not accept the extra checksum the newer SDK adds to signed links.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return client;
}

export function r2Configured(): boolean {
  return env.r2Ready;
}

export function r2PublicUrl(path: string): string {
  return `${env.r2PublicUrl.replace(/\/+$/, "")}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

// The storage path of an address that points to our R2 domain, or null for any other address.
export function r2PathFromUrl(url: string): string | null {
  if (!env.r2Ready) return null;
  const base = `${env.r2PublicUrl.replace(/\/+$/, "")}/`;
  if (!url.startsWith(base)) return null;
  const path = decodeURIComponent(url.slice(base.length).split("?")[0]);
  return path && !path.includes("..") ? path : null;
}

// A one-time link the browser uses to PUT the file straight into the bucket (15 minutes).
export async function r2SignPut(path: string, contentType: string, cacheControl: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.r2Bucket,
    Key: path,
    ContentType: contentType,
    CacheControl: cacheControl,
  });
  return getSignedUrl(s3(), command, { expiresIn: 900 });
}

// Size in bytes of a stored file, or null when it does not exist.
export async function r2Size(path: string): Promise<number | null> {
  try {
    const out = await s3().send(new HeadObjectCommand({ Bucket: env.r2Bucket, Key: path }));
    return out.ContentLength ?? 0;
  } catch {
    return null;
  }
}

export type R2Object = { name: string; path: string; size: number; created: number | null };

// Files directly inside one folder (prefix without a trailing slash).
export async function r2List(folder: string): Promise<R2Object[]> {
  const prefix = `${folder}/`;
  const found: R2Object[] = [];
  let token: string | undefined;
  do {
    const out = await s3().send(
      new ListObjectsV2Command({ Bucket: env.r2Bucket, Prefix: prefix, ContinuationToken: token }),
    );
    for (const item of out.Contents ?? []) {
      if (!item.Key || item.Key === prefix) continue;
      const name = item.Key.slice(prefix.length);
      if (name.includes("/")) continue;
      found.push({ name, path: item.Key, size: item.Size ?? 0, created: item.LastModified?.getTime() ?? null });
    }
    token = out.IsTruncated ? out.NextContinuationToken : undefined;
  } while (token);
  return found;
}

// Returns how many files were deleted.
export async function r2Remove(paths: string[]): Promise<number> {
  let removed = 0;
  for (let i = 0; i < paths.length; i += 1000) {
    const chunk = paths.slice(i, i + 1000);
    const out = await s3().send(
      new DeleteObjectsCommand({
        Bucket: env.r2Bucket,
        Delete: { Objects: chunk.map((Key) => ({ Key })), Quiet: false },
      }),
    );
    removed += out.Deleted?.length ?? 0;
  }
  return removed;
}