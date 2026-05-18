# V1_TODO — v1.0 구현 체크리스트

> 출처: `docs/V1_IMPLEMENTATION_PLAN.md`  
> 목적: 계획을 순차 실행 가능한 단위 작업으로 쪼개고, 단계마다 파일/완료 기준/테스트/커밋 메시지를 고정한다. 위에서부터 순서대로 처리한다.  
> 톤/금지어/기술 제약은 `AGENTS.md` + `docs/TONE_GUIDE.md` + `docs/V1_IMPLEMENTATION_PLAN.md`의 기본 원칙을 따른다.

---

## 0. 사전 확정

| 항목 | 결정 |
| --- | --- |
| 하이볼 기준 ABV | 7.0% 고정. UI에 "일반 추정" 1줄 안내. |
| 소주 잔 + 병 동시 입력 | 허용. 둘 다 합산. |
| 마스코트 1차 배치 | 메인 페이지 제목 우측에 작게. |
| 테마 토글 위치 | 메인 상단 우측. 결과/주간/카드에서도 접근 가능. |
| JSON import | v1.0 제외. export만. |
| 사용자 사진 배경 카드 | v1.0 필수. 다만 마지막 단계에서 구현. |
| OG 이미지 | `public/brand/og-image.png`를 1200×630으로 유지. |

---

## 1. 현재 코드 베이스 스냅샷

- 데이터 모델: `types/record.ts` — `DayRecord = { date, soju, beer, updatedAt }`.
- 계산: `lib/calculate.ts` — `computeDay` / `computeWeek` 모두 soju/beer 2종만 합산.
- 상수: `lib/constants.ts` — `DRINKS` 2종, `INPUT_MAX` 2종, `STORAGE_KEY = "hiyl:v1:records"`.
- 입력 UI: `components/drink-input/DrinkInputCard.tsx` + `StepperRow.tsx` — soju/beer 2종 스테퍼.
- 메인: `app/page.tsx` — `handleSojuChange` / `handleBeerChange` 두 핸들러만 존재.
- 카드 메타: `data/cardTemplates.ts` — `tpl_report`, `tpl_overtime` 2종.
- 카드 템플릿: `components/story-card/templates/TplReport.tsx`, `TplOvertime.tsx`.
- 주간 페이지: `components/result/WeeklyClient.tsx` — 카드 CTA는 disabled 상태.
- 다크 모드: `app/globals.css`에서 `@media (prefers-color-scheme: dark)`만 사용.
- 브랜드 에셋:
  - `app/favicon.ico`
  - `public/brand/mascot-main.png`
  - `public/brand/apple-touch-icon.png`
  - `public/brand/icon-192.png`
  - `public/brand/icon-512.png`
  - `public/brand/og-image.png` — 1200×630이어야 함
- `app/layout.tsx` metadata: `icons` / `openGraph` 미설정.
- 테스트: 현재 기준 `npm test` 146개 통과.

---

## 2. 작업 흐름 규칙

1. 각 단계 시작 전 `npm test` 베이스라인 확인.
2. 단계 완료 후 `npm test` → `npm run lint` → 필요한 경우 `npm run build`.
3. 각 단계마다 별도 커밋.
4. 문서 업데이트와 기능 구현을 한 커밋에 섞지 않는다.
5. 카드 관련 변경은 실제 PNG 생성 후 1080×1920 확인.
6. Next.js 16.2.6 관련 API는 구현 전 `node_modules/next/dist/docs/` 확인.
7. `src/` 디렉토리 생성 금지. Tailwind v4 `@theme inline` 유지. shadcn/ui 도입 금지.
8. 과음 조장, 경쟁형 게임화, "다음 티어까지" 류 문구 금지.

---

## 3. 단계별 TODO

### Step 1 — v1.0 문서 업데이트

**목적**: MVP 제외 항목을 v1.0 포함 항목으로 옮기고, 새 결정사항을 문서끼리 일관되게 만든다.

