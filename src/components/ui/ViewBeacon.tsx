"use client";

import { useEffect } from "react";

type Props = { endpoint: string; username: string };

export function ViewBeacon({ endpoint, username }: Props) {
  useEffect(() => {
    const key = `viewed:${username}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // storage blocked: count the view anyway
    }
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, referrer: document.referrer || undefined }),
      keepalive: true,
    }).catch(() => {});
  }, [endpoint, username]);

  return null;
}