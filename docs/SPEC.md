# 더리드온 홈페이지 리뉴얼 개발명세서

- 문서 버전: v1.2 (2026-10-16, 소식 게시판 1차 구현 반영)
- 대상: https://theleadon.kr (저장소 `cutehjk/theleadon.kr`)
- 상태: **기획 확정 / 개발 착수 전**. 단, `TBD` 표시 항목은 회사의 사실 정보 제공이 필요합니다.
- 작성 근거: Grill Me 방식 인터뷰(Q1~Q25)와 기존 코드·인프라 분석

> 이 문서에서 `TBD`로 표시된 값은 임의로 채우지 않습니다. 회사가 확인한 사실로만 교체합니다.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| 회사 | 주식회사 더리드온 (The LeadOn) |
| 슬로건 | LEAD TODAY, GROW TOMORROW |
| 사업 | 대학·대학원 대상 교육콘텐츠 개발, 이러닝 운영, AI 기반 교육 솔루션 |
| 사이트 1순위 목표 | **신뢰 확보**: 입찰·제안·소개로 회사를 검증하러 온 담당자가 "믿을 만한 회사"라고 판단하게 함 |
| 2순위 목표 | **문의 전환**: 검증을 마친 담당자가 문의 폼을 제출하게 함 |
| 1차 타깃 | 대학·대학원 실무 담당자(팀장·실장급): 대학원 행정실, 이러닝센터, 교수학습지원센터, 평생교육원 |
| 2차 타깃 | 그 외 교육기관(공공·기업·군 등). 별도 메시지 없이 문의만 받음 |
| 운영 주체 | 비개발자 1명(운영 담당) + 대표. 브라우저 관리자 화면으로 운영 |
| 운영비 | **월 0원** (모두 무료 등급 사용) |
| 언어 | 한국어만 제작 (영문은 푸터의 회사 정보 1줄) |

### 1.1 성공 지표
- 회사 검증에 필요한 정보(회사 정보, 사업, 실적, 조직, 연락처)를 **모든 페이지에서 2클릭 이내**에 찾을 수 있음
- 문의 폼이 접수부터 담당자 메일 수신까지 **누락 없이** 작동하고, 장애가 생기면 24시간 안에 인지함
- 문의 데이터에 유입 페이지가 기록되어, "어느 페이지에서 문의가 들어왔는지" 확인할 수 있음

---

## 2. 현황 분석 (2026-10-15 확인)

| 항목 | 확인된 사실 |
|---|---|
| 배포 방식 | GitHub Pages. DNS A 레코드가 185.199.108~111.153을 가리킴. `CNAME`=theleadon.kr |
| 저장소 | `cutehjk/theleadon.kr`, **Public**, main 브랜치. **개인 계정 소유** |
| DNS | 가비아 (ns.gabia.net / ns.gabia.co.kr / ns1.gabia.co.kr) |
| 회사 메일 | 하이웍스 (MX: mx1/mx2.hiworks.com) |
| 메일 인증 | 루트 도메인 TXT(SPF) 레코드 없음 |
| 기술 | 순수 정적 HTML + `style.css` 1개. 빌드 과정 없음. 헤더·푸터를 페이지마다 복사 |
| 배포본 페이지 | index, about, business, vision, organization, contact, 404 |
| 로컬 전용 | 로그인·회원가입·마이페이지·비밀번호 재설정(Supabase, 설정값 비어 있어 작동 안 함). **배포된 적 없음** |
| 백업 zip | `theleadon.kr-main.zip`에 `transition.html`(5단계 운영전환)과 이미지 3장(learning-workshop, lecture-hall, online-learning)이 추가로 있음 |
| 문의 | 폼 없음. 전화·이메일·주소 표기 없음 |
| 법적 표기 | 대표자·사업자등록번호·주소·개인정보처리방침 없음 |
| 디자인 | 네이비 `#13254A` + 브라스 `#B48A48`(TL 마크에서 추출). Pretendard / Cormorant Garamond / Montserrat. 다크모드 자동 전환 |
| 모바일 | 860px 이하에서 메뉴가 가로 스크롤로 바뀜 (햄버거 메뉴 없음) |
| 이미지 | 모두 Unsplash·Pexels 스톡 사진 (`images/CREDITS.md`) |
| SEO | 페이지별 title·description·canonical·OG 있음. OG 이미지가 세로형(654×706). sitemap 6개 URL |
| 포지셔닝 불일치 | 현재 사이트는 "대학원 / 교육운영·AI콘텐츠·디지털홍보"를 내세움. 리뉴얼 방향은 "대학·대학원 / 콘텐츠 개발·이러닝 운영·AI 솔루션" |

---

## 3. 확정 결정 로그