- [ ] `docs/PRD.md`
  - v1.0 스코프 섹션 추가.
  - 카드 5종(당일 4 + 주간 1), 주간 카드, JSON export, 다크 모드 토글, 브랜드 에셋, 소주 잔/하이볼, 사진 배경 카드를 포함으로 명시.
- [ ] `docs/CALCULATION_RULES.md`
  - 4종 단위 표 추가.
  - `sojuGlass: 50ml, ABV 16.5%`.
  - `highball: 350ml, ABV 7.0%`.
  - 소주 1잔 ≈ 6.51g, 하이볼 1잔 ≈ 19.33g.
  - 기존 기록의 누락 필드는 0으로 폴백.
- [ ] `docs/TECHNICAL_PLAN.md`
  - `DayRecord` 확장 필드 표기.
  - 스토리지 키는 `hiyl:v1:records` 유지.
  - 테마 키: `hiyl:v1:theme`.
  - JSON export 파일명: `how-is-your-liver-records-YYYY-MM-DD.json`.
  - export용 storage public API 추가 방침 명시. private `readAll()` 직접 사용 금지.
- [ ] `docs/STORY_CARD_SPEC.md`
  - `tpl_forecast`, `tpl_warning`, `tpl_weekly` 사양.
  - 사진 배경 카드: 다운스케일 dataURL, 50~65% 어두운 오버레이, 서버 전송 없음.
- [ ] `docs/DESIGN_SYSTEM.md`
  - 테마 토글 컴포넌트 사양.
  - `theme-light` / `theme-dark` 클래스와 `prefers-color-scheme` 우선순위.
  - 마스코트 사용 가이드: 메인 제목 우측 작게, 결과/카드 남용 금지.
- [ ] `docs/TONE_GUIDE.md`
  - 하이볼 안내 문구 예시.
  - 새 카드 카피 금지어 검사 범위 명시.
- [ ] `docs/V1_IMPLEMENTATION_PLAN.md`
  - 사진 배경 카드가 v1.0 필수임을 P1/단계/프롬프트 모두에서 일관되게 유지.

**완료 기준**

- 문서끼리 v1.0 범위 충돌 없음.
- "이번 주" 표현 없음.
- P0 항목이 구현 순서에서 먼저 온다.

**커밋**: `docs: align v1 scope`

---

### Step 2 — 브랜드 에셋 / 메타데이터 적용

**목적**: 이미 준비된 favicon, app icon, OG 이미지, 마스코트를 실제 앱에 연결한다.

- [ ] 구현 전 Next 16 metadata docs 확인.
- [ ] `app/layout.tsx`
  - `metadata.icons` 추가.
  - `metadata.openGraph` 추가.
  - `openGraph.images`는 `/brand/og-image.png`, `width: 1200`, `height: 630`.
  - `viewport.themeColor` 유지 또는 라이트/다크 대응 필요 여부 판단.
- [ ] `components/ui/Mascot.tsx` 신규
  - `next/image` 사용.
  - 기본 `src="/brand/mascot-main.png"`.
  - 이미지 로드 실패 시 숨김 처리.
  - `size`, `className`, `alt` prop 지원.
- [ ] `app/page.tsx`
  - 메인 제목 우측에 마스코트 작게 배치.
  - 360px에서 제목/마스코트 겹침 없음.
- [ ] 확인
  - `public/brand/og-image.png`가 1200×630인지 확인.
  - 브라우저 탭 favicon 확인.
  - view-source 또는 빌드 결과에서 OG meta 확인.

**완료 기준**

- favicon / apple-touch-icon / icon-192 / icon-512 / OG 이미지 연결.
- 마스코트 파일이 없어도 앱이 깨지지 않음.
- 마스코트가 술게임 보상처럼 보이지 않음.
- `npm run build` metadata 경고 없음.

**커밋**: `feat: wire brand assets and metadata`

---

### Step 3 — 테마 토글

**목적**: `system / light / dark` 선택을 제공하되 기존 시스템 자동 대응과 충돌하지 않게 한다.

