import { describe, it, expect } from "vitest";
import { computeWeek } from "@/lib/calculate";
import { getWeekTier } from "@/lib/tiers";
import type { DayRecord } from "@/types/record";

function rec(date: string, soju: number, beer: number): DayRecord {
  return { date, soju, beer, updatedAt: 0 };
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
