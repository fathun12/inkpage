export type Profile = {
  id: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  theme: string;
  bg_mode: string;
  bg_image_url: string | null;
  bg_tint: number;
  bg_gray: boolean;
  created_at: string;
};