- [ ] 구현 전 Next 16 script/hydration docs 확인.
- [ ] `app/globals.css`
  - 기존 `@media (prefers-color-scheme: dark)` 유지.
  - `:root.theme-dark` 추가.
  - `:root.theme-light` 추가.
  - `system` 모드에서는 클래스를 제거하고 미디어 쿼리에 맡김.
- [ ] `lib/theme.ts` 신규
  - `ThemeMode = "system" | "light" | "dark"`.
  - `getTheme()`, `setTheme(mode)`, `applyTheme(mode)`.
  - LocalStorage key: `hiyl:v1:theme`.
- [ ] `components/ui/ThemeToggle.tsx` 신규
  - 단일 3상태 순환 버튼.
  - 크기 44×44 이상.
  - `aria-label`에 현재 모드와 다음 모드 표시.
- [ ] `app/layout.tsx`
  - 깜빡임 방지 inline script 또는 Next 권장 방식 적용.
  - `<html suppressHydrationWarning>` 필요 여부 확인 후 적용.
- [ ] 메인/결과/주간/카드 화면에서 접근 가능하게 배치.
- [ ] `tests/theme.test.ts` 신규.

**완료 기준**

- 새로고침 후 선택 유지.
- `system` 모드는 OS 테마를 따른다.
- 라이트/다크 대비 유지.
- 스토리 카드 PNG 색상은 테마 토글에 영향받지 않음.

**커밋**: `feat: add theme mode toggle`

---

### Step 4 — 카드 템플릿 3종 추가

**목적**: 당일 카드 4종 + 주간 카드 1종 구조를 만든다.

- [ ] `data/cardTemplates.ts`
  - `scope: "day" | "week"` 추가.
  - day 템플릿: `tpl_report`, `tpl_overtime`, `tpl_forecast`, `tpl_warning`.
  - week 템플릿: `tpl_weekly`.
  - `getDayTemplates()`, `getWeekTemplates()` 추가.
  - `DayCardProps`, `WeekCardProps` 분리.
  - `buildWeekCardProps` 추가.
- [ ] `components/story-card/templates/TplForecast.tsx` 신규.
- [ ] `components/story-card/templates/TplWarning.tsx` 신규.
- [ ] `components/story-card/templates/TplWeekly.tsx` 신규.
- [ ] `components/story-card/StoryCardCanvas.tsx`
  - template switch에 3종 추가.
- [ ] `components/story-card/StoryCardClient.tsx`
  - day 템플릿만 필터링.
  - 4개 탭이 360px에서 깨지지 않게 가로 스크롤 또는 2행 그리드 적용.
- [ ] `tests/card-data.test.ts`
  - day 4종 + week 1종 존재 확인.
  - `buildWeekCardProps`가 빈 주에도 throw하지 않음.
- [ ] 실제 PNG 생성 검증.

**완료 기준**

- 당일 카드 4종 존재.
- 주간 카드 템플릿 1종 존재.
- 모든 카드 1080×1920 저장 가능.
- 높은 티어 카드가 보상처럼 보이지 않음.
- 금지어 테스트 통과.

**커밋**: `feat: add expanded story card templates`

---

### Step 5 — 주간 스토리 카드 라우트

**목적**: 주간 리포트의 disabled CTA를 실제 `/weekly/card`로 연결한다.

- [ ] `app/weekly/card/page.tsx` 신규.
- [ ] `components/story-card/WeeklyCardClient.tsx` 신규 또는 동등한 client wrapper.
- [ ] `components/result/WeeklyClient.tsx`
  - "준비 중" CTA를 활성화.
  - `router.push("/weekly/card")`.
- [ ] 기록 0건 정책
  - v1.0에서는 진입 허용.
  - `tpl_weekly`가 빈 최근 7일을 깔끔하게 표현.
- [ ] `tests/weekly.test.ts`
  - 0건/3건/7건에서 `buildWeekCardProps` 결과 검증.
