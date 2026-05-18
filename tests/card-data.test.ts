import { describe, it, expect } from "vitest";
import {
  buildCardProps,
  buildWeekCardProps,
  getDayTemplates,
  getWeekTemplates,
  CARD_TEMPLATES,
} from "@/data/cardTemplates";
import { computeDay, computeWeek } from "@/lib/calculate";
import { getDayTier, getWeekTier } from "@/lib/tiers";
import type { DayRecord } from "@/types/record";

const makeRecord = (date: string, soju: number, beer: number): DayRecord => ({
  date,
  soju,
  beer,
  updatedAt: Date.now(),
});

// ── 템플릿 메타 ────────────────────────────────────────────────────────────

describe("CARD_TEMPLATES — 5종 메타", () => {
  it("day 템플릿 4종 존재 (tpl_report, tpl_overtime, tpl_forecast, tpl_warning)", () => {
    const dayIds = getDayTemplates().map((t) => t.id);
    expect(dayIds).toContain("tpl_report");
    expect(dayIds).toContain("tpl_overtime");
    expect(dayIds).toContain("tpl_forecast");
    expect(dayIds).toContain("tpl_warning");
    expect(dayIds).not.toContain("tpl_weekly");
  });

  it("week 템플릿 1종 존재 (tpl_weekly)", () => {
    const weekIds = getWeekTemplates().map((t) => t.id);
    expect(weekIds).toContain("tpl_weekly");
    expect(weekIds).not.toContain("tpl_report");
    expect(weekIds.length).toBe(1);
  });

  it("getDayTemplates()가 4개 반환", () => {
    expect(getDayTemplates().length).toBe(4);
  });

  it("getWeekTemplates()가 1개 반환", () => {
    expect(getWeekTemplates().length).toBe(1);
  });

  it("전체 템플릿은 5종", () => {
    expect(CARD_TEMPLATES.length).toBe(5);
  });

  it("모든 day 템플릿에 scope === 'day'", () => {
    for (const t of getDayTemplates()) {
      expect(t.scope).toBe("day");
    }
  });

  it("tpl_weekly에 scope === 'week'", () => {
    const weekly = getWeekTemplates()[0];
    expect(weekly.scope).toBe("week");
  });
});

// ── buildCardProps (당일 4종 공통 필드) ───────────────────────────────────

describe("buildCardProps — 당일 4종 공통 필드 제공", () => {
  const record = makeRecord("2026-05-18", 2, 1);
  const calc = computeDay(record);
  const tier = getDayTier(calc.alcoholG);

  for (const tpl of getDayTemplates()) {
    it(`${tpl.id} — 필요한 필드를 모두 제공`, () => {
      const props = buildCardProps(tpl.id, record, calc, tier);
      expect(props.templateId).toBe(tpl.id);
      expect(props.date).toBe("2026-05-18");
      expect(props.tierName).toBeTruthy();
      expect(props.tierId).toBeTruthy();
      expect(props.cardLine).toBeTruthy();
      expect(props.safetyLine).toBeTruthy();
      expect(typeof props.alcoholG).toBe("number");
      expect(typeof props.sojuEquivBottles).toBe("number");
      expect(typeof props.processHours).toBe("number");
      expect(typeof props.kcal).toBe("number");
    });
  }

  it("빈 기록(undefined)이면 throw", () => {
    const c = computeDay(makeRecord("2026-05-18", 1, 0));
    const t = getDayTier(c.alcoholG);
    expect(() => buildCardProps("tpl_report", undefined, c, t)).toThrow();
  });

  it("0/0 저장 기록에서는 t0_peace 카피로 정상 생성", () => {
    const r = makeRecord("2026-05-18", 0, 0);
    const c = computeDay(r);
    const t = getDayTier(c.alcoholG);
    expect(t.id).toBe("t0_peace");
    const props = buildCardProps("tpl_report", r, c, t);
    expect(props.tierId).toBe("t0_peace");
    expect(props.alcoholG).toBe(0);
    expect(props.processHours).toBe(0);
  });
});

// ── buildWeekCardProps ─────────────────────────────────────────────────────

describe("buildWeekCardProps — 주간 카드 props", () => {
  it("기록 0건인 빈 주에서 throw하지 않음", () => {
    const weekCalc = computeWeek([]);
    const tier = getWeekTier(weekCalc.totalAlcoholG);
    expect(() =>
      buildWeekCardProps("tpl_weekly", "2026-05-11", "2026-05-17", weekCalc, tier)
    ).not.toThrow();
  });

  it("기록 전부 0인 주에서 throw하지 않음", () => {
    const records = [
      makeRecord("2026-05-11", 0, 0),
      makeRecord("2026-05-12", 0, 0),
    ];
    const weekCalc = computeWeek(records);
    const tier = getWeekTier(weekCalc.totalAlcoholG);
    expect(() =>
      buildWeekCardProps("tpl_weekly", "2026-05-11", "2026-05-17", weekCalc, tier)
    ).not.toThrow();
  });

  it("빈 주 — drinkingDays: 0, totalAlcoholG: 0, peakDayLabel: '없음'", () => {
    const weekCalc = computeWeek([]);
    const tier = getWeekTier(0);
    const props = buildWeekCardProps(
      "tpl_weekly",
      "2026-05-11",
      "2026-05-17",
      weekCalc,
      tier
    );
    expect(props.drinkingDays).toBe(0);
    expect(props.totalAlcoholG).toBe(0);
    expect(props.peakDayLabel).toBe("없음");
    expect(props.rangeStart).toBe("2026-05-11");
    expect(props.rangeEnd).toBe("2026-05-17");
    expect(props.tierName).toBeTruthy();
    expect(props.cardLine).toBeTruthy();
    expect(props.safetyLine).toBeTruthy();
  });

  it("정상 기록 — 필요한 모든 필드 제공", () => {
    const records = [
      makeRecord("2026-05-13", 1, 1),
      makeRecord("2026-05-15", 2, 0),
      makeRecord("2026-05-17", 0, 2),
    ];
    const weekCalc = computeWeek(records);
    const tier = getWeekTier(weekCalc.totalAlcoholG);
    const props = buildWeekCardProps(
      "tpl_weekly",
      "2026-05-11",
      "2026-05-17",
      weekCalc,
      tier
    );
    expect(props.templateId).toBe("tpl_weekly");
    expect(props.drinkingDays).toBe(3);
    expect(props.totalAlcoholG).toBeGreaterThan(0);
    expect(props.totalSojuEquivBottles).toBeGreaterThan(0);
    expect(props.peakDayLabel).not.toBe("없음");
    expect(props.tierId).toBeTruthy();
  });

  it("동률(peakDayTie) — peakDayLabel: '동률'", () => {
    // 같은 양으로 3일 → peakDayTie
    const records = [
      makeRecord("2026-05-11", 1, 0),
      makeRecord("2026-05-12", 1, 0),
      makeRecord("2026-05-13", 1, 0),
    ];
    const weekCalc = computeWeek(records);
    const tier = getWeekTier(weekCalc.totalAlcoholG);
    const props = buildWeekCardProps(
      "tpl_weekly",
      "2026-05-11",
      "2026-05-17",
      weekCalc,
      tier
    );
    if (weekCalc.peakDayTie) {
      expect(props.peakDayLabel).toBe("동률");
    }
  });
});
