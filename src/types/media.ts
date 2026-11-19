export type VideoSignInput = { name: string; type: string; size: number };

export type VideoSignResult = { path: string; token: string } | { error: string };

// Server action that prepares a direct upload of a background video or GIF.
export type VideoSignAction = (input: VideoSignInput) => Promise<VideoSignResult>;