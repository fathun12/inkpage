"use client";

import { useState, useTransition } from "react";
import { toggleLikeAction } from "@/features/articles/like-actions";

type Props = { articleId: string; initialLiked: boolean; initialCount: number };

// Like: the number changes at once, and goes back if the server says no.
export function LikeButton({ articleId, initialLiked, initialCount }: Props) {
  const [state, setState] = useState({ liked: initialLiked, count: initialCount });
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function click() {
    if (pending) return;
    const before = state;
    setError(null);
    setState({ liked: !before.liked, count: Math.max(before.count + (before.liked ? -1 : 1), 0) });
    startTransition(async () => {
      const result = await toggleLikeAction(articleId);
      if (result.ok) {
        setState({ liked: result.liked, count: result.count });
      } else {
        setState(before);
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={click}
        aria-pressed={state.liked}
        className={`flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest hover:text-ink ${
          state.liked ? "text-ink" : "text-ink-soft"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          aria-hidden
          fill={state.liked ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        >
          <path d="M12 20.5s-7.5-4.6-9.2-9.3C1.7 8.2 3.4 5 6.6 5c1.9 0 3.5 1 5.4 3 1.9-2 3.5-3 5.4-3 3.2 0 4.9 3.2 3.8 6.2-1.7 4.7-9.2 9.3-9.2 9.3z" />
        </svg>
        {state.liked ? "Liked" : "Like"}
        {state.count > 0 && <span>· {state.count}</span>}
      </button>
      {error && (
        <span role="alert" className="font-mono text-[11px] tracking-wide text-ink-soft">
          {error}
        </span>
      )}
    </div>
  );
}