| # | 주제 | 결정 |
|---|---|---|
| Q1 | 목표 | 1순위 신뢰 확보, 2순위 문의 전환 |
| Q2 | 타깃 | 대학 + 대학원. 그 외 기관은 '기타' 문의로 받음 |
| Q3 | 사업 구분 | ① 교육콘텐츠 개발 ② 이러닝 운영(모집·홍보 지원 포함) ③ AI 교육 솔루션. ③은 자체 제품이 확인되기 전까지 **AI 활용 서비스**로 표현 |
| Q4 | 실적 | 건별로 기관명 공개 여부 확인. 3건 미만이면 '수행 역량·레퍼런스' 형태로 구성 |
| Q5 | 회원 | 일반 회원 기능 **제거**. 관리자 로그인만 유지 |
| Q6 | 운영 | 비개발자가 브라우저 관리자 화면에서 운영 |
| Q7 | 일정·비용 | 1차: 핵심 페이지 + 문의 폼 → 2차: 관리자 화면. 월 0원 |
| Q8 | 기술 | **Astro(정적 생성) + Supabase + GitHub Pages**. 발행 시 자동 재빌드 |
| Q9 | 디자인 | 브랜드 컬러·폰트 유지, 레이아웃 정돈, **라이트 모드 고정** |
| Q10 | 사진 | 실제 사진 5~8장 촬영. 확보 전까지 인물 스톡 사진 사용 안 함 |
| Q11 | 메뉴 | 회사소개 / 사업분야(상세 3개) / 레퍼런스 / 소식 / 문의하기 |
| Q12 | 문의 폼 | 필수 7개 + 선택 4개 항목. 1차는 첨부파일 없음. Turnstile + 반복 제출 제한. "영업일 2일 이내 회신" 안내 |
| Q13 | 공지 | 분류 3종, 상단 고정, 대표 이미지, 첨부파일, 임시저장. 예약 발행·조회수 없음. 홈 노출은 글이 있을 때만 |
| Q26 | 소식 스타일 | 대부분의 글에 사진 포함, 게시 빈도 월 1~2건 → **카드형 + 상단 고정 공지 띠** (최신 글을 크게 보여 주는 혼합형은 사용하지 않음) |
| Q14 | 관리자 | 2명(대표 + 운영 담당), 동일 권한, 초대 방식, TOTP 2단계 인증 |
| Q15 | SEO | 서치어드바이저·서치콘솔 등록, 깔끔한 URL, 구조화 데이터, 1200×630 OG 이미지, Cloudflare Web Analytics |
| Q16 | 회사소개서 | PDF를 이메일 입력 없이 다운로드. 자료가 없으면 3차로 미룸 |
| Q17 | 홈 구성 | 히어로 → 신뢰 지표 → 사업 3종 → 레퍼런스 → 일하는 방식 → 최근 소식 → CTA |
| Q18 | 숫자 원칙 | 증빙 가능한 것만 게시, 기준 시점 표기, 회사 실적과 구성원 경력 분리 |
| Q19 | 레퍼런스 | 6.3절의 항목 사용. 카드형 목록, 사업분야 필터. 상세 페이지는 5건 이상일 때 추가 |
| Q20 | 사업 상세 | 공통 틀 사용. 문구 초안은 개발 측 작성, 사실 검수는 회사 |
| Q21 | 개인정보 | Supabase 서울 리전, 문의 3년 보관 후 자동 삭제, 보호책임자는 대표, 표준 양식 기반 초안 |
| Q22 | 메일 | Resend(무료) + 발송 전용 서브도메인 `send.theleadon.kr`에 SPF·DKIM. 기존 MX는 변경하지 않음 |
| Q23 | 단계 | 1차 오픈 / 2차 관리자 / 3차 선택. 완료 기준은 10장 참조 |
| Q24 | 유지관리 | 매일 상태 확인(일시 정지 방지), 주 1회 백업, 계정은 회사 소유로 이전, 운영 매뉴얼 작성 |
| Q25 | 언어 | 한국어만 |

---

## 4. 정보구조 (IA)와 URL

| 메뉴 | 페이지 | URL | 단계 |
|---|---|---|---|
| 홈 | 메인 | `/` | 1차 |
| 회사소개 | 개요·미션·회사 현황 | `/about/` | 1차 |
| | AI 교육혁신 비전 | `/about/vision/` | 1차 |
| | 조직·인력 | `/about/organization/` | 1차 |
| | 오시는 길 | `/about/location/` | 1차 (주소 TBD. 주소가 없으면 메뉴 숨김) |
| 사업분야 | 사업 개요 | `/business/` | 1차 |
| | 교육콘텐츠 개발 | `/business/content/` | 1차 |
| | 이러닝 운영 | `/business/elearning/` | 1차 |
| | AI 교육 솔루션 | `/business/ai/` | 1차 |
| 레퍼런스 | 수행 역량·실적 + 운영전환 5단계 | `/references/` (`#transition`) | 1차 |
| 소식 | 목록 | `/news/`, `/news/{n}/`(2페이지부터) | 1차 화면 구현 완료 (글 0건이면 메뉴·페이지 생성 안 함) |
| | 분류별 목록 | `/news/category/{key}/` (key: notice·press·news) | 1차 |
| | 상세 | `/news/{slug}/` (slug = Markdown 파일 이름, 예: `20261014-1`) | 1차 |
| 문의하기 | 문의 폼 + 연락처 | `/contact/` (`?type=` content·elearning·ai) | 1차 |
| 푸터 | 개인정보처리방침 | `/privacy/` | 1차 |
| 푸터 | 회사소개서 PDF | `/files/theleadon-company-profile.pdf` | 3차 (자료 있으면 1차) |
| — | 관리자 | `/admin/` | 2차 (`noindex`, robots 차단) |
| — | 404 | `/404.html` | 1차 |

### 4.1 기존 URL 연결
GitHub Pages는 301 리다이렉트를 지원하지 않으므로, 기존 주소에 안내 페이지를 생성합니다. 각 페이지는 `<link rel="canonical">`(새 주소) + `<meta http-equiv="refresh" content="0; url=…">` + `location.replace()` + 수동 링크로 구성하고, `noindex`를 적용합니다.

