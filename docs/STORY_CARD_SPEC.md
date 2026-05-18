# STORY_CARD_SPEC — 스토리 카드 사양

## 카드 목적
한 장으로 자랑+자학을 동시 충족하는 인스타 스토리용 이미지. 9:16.

## 카드 비율/크기
- 캔버스: **1080 × 1920** (실제 PNG).
- 모바일 미리보기: 화면 폭 90% 기준 9:16 박스. 1080×1920 캔버스를 CSS `transform: scale()`로 축소 표시.
- 세이프 영역: 상단 120px, 하단 200px (인스타 UI 가림 회피).

## 기본 템플릿

### MVP (2종, 당일 결과 전용)
| ID | 이름 | 콘셉트 | 강조 수치 |
|---|---|---|---|
| `tpl_report` | 기본 리포트 카드 | 건강검진 결과지 풍 | 소주 환산 + 알코올 g |
| `tpl_overtime` | 간 야근 카드 | 사원증/근무표 패러디 | 처리 추정 시간 + 티어 |

### 추후 확장 (3종)
| ID | 이름 | 콘셉트 | 강조 수치 | 대상 |
|---|---|---|---|---|
| `tpl_forecast` | 숙취 예보 카드 | 일기예보 패러디 | 처리 추정 시간 + 한줄 예보 | 당일 |
| `tpl_weekly` | 주간 정산 카드 | 회계 정산서 패러디 | 7일 알코올 g + 음주일 수 | 주간 |
| `tpl_warning` | 블랙코미디 경고 카드 | 안전 표지판 패러디 (지나치게 멋있어 보이지 않게 채도·밝기 낮춘 버전으로 절제) | 티어 카피 메인 | 당일 |

> **MVP 주간 스토리 카드는 없다.** 주간 리포트 페이지에는 카드 CTA 자리를 미리 잡되, 클릭 시 "스토리 카드는 곧 제공됩니다." 토스트 또는 비활성 처리. 카드 생성 자체는 추후 확장.

## 카드 레이아웃 (공통 골조)
```
┌──────────────────────────┐  ← 세이프 top
│  로고                       │
│                          │
│  [큰 숫자 / 티어]            │
│                          │
│  [블랙코미디 한 줄]          │
│                          │
│  [보조 수치 3개 인라인]       │
│                          │
│  안전 안내 1줄              │
└──────────────────────────┘  ← 세이프 bottom
```
각 템플릿은 위 골조의 강조점·배경 텍스처·아이콘만 다르다.

## 카드에 들어갈 정보
- 서비스명/로고 (작게, 좌상단).
- 날짜 — 당일 "2026.05.17 토" / 주간 "2026.05.11 ~ 17".
- 티어 이름 (`cardLine` 슬롯).
- 핵심 수치 1개 (큰 글씨).
- 보조 수치 2~3개 (작은 글씨).
- 안전 안내 1줄.

## 사용자 배경 사진 업로드 카드 (추후 확장 — MVP 구현/파일 모두 X)
> MVP 폴더 구조에는 **포함하지 않는다.** stub 파일도 만들지 않는다. 확장 시점에 별도 모듈로 추가.

설계 의도(메모):
- 데이터 모델: `cardCustomBackground: { fileBlobUrl: string, focusPoint: { x: number; y: number } }`.
- 렌더링: `<img object-fit: cover>` + 자동 `linear-gradient(rgba(11,20,17,0.55), rgba(11,20,17,0.85))` 오버레이.
- 텍스트는 세이프 영역에 흰색 + 가벼운 drop-shadow.
- 확장 구현 시 `html-to-image`가 cross-origin 이미지를 다룰 수 있도록 dataURL로 변환 후 캔버스에 그린다.

## 이미지 저장 방식
- `html-to-image`의 `toPng(node, { pixelRatio: 2, cacheBust: true, fontEmbedCSS })`.
- 폰트는 dataURL 임베드: 첫 카드 생성 직전 `htmlToImage.getFontEmbedCSS()`를 1회 실행 후 메모.
- 1080×1920 캔버스 노드를 화면에 1:1 크기로 렌더한 뒤 CSS `transform: scale()`로 축소 표시 — 캡처 시에는 원본 크기 사용.

## 공유 방식
```ts
async function shareCard(blob: Blob) {
  const file = new File([blob], "liver-report.png", { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: "당신의 간은 안녕하십니까?" });
  } else {
    triggerDownload(blob, "liver-report.png");
  }
}
```

## Fallback 전략
- Web Share Files API 미지원: `<a download>` 다운로드.
- iOS Safari에서 `canShare` 다양성: 우선 try → 실패 시 다운로드.
- 캡처 실패: 토스트 + 단순 텍스트 공유(`navigator.share({ text: ... })`)로 폴백.

## 카드 문구 길이 제한
- `cardLine` ≤18자 (한글 기준).
- 보조 수치 라벨 ≤8자.
- **카드용 안전 안내 ≤32자** (한 줄 유지). 결과 페이지 고정 문구(80자)와 다른 짧은 버전을 별도 정의:
  - 기본: "참고용 추정치 · 운전 판단 불가 · 일반 성인 기준"
  - `lib/safety-copy.ts`에서 `safetyLineLong` (페이지용)과 `safetyLineCard` (카드용) 두 상수 export.
