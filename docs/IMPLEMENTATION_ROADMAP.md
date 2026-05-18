# IMPLEMENTATION_ROADMAP — 구현 로드맵

> 각 단계는 **완료 기준(Done Criteria)** 을 만족해야 다음 단계로 넘어간다. 단계별로 Codex 1세션 분량으로 잘려 있다.

## 1단계 — 문서 정리
- `docs/` 폴더에 10개 파일 존재 (`PROJECT_BRIEF` / `PRD` / `UX_FLOW` / `DESIGN_SYSTEM` / `TONE_GUIDE` / `CALCULATION_RULES` / `TIER_SYSTEM` / `STORY_CARD_SPEC` / `TECHNICAL_PLAN` / `IMPLEMENTATION_ROADMAP`).
- 팀(또는 사용자) 1회 리뷰 완료.
- **완료 기준**: `ls docs/` 가 10개 파일을 보여주고, 본 문서가 유지된다.

## 2단계 — 프로젝트 세팅
- 의존성 추가: `framer-motion`, `date-fns`, `html-to-image`, `vitest`, `@testing-library/react`, `@testing-library/dom`, `jsdom`.
- `vitest.config.ts` 작성 (jsdom env, `@/*` path alias 동기화).
- `package.json`에 `test`, `test:watch` 스크립트 추가.
- `app/globals.css`에 Tailwind v4 `@theme inline` 토큰 (컬러/타이포 토큰 정의).
- `app/layout.tsx`에 Pretendard 적용, 한국어 메타데이터, viewport·theme-color.
- **완료 기준**: `npm run dev` → 빈 메인이 한글 폰트로 표시, `npm run test`가 0개 테스트로 통과.

## 3단계 — 계산/티어/스토리지/문구 로직
- `lib/constants.ts`, `lib/calculate.ts`, `lib/tiers.ts`, `lib/storage.ts`, `lib/date.ts`, `lib/safety-copy.ts`(2종 export), `lib/share.ts` 구현.
- `data/tierMessages.ts` (14개 티어 × 4슬롯), `data/cardTemplates.ts` (**MVP 2종 메타**) 작성.
- 모든 단위 테스트 작성 (`tests/calculate`, `tests/tiers`, `tests/storage`, `tests/safety-copy`, `tests/card-data`).
- **완료 기준**: Vitest 30개 이상 케이스 통과. 금지어 테스트 통과. `lib/safety-copy.ts`의 두 상수는 allow-list로 검사 제외.

## 4단계 — 메인 UI
- `components/ui/{Button,GlassPanel,Toast}.tsx`.
- `components/week-selector/{WeekSelector,DayPill}.tsx`.
- `components/drink-input/{DrinkInputCard,StepperRow}.tsx`.
- `app/page.tsx`에 통합 + LocalStorage 자동 저장 + 미니 티어 + `aria-live="polite"` 저장 상태 라벨.
- **완료 기준**: 모바일 viewport(375×812)에서 한 손 조작 가능. 새로고침 후 입력 복원. ± 버튼 조작 시 `DayRecord`가 생성되고, 조작 없이 빠져나가면 미생성. Lighthouse 모바일 접근성 90+.

## 5단계 — 당일 결과
- `app/result/page.tsx`, `components/result/{ResultHero,MetricCard}.tsx`.
- 빈 기록(객체 없음) → 메인 리다이렉트 + 토스트. 0/0 저장 기록 → 정상 표시 (`t0_peace`).
- "처리 추정 시간" 옆에 "운전 가능 시점 아님" 부속 카피 + 정보 아이콘 모달.
- **완료 기준**: 메인 → CTA → 결과 → 메인 왕복 정상. 모든 수치·티어·안전 안내 표시. 빈 기록 vs 0 기록 동작 검증.

## 6단계 — 주간 리포트
- `app/weekly/page.tsx`, `components/result/WeeklyBarChart.tsx` (CSS only).
- 7일 합산·음주일 수·최다 음주일·주간 티어.
- **완료 기준**: 기록 0건/3건/7건 시나리오 각각 정상 표시.

## 7단계 — 스토리 카드 (MVP 2종)
- `components/story-card/StoryCardCanvas.tsx`, `templates/{TplReport,TplOvertime}.tsx`, `ShareButton.tsx`.
- `app/result/card/page.tsx` (당일만). 주간 카드 라우트는 만들지 않는다 (추후 확장).
- `lib/share.ts`의 `shareOrDownload` 동작 확인.
- 높은 티어(t5/t6) 시각 절제 규칙 적용 ([DESIGN_SYSTEM](./DESIGN_SYSTEM.md)).
- **완료 기준**: iOS Safari 16+ 실기기에서 공유 시트 또는 다운로드 동작 확인. 2종 템플릿 모두 캡처 성공. 캡처된 PNG가 1080×1920 with pixelRatio 2.

## 8단계 — 테스트/수정
- 문구 금지어 자동 검사 통과 유지.
- 수동 QA 체크리스트:
  - [ ] 첫 진입에 today 자동 선택.
  - [ ] 요일바 글래스 효과 모바일 정상.
  - [ ] 입력 자동 저장 + 새로고침 복원.
  - [ ] `±` 조작 없이 빠져나가면 빈 기록 → 결과 진입 시 메인 리다이렉트.
  - [ ] `±` 조작 후 0/0이면 결과 페이지에 `t0_peace` 카피 정상.
  - [ ] 결과 페이지 안전 안내(긴 버전) + "처리 추정 시간" 옆 "운전 가능 시점 아님" 항상 노출.
  - [ ] 주간 리포트 0/3/7건 시나리오, 최다 음주일 동률 케이스.
  - [ ] **2종 카드** 캡처 정상, 텍스트 잘림 없음, 카드용 안전 안내(≤32자) 노출.
  - [ ] 높은 티어(t5/t6) 카드 시각 절제 규칙 적용 확인.
  - [ ] Web Share 미지원 환경에서 다운로드 fallback.
  - [ ] 다크 모드 자동 대응.
  - [ ] `prefers-reduced-motion` 환경에서 애니메이션 0ms.
  - [ ] 다양한 가로폭(360, 375, 414)에서 레이아웃 무너지지 않음.
  - [ ] "이번 주" 표현이 어디에도 남아 있지 않음 (UI 전체 grep).
- **완료 기준**: 위 체크리스트 100%.

## 9단계 — Vercel 배포
- 환경변수 없음, 단순 배포.
- favicon, OG 이미지, theme-color 확인.
- **완료 기준**: 프로덕션 URL에서 메인 진입 → 카드 저장까지 30초 이내.