| 기존 | 새 주소 |
|---|---|
| `/index.html` | `/` |
| `/about.html` | `/about/` |
| `/business.html` | `/business/` |
| `/vision.html` | `/about/vision/` |
| `/organization.html` | `/about/organization/` |
| `/contact.html` | `/contact/` |

### 4.2 공통 레이아웃
- **헤더**: 로고(홈 링크) + 메뉴 5개 + [문의하기] 버튼. 860px 이하에서는 햄버거 버튼 → 전체 화면 드로어(포커스 가두기, ESC로 닫기, `aria-expanded`)
- **푸터**: 회사 정보(상호, 대표자 `TBD`, 사업자등록번호 `TBD`, 주소 `TBD`, 전화 `TBD`, 이메일 `TBD`: office@theleadon.kr 사용 여부 확인 필요), 메뉴 링크, 개인정보처리방침(굵게 표시), 회사소개서 다운로드, 저작권 표기
- **페이지 헤드**: 영문 eyebrow + H1 + 한 줄 설명 + 브레드크럼(구조화 데이터 포함)
- **하단 CTA**: 모든 콘텐츠 페이지 하단에 표시. 사업 상세 페이지에서는 해당 문의 분야를 미리 선택한 링크

---

## 5. 페이지별 요구사항

### 5.1 홈 `/`
| 순서 | 섹션 | 내용 | 조건 |
|---|---|---|---|
| 1 | 히어로 | 한 문장 가치 제안(대학·대학원 대상), 보조 문장, [문의하기] [회사소개서 받기] | 회사소개서가 없으면 두 번째 버튼은 [사업분야 보기] |
| 2 | 신뢰 지표 띠 | 검증 가능한 숫자 3~4개 + 기준 시점 | **숫자 3개 미만이면 섹션 숨김**, 레퍼런스 섹션을 위로 올림 |
| 3 | 사업분야 | 카드 3개(콘텐츠 개발 / 이러닝 운영 / AI 솔루션) → 상세 페이지 링크 | |
| 4 | 레퍼런스 하이라이트 | 대표 실적 2~3건 카드 → `/references/` | 실적 0건이면 '수행 역량' 요약으로 대체 |
| 5 | 일하는 방식 | 운영전환 5단계 요약 → `/references/#transition` | 5단계 내용 원문 확인 필요 (zip의 `transition.html`) |
| 6 | 최근 소식 | 최신 글 3건을 카드 1줄로 표시 (소식 목록과 같은 카드) | **글 0건이면 섹션 숨김** (2차부터) |
| 7 | CTA | 문의 유도 + 회신 시한 안내 | |

- 현재 홈의 "AI 비전 인용문" 섹션은 `/about/vision/`으로 옮깁니다.
- 현재 홈의 "Why The LeadOn" 3개 카드는 문구를 다듬어 4번 또는 5번 섹션에 흡수합니다.

### 5.2 회사소개
- `/about/`: 회사 소개 문단, 미션·슬로건, 핵심가치(PEOPLE·KNOWLEDGE·NETWORK·OPPORTUNITY·A BETTER WORLD), 회사 현황 표(상호, 대표자 `TBD`, 설립일 `TBD`, 업종: 온라인 교육훈련업/소프트웨어개발, 소재지 `TBD`), 대표 인사말(선택, 원고 `TBD`)
- `/about/vision/`: 현재 `vision.html` 내용 + 홈에서 옮겨온 인용문
- `/about/organization/`: 현재 조직도와 역할표를 재사용. 사업 구분 변경(Q3)에 맞춰 팀 설명 문구를 정리. 구성원 경력은 '구성원 경력'으로 표기(Q18)
- `/about/location/`: 주소, 지도 링크(네이버 지도·카카오맵 외부 링크. 지도 임베드는 사용하지 않음), 대중교통 안내 `TBD`

### 5.3 사업분야 상세 (3개 페이지 공통 틀)
1. 고객의 문제 (담당자 관점의 문제 3가지)
2. 제공 서비스 범위 (항목 4~6개)
3. 수행 프로세스 (단계도 4~6단계)
4. 산출물 (납품물 목록)
5. 관련 레퍼런스 (해당 사업분야 태그가 붙은 레퍼런스를 자동으로 표시. 0건이면 숨김)
6. 자주 묻는 질문 3~5개 (`FAQPage` 구조화 데이터)
7. CTA → `/contact/?type={content|elearning|ai}`

| 페이지 | 기존 콘텐츠 출처 |
|---|---|
| 교육콘텐츠 개발 | 기존 'AI·콘텐츠' 항목 + 조직도의 '콘텐츠 제작 및 미디어지원팀' 업무 |
| 이러닝 운영 | 기존 '교육운영'과 '디지털'의 LMS·모집·홍보 항목 + '교육운영지원팀', '모집·홍보팀' 업무 |
| AI 교육 솔루션 | 기존 '생성형 AI 활용 교육', 비전 페이지의 'FOR INSTITUTIONS' 항목. **제품처럼 표현하지 않음** (Q3) |

문구 초안은 개발 측에서 작성하고, 회사가 사실관계를 검수한 뒤 게시합니다(Q20). 검수 전 문구는 배포하지 않습니다.

