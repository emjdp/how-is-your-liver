# V1_IMPLEMENTATION_PLAN — v1.0 확장 구현 계획

> 목적: MVP 이후 v1.0을 만들기 전에 추가 기능의 우선순위와 구현 순서를 고정한다.  
> 이 문서는 Claude Opus / Claude Code에 넘길 실행 프롬프트 역할도 한다.

## 0. 기본 원칙

- MVP에서 의도적으로 제외했던 기능을 우선 구현한다.
- 제품 방향은 계속 **개인 간 리포트 + 인스타 스토리 카드** 중심으로 유지한다.
- 장소/모임/랭킹/커뮤니티/AI 생성 기능으로 확장하지 않는다.
- 과음 조장 표현, 경쟁형 게임화, "다음 티어까지 N잔" 류의 유도 UI는 금지한다.
- 계산 결과는 계속 의료 진단이 아니라 엔터테인먼트·참고용 추정치로 표시한다.
- 기존 테스트 146개는 유지하고, 계산/스토리지/카드 확장마다 테스트를 추가한다.

## 1. v1.0 우선순위

### P0 — MVP 문서에 있었지만 아직 구현하지 않은 항목

1. 기본 모바일 메타 마무리
   - favicon
   - apple-touch-icon
   - icon-192 / icon-512
   - OG 이미지
   - theme-color 점검
2. 스토리 카드 확장 3종
   - `tpl_forecast` — 숙취 예보 카드
   - `tpl_weekly` — 주간 정산 카드
   - `tpl_warning` — 블랙코미디 경고 카드
3. 주간 스토리 카드 생성
   - `/weekly/card` 라우트 추가
   - 최근 7일 요약 카드 PNG 저장
4. JSON export
   - LocalStorage 백업용 내보내기
   - 서버 전송 없음
5. 다크 모드 토글
   - 기존 `prefers-color-scheme` 자동 대응은 유지
   - 사용자가 직접 `system / light / dark`를 고를 수 있는 작은 버튼 추가

### P1 — 이번에 새로 추가할 핵심 기능

1. 소주 잔 단위 입력
   - 소주 1잔 = 50ml
   - 기존 소주 병 입력과 함께 제공
   - 예: 소주 1병 + 소주 2잔
2. 하이볼 입력
   - 하이볼 1잔 단위
   - 계산 상수는 문서에서 먼저 확정 후 구현
3. 마스코트 이미지 적용
   - 메인 화면, 빈 상태, 결과/카드 일부에 브랜드 요소로 배치
   - 과음 보상처럼 보이지 않게 절제된 사용
4. 파비콘/앱 아이콘 적용
   - 실제 에셋 파일을 `public/brand/` 및 `app/` 또는 `public/`에 배치
5. 사용자 사진 위에 스토리 카드 만들기
   - 사용자가 업로드한 사진을 카드 배경으로 사용
   - 텍스트 가독성 오버레이 적용
   - `html-to-image` 캡처 안정성 검증 필수
   - v1.0 필수 기능으로 확정

### P2 — 후순위 확장

1. 사진 배경 카드의 초점 조정 (드래그 reposition)
2. 카드 템플릿별 마스코트 포즈 확장
3. GitHub Actions CI
4. 본격 PWA

## 2. 에셋 준비 및 저장 위치

### 마스코트

권장 원본:

- 투명 배경 PNG
- 최소 1024×1024, 가능하면 2048×2048
- 캐릭터가 캔버스의 80~90%를 차지
- 밝은 배경/어두운 배경 모두에서 보이도록 외곽선 또는 충분한 대비 필요

저장 위치:

```text
public/brand/mascot-main.png
public/brand/mascot-main.webp
public/brand/mascot-small.png
public/brand/mascot-empty.png
public/brand/mascot-warning.png
```

최소 필수:

```text
public/brand/mascot-main.png
```

사용 원칙:

- 메인 화면: 작게, 브랜드 정체성만 보강
- 결과 페이지: 티어를 과하게 축하하는 방식 금지
- 높은 티어(t5/t6): 신남/승리/전설 느낌 금지, 지친 표정 또는 절제된 배치
- 스토리 카드: 텍스트 가독성을 해치지 않는 보조 요소로만 사용

### 파비콘/앱 아이콘

권장 저장 위치:

```text
app/favicon.ico
public/brand/favicon.svg
public/brand/icon-192.png
public/brand/icon-512.png
public/brand/apple-touch-icon.png
public/brand/og-image.png
```

