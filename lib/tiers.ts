import type { TierResult } from "@/types/record";
import { DAY_TIER_MESSAGES, WEEK_TIER_MESSAGES } from "@/data/tierMessages";

/**
 * 당일 티어 판정 (기준: 순수 알코올 g)
 * 경계: <= / > 기반 (예: 20g 정확히는 t1_light, 20.01g는 t2_somaek)
 */
export function getDayTier(alcoholG: number): TierResult {
  let id: string;

  if (alcoholG === 0) {
    id = "t0_peace";
  } else if (alcoholG <= 20) {
    id = "t1_light";
  } else if (alcoholG <= 45) {
    id = "t2_somaek";
  } else if (alcoholG <= 80) {
    id = "t3_yajang";
  } else if (alcoholG <= 120) {
    id = "t4_overtime";
  } else if (alcoholG <= 180) {
    id = "t5_overload";
  } else {
    id = "t6_redzone";
  }

  return DAY_TIER_MESSAGES[id] as TierResult;
}

/**
 * 주간 티어 판정 (기준: 최근 7일 합산 순수 알코올 g)
 */
export function getWeekTier(totalG: number): TierResult {
  let id: string;

  if (totalG === 0) {
    id = "w0_rest";
  } else if (totalG <= 80) {
    id = "w1_breeze";
  } else if (totalG <= 200) {
    id = "w2_routine";
  } else if (totalG <= 400) {
    id = "w3_busy";
  } else if (totalG <= 700) {
    id = "w4_overtime";
  } else if (totalG <= 1000) {
    id = "w5_overload";
  } else {
    id = "w6_redzone";
  }

  return WEEK_TIER_MESSAGES[id] as TierResult;
}

/** 높은 티어 여부 (t5/t6, w5/w6) — 시각 절제 및 공유 카피 톤 조정에 사용 */
export function isHighTier(tierId: string): boolean {
  return (
    tierId === "t5_overload" ||
    tierId === "t6_redzone" ||
    tierId === "w5_overload" ||
    tierId === "w6_redzone"
  );
}