### 5.4 레퍼런스 `/references/`
- 상단: 수행 역량 요약(실적이 3건 미만일 때 강조)
- 목록: 카드형. 필터는 사업분야 하나(전체 / 콘텐츠 / 이러닝 / AI)
- 카드 표시: 기관명(공개) 또는 비공개 표기 문구, 기관 유형, 사업명, 기간, 요약, 성과 수치, `회사 실적` / `구성원 경력` 배지
- `#transition`: 운영전환 5단계 체계
- 건별 상세 페이지는 노출 실적이 5건 이상이 되면 추가합니다 (3차)

### 5.5 소식 `/news/` (2차)
스타일: **카드형 + 상단 고정 공지 띠** (Q26). 게시 빈도는 월 1~2건으로 예상합니다.

> **구현 현황 (2026-10-16)**: 관리자 화면보다 먼저 화면을 구현했습니다. 2차 전까지 글은 `src/content/news/*.md`(Markdown 파일)로 관리하며, 작성 방법은 저장소 `README.md`에 있습니다. 2차에서 Supabase `posts` 테이블로 옮깁니다.

**목록**
- 분류 탭: 전체 / 공지 / 보도자료 / 사업소식 (정적 페이지 `/news/category/{key}/`로 분리. 검색 엔진이 분류 페이지도 읽을 수 있음)
- 상단 고정 띠: `pinned = true`인 글을 카드 위에 텍스트 한 줄씩 표시합니다(배지 '고정' + 분류 + 제목 + 날짜). 최대 3건이며, 고정 글은 아래 카드 목록에 중복 표시하지 않습니다
- 카드 그리드: PC 3열 / 태블릿(960px 이하) 2열 / 모바일(640px 이하) 1열. **페이지당 9건**, 번호식 페이지 이동 (무한 스크롤 없음)
- 카드 구성: 대표 사진(16:9, `object-fit: cover`) → 분류 라벨 → 제목(2줄 말줄임) → 발행일 `YYYY.MM.DD`. 요약문은 넣지 않습니다
- NEW 표시: 발행 후 7일 이내 (빌드 시점 기준, 매일 빌드로 갱신)
- 대표 사진이 없는 글: 빈 칸 대신 **기본 이미지**(네이비 배경 + 분류 라벨 + 로고)를 자동으로 표시합니다. 분류별 3종을 정적 파일로 준비합니다
- 색: 제목은 네이비, '고정' 배지와 분류 라벨에만 브라스. 분류는 색이 아니라 글자 라벨로 구분합니다
- 검색: 넣지 않음 (글이 30건을 넘으면 재검토)
- 카드 전체가 링크 영역이며, 키보드 포커스 시 카드 테두리를 강조합니다

**상세**
- 분류 · 발행일 → 제목 → 대표 사진(16:9) → 본문 → 첨부파일 박스 → 이전·다음 글 → [목록] 버튼, [링크 복사]
- 본문 폭은 최대 720px. 본문 안에 사진을 여러 장 넣을 수 있음
- 대표 사진을 해당 글의 OG 이미지로 사용 (없으면 기본 OG 이미지)

**관리자 입력 규칙**
- 대표 사진: jpg/png/webp, 5MB 이하, 가로 1200px 이상 권장 (미만이면 경고만 표시). 업로드 시 16:9 미리보기로 잘림 위치를 확인
- **사진 설명(대체 텍스트) 필수**: 대표 사진과 본문 사진 모두

**제외**: 댓글, 조회수, 사용자 글쓰기, 예약 발행

### 5.6 문의하기 `/contact/`
**폼 항목**

| 항목 | 필수 | 형식·검증 |
|---|---|---|
| 기관명 | ✅ | 1~100자 |
| 담당자명 | ✅ | 1~50자 |
| 이메일 | ✅ | 이메일 형식 |
| 연락처 | ✅ | 숫자·하이픈, 9~20자 |
| 문의 분야 | ✅ | 콘텐츠 개발 / 이러닝 운영 / AI 솔루션 / 기타 (URL `?type=`로 미리 선택) |
| 문의 내용 | ✅ | 10~3000자 |
| 개인정보 수집·이용 동의 | ✅ | 체크박스 + 수집 항목·목적·보유기간 요약 표시 + 처리방침 링크 |
| 부서·직위 | | 0~100자 |
| 희망 일정 | | 자유 입력 0~100자 |
| 예산 범위 | | 선택: 미정 / 1천만원 미만 / 1천만~5천만원 / 5천만~1억원 / 1억원 이상 (구간은 회사 확인 후 확정) |
| 첨부파일 | | **1차에서는 제공하지 않음** |

**동작**
1. 브라우저 검증 → Cloudflare Turnstile 토큰 발급
2. Supabase Edge Function `submit-inquiry` 호출 (테이블에 직접 insert하지 않음)
3. 서버: Turnstile 검증 → 입력값 재검증 → 반복 제출 제한(같은 IP 해시 기준 **10분에 3건**) → `inquiries`에 저장(유입 페이지·UTM 포함)
4. 메일 발송: ① 담당자 알림(수신 주소 `TBD`) ② 문의자 접수 확인 메일
5. 화면: 성공하면 "접수되었습니다. 영업일 2일 이내 회신드립니다." 표시. 실패하면 오류 메시지와 함께 대체 연락 수단(이메일·전화) 표시
6. 메일 발송이 실패해도 DB 저장이 성공했다면 접수 성공으로 처리하고, 관리자 화면에 '알림 실패' 표시

