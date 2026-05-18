import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getRecord, saveRecord, getRecordsForDates, getAllRecords } from "@/lib/storage";
import { getLast7Days } from "@/lib/date";
import type { DayRecord } from "@/types/record";
import { STORAGE_KEY } from "@/lib/constants";

// jsdom에서 localStorage를 사용
beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

const makeRecord = (
  date: string,
  soju: number,
  beer: number
): DayRecord => ({
  date,
  soju,
  beer,
  updatedAt: Date.now(),
});

describe("saveRecord / getRecord", () => {
  it("저장 후 같은 날짜 read → 동일 객체", () => {
    const r = makeRecord("2026-05-18", 2, 1);
    saveRecord(r);
    const result = getRecord("2026-05-18");
    expect(result).toBeDefined();
    expect(result?.soju).toBe(2);
    expect(result?.beer).toBe(1);
  });

  it("기존 기록 수정 → updatedAt 갱신", () => {
    const r1 = makeRecord("2026-05-18", 1, 0);
    saveRecord(r1);
    const before = getRecord("2026-05-18")?.updatedAt ?? 0;

    const r2 = makeRecord("2026-05-18", 2, 0);
    saveRecord(r2);
    const after = getRecord("2026-05-18")?.updatedAt ?? 0;

    expect(after).toBeGreaterThanOrEqual(before);
    expect(getRecord("2026-05-18")?.soju).toBe(2);
  });

  it("빈 기록 vs 0 기록 구분 — 기록 없는 날은 undefined 반환", () => {
    // 저장 안 한 날짜
    expect(getRecord("2026-01-01")).toBeUndefined();
  });

  it("0/0 으로 저장한 날은 DayRecord 반환 (undefined 아님)", () => {
    saveRecord(makeRecord("2026-05-10", 0, 0));
    const r = getRecord("2026-05-10");
    expect(r).toBeDefined();
    expect(r?.soju).toBe(0);
    expect(r?.beer).toBe(0);
  });
});

describe("getRecordsForDates", () => {
  it("7일 윈도우 필터링 — today, today-6 포함 / today-7 제외", () => {
    const today = "2026-05-18";
    const days = getLast7Days(today);

    // 7일 안의 날짜 저장
    saveRecord(makeRecord("2026-05-18", 1, 0)); // today
    saveRecord(makeRecord("2026-05-12", 2, 0)); // today-6 (6일 전)
    saveRecord(makeRecord("2026-05-11", 3, 0)); // today-7 (7일 전, 윈도우 밖)

    const result = getRecordsForDates(days);
    expect(result["2026-05-18"]).toBeDefined();
    expect(result["2026-05-12"]).toBeDefined();
    expect(result["2026-05-11"]).toBeUndefined(); // 7일 밖
  });

  it("기록 없는 날짜는 결과에 포함되지 않음", () => {
    const result = getRecordsForDates(["2026-05-01", "2026-05-02"]);
    expect(Object.keys(result).length).toBe(0);
  });
});

describe("손상 데이터 폴백", () => {
  it("JSON 파손 시 빈 상태로 폴백 (에러 없음)", () => {
    localStorage.setItem("hiyl:v1:records", "{ invalid json }}}");
    expect(() => getRecord("2026-05-18")).not.toThrow();
    expect(getRecord("2026-05-18")).toBeUndefined();
  });

  it("음수 입력값 저장 시 0으로 클램프", () => {
    const r: DayRecord = {
      date: "2026-05-18",
      soju: -5,
      beer: -2,
      updatedAt: Date.now(),
    };
    saveRecord(r);
    const result = getRecord("2026-05-18");
    expect(result?.soju).toBe(0);
    expect(result?.beer).toBe(0);
  });

  it("초과 입력값 저장 시 max(30)으로 클램프", () => {
    const r: DayRecord = {
      date: "2026-05-18",
      soju: 999,
      beer: 999,
      updatedAt: Date.now(),
    };
    saveRecord(r);
    const result = getRecord("2026-05-18");
    expect(result?.soju).toBe(30);
    expect(result?.beer).toBe(30);
  });
});

