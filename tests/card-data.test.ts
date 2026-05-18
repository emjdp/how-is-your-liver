import { describe, it, expect } from "vitest";
import {
  buildCardProps,
  CARD_TEMPLATES,
} from "@/data/cardTemplates";
import { computeDay } from "@/lib/calculate";
import { getDayTier } from "@/lib/tiers";
import type { DayRecord } from "@/types/record";

const makeRecord = (date: string, soju: number, beer: number): DayRecord => ({
  date,
  soju,
  beer,
  updatedAt: Date.now(),
});

describe("CARD_TEMPLATES — MVP 2종 메타", () => {
  it("MVP 2종 템플릿 존재 (tpl_report, tpl_overtime)", () => {
    const ids = CARD_TEMPLATES.map((t) => t.id);
    expect(ids).toContain("tpl_report");
    expect(ids).toContain("tpl_overtime");
    expect(ids.length).toBe(2);
  });
});

describe("buildCardProps", () => {
  it("tpl_report — 필요한 필드를 모두 제공", () => {
    const record = makeRecord("2026-05-18", 2, 1);
    const calc = computeDay(record);
    const tier = getDayTier(calc.alcoholG);
    const props = buildCardProps("tpl_report", record, calc, tier);

    expect(props.templateId).toBe("tpl_report");
    expect(props.date).toBe("2026-05-18");
    expect(props.tierName).toBeTruthy();
    expect(props.tierId).toBeTruthy();
    expect(props.cardLine).toBeTruthy();
    expect(props.safetyLine).toBeTruthy();
    expect(props.alcoholG).toBeGreaterThan(0);
    expect(props.sojuEquivBottles).toBeGreaterThan(0);
    expect(props.processHours).toBeGreaterThan(0);
  });

  it("tpl_overtime — 필요한 필드를 모두 제공", () => {
    const record = makeRecord("2026-05-18", 1, 2);
    const calc = computeDay(record);
    const tier = getDayTier(calc.alcoholG);
    const props = buildCardProps("tpl_overtime", record, calc, tier);

    expect(props.templateId).toBe("tpl_overtime");
    expect(props.processHours).toBeGreaterThanOrEqual(0);
    expect(props.tierId).toBeTruthy();
  });

  it("빈 기록(undefined)이면 throw", () => {
    const calc = computeDay(makeRecord("2026-05-18", 1, 0));
    const tier = getDayTier(calc.alcoholG);
    expect(() => buildCardProps("tpl_report", undefined, calc, tier)).toThrow();
  });

  it("0/0 저장 기록에서는 t0_peace 카피로 정상 생성", () => {
    const record = makeRecord("2026-05-18", 0, 0);
    const calc = computeDay(record);
    const tier = getDayTier(calc.alcoholG);

    expect(tier.id).toBe("t0_peace");

    const props = buildCardProps("tpl_report", record, calc, tier);
    expect(props.tierId).toBe("t0_peace");
    expect(props.alcoholG).toBe(0);
    expect(props.processHours).toBe(0);
  });
});