**연락처 블록**: 대표 이메일, 전화, 주소, 응대 시간 (모두 `TBD`)

### 5.7 개인정보처리방침 `/privacy/`
- 개인정보보호위원회의 작성 지침과 표준 양식을 바탕으로 초안 작성 → 회사가 확인 (필요하면 전문가 검토)
- 필수 기재: 처리 목적, 처리 항목, 보유 기간(**문의 접수일로부터 3년**), 파기 절차, 처리 위탁·국외 이전, 정보주체 권리와 행사 방법, 안전성 확보 조치, 보호책임자(대표, 연락처 `TBD`), 시행일, 변경 이력
- 처리 위탁·국외 이전 고지 대상(초안):

| 업체 | 용도 | 처리 정보 | 비고 |
|---|---|---|---|
| Supabase | 문의 데이터 저장 | 문의 폼 항목 | 서울 리전 저장 |
| Resend | 메일 발송 | 이메일, 이름, 문의 요약 | 국외(미국) |
| Cloudflare | 봇 차단, 방문 통계 | IP 등 접속 정보 | 국외 |
| GitHub | 웹사이트 호스팅 | 접속 로그 | 국외 |

> 법적 적정성의 최종 판단은 회사의 책임입니다. 이 명세서는 법률 자문이 아닙니다.

### 5.8 404
브랜드 레이아웃 + 홈·주요 메뉴·문의 링크.

---

## 6. 데이터 모델 (Supabase, 서울 리전)

### 6.1 공통
- 모든 테이블에 RLS 적용
- `admins(user_id uuid pk references auth.users, created_at)` 테이블과 `is_admin()` SQL 함수(`security definer`)로 관리자 판별
- Auth 설정: **공개 가입 비활성화**, 이메일+비밀번호, **TOTP MFA 필수**. 관리자 화면은 `aal2` 세션에서만 동작

### 6.2 `inquiries` (1차)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid pk | |
| created_at | timestamptz | default now() |
| org_name | text | 필수 |
| contact_name | text | 필수 |
| email | text | 필수 |
| phone | text | 필수 |
| category | text | `content` / `elearning` / `ai` / `other` |
| message | text | 필수 |
| department | text | 선택 |
| desired_schedule | text | 선택 |
| budget_range | text | 선택 |
| privacy_agreed_at | timestamptz | 필수 |
| source_path | text | 문의 직전 페이지 |
| utm | jsonb | 선택 |
| ip_hash | text | 솔트를 붙인 SHA-256 해시 (원본 IP는 저장하지 않음) |
| status | text | `new` / `in_progress` / `done` (기본값 `new`) |
| admin_memo | text | |
| notify_status | text | `sent` / `failed` |
| delete_after | timestamptz | `created_at + interval '3 years'` |

- RLS: anon은 접근 불가(insert는 Edge Function이 service role로 처리). 관리자는 select·update·delete 가능
- 파기: `pg_cron`으로 매일 `delete_after < now()` 행 삭제

### 6.3 `references` (2차부터 DB 사용. 1차는 `src/data/references.json`에 같은 스키마로 작성)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid pk | |
| title | text | 사업명 |
| org_name | text | 실제 기관명 (관리용) |
| org_public | boolean | 기관명 공개 여부 |
| org_alias | text | 비공개일 때 표기 (예: "수도권 A대학교 대학원") |
| org_type | text | `university` / `graduate_school` / `other` |
| areas | text[] | `content` / `elearning` / `ai` 복수 선택 |
| period_start / period_end | date | `period_end`가 null이면 "진행 중" |
| summary | text | 3~5줄 |
| metrics | text | 성과 수치 (선택, 증빙 가능한 것만) |
| cover_image | text | Storage 경로 (선택) |
| kind | text | `company`(회사 실적) / `member_career`(구성원 경력) |
| visible | boolean | |
| sort_order | int | |
| updated_at | timestamptz | |

- RLS: anon은 `visible = true` 행만 select. 단, **`org_public = false`인 행은 `org_name`을 노출하지 않도록** 공개용 view `references_public`(org_name 제외, 표기명 계산)으로만 조회
- 빌드는 `references_public` view만 읽습니다

### 6.4 `posts` (2차)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid pk | |
| slug | text unique | 영문·숫자·하이픈. 기본값은 `YYYYMMDD-n` |
| category | text | `notice` / `press` / `news` |
| title | text | |
| body_md | text | Markdown |
| cover_image | text | Storage 경로 (없으면 기본 이미지) |
| cover_alt | text | 대표 사진 설명. `cover_image`가 있으면 필수 |
| attachments | jsonb | `[{path, name, size}]` |
| pinned | boolean | |
| status | text | `draft` / `published` |
| published_at | timestamptz | 발행 시 기록 |
| created_by | uuid | |
| updated_at | timestamptz | |

- RLS: anon은 `status = 'published'` 행만 select. 관리자는 전체 권한
- Storage 버킷 `media` (public read, 관리자만 쓰기). 이미지는 jpg/png/webp 5MB 이하, 첨부는 pdf/hwp/hwpx/docx/xlsx/pptx 10MB 이하

### 6.5 `rate_limits` (1차)
`ip_hash`, `created_at`. 반복 제출 제한에 사용하고, 24시간 지난 행은 삭제합니다.

---

## 7. 시스템 구성

