import { describe, it, expect } from "vitest";
import { computeWeek } from "@/lib/calculate";
import { getWeekTier } from "@/lib/tiers";
import { buildWeekCardProps, getWeekTemplates } from "@/data/cardTemplates";
import type { DayRecord } from "@/types/record";

function rec(date: string, soju: number, beer: number): DayRecord {
  return { date, soju, beer, updatedAt: 0 };
}

function rec4(
  date: string,
  soju: number,
  beer: number,
  sojuGlass: number,
  highball: number
): DayRecord {
  return { date, soju, beer, sojuGlass, highball, updatedAt: 0 };
}

// ── 0건 시나리오 ─────────────────────────────────────────────

describe("computeWeek — 0건 시나리오", () => {
  it("빈 배열: 합산 0, 음주일 0, peakDay null", () => {
    const r = computeWeek([]);
    expect(r.totalAlcoholG).toBe(0);
    expect(r.drinkingDays).toBe(0);
    expect(r.peakDay).toBeNull();
    expect(r.peakDayTie).toBe(false);
  });

  it("0건 시 주간 티어 → w0_rest", () => {
    const r = computeWeek([]);
    expect(getWeekTier(r.totalAlcoholG).id).toBe("w0_rest");
  });

  it("0/0 기록만 있는 경우 → 음주일 0, peakDay null", () => {
    const records = [
      rec("2026-05-18", 0, 0),
      rec("2026-05-17", 0, 0),
    ];
    const r = computeWeek(records);
    expect(r.drinkingDays).toBe(0);
    expect(r.totalAlcoholG).toBe(0);
    expect(r.peakDay).toBeNull();
  });
});

// ── 3건 시나리오 ─────────────────────────────────────────────

describe("computeWeek — 3건 시나리오", () => {
  it("3건 중 음주일 2건: drinkingDays=2, 0/0은 미포함", () => {
    const records = [
      rec("2026-05-18", 1, 0), // 알코올 있음
      rec("2026-05-17", 0, 2), // 알코올 있음
      rec("2026-05-16", 0, 0), // 0/0 기록
    ];
    const r = computeWeek(records);
    expect(r.drinkingDays).toBe(2);
    expect(r.totalAlcoholG).toBeGreaterThan(0);
  });

  it("3건: peakDay는 alcoholG가 가장 높은 날", () => {
    const records = [
      rec("2026-05-18", 1, 0), // 소주 1병 ≈ 46.9g
      rec("2026-05-17", 0, 2), // 맥주 2잔 ≈ 35.5g
      rec("2026-05-16", 0, 1), // 맥주 1잔 ≈ 17.8g
    ];
    const r = computeWeek(records);
    expect(r.peakDay).toBe("2026-05-18");
    expect(r.peakDayTie).toBe(false);
  });

  it("3건 동률 (2일): peakDay = today에 가까운 날, peakDayTie=false", () => {
    // 소주 1병 ≈ 46.87g — 두 날이 동일
    const records = [
      rec("2026-05-18", 1, 0),
      rec("2026-05-17", 1, 0),
      rec("2026-05-16", 0, 1),
    ];
    const r = computeWeek(records);
    expect(r.peakDay).toBe("2026-05-18"); // 더 최근 날 우선
    expect(r.peakDayTie).toBe(false);
  });
});

// ── 7건 시나리오 ─────────────────────────────────────────────

