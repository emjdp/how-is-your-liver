import type { DayRecord, DayCalc, TierResult, WeekCalc } from "@/types/record";
import { safetyLineCard } from "@/lib/safety-copy";

export interface CardTemplate {
  id: string;
  name: string;
  concept: string;
  emphasisFields: string[];
  scope: "day" | "week";
}

export const CARD_TEMPLATES: CardTemplate[] = [
  {
    id: "tpl_report",
    name: "기본 리포트",
    concept: "건강검진 결과지 풍",
    emphasisFields: ["sojuEquivBottles", "alcoholG"],
    scope: "day",
  },
  {
    id: "tpl_overtime",
    name: "간 야근",
    concept: "사원증/근무표 패러디",
    emphasisFields: ["processHours", "tierId"],
    scope: "day",
  },
  {
    id: "tpl_forecast",
    name: "숙취 예보",
    concept: "일기예보 패러디",
    emphasisFields: ["processHours", "cardLine"],
    scope: "day",
  },
  {
    id: "tpl_warning",
    name: "경고 카드",
    concept: "안전 표지판 패러디",
    emphasisFields: ["alcoholG", "cardLine"],
    scope: "day",
  },
  {
    id: "tpl_weekly",
    name: "주간 정산",
    concept: "회계 정산서 패러디",
    emphasisFields: ["totalAlcoholG", "drinkingDays"],
    scope: "week",
  },
];

export function getDayTemplates(): CardTemplate[] {
  return CARD_TEMPLATES.filter((t) => t.scope === "day");
}

export function getWeekTemplates(): CardTemplate[] {
  return CARD_TEMPLATES.filter((t) => t.scope === "week");
}

/** 당일 카드용 props */
export interface DayCardProps {
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

/** 주간 카드용 props */
export interface WeekCardProps {
  templateId: string;
  rangeStart: string;
  rangeEnd: string;
  tierName: string;
  tierId: string;
  cardLine: string;
  safetyLine: string;
  totalAlcoholG: number;
  totalSojuEquivBottles: number;
  drinkingDays: number;
  peakDayLabel: string;
}

/** 하위 호환용 타입 별칭 (기존 코드가 CardProps를 참조하는 경우) */
export type CardProps = DayCardProps;

/**
 * DayRecord + DayCalc + TierResult → DayCardProps
 * 빈 기록(undefined)이면 throw.
 */
export function buildCardProps(
  templateId: string,
  record: DayRecord | undefined,
  calc: DayCalc,
  tier: TierResult
): DayCardProps {
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

function formatPeakDayLabel(
  peakDay: string | null,
  peakDayTie: boolean,
  drinkingDays: number
): string {
  if (drinkingDays === 0) return "없음";
  if (peakDayTie) return "여러 날 동률";
  if (!peakDay) return "없음";
  const parts = peakDay.split("-");
  if (parts.length !== 3) return peakDay;
  const [, m, d] = parts;
  const dayIdx = new Date(`${peakDay}T12:00:00`).getDay();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${parseInt(m)}/${parseInt(d)} ${days[dayIdx]}`;
}

/**
 * rangeStart/rangeEnd + WeekCalc + TierResult → WeekCardProps
 * 기록 0건 / 전부 0이어도 throw하지 않는다.
 */
export function buildWeekCardProps(
  templateId: string,
  rangeStart: string,
  rangeEnd: string,
  weekCalc: WeekCalc,
  tier: TierResult
): WeekCardProps {
  return {
    templateId,
    rangeStart,
    rangeEnd,
    tierName: tier.name,
    tierId: tier.id,
    cardLine: tier.cardLine,
    safetyLine: safetyLineCard,
    totalAlcoholG: weekCalc.totalAlcoholG,
    totalSojuEquivBottles: weekCalc.totalSojuEquivBottles,
    drinkingDays: weekCalc.drinkingDays,
    peakDayLabel: formatPeakDayLabel(
      weekCalc.peakDay,
      weekCalc.peakDayTie,
      weekCalc.drinkingDays
    ),
  };
}
