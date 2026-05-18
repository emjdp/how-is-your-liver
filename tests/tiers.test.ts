import { describe, it, expect } from "vitest";
import { getDayTier, getWeekTier } from "@/lib/tiers";

describe("getDayTier — 당일 티어 경계값", () => {
  const cases: [number, string][] = [
    [0, "t0_peace"],
    [0.01, "t1_light"],
    [20, "t1_light"],
    [20.01, "t2_somaek"],
    [45, "t2_somaek"],
    [45.01, "t3_yajang"],
    [80, "t3_yajang"],
    [80.01, "t4_overtime"],
    [120, "t4_overtime"],
    [120.01, "t5_overload"],
    [180, "t5_overload"],
    [180.01, "t6_redzone"],
    [999, "t6_redzone"],
  ];

  it.each(cases)("alcoholG=%s → tierId=%s", (g, expectedId) => {
    const tier = getDayTier(g);
    expect(tier.id).toBe(expectedId);
  });

  it("반환 객체에 4슬롯 카피·color·scope 모두 존재", () => {
    const tier = getDayTier(50);
    expect(tier.headline).toBeTruthy();
    expect(tier.subline).toBeTruthy();
    expect(tier.cardLine).toBeTruthy();
    expect(tier.safetyLine).toBeTruthy();
    expect(tier.color).toBeTruthy();
    expect(tier.scope).toBe("day");
  });
});

describe("getWeekTier — 주간 티어 경계값", () => {
  const cases: [number, string][] = [
    [0, "w0_rest"],
    [0.01, "w1_breeze"],
    [80, "w1_breeze"],
    [80.01, "w2_routine"],
    [200, "w2_routine"],
    [200.01, "w3_busy"],
    [400, "w3_busy"],
    [400.01, "w4_overtime"],
    [700, "w4_overtime"],
    [700.01, "w5_overload"],
    [1000, "w5_overload"],
    [1000.01, "w6_redzone"],
    [9999, "w6_redzone"],
  ];

  it.each(cases)("totalG=%s → tierId=%s", (g, expectedId) => {
    const tier = getWeekTier(g);
    expect(tier.id).toBe(expectedId);
  });

  it("반환 객체에 4슬롯 카피·color·scope 모두 존재", () => {
    const tier = getWeekTier(500);
    expect(tier.headline).toBeTruthy();
    expect(tier.subline).toBeTruthy();
    expect(tier.cardLine).toBeTruthy();
    expect(tier.safetyLine).toBeTruthy();
    expect(tier.color).toBeTruthy();
    expect(tier.scope).toBe("week");
  });

  it("0g → w0_rest", () => {
    expect(getWeekTier(0).id).toBe("w0_rest");
  });

  it("매우 큰 값 → w6_redzone", () => {
    expect(getWeekTier(999999).id).toBe("w6_redzone");
  });
});
