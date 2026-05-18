import type { DayRecord, DayCalc, WeekCalc } from "@/types/record";
import {
  DRINKS,
  ALCOHOL_DENSITY_G_PER_ML,
  METABOLISM_G_PER_HOUR,
  KCAL_PER_G_ALCOHOL,
  INPUT_MAX,
  SOJU_G_PER_BOTTLE,
} from "@/lib/constants";

/** 음수/NaN 방어: 0 이상으로 클램프 */
function safeNum(n: unknown): number {
  const v = typeof n === "number" ? n : 0;
  return isNaN(v) ? 0 : Math.max(0, v);
}

/** pureAlcoholG(volumeMl, abv) = volumeMl * abv * 0.789 */
export function pureAlcoholG(volumeMl: number, abv: number): number {
  return safeNum(volumeMl) * safeNum(abv) * ALCOHOL_DENSITY_G_PER_ML;
}

/** 소주 환산 병 수: 소수점 1자리 반올림 */
export function sojuEquivBottles(totalAlcoholG: number): number {
  const v = safeNum(totalAlcoholG) / SOJU_G_PER_BOTTLE;
  return Math.round(v * 10) / 10;
}

/** kcal: 정수 반올림 */
export function calcKcal(totalAlcoholG: number): number {
  return Math.round(safeNum(totalAlcoholG) * KCAL_PER_G_ALCOHOL);
}

/**
 * 처리 추정 시간: 0.5h 단위 반올림
 * 명칭 주의: "회복 시간"이 아닌 "알코올 처리 추정 시간" (필드명: processHours)
 */
export function calcProcessHours(totalAlcoholG: number): number {
  const raw = safeNum(totalAlcoholG) / METABOLISM_G_PER_HOUR;
  return Math.round(raw * 2) / 2;
}

/** 입력값 클램프 (0..max, 정수) */
export function clampInput(
  value: number,
  type: keyof typeof INPUT_MAX
): number {
  const v = Math.round(safeNum(value));
  return Math.min(v, INPUT_MAX[type]);
}

/** DayRecord → DayCalc (4종 합산: soju, sojuGlass, beer, highball) */
export function computeDay(record: DayRecord): DayCalc {
  const soju      = clampInput(record.soju, "soju");
  const sojuGlass = clampInput(record.sojuGlass ?? 0, "sojuGlass");
  const beer      = clampInput(record.beer, "beer");
  const highball  = clampInput(record.highball ?? 0, "highball");

  const sojuG      = pureAlcoholG(DRINKS.soju.mlPerUnit      * soju,      DRINKS.soju.abv);
  const sojuGlassG = pureAlcoholG(DRINKS.sojuGlass.mlPerUnit * sojuGlass, DRINKS.sojuGlass.abv);
  const beerG      = pureAlcoholG(DRINKS.beer.mlPerUnit      * beer,      DRINKS.beer.abv);
  const highballG  = pureAlcoholG(DRINKS.highball.mlPerUnit  * highball,  DRINKS.highball.abv);
  const totalG = sojuG + sojuGlassG + beerG + highballG;

  return {
    alcoholG: Math.round(totalG * 10) / 10,
    sojuEquivBottles: sojuEquivBottles(totalG),
    kcal: calcKcal(totalG),
    processHours: calcProcessHours(totalG),
  };
}

/** DayRecord[] → WeekCalc (최근 7일 합산) */
export function computeWeek(records: DayRecord[]): WeekCalc {
  let totalG = 0;
  let drinkingDays = 0;
  let peakG = -1;
  let peakDay: string | null = null;
  let peakCount = 0;

  // 날짜 기준 내림차순 정렬 → today에 가까운 날 우선 처리
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));

  for (const r of sorted) {
    const calc = computeDay(r);
    totalG += calc.alcoholG;
    if (
      r.soju > 0 ||
      r.beer > 0 ||
      (r.sojuGlass ?? 0) > 0 ||
      (r.highball ?? 0) > 0
    ) {
      drinkingDays++;
    }

    if (calc.alcoholG > peakG) {
      peakG = calc.alcoholG;
      peakDay = r.date;
      peakCount = 1;
    } else if (calc.alcoholG === peakG && peakG > 0) {
      peakCount++;
    }
  }

  const peakDayTie = peakCount >= 3;
  if (peakDayTie) peakDay = null;

  return {
    totalAlcoholG: Math.round(totalG * 10) / 10,
    totalSojuEquivBottles: sojuEquivBottles(totalG),
    totalKcal: calcKcal(totalG),
    drinkingDays,
    peakDay: drinkingDays === 0 ? null : peakDay,
    peakDayTie,
  };
}