- [ ] 실제 PNG 생성 검증.

**완료 기준**

- `/weekly/card` 진입 가능.
- 0/3/7건 모두 카드 생성 가능.
- 최다 음주일 동률 표기가 페이지와 카드에서 일관됨.

**커밋**: `feat: add weekly story card route`

---

### Step 6 — JSON export

**목적**: LocalStorage 백업을 사용자 기기에 JSON으로 저장한다. 서버 전송은 없다.

- [ ] `lib/storage.ts`
  - `getAllRecords()` 또는 `getSanitizedRecords()` public API 추가.
  - private `readAll()`을 외부에서 직접 참조하지 않음.
  - 모든 레코드는 sanitize된 값만 반환.
- [ ] `lib/export.ts` 신규
  - `serializeExport(records)` 순수 함수.
  - `exportRecordsAsJson()` 다운로드 함수.
  - wrap 형태: `{ version: 1, exportedAt: ISO, records: [...] }`.
  - 파일명: `how-is-your-liver-records-YYYY-MM-DD.json`.
- [ ] 노출 위치
  - 주간 페이지 하단 작은 ghost 버튼.
  - 카피: "기기 안에만 저장됩니다. 서버로 보내지지 않아요."
- [ ] `tests/export.test.ts`
  - `serializeExport` 결과 검증.
  - 손상/누락 필드 정규화 검증.

**완료 기준**

- JSON 다운로드 가능.
- 서버 호출 0건.
- import 기능은 만들지 않음.

**커밋**: `feat: export records as json`

---

### Step 7 — 계산 / 타입 / 스토리지 확장

**목적**: 소주 잔과 하이볼을 UI보다 먼저 계산 모델에 추가한다.

- [ ] `types/record.ts`
  - `DrinkType = "soju" | "beer" | "sojuGlass" | "highball"`.
  - `DayRecord`에 `sojuGlass?: number`, `highball?: number`.
- [ ] `lib/constants.ts`
  - `DRINKS.sojuGlass = { mlPerUnit: 50, abv: 0.165, unitLabel: "잔" }`.
  - `DRINKS.highball = { mlPerUnit: 350, abv: 0.07, unitLabel: "잔" }`.
  - `INPUT_MAX.sojuGlass = 30`, `INPUT_MAX.highball = 30`.
- [ ] `lib/calculate.ts`
  - `computeDay` 4종 합산.
  - 누락 필드 0 폴백.
  - `computeWeek` 음주일 판정 4종 OR.
- [ ] `lib/storage.ts`
  - `sanitizeRecord` 4필드 처리.
  - 기존 저장 데이터는 새 필드 0으로 읽힘.
- [ ] 테스트
  - 소주 1잔 ≈ 6.51g.
  - 하이볼 1잔 ≈ 19.33g.
  - 소주 1병 + 소주 2잔 + 맥주 1잔 + 하이볼 1잔 합산.
  - 기존 LocalStorage backward compatibility.

**완료 기준**

- 기존 테스트 전부 통과.
- 새 계산/스토리지 테스트 통과.
- 기존 저장 데이터가 깨지지 않음.

**커밋**: `feat: support soju glass and highball calculations`

---

### Step 8 — 입력 UI 확장

**목적**: 소주 병/소주 잔/맥주/하이볼 4종을 10초 안에 입력 가능하게 한다.

- [ ] `components/drink-input/StepperRow.tsx`
  - 4종 type 지원.
  - 라벨: `소주(병)`, `소주(잔)`, `맥주`, `하이볼`.
  - 보조 텍스트: 360ml / 50ml / 500ml / 350ml.
- [ ] `components/drink-input/DrinkInputCard.tsx`
  - 순서: 소주(병) → 소주(잔) → 맥주 → 하이볼.
  - 하이볼 안내: "하이볼은 일반 레시피 기준 추정입니다."
  - 카드 높이 폭증 방지.
- [ ] `app/page.tsx`
  - 단일 `handleDrinkChange(key, value)` 권장.
  - 저장 객체에 4필드 포함.
