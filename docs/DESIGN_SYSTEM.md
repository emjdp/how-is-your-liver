# DESIGN_SYSTEM — 디자인 시스템

## 디자인 콘셉트
- **프리미엄 헬스 리포트 × 블랙코미디 밈 카드.**
- 모티프: Spotify Wrapped의 카드 감성 + 건강검진 결과지의 정돈 + 일본 잡지의 활자 미장센.

## 컬러 팔레트
Tailwind v4의 `@theme inline` 변수로 정의한다. (참고: 본 프로젝트는 `tailwind.config.js`를 사용하지 않는다.)

| 토큰 | HEX | 용도 |
|---|---|---|
| `--color-ink` | `#0B1411` | 본문/주요 텍스트 (거의 블랙, 살짝 그린) |
| `--color-bg` | `#F7F4EC` | 메인 배경 (아이보리) |
| `--color-surface` | `#FFFFFF` | 카드 표면 |
| `--color-deep-green` | `#0F3D2E` | 헤드라인 / 티어 강조 |
| `--color-deep-green-2` | `#1A5C44` | 그라데이션 보조 |
| `--color-lime` | `#C8F26C` | 라임 포인트 / today 인디케이터 |
| `--color-warn` | `#D9342B` | 경고 / 높은 티어 (배경 X, 테두리·아이콘만) |
| `--color-muted` | `#6B7370` | 보조 텍스트 |
| `--color-glass` | `rgba(255,255,255,0.55)` | 글래스 표면 |
| `--color-glass-stroke` | `rgba(15,61,46,0.12)` | 글래스 외곽선 |

## 다크 모드 토글 (v1.0)

### 사양
- 3상태: `system` / `light` / `dark`.
- 기본값: `system` (OS 설정에 따름).
- 클릭할 때마다 `system → light → dark → system` 순환.
- 버튼 크기: 최소 44×44px.
- 위치: 메인 상단 우측. 결과(`/result`), 주간(`/weekly`), 카드(`/result/card`, `/weekly/card`) 화면에서도 접근 가능.

### 클래스/우선순위
- `system` 모드: `:root` 클래스 없음. `@media (prefers-color-scheme: dark)` 에 맡김.
- `light` 모드: `:root.theme-light`. 미디어 쿼리보다 우선.
- `dark` 모드: `:root.theme-dark`. 미디어 쿼리보다 우선.
- 선택값은 `hiyl:v1:theme` LocalStorage 키에 저장.

### 스토리 카드 PNG
- 카드 PNG 색상은 테마 토글에 영향받지 않는다. 카드 배경은 항상 deep-green 그라데이션(또는 사진 오버레이) 고정.

## 타이포그래피
- **한글**: Pretendard Variable (셀프 호스팅 또는 CDN). 본문 letter-spacing -2.5%.
- **영문/숫자**: Inter Variable.
- **숫자(스코어)**: Inter Tabular, `font-feature-settings: "tnum"`.

### 타입 스케일 (모바일)
| 토큰 | px | line-height | 용도 |
|---|---|---|---|
| `display` | 56 | 60 | 결과/카드 메인 숫자 |
| `h1` | 32 | 38 | 페이지 헤더 |
| `h2` | 22 | 28 | 섹션 헤더 |
| `body` | 15 | 22 | 본문 |
| `caption` | 12 | 16 | 안전 안내·hint |

## 레이아웃 원칙
- 가로 패딩 `20px` 기본, 카드 내부 `24px`.
- 한 손 조작 영역: 화면 하단 60% 안에 모든 primary 인터랙션.
- 카드 radius: `20px` (외곽), `12px` (내부 요소).
- 그림자: `0 8px 32px rgba(11,20,17,0.06)` — 절제된 1단계만 사용.

## 컴포넌트 스타일

### 플로팅 요일 선택 바
- `position: sticky; top: env(safe-area-inset-top) + 12px;`
- 배경: `--color-glass` + `backdrop-filter: blur(20px) saturate(140%)`.
- pill 컨테이너 radius `999px`, padding `8px`.
- 셀: 44×44 원형. 선택 시 진한 글래스 + 외곽선. today: 라임 닷.

### 입력 카드
- 배경: `--color-surface`, 1px stroke `rgba(11,20,17,0.06)`.
- ± 버튼: 56×56, radius `16px`, ghost 스타일.
- 숫자 디스플레이: tabular, `display` 토큰.

### 결과 리포트
- 첫 화면 fold 안에 티어 + 메인 수치가 모두 보이도록.
- 수치 카드 3개는 가로 스크롤이 아닌 수직 스택 (모바일).

### 스토리 카드 (9:16)
- 가운데 정렬 9:16 박스, 1080×1920 캔버스에 1:1 매핑.
- 세이프 영역: 상단 120px / 하단 200px (인스타 UI 가림 방지).
- 배경: deep-green 그라데이션 + **SVG `<filter feTurbulence>` 노이즈** (`baseFrequency: 0.9`, `opacity: 0.06`). CSS 비트맵 이미지는 사용하지 않는다 (html-to-image 캡처 안정성).
- **높은 티어(t5/t6) 카드의 시각적 보상 절제 (강제 규칙)**:
  - 배경 그라데이션 채도 -20%, 밝기 -10%.
  - warn 컬러(`--color-warn`)는 1pt 외곽선과 24×24 이하 아이콘에만 사용. 면적 채움 금지.
  - 타이포 크기 키우지 않기 (보통 티어와 동일 스케일).
  - 노이즈 강도 증가 등 "더 멋있어 보이게" 만드는 효과 일체 금지.

## 애니메이션 방향
- **MVP 필수**: 페이지/요일 전환 200ms fade + 12px y 슬라이드. Framer Motion 또는 CSS 전환 둘 다 가능 — 가벼운 쪽 우선.
- **추후 확장 (MVP 제외)**:
  - 숫자 카운트업 (600ms ease-out, 입력값 변경 시).
  - Spring 기반 모션 (`{ stiffness: 220, damping: 22 }`).
- 과한 mascot/스티커 애니메이션 금지.
- `prefers-reduced-motion: reduce` 사용자에게는 모든 transition 0ms.

## 마스코트 사용 가이드 (v1.0)

- **메인 페이지**: 제목 "당신의 간은 안녕하십니까?" 우측에 작게 배치. 브랜드 정체성 보강 목적.
- **결과 페이지 / 카드**: 남용 금지. 텍스트 가독성을 해치지 않는 보조 요소로만.
- **높은 티어(t5/t6)**: 신남·승리·전설 느낌 금지. 지친 표정 또는 절제된 배치.
- **주의**: 높은 티어에서 마스코트가 보상처럼 보이면 안 된다.
- 마스코트 파일 없어도 앱이 깨지지 않도록 graceful fallback 필수.

## 사진 배경 카드 디자인 규칙 (v1.0)

- 사진 위에 **50~65% 어두운 오버레이** 필수.
- 텍스트는 흰색 + 가벼운 drop-shadow로 대비 유지 (WCAG AA 이상).
- 과음을 자랑처럼 보이게 하는 스티커, 이펙트, 필터 금지.
- 사진 없으면 기존 deep-green 그라데이션으로 대체.

## 피해야 할 디자인
- 빨강/노랑 메인 컬러, 네온, 자극적 술병 일러스트.
- "ㅋㅋㅋ" 같은 자모음 강조, 이모지 도배.
- 카드 게임 점수판 느낌의 다단계 배지/메달.
- 회전·진동·반짝임 효과.
- 헌팅포차·클럽 포스터 느낌.
- 과음 랭킹 게임처럼 보이는 디자인.
