# VERCEL_DEPLOYMENT — Vercel CLI 배포 가이드

> 목적: Claude Code 또는 로컬 터미널에서 Vercel CLI로 MVP를 배포할 때 필요한 순서와 확인 항목을 고정한다.

## 전제

- GitHub 원격: `https://github.com/emjdp/how-is-your-liver.git`
- 기본 브랜치: `main`
- 환경변수: 없음
- Vercel CLI는 npm script에서 `npx vercel`로 실행한다. 글로벌 설치는 필요 없다.

## 배포 전 확인

```bash
npm test
npm run lint
npm run build
git status --short --branch
```

기대 결과:

- 테스트 전체 통과
- lint 오류 없음
- build 성공
- 커밋할 변경분이 없다면 `main...origin/main`만 표시

## 최초 1회 인증

```bash
npm run vercel:login
```

브라우저 또는 이메일 인증이 필요하다. 인증이 막히면 사용자가 직접 완료해야 한다.

인증 확인:

```bash
npm run vercel:whoami
```

## 최초 1회 프로젝트 연결

```bash
npm run vercel:link
```

권장 선택:

- Existing project가 있으면 해당 프로젝트 선택
- 새 프로젝트라면 프로젝트명 `how-is-your-liver`
- Framework preset은 Vercel 자동 감지(Next.js)
- Root directory는 현재 프로젝트 루트 (`how-is-your-liver`)

연결 후 `.vercel/` 디렉토리가 생길 수 있다. `.gitignore`에 의해 커밋하지 않는다.

## Preview 배포

```bash
npm run deploy:preview
```

Preview URL이 출력되면 브라우저에서 MVP 플로우를 확인한다.

## Production 배포

```bash
npm run deploy:prod
```

Production URL이 출력되면 아래를 확인한다.

- 메인 진입
- 오늘 자동 선택
- 입력 저장
- 당일 결과
- 최근 7일 리포트
- 스토리 카드 2종
- 이미지 저장
- 빈 기록 리다이렉트
- 0/0 기록 결과 표시
- 안전 안내 노출

## 주의

- `/weekly/card` 라우트는 MVP에 없다.
- 사용자 사진 업로드, AI 이미지 생성, 로그인, 서버 DB는 배포 중 추가하지 않는다.
- Vercel 프로젝트 설정에서 별도 환경변수는 만들지 않는다.