권장 크기:

- `favicon.ico`: 16/32/48 포함
- `favicon.svg`: 단순 심볼 버전
- `icon-192.png`: 192×192
- `icon-512.png`: 512×512
- `apple-touch-icon.png`: 180×180
- `og-image.png`: 1200×630

주의:

- 파비콘은 마스코트 전신보다 단순 얼굴/간 심볼/로고마크가 적합하다.
- 작은 크기에서 알아볼 수 없는 디테일은 제거한다.

## 3. 계산 정책 확정안

### 기존 단위

- 소주 1병 = 360ml, ABV 16.5%
- 맥주 1잔 = 500ml, ABV 4.5%

### 추가 단위

소주 잔:

```text
sojuGlass: 50ml, ABV 16.5%, unitLabel "잔"
```

- 순수 알코올 g = 50 × 0.165 × 0.789 = 약 6.51g
- 소주 1병은 약 7.2잔으로 환산된다.
- UI에서는 병과 잔을 함께 입력하되, 계산은 둘 다 합산한다.

하이볼:

```text
highball: 350ml, ABV 7.0%, unitLabel "잔"
```

- 순수 알코올 g = 350 × 0.07 × 0.789 = 약 19.33g
- 실제 하이볼은 레시피 편차가 크므로 UI에 "일반 추정" 또는 정보 모달을 둔다.
- 더 강한 하이볼/위스키 샷 수 입력은 v1.0에서 제외한다.

### 입력 제한 권장

```text
sojuBottle: 0..30, integer
sojuGlass: 0..30, integer
beer: 0..30, integer
highball: 0..30, integer
```

### 데이터 모델 방향

기존 `DayRecord`에 필드를 추가한다.

```ts
interface DayRecord {
  date: string;
  soju: number;       // 병
  beer: number;       // 잔
  sojuGlass?: number; // 50ml 잔
  highball?: number;  // 잔
  updatedAt: number;
}
```

마이그레이션 원칙:

- 기존 저장 데이터는 `sojuGlass: 0`, `highball: 0`으로 폴백한다.
- LocalStorage 키는 가능하면 `hiyl:v1:records`를 유지하되, read layer에서 backward compatible하게 처리한다.
- 스토리지 구조가 크게 바뀌는 경우에만 `hiyl:v2:records` 도입을 검토한다.

## 4. 단계별 구현 계획

### 1단계 — v1.0 문서/타입/계산 확정

작업:

- `docs/PRD.md`, `docs/CALCULATION_RULES.md`, `docs/TECHNICAL_PLAN.md`, `docs/STORY_CARD_SPEC.md`, `docs/DESIGN_SYSTEM.md`를 v1.0 기준으로 업데이트한다.
- 소주 잔/하이볼 상수와 계산 예시를 문서화한다.
- 주간 카드, 카드 템플릿 3종, 다크 모드 토글, JSON export, 브랜드 에셋 위치를 문서에 반영한다.

완료 기준:

- 문서에서 MVP 제외 항목과 v1.0 포함 항목이 충돌하지 않는다.
- "이번 주" 표현이 다시 들어가지 않는다.
- 계산 상수와 테스트 기대값이 명확하다.

### 2단계 — 브랜드 에셋/메타 적용

작업:

- `app/layout.tsx`의 metadata에 favicon, apple-touch-icon, icon-192/icon-512, OG 이미지를 연결한다.
- `public/brand/og-image.png`는 1200×630으로 유지한다.
- `components/ui/Mascot.tsx` 또는 동등한 fallback 컴포넌트를 추가한다.
- 메인 제목 우측에 `public/brand/mascot-main.png`를 작게 배치한다.

완료 기준:

- favicon이 브라우저 탭에 표시된다.
- apple-touch-icon과 OG 이미지가 metadata에 연결된다.
- 마스코트 파일이 없어도 페이지가 깨지지 않는다.
- 마스코트가 술게임 보상처럼 보이지 않는다.

### 3단계 — 테마 토글

작업:

- 작은 테마 버튼을 추가한다.
- 옵션은 `system`, `light`, `dark`.
- 기본값은 `system`.
- 선택값은 LocalStorage에 저장한다.
- 기존 `prefers-color-scheme` 자동 대응과 충돌하지 않게 한다.
- Next.js 16 hydration 경고를 피하기 위해 `<html suppressHydrationWarning>` 또는 권장 패턴을 확인한다.

완료 기준:

- 새로고침 후 선택 유지.
- 시스템 설정 변경 시 `system` 모드에서 반영.
- 라이트/다크 모두 텍스트 대비 유지.
- 스토리 카드 PNG 배경은 테마 토글에 의해 의도치 않게 바뀌지 않는다.

### 4단계 — 카드 템플릿 3종 추가

작업:

- `TplForecast.tsx`
- `TplWeekly.tsx`
- `TplWarning.tsx`
- `data/cardTemplates.ts` 메타 확장
- `tests/card-data.test.ts` 확장

주의:

- `tpl_warning`은 높은 티어를 멋있게 보상하지 않는다.
- warn 컬러는 면적 채움 금지, 외곽선/작은 아이콘 위주.
- 카드 문구 길이 제한 유지.

완료 기준:

- 당일 카드 4종: `tpl_report`, `tpl_overtime`, `tpl_forecast`, `tpl_warning`
- 주간 카드 1종: `tpl_weekly`
- 모든 카드가 1080×1920 PNG로 저장된다.

### 5단계 — 주간 스토리 카드

작업:

- `/weekly/card` 라우트 추가.
- `WeeklyCardClient` 또는 동등한 client wrapper 추가.
- 주간 리포트 CTA를 disabled에서 실제 이동으로 전환.
- 최근 7일 합산, 음주일 수, 최다 음주일, 주간 티어를 카드에 반영한다.

완료 기준:

- 기록 0건/3건/7건에서 카드 생성 가능.
- 동률 최다 음주일 표시가 페이지와 카드에서 일관된다.
- 카드 저장 결과가 1080×1920이다.

### 6단계 — JSON export

작업:

- LocalStorage 기록을 JSON 파일로 다운로드하는 기능 추가.
- `lib/storage.ts`에 export용 public read API를 추가한다. private `readAll()`을 직접 참조하지 않는다.
- 서버 업로드 없음.
- 파일명 예: `how-is-your-liver-records-YYYY-MM-DD.json`
- 가져오기(import)는 v1.0 필수에서 제외하고 별도 검토한다.

완료 기준:

- 현재 records가 JSON으로 저장된다.
- 손상 데이터가 export되지 않거나 안전하게 정규화된다.
- 개인정보/서버 전송 오해가 없게 "기기 안에만 저장" 톤을 유지한다.

### 7단계 — 계산/타입/스토리지 확장

작업:

- `types/record.ts`에 `sojuGlass`, `highball` 필드 추가.
- `lib/constants.ts`에 `sojuGlass`, `highball` 추가.
- `lib/calculate.ts`가 네 종류 입력을 모두 합산하도록 수정.
- `lib/storage.ts`가 기존 데이터에서 새 필드를 0으로 폴백하도록 수정.
- 단위 테스트 추가.

완료 기준:

- 기존 테스트 통과.
- 소주 1잔, 하이볼 1잔 계산 테스트 통과.
- 기존 LocalStorage 데이터가 깨지지 않는다.

### 8단계 — 입력 UI 확장

작업:

- 메인 입력 카드에 소주 잔과 하이볼 입력을 추가한다.
- 10초 입력성이 죽지 않도록 카드 밀도를 조정한다.
- `소주 병`, `소주 잔`, `맥주`, `하이볼` 순서를 권장한다.
- 작은 화면에서 버튼/숫자/라벨이 겹치지 않게 한다.

완료 기준:

- 360/375/414px 모바일에서 조작 가능.
- 모든 ± 버튼은 44px 이상.
- 값 변경 시 미니 티어와 저장 상태가 즉시 갱신된다.
- 0 입력 vs 기록 없음 정책 유지.

### 9단계 — 결과/주간 리포트 확장

작업:

- 결과 페이지의 입력 내역에 소주 잔/하이볼을 표시한다.
- 계산 수치 카드에는 기존 핵심 수치 체계를 유지한다.
- 주간 리포트 합산에도 새 주종을 반영한다.
- 하이볼은 레시피 편차가 크다는 참고 문구를 과하지 않게 제공한다.

완료 기준:

- 당일/최근 7일 계산이 새 주종을 포함한다.
- 하이볼 입력이 있어도 운전 가능 여부로 오해될 표현이 없다.

### 10단계 — 사용자 사진 배경 카드

작업:

- v1.0 필수 기능으로 진행한다.
- 사용자가 업로드한 사진을 dataURL로 변환하되, 원본 대용량 dataURL을 그대로 오래 보관하지 않는다.
- 업로드 즉시 1080×1920 또는 긴 변 2160px 이하로 다운스케일한 dataURL을 사용한다.
- 카드 배경에 `object-fit: cover`로 표시한다.
- 어두운 오버레이를 적용해 텍스트 가독성을 보장한다.
- 초점 위치 조정은 v1.0 필수에서 제외하고, 필요 시 간단한 중앙 기준으로 시작한다.

완료 기준:

- 업로드 사진이 서버로 전송되지 않는다.
- 캡처된 PNG에 외부 이미지 CORS 문제가 없다.
- 텍스트 가독성 AA 수준을 유지한다.
- 업로드 사진 기능은 당일 카드 일부 템플릿에만 먼저 적용한다.

## 5. Claude Opus 실행 프롬프트

아래 프롬프트를 Claude Opus / Claude Code에 그대로 전달한다.

```text
너는 how-is-your-liver 프로젝트의 v1.0 구현 담당자다.

목표:
MVP 이후 v1.0 확장 기능을 구현한다. 단, 우선순위는 "MVP 문서에 있었지만 아직 구현하지 않은 것"이 가장 높다. 새 기능을 추가하되 제품 방향은 개인 간 리포트 + 인스타 스토리 카드 중심으로 유지한다.

반드시 먼저 읽을 문서:
- AGENTS.md
- CLAUDE.md
- docs/PRD.md
- docs/CALCULATION_RULES.md
- docs/STORY_CARD_SPEC.md
- docs/TECHNICAL_PLAN.md
- docs/DESIGN_SYSTEM.md
- docs/TONE_GUIDE.md
- docs/IMPLEMENTATION_ROADMAP.md
- docs/V1_IMPLEMENTATION_PLAN.md

중요 제약:
- Next.js 16.2.6이다. 구현 전에 node_modules/next/dist/docs/의 관련 문서를 확인해라.
- src/ 디렉토리는 만들지 않는다.
- Tailwind v4 @theme inline 구조를 유지한다.
- shadcn/ui를 갑자기 도입하지 않는다.
- 서버 DB, 로그인, 랭킹, 커뮤니티, 야장 지도, AI 이미지 생성은 추가하지 않는다.
- 과음 조장 표현 금지.
- "더 마셔라", "한 잔만 더", "전설", "술고수", "주신", "상남자", "다음 티어까지" 류의 표현 금지.
- 운전 가능 여부를 암시하지 않는다.
- 모든 계산은 참고용/엔터테인먼트 톤을 유지한다.

우선순위:
P0. MVP 문서에 있었지만 아직 구현하지 않은 것
1. favicon / app icon / OG image / theme-color 점검
2. 카드 템플릿 3종 추가: tpl_forecast, tpl_weekly, tpl_warning
3. 주간 스토리 카드 `/weekly/card`
4. JSON export
5. 다크 모드 토글(system/light/dark)

P1. 새로 추가할 기능
1. 소주 잔 단위 입력 추가
   - 소주 1잔 = 50ml
   - 기존 소주 병 입력과 함께 합산
2. 하이볼 입력 추가
   - 하이볼 1잔 = 350ml, ABV 7.0% 기준
   - 레시피 편차가 큰 추정치임을 과하지 않게 안내
3. 마스코트 이미지 적용
   - public/brand/mascot-main.png 기준
   - 없으면 코드에서 깨지지 않게 graceful fallback
4. 파비콘 적용
   - app/favicon.ico 또는 public/brand/favicon.svg 등 실제 존재 파일 기준
5. 사용자 사진 배경 카드
   - v1.0 필수
   - 업로드 이미지는 서버 전송 없이 기기 안에서만 처리
   - 캡처 안정성을 위해 다운스케일 후 dataURL 사용

P2. 후순위
1. 사진 배경 카드의 초점 조정
2. 본격 PWA
3. GitHub Actions CI

작업 방식:
1. 먼저 현재 코드 구조를 읽고, 구현 계획을 짧게 정리해라.
2. 한 번에 너무 넓게 건드리지 말고 단계별로 구현해라.
3. 각 단계마다 테스트를 추가하거나 기존 테스트를 갱신해라.
4. 기존 기능이 깨지지 않게 npm test / npm run lint / npm run build를 계속 확인해라.
5. 스토리 카드 관련 변경은 실제 PNG 생성 검증을 포함해라.

세부 요구:

1단계 — 문서 업데이트
- docs/PRD.md, docs/CALCULATION_RULES.md, docs/TECHNICAL_PLAN.md, docs/STORY_CARD_SPEC.md, docs/DESIGN_SYSTEM.md를 v1.0 기준으로 업데이트한다.
- MVP 제외 항목이 v1.0 포함 항목으로 이동하는 부분을 명확히 한다.

2단계 — 브랜드 에셋
- favicon/app icon/OG image를 적용한다.
- public/brand/og-image.png는 1200x630이어야 한다.
- 마스코트 파일은 public/brand/mascot-main.png 기준으로 사용한다.
- 에셋이 아직 없으면 깨지지 않게 fallback을 둔다.

3단계 — 테마 토글
- system/light/dark 작은 토글 버튼을 추가한다.
- 기본값은 system.
- LocalStorage에 저장한다.
- 라이트/다크 모두 접근성 대비를 유지한다.
- 스토리 카드 PNG의 고정 디자인은 테마 토글에 의해 깨지지 않게 한다.
- Next.js 16 hydration 경고 방지를 위해 관련 docs를 확인한다.

4단계 — 스토리 카드 확장
- tpl_forecast, tpl_warning, tpl_weekly를 추가한다.
- 주간 카드는 `/weekly/card`에서 생성한다.
- 모든 카드 저장 결과는 1080x1920이어야 한다.
- 높은 티어 카드는 보상처럼 보이지 않게 절제한다.

5단계 — JSON export
- LocalStorage records를 JSON으로 다운로드한다.
- 서버 전송 없음.
- import는 이번 단계에서 하지 않는다.
- storage private 함수에 의존하지 말고 export용 public read API를 추가한다.

6단계 — 계산/데이터 모델
- DayRecord에 sojuGlass, highball을 추가한다.
- 기존 records는 새 필드가 없어도 0으로 읽혀야 한다.
- DRINKS에 sojuGlass/highball 상수를 추가한다.
- computeDay/computeWeek가 네 종류 입력을 합산해야 한다.
- 테스트:
  - 소주 1잔 알코올 g 약 6.51g
  - 하이볼 1잔 알코올 g 약 19.33g
  - 기존 소주/맥주 계산 유지
  - 기존 저장 데이터 backward compatibility

7단계 — 입력 UI
- 메인 입력 카드에 소주 잔과 하이볼을 추가한다.
- 360px 모바일에서도 깨지지 않아야 한다.
- 10초 입력성을 해치지 않게 구성한다.

8단계 — 결과/주간 리포트
- 결과 페이지와 주간 리포트에 새 주종 합산을 반영한다.
- 입력 내역 표시에는 소주 병/소주 잔/맥주/하이볼이 드러나야 한다.

9단계 — 사용자 사진 배경 카드
- v1.0 필수로 진행한다.
- 사진은 다운스케일한 dataURL로만 처리하고 서버 전송 금지.
- 오버레이로 텍스트 가독성을 보장한다.
- html-to-image 캡처 검증 필수.

완료 기준:
- npm test 통과
- npm run lint 통과
- npm run build 통과
- 카드 PNG 생성 검증 통과
- 금지어 테스트 통과
- 360/375/414 모바일 레이아웃 확인
- Vercel 배포 가능한 상태

완료 보고 형식:
- 변경 파일 목록
- 구현한 단계
- 테스트 결과
- 카드 PNG 검증 결과
- 남은 리스크
- 다음 단계 추천
```

## 6. 구현 전 확인 질문

구현 전에 사용자에게 확정받을 항목:

1. 하이볼 기준 ABV를 7.0%로 고정해도 되는가? yes
2. 소주 잔 입력은 병 입력과 동시에 허용할 것인가? yes
3. 마스코트는 어떤 화면에 먼저 넣을 것인가? 당신의 간은 안녕하십니까? 제목 우측에 작게
4. 다크모드 토글 아이콘 위치는 메인 상단 우측으로 할 것인가? 일단 yes
5. JSON export만 v1.0에 넣고 import는 제외해도 되는가? yes
6. 사용자 사진 배경 카드는 v1.0 필수인가, v1.1로 미룰 것인가? v1.0 필수

## 7. 권장 커밋 단위

1. `docs: plan v1 expansion`
2. `feat: wire brand assets and metadata`
3. `feat: add theme mode toggle`
4. `feat: add expanded story card templates`
5. `feat: add weekly story cards`
6. `feat: export records as json`
7. `feat: support soju glass and highball calculations`
8. `feat: expand drink input UI`
9. `feat: surface 4-drink totals on result and weekly`
10. `feat: add custom photo story card background`
