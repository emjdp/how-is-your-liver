import type { DayRecord } from "@/types/record";
import { getKSTToday } from "@/lib/date";
import { getAllRecords } from "@/lib/storage";

export interface ExportPayload {
  version: 1;
  exportedAt: string;
  records: DayRecord[];
}

/** 기록 배열을 export 페이로드로 직렬화 — 순수 함수, 브라우저 API 미사용 */
export function serializeExport(records: DayRecord[]): ExportPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    records,
  };
}

/** export 파일명 생성 (예: how-is-your-liver-records-2026-05-18.json) */
export function buildExportFilename(today?: string): string {
  const date = today ?? getKSTToday();
  return `how-is-your-liver-records-${date}.json`;
}

/**
 * LocalStorage 기록 전체를 JSON 파일로 다운로드.
 * 서버 전송 없음. SSR 환경에서는 no-op.
 */
export function exportRecordsAsJson(): void {
  if (typeof window === "undefined") return;
  const records = getAllRecords();
  const payload = serializeExport(records);
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = buildExportFilename();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
