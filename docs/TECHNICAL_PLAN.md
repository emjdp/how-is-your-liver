# TECHNICAL_PLAN — 기술 계획

## 기술 스택 (확정)
- **Next.js 16.2.6** (App Router, `app/` 루트 디렉토리, **`src/` 미사용**)
- **React 19.2.4**
- **TypeScript 5**
- **Tailwind CSS v4** (`@theme inline` 토큰 정의, `tailwind.config.js` 없음, `@import "tailwindcss"` 단일 import)
- **Framer Motion** (`motion@^11`)
- **date-fns**
- **html-to-image**
- 테스트: **Vitest** + `@testing-library/react` + `jsdom`
- 배포: **Vercel**
- **shadcn/ui는 MVP 미도입.** Tailwind v4 호환 검증 후 추후 도입. 필요한 컴포넌트(Button, Toast 등)는 직접 구현.

> ⚠️ **Next 16 변경점 주의.** `node_modules/next/dist/docs/01-app/` 가이드를 구현 직전 1회 정독.
> 특히 `metadata`/`viewport` 분리, Server Component 기본값, fetch 캐시 기본값 변경 가능성 확인.

## 폴더 구조 (루트 기준)

```
how-is-your-liver/
├── app/
│   ├── layout.tsx          # 폰트, 메타, 전역 토스트 host
│   ├── page.tsx            # 메인 (요일바 + 입력 카드)
│   ├── result/
│   │   ├── page.tsx        # 당일 결과 (?d=YYYY-MM-DD)
│   │   └── card/
│   │       └── page.tsx    # 당일 스토리 카드 (MVP: 2종 템플릿)
│   ├── weekly/
│   │   └── page.tsx        # 주간 리포트 (스토리 카드는 추후 확장)
│   └── globals.css         # Tailwind v4 + @theme inline + 폰트
├── components/
│   ├── week-selector/
│   │   ├── WeekSelector.tsx
│   │   └── DayPill.tsx
│   ├── drink-input/
│   │   ├── DrinkInputCard.tsx
│   │   └── StepperRow.tsx
│   ├── result/
│   │   ├── ResultHero.tsx
│   │   ├── MetricCard.tsx
│   │   └── WeeklyBarChart.tsx
│   ├── story-card/
│   │   ├── StoryCardCanvas.tsx
│   │   ├── templates/
│   │   │   ├── TplReport.tsx     # MVP
│   │   │   └── TplOvertime.tsx   # MVP
│   │   └── ShareButton.tsx
│   #   (TplForecast/TplWeekly/TplWarning, CustomBackgroundUploader는 추후 확장 — 파일 생성 X)
│   └── ui/
│       ├── Button.tsx
│       ├── GlassPanel.tsx
│       └── Toast.tsx
├── lib/
│   ├── calculate.ts        # 알코올/칼로리/처리 추정 시간
│   ├── tiers.ts            # 티어 판정
│   ├── storage.ts          # LocalStorage 래퍼
│   ├── share.ts            # Web Share + download
│   ├── date.ts             # KST today, 최근 7일
│   ├── safety-copy.ts      # 안전 문구 고정 export
│   └── constants.ts
├── data/
│   ├── tierMessages.ts     # 당일/주간 티어별 4슬롯 카피
│   └── cardTemplates.ts    # MVP 2종 템플릿 메타 (확장 메타는 별도 PR에서)
├── types/
│   └── record.ts
├── docs/                   # (본 작업 산출물)
├── tests/
│   ├── calculate.test.ts
│   ├── tiers.test.ts
│   ├── storage.test.ts
│   ├── safety-copy.test.ts
│   └── card-data.test.ts
├── public/                 # 폰트, 아이콘
├── vitest.config.ts
└── (기존 next.config.ts / tsconfig.json / postcss.config.mjs / eslint.config.mjs)
```