```
[방문자] ──> GitHub Pages (Astro 정적 빌드 결과)
               │  문의 제출
               └──> Supabase Edge Function: submit-inquiry
                         ├─ Cloudflare Turnstile 검증
                         ├─ Postgres(inquiries) 저장
                         └─ Resend 메일 발송 (send.theleadon.kr)

[관리자] ──> /admin/ (정적 페이지 + supabase-js, MFA)
               ├─ inquiries 조회·상태 변경
               ├─ posts / references CRUD, Storage 업로드
               └─ [발행] → Edge Function: trigger-rebuild
                              └─ GitHub API repository_dispatch → GitHub Actions 빌드·배포

[GitHub Actions]
   ├─ deploy.yml   : push(main) / repository_dispatch / 매일 1회 → 빌드 → Pages 배포
   │                 (빌드 시 Supabase 조회 = 일시 정지 방지 효과)
   ├─ healthcheck.yml : 매일 1회 submit-inquiry 헬스 엔드포인트 확인, 실패 시 이슈 생성 + 메일 알림
   └─ backup.yml   : 주 1회 DB 덤프 → 비공개 저장소(또는 사내 드라이브) 보관
```

### 7.1 기술 스택
| 영역 | 선택 |
|---|---|
| 정적 생성 | Astro (최신 안정판), `output: 'static'`, `trailingSlash: 'always'` |
| 스타일 | 기존 `style.css` 토큰을 이어서 사용 (CSS 변수). 프레임워크 추가 없음 |
| 사이트맵 | `@astrojs/sitemap` (`/admin/`, 리다이렉트 페이지 제외) |
| 이미지 | Astro `<Image>`로 webp 변환·크기별 생성, `loading="lazy"` |
| 폰트 | Pretendard(dynamic subset), Montserrat, Cormorant Garamond. 사용하는 굵기만 로드 |
| 백엔드 | Supabase (Postgres, Auth+MFA, Storage, Edge Functions, pg_cron) |
| 메일 | Resend 무료 등급 |
| 봇 차단 | Cloudflare Turnstile |
| 분석 | Cloudflare Web Analytics (JS 비콘, 쿠키 없음) |
| 관리자 에디터 | Markdown 기반 WYSIWYG 에디터 (후보: Toast UI Editor. 2차 착수 시 확정) |

### 7.2 비밀값 관리
| 값 | 보관 위치 |
|---|---|
| Supabase anon key, URL | GitHub Actions 변수 (공개 가능 값) |
| Supabase service role key | Supabase Edge Function 비밀값에만 보관. **저장소·브라우저에 절대 넣지 않음** |
| Resend API key | Edge Function 비밀값 |
| Turnstile secret | Edge Function 비밀값 |
| GitHub PAT (repository_dispatch 전용, 대상 저장소만, 최소 권한) | Edge Function 비밀값 |
| IP 해시 솔트 | Edge Function 비밀값 |

저장소가 Public이므로 커밋 전 비밀값 검사(GitHub secret scanning / push protection)를 켭니다.

### 7.3 DNS 변경 (가비아)
- 기존 A 레코드(GitHub Pages)와 **MX(하이웍스)는 변경하지 않음**
- Resend용 `send.theleadon.kr` 서브도메인에 SPF·DKIM(·MX) 레코드 추가 (Resend가 안내하는 값 사용)
- (권장) 루트 도메인 SPF와 DMARC는 하이웍스 안내에 따라 별도로 설정
- 네이버 서치어드바이저·구글 서치콘솔 소유 확인은 메타 태그 또는 TXT 레코드 사용

---

## 8. 디자인 시스템

- **유지**: 네이비 `#13254A` / `#1C3466` / `#0C1932`, 브라스 `#B48A48` / `#E9DCC4`, 배경 `#F6F7FA`, 본문 `#152039`, 보조 `#5A6580`, 라인 `#DCE1EC`. 라운드 24/16/10px. 기존 그림자
- **변경**:
  - 다크모드 제거 (`prefers-color-scheme` 블록 삭제, `color-scheme: light`)
  - 모바일 메뉴를 가로 스크롤에서 햄버거 드로어로 변경
  - 카드 안 장식 아이콘을 줄이고 정보 위계 강화 (제목 → 요약 → 근거)
  - 신뢰 지표용 숫자 블록 컴포넌트 추가 (숫자 + 단위 + 설명 + 기준 시점)
  - 사업분야 3색(teal / violet / blue) 중 브랜드와 충돌하는 색은 정리. 사업 구분은 색이 아니라 라벨로 표시
- **사진**: 실제 사진 5~8장(사무실, 스튜디오, 작업 장면, 대표 프로필, 제작 콘텐츠 캡처). 확보 전에는 인물 없는 스톡 사진 또는 그래픽 사용. 출처는 `CREDITS.md`로 관리
- **OG 이미지**: 1200×630 가로형. 로고 + 슬로건. 사업 페이지별 변형(선택)
- **컴포넌트 목록**: Header, MobileDrawer, Footer, PageHead, Breadcrumb, CTA, PillarCard, StatBand, ReferenceCard, ReferenceFilter, ProcessSteps, FAQ, PostPinnedBar, PostCardGrid, PostCard, PostPlaceholderImage, Pagination, ContactForm, Notice(성공·오류)

---

## 9. SEO·접근성·성능

