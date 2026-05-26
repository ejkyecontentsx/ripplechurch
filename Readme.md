# Ripple Church 웹사이트 개발 지시서

## 프로젝트 개요

**사이트명:** Ripple Church  
**도메인:** ripplechurch.net  
**컨셉:** 밈 종교이지만 현대인의 외로움과 SNS 피로감에 실질적인 메시지를 전달하는 사이트. 톤은 미니멀하고 약간 진지한 듯 유머러스하게.

---

## 기술 스택

- **프레임워크:** Next.js 14 (App Router)
- **스타일링:** Tailwind CSS
- **DB:** Supabase (간증 보드 데이터)
- **배포:** Vercel
- **주요 라이브러리:**
  - `html2canvas` — 입교 증명 카드 이미지 변환
  - `@supabase/supabase-js` — Supabase 클라이언트

---

## 루트 파일 위치

아래 파일은 이미 루트에 존재함. 반드시 다음 경로로 이동시킬 것:

- `logo.svg` → `/public/logo.svg`
- `경전.pdf` → `/public/경전.pdf`

---

## 디자인 시스템

| 항목 | 값 |
|------|----|
| 배경 | `#ffffff` |
| 텍스트 기본 | `#1a1a2e` |
| 포인트 컬러 | `#4a90d9` |
| 보조 텍스트 | `#666666` |
| 한국어 폰트 | Pretendard (Google Fonts 또는 CDN) |
| 영문 폰트 | 시스템 sans-serif |
| 반응형 | 모바일 우선 |

**애니메이션:**  
메인 페이지 로고의 동심원에 CSS `@keyframes` 로 천천히 퍼져나가는 ripple 애니메이션 적용. 루프. 각 원마다 delay를 다르게 줘서 순차적으로 퍼지는 효과.

---

## 페이지 구성

### 1. 메인 (`/`)

- 로고(`/public/logo.svg`) 중앙 배치, 페이드인 애니메이션
- 로고 동심원에 ripple CSS 애니메이션 적용
- 메인 카피: `"인간은 파동을 방출하고 감지한다"`
- 서브 카피: `"선한 파동을 만들어라"`
- CTA 버튼 2개:
  - `경전 읽기` → `/scripture`
  - `입교하기` → `/join`
- 네비게이션: 로고 / 경전 / 입교 / 간증 / 소개

---

### 2. 경전 (`/scripture`)

- 페이지 상단: 제목 `파동의 서 — Book of Waves`
- 십계명 전문을 섹션으로 표시:

```
제 1계 — 인간은 파동을 방출하고 감지한다
제 2계 — 네 생각은 네 안에 머물지 않는다
제 3계 — 생각부터 맑게 하라. 선한 삶은 도덕이 아니라 위생이다
제 4계 — 육감을 믿어라. 그것은 아직 측정되지 않은 감각이다
제 5계 — 전자기기를 경계하라. 그것은 파동을 왜곡한다
제 6계 — 몸을 자연으로 채워라. 정크로 가득 찬 몸은 파동을 왜곡한다
제 7계 — 하루 한 번 내면의 소리에 귀를 기울여라
제 8계 — 파동 없는 관계를 경계하라
제 9계 — 파동은 돌아온다
제 10계 — 선한 파동을 만들어라
```

- 각 계명은 카드 또는 섹션으로 구분. 계명 번호는 포인트 컬러(`#4a90d9`)로 크게, 본문은 읽기 좋은 크기
- 페이지 하단에 PDF 다운로드 버튼: `경전 전문 다운로드 (PDF)` → `/public/경전.pdf` 링크

---

### 3. 입교 (`/join`)

**흐름:**

1. 페이지 진입 시 입교 선언문 전문 표시:

```
나는 오늘부터 Ripple Church의 신자다.

나는 인간이 파동을 방출하고 감지하는 존재임을 믿는다.
나는 내 생각이 이미 새어나가고 있음을 안다.
나는 생각부터 맑게 하려 노력할 것이다.
나는 육감을 무시하지 않겠다.
나는 하루 한 번, 화면 없이 내 안의 소리를 듣겠다.
나는 파동 없는 관계에 내 감정을 낭비하지 않겠다.
나는 선한 파동을 만들 것이다.
```

