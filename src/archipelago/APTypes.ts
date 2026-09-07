export type APConnectionConfig = {
  host: string;
  port: number;
  slot: string;
  password?: string;
};

export type ProgressiveChance =
  | 0.2
  | 0.5
  | 0.8;