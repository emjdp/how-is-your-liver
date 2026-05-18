import { describe, it, expect } from "vitest";
import { DAY_TIER_MESSAGES, WEEK_TIER_MESSAGES } from "@/data/tierMessages";
import { safetyLineLong, safetyLineCard } from "@/lib/safety-copy";

/** 금지어 패턴 목록 (TONE_GUIDE.md 기준) */
const FORBIDDEN_PATTERNS = [
  /더 마셔/,
  /한 병 더/,
  /계속 달려/,
  /달리자/,
  /주신/,
  /술고수/,
  /주당/,
  /주신급/,
  /레전드/,
  /전설/,
  /진정한 상남자/,
  /찐 남자/,
  /여자가 이 정도면/,
  /아직 부족/,
  /이 정도면 더/,
  /더 가자/,
  /한 잔만 더/,
  /음주운전/,
  /대리 없이/,
  /치료/,
  /진단/,
  /처방/,
  /축하드립니다/,
  /축하합니다/,
  /자랑하기엔 부족/,
  /자랑하기 부족/,
];

const allDayMessages = Object.values(DAY_TIER_MESSAGES);
const allWeekMessages = Object.values(WEEK_TIER_MESSAGES);
const allMessages = [...allDayMessages, ...allWeekMessages];

function checkForbidden(text: string, label: string): void {
  for (const pattern of FORBIDDEN_PATTERNS) {
    expect(
      pattern.test(text),
      `금지어 "${pattern}" 발견: [${label}] "${text}"`
    ).toBe(false);
  }
}

describe("금지어 검사 — 모든 tierMessages 슬롯", () => {
  for (const tier of allMessages) {
    it(`${tier.id} - headline 금지어 없음`, () => {
      checkForbidden(tier.headline, `${tier.id}.headline`);
    });
    it(`${tier.id} - subline 금지어 없음`, () => {
      checkForbidden(tier.subline, `${tier.id}.subline`);
    });
    it(`${tier.id} - cardLine 금지어 없음`, () => {
      checkForbidden(tier.cardLine, `${tier.id}.cardLine`);
    });
    it(`${tier.id} - safetyLine 금지어 없음`, () => {
      checkForbidden(tier.safetyLine, `${tier.id}.safetyLine`);
    });
  }
});

describe("카피 길이 제한", () => {
  for (const tier of allMessages) {
    it(`${tier.id} - cardLine ≤18자`, () => {
      expect(tier.cardLine.length).toBeLessThanOrEqual(18);
    });
  }
});

describe("안전 안내 문구 길이 및 allow-list", () => {
  it("safetyLineLong ≤80자", () => {
    expect(safetyLineLong.length).toBeLessThanOrEqual(80);
  });

  it("safetyLineCard ≤32자", () => {
    expect(safetyLineCard.length).toBeLessThanOrEqual(32);
  });

  it("safetyLineLong은 금지어 검사 allow-list (검사 제외)", () => {
    // 이 두 상수는 "운전" 단어를 포함하지만 안전 목적이므로 금지어 검사 제외
    // "음주운전", "대리 없이" 패턴만 걸러냄 — "운전" 자체는 허용
    expect(/음주운전/.test(safetyLineLong)).toBe(false);
    expect(/대리 없이/.test(safetyLineLong)).toBe(false);
  });

  it("safetyLineCard는 금지어 검사 allow-list (검사 제외)", () => {
    expect(/음주운전/.test(safetyLineCard)).toBe(false);
    expect(/대리 없이/.test(safetyLineCard)).toBe(false);
  });
});

// ── v1.0 신규 카드 템플릿 하드코딩 카피 금지어 검사 ──────────────────────
// (TplForecast / TplWarning / TplWeekly 인라인 텍스트)

const FORECAST_STATIC_COPIES = [
  "숙취 예보",
  "당신의 간은 안녕하십니까?",
  "알코올 처리 추정",
  "순수 알코올",
  "소주 환산",
  "열량",
  "오늘 간은 평화롭습니다.",
  "내일 컨디션은 비공개입니다.",
  "가벼운 안개 예상.",
  "오전 흐림 예상.",
  "장기간 흐림 예상.",
];

const WARNING_STATIC_COPIES = [
  "당신의 간은 안녕하십니까?",
  "오늘 섭취한 순수 알코올",
  "소주 환산",
  "처리 추정",
  "열량",
];

const WEEKLY_STATIC_COPIES = [
  "주간 정산",
  "당신의 간은 안녕하십니까?",
  "최근 7일 합산 순수 알코올",
  "음주일",
  "소주 환산",
  "최고 음주일",
  "평가",
];

describe("금지어 검사 — v1.0 신규 카드 템플릿 하드코딩 카피", () => {
  for (const copy of FORECAST_STATIC_COPIES) {
    it(`TplForecast: "${copy}" 금지어 없음`, () => {
      checkForbidden(copy, `TplForecast`);
    });
  }

  for (const copy of WARNING_STATIC_COPIES) {
    it(`TplWarning: "${copy}" 금지어 없음`, () => {
      checkForbidden(copy, `TplWarning`);
    });
  }

  for (const copy of WEEKLY_STATIC_COPIES) {
    it(`TplWeekly: "${copy}" 금지어 없음`, () => {
      checkForbidden(copy, `TplWeekly`);
    });
  }
});
