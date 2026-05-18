import type { DayRecord } from "@/types/record";
import { STORAGE_KEY, INPUT_MAX } from "@/lib/constants";

type RecordsMap = Record<string, DayRecord>;

function isSSR(): boolean {
  return typeof window === "undefined";
}

function readAll(): RecordsMap {
  if (isSSR()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return {};
    }
    return parsed as RecordsMap;
  } catch {
    console.warn("[storage] LocalStorage 읽기 실패, 빈 상태로 폴백");
    return {};
  }
}

function writeAll(records: RecordsMap): void {
  if (isSSR()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    console.warn("[storage] LocalStorage 쓰기 실패");
  }
}

function sanitizeRecord(r: DayRecord): DayRecord {
  return {
    date: r.date,
    soju: Math.min(
      Math.max(0, Math.round(isNaN(r.soju) ? 0 : r.soju)),
      INPUT_MAX.soju
    ),
    beer: Math.min(
      Math.max(0, Math.round(isNaN(r.beer) ? 0 : r.beer)),
      INPUT_MAX.beer
    ),
    updatedAt: r.updatedAt ?? Date.now(),
  };
}

/** 특정 날짜 기록 읽기. undefined = 기록 없음, DayRecord = 기록 있음 (0/0 포함) */
export function getRecord(date: string): DayRecord | undefined {
  const records = readAll();
  const r = records[date];
  if (!r) return undefined;
  try {
    return sanitizeRecord(r);
  } catch {
    console.warn(`[storage] 날짜 ${date} 기록 손상, 폴백`);
    return { date, soju: 0, beer: 0, updatedAt: Date.now() };
  }
}

/** 기록 저장 (upsert) */
export function saveRecord(record: DayRecord): void {
  if (isSSR()) return;
  const records = readAll();
  records[record.date] = sanitizeRecord({ ...record, updatedAt: Date.now() });
  writeAll(records);
}

/**
 * 최근 N일 기록 반환 (기본 7일, today 포함)
 * @param dateStrings YYYY-MM-DD 형태 날짜 목록 (최근 7일)
 */
export function getRecordsForDates(dateStrings: string[]): RecordsMap {
  const records = readAll();
  const result: RecordsMap = {};
  for (const d of dateStrings) {
    const r = records[d];
    if (r) {
      try {
        result[d] = sanitizeRecord(r);
      } catch {
        result[d] = { date: d, soju: 0, beer: 0, updatedAt: Date.now() };
      }
    }
  }
  return result;
}

/** LocalStorage 지원 여부 확인 (시크릿 모드 등) */
export function isStorageAvailable(): boolean {
  if (isSSR()) return false;
  try {
    const testKey = "__hiyl_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