### 9.1 SEO
- title 패턴: `{페이지명} | 더리드온` (홈: `더리드온 | 대학·대학원 교육콘텐츠 개발·이러닝 운영·AI 교육`)
- 페이지마다 description 80~120자, canonical, OG/Twitter 태그
- 구조화 데이터: 전체 `Organization`(name, url, logo, 주소·전화는 TBD 해소 후), 하위 페이지 `BreadcrumbList`, 사업 상세 `FAQPage`, 소식 상세 `Article`
- `robots.txt`: `/admin/` 차단, sitemap 경로 표기
- 등록: 네이버 서치어드바이저, 구글 서치콘솔 (사이트맵 제출)
- 페이지별 핵심 키워드(초안, 회사 검토 필요): 대학 이러닝 운영 위탁, 대학원 학사운영 위탁, 온라인 강의 콘텐츠 제작, 대학 교육콘텐츠 개발, 생성형 AI 교육

### 9.2 접근성
- KWCAG 2.2 / WCAG 2.1 AA 수준을 목표로 함
- 색 대비 4.5:1 이상, 키보드로 모든 기능 사용 가능, 포커스 표시, 폼 라벨·오류 메시지 연결(`aria-describedby`), 이미지 대체 텍스트, `prefers-reduced-motion` 대응

### 9.3 성능·호환
- Lighthouse **모바일** 기준 성능·접근성·권장사항·SEO 각 **90점 이상** (홈, 사업 상세 1개, 문의 페이지 측정)
- 360px 너비에서 가로 스크롤 없음
- 지원 브라우저: 최신 Chrome, Edge, Safari(iOS 포함), 삼성인터넷. IE 미지원

---

## 10. 개발 단계와 완료 기준

### 0단계: 사전 준비 (회사 측 작업 포함)
| 작업 | 담당 |
|---|---|
| 11장의 TBD 사실 정보 제공 | 회사 |
| 공개 가능한 실적 목록 작성 (건별 기관명 공개 여부, 회사 실적/구성원 경력 구분) | 회사 |
| 실제 사진 촬영 5~8장 | 회사 |
| GitHub Organization 생성 후 저장소 이전, 회사 공용 메일로 Supabase·Cloudflare·Resend 계정 생성 | 회사 + 개발 |
| Supabase 프로젝트 생성 (서울 리전) | 개발 |

### 1차: 오픈
| # | 작업 | 완료 기준 |
|---|---|---|
| 1-1 | Astro 프로젝트 전환, 공통 레이아웃, 디자인 토큰 이식, 다크모드 제거 | 모든 페이지가 같은 Header·Footer 컴포넌트를 사용 |
| 1-2 | 모바일 햄버거 드로어 | 360px에서 메뉴 5개 모두 접근 가능, 키보드·스크린리더로 조작 가능 |
| 1-3 | 홈, 회사소개 4종, 사업 개요 + 상세 3종, 레퍼런스(JSON 데이터), 개인정보처리방침, 404 | 문구는 회사 검수를 마친 것만 게시. TBD 값이 화면에 노출되지 않음 (값이 없으면 해당 항목 숨김) |
| 1-4 | 문의 폼 + `submit-inquiry` + Turnstile + 반복 제출 제한 + Resend + DNS 설정 | 실제 제출 시 DB 저장, 담당자 메일과 문의자 메일이 **스팸함이 아닌 받은편지함**에 도착. 10분 안의 4번째 제출이 차단되는지 확인 |
| 1-5 | `pg_cron` 파기 작업 | 테스트 행(`delete_after` 과거 시점)이 다음 실행에서 삭제됨 |
| 1-6 | SEO: 메타, 구조화 데이터, sitemap, robots, OG 이미지, 기존 URL 안내 페이지 | 구글 리치 결과 테스트 통과. 기존 6개 URL이 새 주소로 이동 |
| 1-7 | Cloudflare Web Analytics | 대시보드에 방문 집계 확인 |
| 1-8 | GitHub Actions: deploy / healthcheck / backup | 일부러 장애를 만들었을 때 24시간 안에 알림 수신, 백업 파일 생성 확인 |
| 1-9 | 로컬 전용 회원 기능 파일 미이전 | 배포 결과물에 login·signup·mypage·auth 파일이 없음 |
| 1-10 | 서치어드바이저·서치콘솔 등록 | 사이트맵 제출 완료 |
| 1-11 | 품질 점검 | 9.3절 기준 충족, 깨진 링크 0개 |

### 2차: 관리자
| # | 작업 | 완료 기준 |
|---|---|---|
| 2-1 | `/admin/` 로그인 + TOTP MFA + `admins` 테이블 | 관리자가 아닌 계정, MFA 미완료 세션은 데이터 조회 불가 (RLS로 검증) |
| 2-2 | 문의 관리: 목록(상태 필터·검색), 상세, 상태 변경, 메모, CSV 내보내기 | 운영 담당자가 매뉴얼만 보고 처리 가능 |
| 2-3 | 레퍼런스 CRUD + JSON → DB 이전 | 비공개 기관명이 공개 페이지·빌드 결과물·네트워크 응답 어디에도 나타나지 않음 |
| 2-4 | 소식 CRUD (임시저장, 상단 고정, 대표 이미지, 첨부) | 발행 후 **10분 이내** 사이트에 반영 |
| 2-5 | `trigger-rebuild` + repository_dispatch | 발행·수정·삭제 시 자동 재빌드 |
| 2-6 | 운영 매뉴얼 (`docs/OPERATIONS.md`) | 공지 등록, 문의 처리, 관리자 추가·삭제, 장애 대응 절차 포함 |

