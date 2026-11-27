// Public Steam facts of the owner, read from the Steam Web API.
export type SteamGame = {
  appid: number;
  name: string;
  // Minutes played in the last two weeks and in total.
  recentMinutes: number;
  totalMinutes: number;
};

export type SteamData = {
  id: string;
  name: string;
  avatar: string;
  href: string;
  level: number | null;
  state: "playing" | "online" | "offline";
  // The game being played right now (only when state is "playing").
  playing: string | null;
  // Games in the library and the total time played, when Game details are public.
  owned: number;
  totalMinutes: number;
  recent: SteamGame[];
  top: SteamGame[];
};