2. 이름 입력 필드 (선택사항, placeholder: `당신의 이름 (선택사항)`)
3. 버튼: `파동을 보내다`
4. 클릭 시 → 입교 증명 카드 생성 및 표시

**입교 증명 카드 디자인:**

- 카드 크기: 가로 600px, 세로 340px (16:9 비율)
- 배경: `#1a1a2e` (다크)
- 상단: 로고 SVG (흰색 버전) + `RIPPLE CHURCH`
- 중앙: `나는 Ripple Church의 신자다`
- 이름 있을 경우: 이름 표시
- 하단: 입교일 (오늘 날짜) + `ripplechurch.net`
- 포인트 컬러 `#4a90d9` 로 동심원 장식 (작게)

**카드 하단 버튼 2개:**

- `이미지로 저장` — `html2canvas` 로 카드를 PNG 다운로드
- `공유하기` — Web Share API (`navigator.share`). 미지원 브라우저는 버튼 숨김 처리

**헌금 안내 (카드 아래 작은 텍스트):**

```
헌금은 XRP로 받습니다.
(농담입니다. 파동은 무료입니다.)
```

---

### 4. 간증 보드 (`/testimony`)

**Supabase 테이블 설계:**

```sql
create table testimonies (
  id uuid default gen_random_uuid() primary key,
  nickname text not null,
  content text not null,
  waves integer default 0,
  created_at timestamp with time zone default now()
);
```

**페이지 구성:**

**상단 — 간증 작성 폼:**
- 닉네임 입력 (필수, 최대 20자)
- 간증 내용 textarea (필수, 최대 200자, 글자수 카운터 표시)
- 버튼: `파동 보내기`
- 제출 후 목록 즉시 갱신 (optimistic update)

**하단 — 간증 카드 그리드:**
- 최신순 정렬
- 카드 구성: 닉네임 / 간증 내용 / 날짜 / "공감 파동 보내기 ⚡" 버튼
- "공감 파동 보내기" 클릭 시 해당 testimony의 `waves` +1 (중복 방지는 localStorage로 간단히 처리)
- 카드 그리드: 모바일 1열, 태블릿 2열, 데스크탑 3열

**Next.js API Route:**
- `POST /api/testimony` — 간증 저장
- `GET /api/testimony` — 간증 목록 조회
- `PATCH /api/testimony/[id]/wave` — 공감 파동 +1

---

### 5. 소개 (`/about`)

- Ripple Church가 무엇인지 한 페이지 설명
- 섹션 순서:
  1. **우리는 무엇인가** — 밈 종교이지만 진짜 위로를 전달하는 공동체
  2. **파동이란** — 창세기 내용 요약 (뇌에서 발생하는 미지의 웨이브, 육감, 파동의 실재)
  3. **왜 지금인가** — SNS 시대, 파동 없는 관계의 문제
  4. **우리의 믿음** — 십계명 요약 나열
- 푸터: `© Ripple Church. 파동은 무료입니다.`

---

## 공통 컴포넌트

- `<Navbar />` — 로고 + 메뉴 (경전 / 입교 / 간증 / 소개). 모바일 햄버거 메뉴
- `<Footer />` — `© Ripple Church. 파동은 무료입니다.`
- `<RippleLogo />` — SVG 로고 + ripple CSS 애니메이션 래퍼

---

## 환경변수 (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 배포

- Vercel에 연결, `main` 브랜치 자동 배포
- 환경변수 Vercel 대시보드에 동일하게 등록
- 커스텀 도메인 `ripplechurch.net` 연결

---

## 주의사항

- 모든 페이지 한국어 기준. 영문 병기는 브랜드명(`RIPPLE CHURCH`, `Book of Waves`)만
- 입교 카드의 로고는 다크 배경에 맞게 흰색으로 처리할 것 (SVG `fill` 색상 변경)
- `html2canvas` 는 한글 폰트 렌더링 이슈가 있을 수 있음. 카드 내부 폰트를 웹폰트 로딩 완료 후 캡처하도록 처리
- Supabase RLS(Row Level Security) 설정: 읽기는 전체 허용, 쓰기는 anon 허용 (스팸 필터링은 추후 추가)