-- File: supabase/migrations/20261119070000_media_video_bucket.sql
-- inkpage: 20261119070000_media_video_bucket
-- Purpose: let the media bucket hold short background videos and GIFs (up to 10 MB per file).

update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array[
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm'
    ]
where id = 'media';