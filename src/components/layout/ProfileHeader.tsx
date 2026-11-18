import { Img } from "@/components/ui/Img";

type Props = {
  displayName: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
};

export function ProfileHeader({ displayName, username, bio, avatarUrl }: Props) {
  return (
    <header className="animate-rise flex flex-col items-center gap-4 text-center">
      <div className="flex size-24 items-center justify-center overflow-hidden rounded-full bg-highlight">
        {avatarUrl ? (
          <Img src={avatarUrl} alt={displayName} className="size-full object-cover" />
        ) : (
          <span className="font-display text-4xl font-medium">
            {displayName.trim().charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div>
        <h1 className="font-display text-4xl font-medium leading-none">{displayName}</h1>
        <p className="mt-2 text-sm text-ink-soft">@{username}</p>
      </div>
      {bio && <p className="max-w-sm whitespace-pre-line text-ink-soft">{bio}</p>}
    </header>
  );
}