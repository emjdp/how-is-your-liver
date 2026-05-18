/**
 * 카드 이미지 공유/다운로드
 * Web Share API 우선, 미지원 시 <a download> 폴백.
 */

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 카드 blob → 공유 시트 또는 다운로드
 * @returns true = 공유/다운로드 실행됨, false = 사용자 취소 (AbortError)
 */
export async function shareOrDownload(
  blob: Blob,
  filename = "liver-report.png"
): Promise<boolean> {
  const file = new File([blob], filename, { type: "image/png" });

  if (
    typeof navigator !== "undefined" &&
    navigator.canShare?.({ files: [file] })
  ) {
    try {
      await navigator.share({
        files: [file],
        title: "당신의 간은 안녕하십니까?",
      });
      return true;
    } catch (err) {
      // 사용자 취소(AbortError) — 다운로드 불필요, false 반환
      if (err instanceof Error && err.name === "AbortError") {
        return false;
      }
      // 그 외 Share 실패 → 다운로드로 폴백
    }
  }

  triggerDownload(blob, filename);
  return true;
}

/** 텍스트 전용 공유 (이미지 생성 실패 시 폴백) */
export async function shareText(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title: "당신의 간은 안녕하십니까?", text });
      return;
    } catch {
      // 폴백 없음 (텍스트 공유 실패는 조용히 처리)
    }
  }
}
