# CHANGELOG_DOCS_01 — REVIEW_01_CODEX 반영

> 기준 리뷰: [REVIEW_01_CODEX.md](./REVIEW_01_CODEX.md)
> 적용 라운드: 1차 문서 수정 (코드 작업 전)
> 적용일: 2026-05-18
> 미수정 파일: `REVIEW_01_CODEX.md` (리뷰 문서 자체는 보존)

---

## 1. 정책 결정 (이번 라운드 신규 확정)

| 영역 | 결정 |
|---|---|
| 티어 ID 명명 | 모든 `_legend` 접미사 제거 → `_redzone`. "전설/레전드" 단어 전면 금지 |
| 빈 기록 vs 0 기록 | `records[date]` 객체 **없음** → 메인 리다이렉트. 객체 **있음**(0/0 포함) → 결과 페이지에서 `t0_peace` 정상 표시 |
| `DayRecord` 생성 시점 | 사용자가 `±` 버튼을 한 번이라도 눌러 값이 변경된 시점 (0→1→0 포함). 단순 진입만으로는 미생성 |
| 회복시간 명명 | "회복시간" → **"알코올 처리 추정 시간"** (UI 라벨: `처리 추정 시간`). 항상 "운전 가능 시점 아님" 부속 카피 인접 |
| 입력 정책 | 소주·맥주 모두 정수만. 소수(0.5병) 미지원 |
| MVP 카드 범위 | 5종 → **2종** (`tpl_report`, `tpl_overtime`). 당일 결과 전용. 주간 카드 + 나머지 3종은 추후 확장 |
| `CustomBackgroundUploader` | MVP 폴더 구조에서 제거. stub 파일도 생성하지 않음. 설계 의도만 STORY_CARD_SPEC에 메모 |
| 안전 안내 | 페이지용(`safetyLineLong` ≤80자)과 카드용(`safetyLineCard` ≤32자) 2가지로 분리 |
| 금지어 테스트 범위 | `data/tierMessages.ts` + 버튼 라벨 + 빈 상태/토스트. `lib/safety-copy.ts`의 2상수는 allow-list로 검사 제외 |
| "운전" 단어 처리 | 일반 금지어에서 제외(안전 안내 통과용). 대신 `음주운전`, `대리 없이` 패턴으로만 검사 |
| 표현 통일 | UI 본문 "이번 주" → "최근 7일" |
| 티어 경계 | `<=` / `>` 기반으로 통일 (예: 20g 정확히는 `t1_light`) |
| 음주일 수 | `soju > 0 || beer > 0` 인 날만 카운트 |
| 최다 음주일 동률 | today에 가까운 날 우선. 3일 이상 동률 시 "여러 날 동률" 표기 |
| 높은 티어(t5/t6) 시각 절제 | 배경 채도 −20%, 밝기 −10%. warn 컬러는 1pt 외곽선·24×24 이하 아이콘에만. 면적 채움·타이포 확대 금지 |
| 높은 티어 공유 카피 | 저장 토스트 "저장 완료." 단독 (공유 유도 제거) |
| 노이즈 텍스처 구현 | SVG `<filter feTurbulence>` (baseFrequency 0.9, opacity 0.06). CSS 비트맵 금지 (html-to-image 안정성) |
| Framer Motion 범위 | MVP는 200ms fade + 12px y 슬라이드만. 카운트업·spring은 추후 확장. `prefers-reduced-motion`에서 0ms |
| PWA 메타 | 본격 PWA → "기본 모바일 메타"(favicon, theme-color, viewport)로 축소 |
| RSC/Client 경계 | `page.tsx`는 RSC(메타데이터 가능). LocalStorage·이벤트 컴포넌트만 `"use client"` |

---

## 2. 파일별 변경 요약

### `PROJECT_BRIEF.md`
- 타깃에 **만 19세 이상** 명시.
- 자기인식 가치의 "회복 시간" → "처리 추정 시간(운전 가능 시점 아님)".