describe("computeWeek — 7건 시나리오", () => {
  it("7건 전부 음주: drinkingDays=7, totalAlcoholG 합산", () => {
    const records = [
      rec("2026-05-18", 1, 0),
      rec("2026-05-17", 0, 2),
      rec("2026-05-16", 1, 1),
      rec("2026-05-15", 2, 0),
      rec("2026-05-14", 0, 3),
      rec("2026-05-13", 1, 0),
      rec("2026-05-12", 0, 1),
    ];
    const r = computeWeek(records);
    expect(r.drinkingDays).toBe(7);
    expect(r.totalAlcoholG).toBeGreaterThan(0);
    expect(r.totalSojuEquivBottles).toBeGreaterThan(0);
  });

  it("7건 중 3일 동률 → peakDayTie=true, peakDay=null", () => {
    // 소주 1병씩 3일 동률
    const records = [
      rec("2026-05-18", 1, 0),
      rec("2026-05-17", 1, 0),
      rec("2026-05-16", 1, 0),
      rec("2026-05-15", 0, 1),
      rec("2026-05-14", 0, 0),
      rec("2026-05-13", 0, 0),
      rec("2026-05-12", 0, 0),
    ];
    const r = computeWeek(records);
    expect(r.peakDayTie).toBe(true);
    expect(r.peakDay).toBeNull();
  });

  it("7건 모두 0/0: 음주일 0, peakDay null, totalAlcoholG 0", () => {
    const records = [
      rec("2026-05-18", 0, 0),
      rec("2026-05-17", 0, 0),
      rec("2026-05-16", 0, 0),
      rec("2026-05-15", 0, 0),
      rec("2026-05-14", 0, 0),
      rec("2026-05-13", 0, 0),
      rec("2026-05-12", 0, 0),
    ];
    const r = computeWeek(records);
    expect(r.drinkingDays).toBe(0);
    expect(r.totalAlcoholG).toBe(0);
    expect(r.peakDay).toBeNull();
    expect(getWeekTier(r.totalAlcoholG).id).toBe("w0_rest");
  });

  it("7건: 최고 음주량 날이 today에서 멀수록 가까운 날이 peakDay", () => {
    // 18일, 15일 동일 알코올 (소주 2병) — 18일이 더 최근
    const records = [
      rec("2026-05-18", 2, 0),
      rec("2026-05-17", 0, 1),
      rec("2026-05-16", 0, 1),
      rec("2026-05-15", 2, 0),
      rec("2026-05-14", 0, 1),
      rec("2026-05-13", 0, 0),
      rec("2026-05-12", 0, 0),
    ];
    const r = computeWeek(records);
    expect(r.peakDay).toBe("2026-05-18");
    expect(r.peakDayTie).toBe(false);
  });
});

// ── 4종 혼합 시나리오 ─────────────────────────────────────────

describe("computeWeek — 4종 혼합 시나리오", () => {
  it("sojuGlass/highball만 있는 날도 음주일로 집계된다", () => {
    const records = [
      rec4("2026-05-18", 0, 0, 2, 0),  // 소주잔 2잔만
      rec4("2026-05-17", 0, 0, 0, 1),  // 하이볼 1잔만
      rec4("2026-05-16", 0, 0, 0, 0),  // 0/0/0/0
    ];
    const r = computeWeek(records);
    expect(r.drinkingDays).toBe(2);
  });

  it("4종 혼합 7일 — totalAlcoholG, drinkingDays, peakDay 정상", () => {
    // 18일: 소주1병+소주2잔+맥주1잔+하이볼1잔 ≈ 96.97g
    // 17일: 맥주2잔 ≈ 35.5g
    // 16일: 하이볼2잔 ≈ 38.66g
    // 15일: 소주잔3잔 ≈ 19.53g
    // 14일: 소주1병 ≈ 46.87g
    // 13일: 0/0/0/0
    // 12일: 맥주1잔 ≈ 17.75g
    const records: DayRecord[] = [
      rec4("2026-05-18", 1, 1, 2, 1),
      rec4("2026-05-17", 0, 2, 0, 0),
      rec4("2026-05-16", 0, 0, 0, 2),
      rec4("2026-05-15", 0, 0, 3, 0),
      rec4("2026-05-14", 1, 0, 0, 0),
      rec4("2026-05-13", 0, 0, 0, 0),
      rec4("2026-05-12", 0, 1, 0, 0),
    ];
    const r = computeWeek(records);
    expect(r.drinkingDays).toBe(6);
    expect(r.totalAlcoholG).toBeGreaterThan(0);
    // 18일이 최고 (96.97g)
    expect(r.peakDay).toBe("2026-05-18");
    expect(r.peakDayTie).toBe(false);
  });

  it("4종 혼합 — 합산 알코올 수치가 각 단위 합과 일치한다", () => {
    // soju 1병 ≈ 46.87 + highball 1잔 ≈ 19.33 = 66.20g
    const record = rec4("2026-05-18", 1, 0, 0, 1);
    const r = computeWeek([record]);
    expect(r.totalAlcoholG).toBeCloseTo(46.87 + 19.33, 0);
  });

  it("sojuGlass/highball가 없는 기존 기록도 4종 OR 판정에서 누락 없음", () => {
    // 기존 2필드 기록: soju=1, beer=0
    const legacy = rec("2026-05-18", 1, 0);
    const r = computeWeek([legacy]);
    expect(r.drinkingDays).toBe(1);
  });
});