- [ ] 360/375/414px 수동 확인.

**완료 기준**

- 4종 ± 동작.
- 미니 티어 즉시 갱신.
- 360px에서 겹침 없음.
- 0 입력 vs 기록 없음 정책 유지.

**커밋**: `feat: expand drink input UI`

---

### Step 9 — 결과 / 주간 리포트 표시 확장

**목적**: 새 주종이 결과와 최근 7일 리포트에 자연스럽게 반영된다.

- [ ] `components/result/ResultClient.tsx`
  - 입력 내역에 4종 표기.
  - 0인 행은 숨기거나 흐리게 표시.
- [ ] `components/result/WeeklyClient.tsx`
  - `computeWeek` 합산 반영 확인.
  - `WeeklyBarChart`가 alcoholG 기반으로 정상 반영되는지 확인.
- [ ] `tests/weekly.test.ts`
  - 4종이 섞인 7일 데이터에서 `totalAlcoholG`, `drinkingDays`, `peakDay` 검증.

**완료 기준**

- 결과 페이지 입력 내역 4종 노출.
- 주간 합산 4종 포함.
- 운전 가능 여부 암시 문구 없음.

**커밋**: `feat: surface 4-drink totals on result and weekly`

---

### Step 10 — 사용자 사진 배경 카드

**목적**: 사용자가 업로드한 사진을 당일 카드 일부 템플릿의 배경으로 사용한다.

- [ ] 지원 범위
  - `tpl_report`, `tpl_overtime` 우선 적용.
  - `tpl_forecast`, `tpl_warning`은 v1.1 검토.
- [ ] `components/story-card/PhotoPicker.tsx` 신규
  - `<input type="file" accept="image/*">`.
  - 10MB 초과 차단.
  - 업로드 즉시 canvas 또는 동등한 방식으로 다운스케일.
  - 저장 상태에는 다운스케일된 dataURL만 보관.
  - 권장 출력: 1080×1920 cover crop 또는 긴 변 2160px 이하.
- [ ] `TplReport.tsx`, `TplOvertime.tsx`
  - `backgroundImage` prop 추가.
  - 사진 배경 + 50~65% 어두운 오버레이.
  - 텍스트 대비 유지.
  - 사진 없으면 기존 그라데이션.
- [ ] `StoryCardClient.tsx`
  - PhotoPicker UI 노출.
  - 사진 제거 버튼.
  - "사진은 기기 안에서만 사용되고 서버로 전송되지 않아요." 안내.
- [ ] 검증
  - dataURL 카드 PNG 1080×1920.
  - 큰 사진 입력 시 Safari 메모리/타임아웃 리스크 확인.
  - 서버 호출 0건.

**완료 기준**

- 사진 업로드/제거 가능.
- PNG 저장 시 1080×1920.
- 텍스트 가독성 유지.
- 서버 전송 없음.

**커밋**: `feat: support custom photo background on day cards`

---

## 4. 마지막 품질 게이트

- [ ] `npm test` 모두 통과.
- [ ] `npm run lint` 경고 없음.
- [ ] `npm run build` 성공.
- [ ] 금지어 테스트에 새 카드/토스트 카피 포함.
- [ ] 360/375/414px 메인/결과/주간/카드 시각 확인.
- [ ] 당일 카드 4종 + 주간 카드 1종 PNG 1080×1920.
- [ ] 사진 배경 카드 PNG 1080×1920.
- [ ] Vercel preview 또는 자동 배포 확인.

## 5. 권장 커밋 순서

1. `docs: align v1 scope`
2. `feat: wire brand assets and metadata`
3. `feat: add theme mode toggle`
4. `feat: add expanded story card templates`
5. `feat: add weekly story card route`
6. `feat: export records as json`
7. `feat: support soju glass and highball calculations`
8. `feat: expand drink input UI`
9. `feat: surface 4-drink totals on result and weekly`
10. `feat: support custom photo background on day cards`
