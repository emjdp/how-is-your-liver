import { describe, it, expect } from "vitest";
import {
  pureAlcoholG,
  sojuEquivBottles,
  calcKcal,
  calcProcessHours,
  computeDay,
  clampInput,
} from "@/lib/calculate";
import {
  SOJU_G_PER_BOTTLE,
  SOJU_GLASS_G_PER_UNIT,
  BEER_G_PER_UNIT,
  HIGHBALL_G_PER_UNIT,
} from "@/lib/constants";
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

  it("소주 1잔 알코올 g ≈ 6.51", () => {
    const g = pureAlcoholG(50, 0.165);
    expect(g).toBeCloseTo(6.51, 1);
  });

  it("하이볼 1잔 알코올 g ≈ 19.33", () => {
    const g = pureAlcoholG(350, 0.07);
    expect(g).toBeCloseTo(19.33, 1);
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

  it("입력 상한 초과 → max로 클램프 (soju/beer 2종)", () => {
    const record: DayRecord = {
      date: "2026-05-18",
      soju: 999,
      beer: 999,
      updatedAt: 0,
    };
    const calc = computeDay(record);
    // soju 30병 + beer 30잔의 알코올 g
    const expected = SOJU_G_PER_BOTTLE * 30 + BEER_G_PER_UNIT * 30;
    expect(calc.alcoholG).toBeCloseTo(expected, 0);
  });

  it("소주 1병 + 소주 2잔 + 맥주 1잔 + 하이볼 1잔 → 합산 ≈ 96.97g", () => {
    const record: DayRecord = {
      date: "2026-05-18",
      soju: 1,
      beer: 1,
      sojuGlass: 2,
      highball: 1,
      updatedAt: 0,
    };
    const calc = computeDay(record);
    // 46.87 + 2*6.51 + 17.75 + 19.33 = 96.97g
    expect(calc.alcoholG).toBeCloseTo(96.97, 0);
  });

  it("sojuGlass/highball 누락 → 0으로 폴백 (기존 2종 결과 동일)", () => {
    const withNew: DayRecord = { date: "2026-05-18", soju: 2, beer: 3, updatedAt: 0 };
    const withExplicit: DayRecord = {
      date: "2026-05-18",
      soju: 2,
      beer: 3,
      sojuGlass: 0,
      highball: 0,
      updatedAt: 0,
    };
    expect(computeDay(withNew).alcoholG).toBeCloseTo(computeDay(withExplicit).alcoholG, 5);
  });

  it("4종 입력 상한 초과 → 각 max(30)으로 클램프", () => {
    const record: DayRecord = {
      date: "2026-05-18",
      soju: 999,
      beer: 999,
      sojuGlass: 999,
      highball: 999,
      updatedAt: 0,
    };
    const calc = computeDay(record);
    const expected =
      SOJU_G_PER_BOTTLE * 30 +
      SOJU_GLASS_G_PER_UNIT * 30 +
      BEER_G_PER_UNIT * 30 +
      HIGHBALL_G_PER_UNIT * 30;
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
  it("최대값 초과 → max로 클램프 (4종)", () => {
    expect(clampInput(999, "soju")).toBe(30);
    expect(clampInput(999, "beer")).toBe(30);
    expect(clampInput(999, "sojuGlass")).toBe(30);
    expect(clampInput(999, "highball")).toBe(30);
  });

  it("음수 → 0으로 클램프", () => {
    expect(clampInput(-5, "soju")).toBe(0);
    expect(clampInput(-1, "sojuGlass")).toBe(0);
    expect(clampInput(-1, "highball")).toBe(0);
  });

  it("소수 → 정수 반올림", () => {
    expect(clampInput(2.7, "soju")).toBe(3);
    expect(clampInput(1.4, "highball")).toBe(1);
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