### `PRD.md`
- **F4**: "회복시간" → "알코올 처리 추정 시간".
- **F6**: 5종 → **MVP 2종** (`tpl_report`, `tpl_overtime`), 당일 전용. 주간 카드·나머지 3종은 추후 확장.
- **F8**: 안전 안내 페이지용/카드용 분리 명시.
- MVP 범위: "PWA 메타" → "기본 모바일 메타", "기록 수정·삭제(값 0)" → "0 저장 결과 페이지 정상 표시" 명확화.
- 추후 확장 목록 보강: 카드 3종, 주간 카드, 사진 배경, JSON export, 다크 모드 토글, 본격 PWA, shadcn/ui.
- **FR-2/3/5/6/7/8/9/10** 모두 정수 입력·빈 기록 정책·표현 통일·"처리 추정 시간"·높은 티어 공유 카피 톤 반영.

### `UX_FLOW.md`
- Happy Path: "회복시간" → "처리 추정 시간", "5종" → "2종".
- 메인 흐름: `aria-live="polite"` 저장 상태 라벨, `DayRecord` 생성 조건 명시.
- 입력 카드 미니 티어 카피 "자랑은 가능" → "공유는 가능".
- CTA "이번 주 간 리포트 보기" → "최근 7일 간 리포트 보기".
- 당일 결과 흐름: 빈 기록 vs 0 기록 정책 표 추가, 처리 추정 시간 부속 카피, 높은 티어 공유 유도 자제.
- 주간 리포트 흐름: "이번 주" → "최근 7일", 음주일 수 계산식·최다 음주일 동률 처리, 주간 스토리 카드는 추후 확장으로 변경.
- 스토리 카드 흐름: 라우트 당일만(`/result/card`), 2종 템플릿, 저장 토스트 티어별 분기.
- 빈 상태 섹션 재정리.

### `DESIGN_SYSTEM.md`
- 스토리 카드 배경: SVG `feTurbulence` 노이즈로 명시 (CSS 비트맵 X).
- **높은 티어(t5/t6) 카드 시각 절제 강제 규칙** 추가.
- 애니메이션: MVP는 fade만, 카운트업·spring은 확장으로. `prefers-reduced-motion` 대응.

### `TONE_GUIDE.md`
- 허용 표현에서 "이번 주" → "최근 7일", "자랑" 일부 → "공유", "축하드립니다" → "알림" 등 위험 단어 정리.
- 금지 표현에 **"전설", "한 잔만 더", "축하드립니다/축하합니다", "자랑하기엔 부족"** 추가.
- 금지어에서 단어 "운전"은 제거하고, 대신 `음주운전`, `대리 없이`로 정밀화. allow-list 정책 명시.
- 검사 범위 명시 (`tierMessages`, 버튼 라벨, 빈 상태/토스트).
- 위험 표현에 "성장", "다음 단계", "숙련", "자랑 단어 반복 제한" 추가.
- 버튼 권장 "주간 보기" → "최근 7일 간 리포트".

### `CALCULATION_RULES.md`
- "회복 시간" 섹션을 **"알코올 처리 추정 시간"** 으로 개명, 명칭 주의 박스 추가.
- 모든 표시 옆 고정 부속 카피 "운전 가능 시점이 아닙니다."
- 반올림 규칙에 "처리 추정 시간" 반영.
- **입력 정책** 섹션 신설 (정수만).
- **0 입력 vs 기록 없음** 정책 표 신설.
- 음주일 수 계산식 추가.
- 예시 계산 결과에 "(운전 가능 시점 아님)" 표기.
- UI 표시 방식: 처리 추정 시간 옆 부속 카피 + 정보 모달 카피 갱신.

### `TIER_SYSTEM.md`
- 당일 티어: `t6_legend` → **`t6_redzone` 간 과부하 경보**. 경계는 `<=`/`>` 표기로 변경.
- 주간 티어: `w6_legend` → **`w6_redzone`** (이름 "간이 사표 쓴 주"는 유지).
- 모든 카피에서 "전설" 제거:
  - t6: "전설은 본인이..." → "기록은 본인이..." (실제로는 "간이 과부하 경보를 띄웠습니다.")
  - "기록상은 전설" → "기록상은 과부하"
  - "전설의 숙취술사" → "간 과부하 경보"
- 카피 표현 정리: "자랑하기엔 좀 부족" → "공유할 숫자는 작고...", "자랑은 가능, 건강은 비추천" → "공유는 가능, 건강에는 비추천", "자랑보다 사과" → "공유할 숫자는 크고..."
- 주간 카피 "이번 주" → "최근 7일".

