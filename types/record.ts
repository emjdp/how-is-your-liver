export type DrinkType = "soju" | "beer";

export interface DayRecord {
  /** ISO date string, KST 자정 기준 YYYY-MM-DD */
  date: string;
  soju: number; // 병 수, integer, 0..30
  beer: number; // 잔 수, integer, 0..30
  updatedAt: number; // epoch ms
}

export interface DayCalc {
  alcoholG: number;
  sojuEquivBottles: number;
  kcal: number;
  processHours: number;
}

export interface WeekCalc {
  totalAlcoholG: number;
  totalSojuEquivBottles: number;
  totalKcal: number;
  drinkingDays: number;
  peakDay: string | null; // YYYY-MM-DD, null if no drinking days
  peakDayTie: boolean; // 3일 이상 동률
}

export interface TierResult {
  id: string;
  name: string;
  headline: string;
  subline: string;
  cardLine: string;
  safetyLine: string;
  color: string;
  scope: "day" | "week";
}
