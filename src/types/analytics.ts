export type DailyPoint = { label: string; views: number; clicks: number };

export type Stats = {
  days: number;
  views: number;
  clicks: number;
  ctr: number;
  daily: DailyPoint[];
  topBlocks: { id: string; title: string; clicks: number }[];
  devices: { name: string; count: number }[];
};