### `STORY_CARD_SPEC.md`
- 템플릿 섹션을 **MVP 2종 / 추후 확장 3종** 으로 분리. 주간 카드는 확장.
- MVP 주간 카드 부재 정책 명시 (CTA 자리만 잡거나 토스트).
- 사용자 배경 사진 업로드: stub 파일 미생성 명시. 설계 의도만 메모로 보존.
- 카드 문구 길이: 카드용 안전 안내 ≤32자 별도 정의. `safetyLineLong` / `safetyLineCard` 2상수 export 합의.

### `TECHNICAL_PLAN.md`
- 폴더 구조: `app/weekly/card/` 제거(MVP X), `templates/`는 `TplReport.tsx` + `TplOvertime.tsx` 2개만, `CustomBackgroundUploader.tsx` 제거.
- `app/result/card/` 주석에 "MVP: 2종 템플릿" 명시.
- `lib/calculate.ts` 주석 "회복시간" → "처리 추정 시간".
- `data/cardTemplates.ts` 주석 "5종" → "MVP 2종 메타 (확장은 별도 PR)".
- 페이지 구조: RSC vs Client 경계 명확화, Next 16 `metadata`/`"use client"` 호환 주의 추가.
- 라우트 매핑에서 `/weekly/card` 제거 (취소선).
- `lib/calculate.ts` 명칭 주의(`processHours` vs `recoveryHours`) 메모.
- `lib/safety-copy.ts` 2상수 export 명시.
- 금지어 검사 범위·allow-list 정책 명시.
- 테스트 케이스: 티어 경계값 세분화, 0/0 기록 vs 빈 기록 구분 케이스, 카드 변환 2종 케이스로 축소.
- 구현 순서 9단계: "5종 템플릿" → "2종 템플릿".

### `IMPLEMENTATION_ROADMAP.md`
- **3단계 오타 수정**: "금지어 테스트 grin." → "금지어 테스트 통과. allow-list 정책 적용".
- 3단계: cardTemplates MVP 2종 메타, safety-copy 2상수.
- 4단계: `aria-live` 저장 상태 라벨, `DayRecord` 생성 조건 검증 추가.
- 5단계: 빈 기록 vs 0 기록 시나리오, 처리 추정 시간 부속 카피·정보 모달 검증.
- 7단계: 5종 → 2종, 주간 카드 라우트 미생성, 높은 티어 시각 절제 규칙 검증, PNG 해상도 검증.
- 8단계 QA 체크리스트 보강: `±` 조작 시나리오 분리, 카드용 안전 안내 ≤32자, 높은 티어 시각 절제, `prefers-reduced-motion`, "이번 주" 잔존 grep.

---

## 3. 정리 후 잔존 키워드 (의도된 사용)
다음은 grep에 걸리지만 모두 **의도된** 사용이므로 보존:

| 키워드 | 파일 | 이유 |
|---|---|---|
| "회복 시간" | `CALCULATION_RULES.md` | 명칭 비교문 ("회복 시간이 아니라 처리 추정 시간") |
| "전설", "레전드" | `TONE_GUIDE.md` | 금지어 사전 |
| "전설 박제" | `TONE_GUIDE.md` | 버튼 비권장 예시 |
| "이번 주" | `PRD.md`, `UX_FLOW.md`, `IMPLEMENTATION_ROADMAP.md` | 정책 명령문 ("이번 주 대신 최근 7일") + QA grep 체크리스트 |

---

## 4. 미해결 / 다음 라운드 고려
이번 라운드에서는 처리하지 않은 항목:

- 사용자 배경 사진 업로드 카드 — 확장 시 별도 라운드에서 모듈 분리 설계.
- 카드 템플릿 확장 3종(`tpl_forecast`, `tpl_weekly`, `tpl_warning`) — MVP 출시 후 사용자 반응 보고 추가.
- 다크 모드 토글 / JSON export / shadcn/ui — 추후 PR.
- 카피 추가 검증 (네이티브 한국어 모니터 1명 추가 리뷰 권장).

---

## 5. 변경 파일 목록
```
docs/PROJECT_BRIEF.md
docs/PRD.md
docs/UX_FLOW.md
docs/DESIGN_SYSTEM.md
docs/TONE_GUIDE.md
docs/CALCULATION_RULES.md
docs/TIER_SYSTEM.md
docs/STORY_CARD_SPEC.md
docs/TECHNICAL_PLAN.md
docs/IMPLEMENTATION_ROADMAP.md
```
미수정: `docs/REVIEW_01_CODEX.md` (리뷰 원본 보존)