// ── buildWeekCardProps 주간 카드 props ────────────────────────

describe("buildWeekCardProps — 주간 카드 props 생성", () => {
  it("getWeekTemplates()는 tpl_weekly 1개만 반환", () => {
    const templates = getWeekTemplates();
    expect(templates.length).toBe(1);
    expect(templates[0].id).toBe("tpl_weekly");
  });

  it("기록 0건에서도 정상 props 생성 (throw 없음)", () => {
    const weekCalc = computeWeek([]);
    const tier = getWeekTier(weekCalc.totalAlcoholG);
    expect(() =>
      buildWeekCardProps("tpl_weekly", "2026-05-12", "2026-05-18", weekCalc, tier)
    ).not.toThrow();
  });

  it("기록 0건 — drinkingDays 0, totalAlcoholG 0, peakDayLabel '없음'", () => {
    const weekCalc = computeWeek([]);
    const tier = getWeekTier(weekCalc.totalAlcoholG);
    const props = buildWeekCardProps(
      "tpl_weekly",
      "2026-05-12",
      "2026-05-18",
      weekCalc,
      tier,
    );
    expect(props.templateId).toBe("tpl_weekly");
    expect(props.drinkingDays).toBe(0);
    expect(props.totalAlcoholG).toBe(0);
    expect(props.peakDayLabel).toBe("없음");
    expect(props.rangeStart).toBe("2026-05-12");
    expect(props.rangeEnd).toBe("2026-05-18");
    expect(props.tierName).toBeTruthy();
    expect(props.cardLine).toBeTruthy();
    expect(props.safetyLine).toBeTruthy();
  });

  it("3건 기록 — drinkingDays/totalAlcoholG/peakDayLabel 정상", () => {
    const records: DayRecord[] = [
      rec("2026-05-18", 1, 0), // 소주 1병
      rec("2026-05-17", 0, 2), // 맥주 2잔
      rec("2026-05-16", 0, 1), // 맥주 1잔
    ];
    const weekCalc = computeWeek(records);
    const tier = getWeekTier(weekCalc.totalAlcoholG);
    const props = buildWeekCardProps(
      "tpl_weekly",
      "2026-05-12",
      "2026-05-18",
      weekCalc,
      tier,
    );
    expect(props.drinkingDays).toBe(3);
    expect(props.totalAlcoholG).toBeGreaterThan(0);
    expect(props.totalSojuEquivBottles).toBeGreaterThan(0);
    // 18일이 최고 음주일 (소주 1병 ≈ 46.9g > 맥주 2잔 ≈ 35.5g)
    expect(props.peakDayLabel).not.toBe("없음");
    expect(props.peakDayLabel).not.toBe("여러 날 동률");
  });

  it("7건 기록 — totalAlcoholG/totalSojuEquivBottles 합산 정상", () => {
    const records: DayRecord[] = [
      rec("2026-05-18", 1, 0),
      rec("2026-05-17", 0, 2),
      rec("2026-05-16", 1, 1),
      rec("2026-05-15", 2, 0),
      rec("2026-05-14", 0, 3),
      rec("2026-05-13", 1, 0),
      rec("2026-05-12", 0, 1),
    ];
    const weekCalc = computeWeek(records);
    const tier = getWeekTier(weekCalc.totalAlcoholG);
    const props = buildWeekCardProps(
      "tpl_weekly",
      "2026-05-12",
      "2026-05-18",
      weekCalc,
      tier,
    );
    expect(props.drinkingDays).toBe(7);
    expect(props.totalAlcoholG).toBeGreaterThan(0);
    expect(props.totalSojuEquivBottles).toBeGreaterThan(0);
    expect(props.templateId).toBe("tpl_weekly");
  });
});
