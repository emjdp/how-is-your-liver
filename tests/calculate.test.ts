import { describe, it, expect } from "vitest";
import {
  pureAlcoholG,
  sojuEquivBottles,
  calcKcal,
  calcProcessHours,
  computeDay,
  clampInput,
} from "@/lib/calculate";
import { SOJU_G_PER_BOTTLE, BEER_G_PER_UNIT } from "@/lib/constants";
import type { DayRecord } from "@/types/record";

describe("pureAlcoholG", () => {
  it("소주 1병 알코올 g ≈ 46.87", () => {
    const g = pureAlcoholG(360, 0.165);
    expect(g).toBeCloseTo(46.87, 1);
  });

  it("맥주 1잔 알코올 g ≈ 17.75", () => {
    const g = pureAlcoholG(500, 0.045);
    expect(g).toBeCloseTo(17.75, 1);
  });

  it("0 입력 → 0g", () => {
    expect(pureAlcoholG(0, 0.165)).toBe(0);
  });

  it("음수 → 0으로 폴백", () => {
    expect(pureAlcoholG(-100, 0.165)).toBe(0);
  });

  it("NaN → 0으로 폴백", () => {
    expect(pureAlcoholG(NaN, 0.165)).toBe(0);
  });
});

describe("computeDay", () => {
  it("소주 2병 + 맥주 3잔 → 알코올, kcal, 처리 추정 시간 예상값 일치", () => {
    const record: DayRecord = {
      date: "2026-05-18",
      soju: 2,
      beer: 3,
      updatedAt: 0,
    };
    const calc = computeDay(record);

    // 예상: 2*46.87 + 3*17.75 = 93.74 + 53.25 = 146.99g
    expect(calc.alcoholG).toBeCloseTo(147.0, 0);
    expect(calc.kcal).toBeCloseTo(1029, 0);
    // 147 / 8 ≈ 18.375 → 0.5 단위 = 18.5
    expect(calc.processHours).toBe(18.5);
    // 소주 환산 ≈ 147 / 46.87 ≈ 3.1
    expect(calc.sojuEquivBottles).toBeCloseTo(3.1, 0);
  });

  it("0 입력 → 모든 값 0", () => {
    const record: DayRecord = {
      date: "2026-05-18",
      soju: 0,
      beer: 0,
      updatedAt: 0,
    };
    const calc = computeDay(record);
    expect(calc.alcoholG).toBe(0);
    expect(calc.kcal).toBe(0);
    expect(calc.processHours).toBe(0);
    expect(calc.sojuEquivBottles).toBe(0);
  });

  it("음수 입력 → 0으로 폴백", () => {
    const record: DayRecord = {
      date: "2026-05-18",
      soju: -3,
      beer: -1,
      updatedAt: 0,
    };
    const calc = computeDay(record);
    expect(calc.alcoholG).toBe(0);
  });

  it("입력 상한 초과 → max로 클램프", () => {
    const record: DayRecord = {
      date: "2026-05-18",
      soju: 999,
      beer: 999,
      updatedAt: 0,
    };
    const calc = computeDay(record);
    // soju 30병 + beer 30잔의 알코올 g
    const expected =
      SOJU_G_PER_BOTTLE * 30 + BEER_G_PER_UNIT * 30;
    expect(calc.alcoholG).toBeCloseTo(expected, 0);
  });
});

describe("calcProcessHours", () => {
  it("0.5h 단위 반올림: 147g → 18.5h", () => {
    expect(calcProcessHours(147)).toBe(18.5);
  });

  it("0 → 0h", () => {
    expect(calcProcessHours(0)).toBe(0);
  });

  it("NaN → 0h", () => {
    expect(calcProcessHours(NaN)).toBe(0);
  });
});

describe("clampInput", () => {
  it("최대값 초과 → max로 클램프", () => {
    expect(clampInput(999, "soju")).toBe(30);
    expect(clampInput(999, "beer")).toBe(30);
  });

  it("음수 → 0으로 클램프", () => {
    expect(clampInput(-5, "soju")).toBe(0);
  });

  it("소수 → 정수 반올림", () => {
    expect(clampInput(2.7, "soju")).toBe(3);
  });
});

describe("sojuEquivBottles", () => {
  it("소수점 1자리 반올림", () => {
    expect(sojuEquivBottles(46.87)).toBeCloseTo(1.0, 1);
  });
});

describe("calcKcal", () => {
  it("알코올 g × 7, 정수 반올림", () => {
    expect(calcKcal(100)).toBe(700);
    expect(calcKcal(146.99)).toBe(1029);
  });
});
