import type { DayRecord, DayCalc, TierResult } from "@/types/record";

export interface CardTemplate {
  id: string;
  name: string;
  concept: string;
  emphasisFields: string[];
}

/** MVP 2종 템플릿 메타 */
export const CARD_TEMPLATES: CardTemplate[] = [
  {
    id: "tpl_report",
    name: "기본 리포트 카드",
    concept: "건강검진 결과지 풍",
    emphasisFields: ["sojuEquivBottles", "alcoholG"],
  },
  {
    id: "tpl_overtime",
    name: "간 야근 카드",
    concept: "사원증/근무표 패러디",
    emphasisFields: ["processHours", "tierId"],
  },
];

export interface CardProps {
  templateId: string;
  date: string;
  tierName: string;
  tierId: string;
  cardLine: string;
  safetyLine: string;
  alcoholG: number;
  sojuEquivBottles: number;
  kcal: number;
  processHours: number;
}

/**
 * DayRecord + DayCalc + TierResult → CardProps
 * 빈 기록(undefined)이면 throw.
 */
export function buildCardProps(
  templateId: string,
  record: DayRecord | undefined,
  calc: DayCalc,
  tier: TierResult
): CardProps {
  if (!record) {
    throw new Error("카드 생성 불가: 기록이 없습니다.");
  }

  return {
    templateId,
    date: record.date,
    tierName: tier.name,
    tierId: tier.id,
    cardLine: tier.cardLine,
    safetyLine: tier.safetyLine,
    alcoholG: calc.alcoholG,
    sojuEquivBottles: calc.sojuEquivBottles,
    kcal: calc.kcal,
    processHours: calc.processHours,
  };
}
