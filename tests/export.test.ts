import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { serializeExport, buildExportFilename } from "@/lib/export";
import { getAllRecords } from "@/lib/storage";
import { saveRecord } from "@/lib/storage";
import type { DayRecord } from "@/types/record";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

const makeRecord = (date: string, soju: number, beer: number): DayRecord => ({
  date,
  soju,
  beer,
  updatedAt: Date.now(),
});

describe("serializeExport", () => {
  it("version / exportedAt / records 필드를 포함한다", () => {
    const records = [makeRecord("2026-05-18", 1, 2)];
    const result = serializeExport(records);
    expect(result.version).toBe(1);
    expect(typeof result.exportedAt).toBe("string");
    expect(new Date(result.exportedAt).toISOString()).toBe(result.exportedAt);
    expect(Array.isArray(result.records)).toBe(true);
    expect(result.records).toHaveLength(1);
  });

  it("빈 기록도 정상 export 구조를 만든다", () => {
    const result = serializeExport([]);
    expect(result.version).toBe(1);
    expect(typeof result.exportedAt).toBe("string");
    expect(result.records).toHaveLength(0);
  });

  it("records 내용이 인자로 받은 배열과 일치한다", () => {
    const records = [
      makeRecord("2026-05-16", 2, 0),
      makeRecord("2026-05-17", 0, 3),
    ];
    const result = serializeExport(records);
    expect(result.records[0].date).toBe("2026-05-16");
    expect(result.records[1].beer).toBe(3);
  });
});

describe("buildExportFilename", () => {
  it("파일명이 how-is-your-liver-records-YYYY-MM-DD.json 형식이다", () => {
    const filename = buildExportFilename("2026-05-18");
    expect(filename).toBe("how-is-your-liver-records-2026-05-18.json");
  });

  it("날짜를 지정하지 않아도 파일명 형식이 유효하다", () => {
    const filename = buildExportFilename();
    expect(filename).toMatch(
      /^how-is-your-liver-records-\d{4}-\d{2}-\d{2}\.json$/
    );
  });
});

describe("getAllRecords — sanitize 검증", () => {
  it("저장된 기록이 없으면 빈 배열을 반환한다", () => {
    const result = getAllRecords();
    expect(result).toEqual([]);
  });

  it("저장된 기록을 배열로 반환한다", () => {
    saveRecord(makeRecord("2026-05-18", 1, 2));
    saveRecord(makeRecord("2026-05-17", 0, 1));
    const result = getAllRecords();
    expect(result).toHaveLength(2);
  });

  it("저장된 기록을 날짜 오름차순으로 반환한다", () => {
    saveRecord(makeRecord("2026-05-18", 1, 2));
    saveRecord(makeRecord("2026-05-16", 2, 0));
    saveRecord(makeRecord("2026-05-17", 0, 1));
    const result = getAllRecords();
    expect(result.map((r) => r.date)).toEqual([
      "2026-05-16",
      "2026-05-17",
      "2026-05-18",
    ]);
  });

  it("음수 필드를 저장하면 getAllRecords에서 0으로 클램프된다", () => {
    const corrupt: DayRecord = {
      date: "2026-05-15",
      soju: -10,
      beer: -3,
      updatedAt: Date.now(),
    };
    saveRecord(corrupt);
    const result = getAllRecords();
    const r = result.find((x) => x.date === "2026-05-15");
    expect(r).toBeDefined();
    expect(r?.soju).toBe(0);
    expect(r?.beer).toBe(0);
  });

  it("초과 입력값을 저장하면 getAllRecords에서 max(30)으로 클램프된다", () => {
    const corrupt: DayRecord = {
      date: "2026-05-14",
      soju: 999,
      beer: 500,
      updatedAt: Date.now(),
    };
    saveRecord(corrupt);
    const result = getAllRecords();
    const r = result.find((x) => x.date === "2026-05-14");
    expect(r).toBeDefined();
    expect(r?.soju).toBe(30);
    expect(r?.beer).toBe(30);
  });

  it("getAllRecords 결과를 serializeExport에 넘기면 유효한 페이로드가 만들어진다", () => {
    saveRecord(makeRecord("2026-05-18", 1, 1));
    const records = getAllRecords();
    const payload = serializeExport(records);
    expect(payload.version).toBe(1);
    expect(payload.records).toHaveLength(1);
  });

  it("sojuGlass/highball를 저장하면 getAllRecords export에 sanitize된 값이 포함된다", () => {
    const r: DayRecord = {
      date: "2026-05-18",
      soju: 1,
      beer: 0,
      sojuGlass: 3,
      highball: 2,
      updatedAt: Date.now(),
    };
    saveRecord(r);
    const all = getAllRecords();
    const found = all.find((x) => x.date === "2026-05-18");
    expect(found?.sojuGlass).toBe(3);
    expect(found?.highball).toBe(2);
  });

  it("sojuGlass/highball 음수 저장 → getAllRecords에서 0으로 클램프", () => {
    const r: DayRecord = {
      date: "2026-05-17",
      soju: 0,
      beer: 0,
      sojuGlass: -5,
      highball: -2,
      updatedAt: Date.now(),
    };
    saveRecord(r);
    const all = getAllRecords();
    const found = all.find((x) => x.date === "2026-05-17");
    expect(found?.sojuGlass).toBe(0);
    expect(found?.highball).toBe(0);
  });

  it("sojuGlass/highball 초과 저장 → getAllRecords에서 max(30)으로 클램프", () => {
    const r: DayRecord = {
      date: "2026-05-16",
      soju: 0,
      beer: 0,
      sojuGlass: 999,
      highball: 999,
      updatedAt: Date.now(),
    };
    saveRecord(r);
    const all = getAllRecords();
    const found = all.find((x) => x.date === "2026-05-16");
    expect(found?.sojuGlass).toBe(30);
    expect(found?.highball).toBe(30);
  });

  it("4필드 기록을 serializeExport에 넘기면 새 필드도 payload에 포함된다", () => {
    const r: DayRecord = {
      date: "2026-05-15",
      soju: 1,
      beer: 1,
      sojuGlass: 2,
      highball: 1,
      updatedAt: Date.now(),
    };
    saveRecord(r);
    const all = getAllRecords();
    const payload = serializeExport(all);
    const found = payload.records.find((x) => x.date === "2026-05-15");
    expect(found?.sojuGlass).toBe(2);
    expect(found?.highball).toBe(1);
  });
});
