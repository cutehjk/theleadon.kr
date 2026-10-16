# theleadon.kr

더리드온 홈페이지 (Astro 정적 사이트 → GitHub Pages). 기획·요구사항은 `docs/SPEC.md`를 참고하세요.

## 로컬 실행

```sh
npm install
npm run dev      # http://localhost:4321  (draft 글도 보임)
npm run build    # dist/ 생성 (draft 글 제외)
```

## 소식 글 올리기 (2차 관리자 화면 전까지)

`src/content/news/`에 Markdown 파일을 하나 추가합니다. 파일 이름이 주소가 됩니다.
예: `20261020-1.md` → `/news/20261020-1/`

```md
---
title: "글 제목"
category: news          # notice(공지) | press(보도자료) | news(사업소식)
date: 2026-10-20
pinned: false           # true면 목록 상단 고정 띠에 표시 (최대 3건)
cover: ./images/20261020-1.jpg   # 선택. 16:9로 잘림, 가로 1200px 이상 권장
coverAlt: "사진 설명"    # cover가 있으면 필수
attachments:            # 선택. 파일은 public/files/news/ 에 넣습니다
  - { name: "안내문.pdf", href: "/files/news/안내문.pdf", size: "PDF · 320KB" }
---
본문을 Markdown으로 작성합니다.
```

- 사진은 `src/content/news/images/`에 넣습니다.
- `draft: true`를 넣으면 개발 서버에서만 보이고 실제 사이트에는 나타나지 않습니다.
- 발행된 글이 하나도 없으면 소식 메뉴, 홈의 '최근 소식' 섹션, `/news/` 페이지가 자동으로 숨겨집니다.

## 배포

`main`에 병합되면 GitHub Actions(`.github/workflows/deploy.yml`)가 빌드·배포합니다.
처음 한 번은 저장소 **Settings → Pages → Source를 "GitHub Actions"**로 바꿔야 합니다.