## 페이지 구조
- **Server Component (RSC)**: `app/layout.tsx`, 각 라우트의 `page.tsx` (정적 셸 + 메타데이터).
- **Client Component (`"use client"`)**: LocalStorage·이벤트 의존 트리만 (예: `<WeekSelector>`, `<DrinkInputCard>`, `<StoryCardCanvas>`, `<ShareButton>`).
- 패턴: `page.tsx`(RSC)가 정적 컨테이너를 렌더하고, 동적 영역은 클라이언트 컴포넌트를 import.
- Next 16 App Router: `metadata` export는 RSC에만, `"use client"` 파일은 metadata export 불가.
- 라우트 매핑 (MVP):
  - `/` 메인
  - `/result?d=YYYY-MM-DD` 당일 결과
  - `/result/card?d=YYYY-MM-DD` 당일 카드 (2종 템플릿)
  - `/weekly` 주간 리포트
  - ~~`/weekly/card`~~ 추후 확장

## 핵심 데이터 타입 (`types/record.ts`)

```ts
export type DrinkType = "soju" | "beer";

export interface DayRecord {
  /** ISO date string, KST 자정 기준 YYYY-MM-DD */
  date: string;
  soju: number;       // 병 수, integer, 0..30
  beer: number;       // 잔 수, integer, 0..30
  updatedAt: number;  // epoch ms
}

export interface DayCalc {
  alcoholG: number;
  sojuEquivBottles: number;
  kcal: number;
  processHours: number;
}

export interface TierResult {
  id: string;
  name: string;
  headline: string;
  subline: string;
  cardLine: string;
  safetyLine: string;
  color: string;
  scope: "day" | "week";
}
```

## LocalStorage 설계
- 키: `hiyl:v1:records` — value: `Record<string /* YYYY-MM-DD */, DayRecord>`.
- 키 prefix 버저닝(`v1`)으로 향후 마이그레이션 대응.
- 모든 read/write는 `lib/storage.ts`를 통해서만. SSR 환경 보호(`typeof window === "undefined"` 가드).

## 계산/티어/문구 유틸 구조
- `lib/calculate.ts`: 순수 함수만. React 의존 X. Vitest로 단위 테스트.
  - 주요 함수: `pureAlcoholG(volumeMl, abv)`, `computeDay(record): DayCalc`, `computeWeek(records[]): WeekCalc`.
  - **명칭 주의**: 결과 필드는 `processHours`로 통일한다. 외부 노출 라벨은 "처리 추정 시간". 본 문서 단일 진실원은 [CALCULATION_RULES](./CALCULATION_RULES.md).
- `lib/tiers.ts`: `getDayTier(alcoholG): TierResult`, `getWeekTier(totalG): TierResult`. 카피는 `data/tierMessages.ts`에서 lookup. 경계 조건은 `<= / >` 기반 ([TIER_SYSTEM](./TIER_SYSTEM.md) 참조).
- `lib/safety-copy.ts`: `safetyLineLong`(페이지용 ≤80자) + `safetyLineCard`(카드용 ≤32자) 2개 export.
- **금지어 검사**(`tests/safety-copy.test.ts`):
  - 검사 대상: `data/tierMessages.ts`의 모든 슬롯 + `data/buttonLabels.ts`(있다면) + 빈 상태/토스트 카피.
  - 검사 제외(allow-list): `lib/safety-copy.ts`의 두 상수. "운전" 단어가 들어가 있으나 안전 안내 목적이므로 통과시킨다.

## 이미지 생성 구조
- `components/story-card/StoryCardCanvas.tsx`가 1080×1920 div를 렌더, ref를 외부에 노출.
- `lib/share.ts`의 `captureToBlob(node)`가 1080×1920 캔버스를 원본 크기 그대로 PNG로 캡처한다.
- 폰트 임베드: 첫 카드 생성 직전에 `htmlToImage.getFontEmbedCSS()`를 1회 실행 후 메모.

## Web Share API fallback 전략
- [STORY_CARD_SPEC](./STORY_CARD_SPEC.md) 참조. `lib/share.ts`의 `shareOrDownload(blob, filename)` 단일 진입점.

## 테스트 하네스