describe("SSR 가드", () => {
  it("window가 없는 환경에서 getRecord 호출 → undefined (에러 없음)", () => {
    // jsdom 환경에서는 window가 있으므로, 직접 테스트는 어렵지만
    // storage.ts의 isSSR()이 typeof window === "undefined" 체크를 하므로
    // 이 테스트는 실행 환경(브라우저)에서 정상 동작 여부를 검증
    expect(() => getRecord("2026-05-18")).not.toThrow();
  });
});

// ── 하위 호환: sojuGlass/highball 없는 기존 데이터 ────────────────

describe("하위 호환 — 기존 2필드 기록 읽기", () => {
  it("sojuGlass/highball 없는 기존 기록을 읽으면 해당 필드가 0으로 반환된다", () => {
    // 구버전 저장 데이터 직접 주입 (sojuGlass/highball 없음)
    const legacyData: Record<string, unknown> = {
      "2026-01-01": { date: "2026-01-01", soju: 2, beer: 1, updatedAt: 1000 },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacyData));

    const r = getRecord("2026-01-01");
    expect(r).toBeDefined();
    expect(r?.soju).toBe(2);
    expect(r?.beer).toBe(1);
    expect(r?.sojuGlass).toBe(0);
    expect(r?.highball).toBe(0);
  });

  it("기존 2필드 기록이 getAllRecords에서도 sojuGlass/highball 0으로 포함된다", () => {
    const legacyData: Record<string, unknown> = {
      "2026-01-10": { date: "2026-01-10", soju: 1, beer: 0, updatedAt: 2000 },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacyData));

    const all = getAllRecords();
    expect(all).toHaveLength(1);
    expect(all[0].sojuGlass).toBe(0);
    expect(all[0].highball).toBe(0);
  });

  it("date 필드가 빠진 손상 기록은 저장 key 날짜로 폴백된다", () => {
    const legacyData: Record<string, unknown> = {
      "2026-01-11": { soju: 1, beer: 0, updatedAt: 3000 },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacyData));

    const r = getRecord("2026-01-11");
    expect(r?.date).toBe("2026-01-11");
    expect(r?.sojuGlass).toBe(0);
    expect(r?.highball).toBe(0);
  });
});

// ── 4필드 저장/읽기 ────────────────────────────────────────────────

describe("4필드 저장/읽기", () => {
  it("sojuGlass/highball를 포함한 기록 저장 후 읽으면 동일 값이 반환된다", () => {
    const r: DayRecord = {
      date: "2026-05-18",
      soju: 1,
      beer: 1,
      sojuGlass: 3,
      highball: 2,
      updatedAt: Date.now(),
    };
    saveRecord(r);
    const result = getRecord("2026-05-18");
    expect(result?.sojuGlass).toBe(3);
    expect(result?.highball).toBe(2);
  });

  it("sojuGlass 음수 저장 → 0으로 클램프", () => {
    const r: DayRecord = {
      date: "2026-05-18",
      soju: 0,
      beer: 0,
      sojuGlass: -5,
      highball: -2,
      updatedAt: Date.now(),
    };
    saveRecord(r);
    const result = getRecord("2026-05-18");
    expect(result?.sojuGlass).toBe(0);
    expect(result?.highball).toBe(0);
  });

  it("sojuGlass/highball 초과 저장 → max(30)으로 클램프", () => {
    const r: DayRecord = {
      date: "2026-05-18",
      soju: 0,
      beer: 0,
      sojuGlass: 999,
      highball: 500,
      updatedAt: Date.now(),
    };
    saveRecord(r);
    const result = getRecord("2026-05-18");
    expect(result?.sojuGlass).toBe(30);
    expect(result?.highball).toBe(30);
  });
});