### 3차: 선택
- 회사소개서 PDF (1차에서 자료가 없을 때)
- 레퍼런스 상세 페이지 (노출 실적 5건 이상일 때)
- 문의 첨부파일 (PDF·HWP·DOCX, 10MB 이하, 관리자만 다운로드)
- AI 솔루션 데모·파일럿 모집 페이지 (자체 제품이 생겼을 때)

---

## 11. 미확정 사실 정보 (TBD)

| 항목 | 사용처 | 확보 전 처리 |
|---|---|---|
| 대표자명 | 푸터, 회사 현황, 개인정보 보호책임자 | 항목 숨김. **처리방침은 보호책임자가 정해져야 게시 가능 → 1차 오픈 차단 항목** |
| 사업자등록번호 | 푸터 | 항목 숨김 |
| 주소 | 푸터, 오시는 길, 구조화 데이터 | 오시는 길 메뉴 숨김 |
| 대표 전화 | 푸터, 문의 | 항목 숨김 |
| 대표 이메일 (office@theleadon.kr 사용 여부) | 푸터, 문의, 메일 회신 주소 | **1차 오픈 차단 항목** |
| 문의 알림 수신 주소 | Edge Function | **1차 오픈 차단 항목** |
| 설립일 | 회사 현황 | 항목 숨김 |
| 공개 가능한 실적 목록 | 레퍼런스, 홈 | 수행 역량 요약만 게시 |
| 신뢰 지표 숫자와 증빙 | 홈 | 섹션 숨김 |
| "7개 지역거점센터" 등 기존 문구가 회사 실적인지 구성원 경력인지 | 사업·조직 페이지 | 검수 전까지 게시하지 않음 |
| `transition.html`(운영전환 5단계) | 레퍼런스 `#transition` | **확인됨**: GitHub 커밋 `fdcadeb` "Remove operation transition menu and page"로 의도적으로 삭제됨. 다시 게시할지는 회사가 결정 |
| 예산 구간 | 문의 폼 | 5.6절의 기본 구간 사용 |
| 회사소개서 보유 여부 | 히어로, 푸터 | 버튼 숨김, 3차로 미룸 |
| 실제 사진 | 전 페이지 | 인물 없는 이미지 사용 |
| 대표 인사말 원고 | 회사소개 | 섹션 숨김 |

---

## 12. 유지관리

| 주기 | 작업 | 방법 |
|---|---|---|
| 상시 | 문의 확인·처리 | 메일 알림 → 관리자 화면에서 상태 변경 |
| 매일 | 사이트 재빌드 + Supabase 활동 유지 | `deploy.yml` 예약 실행 |
| 매일 | 문의 기능 헬스체크 | `healthcheck.yml`. 실패하면 GitHub 이슈 + 메일 |
| 매일 | 보관 기간 지난 문의 파기 | `pg_cron` |
| 매주 | DB 백업 | `backup.yml` → 비공개 저장소. 최근 12주분 보관 |
| 분기 | 의존성 업데이트, Lighthouse 재측정, 깨진 링크 점검, 실적·숫자 기준 시점 갱신 | 개발 측 |
| 연 1회 | 개인정보처리방침 검토, 관리자 계정 점검(퇴사자 삭제), 도메인 만료일 확인(가비아) | 회사 |

**계정 소유 원칙**: GitHub(Organization), Supabase, Cloudflare, Resend, 가비아 계정은 모두 회사 공용 메일 소유로 하고, 관리자 2명 이상이 접근할 수 있게 합니다. 접속 정보는 회사 비밀번호 관리 도구에 보관합니다.

**변경 절차**: 코드 변경은 브랜치 → Pull Request → 미리보기 확인 → main 병합(자동 배포). main 브랜치는 보호 설정합니다.

---

## 13. 위험과 대응

| 위험 | 영향 | 대응 |
|---|---|---|
| 사실 정보(TBD) 확보 지연 | 1차 오픈 지연 | 오픈 차단 항목(11장)만 우선 확보, 나머지는 숨김 처리 후 오픈 |
| 문구 검수 지연 | 일정 위험 1순위 | 개발 측이 초안 제공, 페이지 단위로 검수 |
| Supabase 무료 프로젝트 일시 정지 | 문의 폼 장애 | 매일 빌드·헬스체크로 활동 유지와 장애 감지 |
| 메일 스팸 분류 | 문의 누락 | 발송 서브도메인 SPF·DKIM, DMARC 권장. 관리자 화면에서 별도로 확인 가능 |
| 비공개 기관명 노출 | 고객 신뢰·계약 문제 | 공개용 view만 조회, 2-3의 완료 기준으로 검증 |
| Public 저장소에 비밀값 커밋 | 보안 사고 | push protection, 비밀값은 Edge Function에만 보관 |
| 개인 계정 의존 | 담당자 이탈 시 접근 불가 | 0단계에서 Organization으로 이전 |
| 무료 등급 한도 초과 | 서비스 제한 | 예상 트래픽(B2B 소규모)으로는 여유 있음. 분기 점검 시 사용량 확인 |

---

## 14. 이번 범위에서 제외
- 일반 회원가입·로그인·마이페이지 (Q5)
- 다크모드 (Q9)
- 영문 사이트 (Q25)
- 댓글, 조회수, 예약 발행 (Q13)
- 1차 문의 첨부파일 (Q12)
- GA4·네이버 애널리틱스 (광고 집행 시 재검토, Q15)