### 설정
- `vitest.config.ts` — `environment: "jsdom"`, `@/*` path alias 동기화.
- `package.json` 스크립트: `"test": "vitest"`, `"test:watch": "vitest --watch"`.
- CI는 MVP에서 미설정 (추후 GitHub Actions).

### 파일별 케이스

**`tests/calculate.test.ts`**
- 소주 1병 알코올 g ≈ 46.87 (±0.01).
- 맥주 1잔 알코올 g ≈ 17.75.
- 소주2 + 맥주3 → 알코올, kcal, 처리 추정 시간 예상값 일치.
- 0 입력 → 0g, 0kcal, 0h.
- 음수/NaN → 0으로 폴백.
- 입력 상한 초과 → max로 클램프.

**`tests/tiers.test.ts`**
- 각 티어 경계값에서 올바른 티어 판정. 검증 케이스: `0`, `0.01`, `20`, `20.01`, `45`, `45.01`, `80`, `80.01`, `120`, `120.01`, `180`, `180.01`. 주간은 `0`, `80`, `200`, `400`, `700`, `1000`, `1000.01`.
- 0g → `t0_peace` / `w0_rest`.
- 매우 큰 값 → `t6_redzone` / `w6_redzone`.
- `getDayTier`·`getWeekTier` 반환 객체에 4슬롯 카피·color 모두 존재.

**`tests/storage.test.ts`**
- 저장 후 같은 날짜 read → 동일 객체.
- 7일 윈도우 필터링 (today, today-6 포함 / today-7 제외).
- 기존 기록 수정 → updatedAt 갱신.
- JSON 파손 시 0 폴백.
- SSR 가드 (window undefined 시 안전).
- **빈 기록 vs 0 기록 구분**: `records[date]` 자체가 없는 경우와 `{soju:0, beer:0}` 로 저장된 경우를 read 결과에서 분리해 반환.

**`tests/safety-copy.test.ts`**
- 모든 `tierMessages` 슬롯 카피가 금지어 사전과 매칭되지 않음.
- 모든 `cardLine` 길이 ≤18자.
- 페이지용 안전 안내(`safetyLineLong`) 길이 ≤80자.
- 카드용 안전 안내(`safetyLineCard`) 길이 ≤32자.

**`tests/card-data.test.ts`**
- 결과 데이터 → 카드 prop 변환 함수가 MVP 2종 템플릿(`tpl_report`, `tpl_overtime`)에 필요한 필드를 제공.
- 빈 기록(`undefined`)일 때 카드 생성 함수가 명시적으로 throw.
- 0/0 저장 기록에서는 `t0_peace` 카피로 정상 생성.

## 구현 순서 (Codex에게 넘길 작업 단위)
1. **세팅**: 의존성 추가 (`framer-motion`, `date-fns`, `html-to-image`, `vitest`, `@testing-library/react`, `jsdom`). `vitest.config.ts`. `tsconfig` paths 확인.
2. **디자인 토큰**: `app/globals.css`에 `@theme inline` 컬러/폰트 토큰. Pretendard/Inter 셀프 호스팅 또는 `next/font` 설정.
3. **lib/계산·티어·스토리지·문구·안전**: 순서대로 구현 + Vitest 통과.
4. **데이터 (`data/tierMessages.ts`, `data/cardTemplates.ts`)**: 14×4슬롯 카피 + MVP 2종 템플릿 메타.
5. **UI 기본 (`components/ui/`)**: Button, GlassPanel, Toast.
6. **메인 화면**: WeekSelector, DrinkInputCard 구현 + LocalStorage 연동.
7. **당일 결과 (`app/result/page.tsx`)**: ResultHero, MetricCard 3종.
8. **주간 리포트 (`app/weekly/page.tsx`)**: WeeklyBarChart, 주간 티어.
9. **스토리 카드 (`/result/card`)**: MVP 2종 템플릿(`TplReport`, `TplOvertime`) + StoryCardCanvas + ShareButton. 주간 카드는 추후 확장.
10. **마무리**: 메타데이터, OG 이미지, favicon, viewport, theme-color.
11. **Vercel 배포**.
