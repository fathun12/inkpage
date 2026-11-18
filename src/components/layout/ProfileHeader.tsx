type Props = {
  displayName: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
};

export function ProfileHeader({ displayName, username, bio, avatarUrl }: Props) {
  return (
    <header className="flex flex-col items-center gap-4 text-center">
      <div className="ink-border shadow-hard animate-stamp flex size-24 items-center justify-center overflow-hidden rounded-md bg-highlight">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={displayName} className="size-full object-cover" />
        ) : (
          <span className="font-display text-5xl font-black">
            {displayName.trim().charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div>
        <h1 className="font-display text-4xl font-black leading-none">{displayName}</h1>
        <p className="mt-2 font-mono text-sm text-ink-soft">@{username}</p>
      </div>
      {bio && <p className="max-w-sm whitespace-pre-line text-ink-soft">{bio}</p>}
    </header>
  );
}