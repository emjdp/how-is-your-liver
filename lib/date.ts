import { format, subDays, parseISO, isValid } from "date-fns";

/** KST 기준 오늘 날짜 (YYYY-MM-DD) — Intl API 사용 */
export function getKSTToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(new Date())
    .replace(/\//g, "-"); // en-CA는 YYYY-MM-DD 형식
}

/** KST 기준 최근 7일 날짜 배열 (today 포함, 오래된 날부터) */
export function getLast7Days(today?: string): string[] {
  const base = today ?? getKSTToday();
  const result: string[] = [];
  for (let i = 6; i >= 0; i--) {
    result.push(format(subDays(parseISO(base), i), "yyyy-MM-dd"));
  }
  return result;
}

/** YYYY-MM-DD → 한글 날짜 라벨 (예: "5월 17일 토요일") */
export function formatKoreanDate(dateStr: string): string {
  const d = parseISO(dateStr);
  if (!isValid(d)) return dateStr;
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const dayNames = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];
  return `${month}월 ${day}일 ${dayNames[d.getDay()]}`;
}

/** YYYY-MM-DD → 요일 한 글자 (예: "토") */
export function getDayChar(dateStr: string): string {
  const d = parseISO(dateStr);
  if (!isValid(d)) return "";
  return ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
}

/** YYYY-MM-DD → 일(day) 숫자 */
export function getDayNumber(dateStr: string): number {
  return parseISO(dateStr).getDate();
}
