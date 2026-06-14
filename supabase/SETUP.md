# Supabase 간증·주간 파동·신도 설정

간증(`testimonies`), 주간 파동(`weekly_waves`), 신도(`members`)는 Supabase를 사용합니다.

## 1. Supabase 프로젝트 생성

1. https://supabase.com 로그인
2. **New project** 생성
3. 프로젝트가 준비되면 **SQL Editor** 열기
4. `supabase/schema.sql` 내용 전체 실행

## 2. API 키 복사

**Project Settings → API** 에서:

| 환경변수 | 값 | 용도 |
|----------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | 읽기/쓰기 공통 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key | 간증·주간 파동·신도 읽기/등록 |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key | **주간 파동 등록만** (서버 전용) |
| `WEEKLY_WAVE_ADMIN_SECRET` | 직접 생성한 비밀 문자열 | `/weekly/compose` 작성 인증 |

> `service_role` 키와 `WEEKLY_WAVE_ADMIN_SECRET`은 절대 클라이언트에 노출하지 마세요.

## 3. 로컬 개발

프로젝트 루트에 `.env.local` 생성:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
WEEKLY_WAVE_ADMIN_SECRET=your-secret-here
```

`npm run dev` 재시작.

> Supabase 없이 로컬만 테스트할 경우, 개발 모드에서는 `data/testimonies.json`, `data/weekly-waves.json`, `data/members.json`에 자동 저장됩니다.

## 4. Vercel 배포

**Vercel → Project → Settings → Environment Variables** 에 위 값들을 등록 후 **Redeploy**.

## 5. 동작 확인

### 간증 (신자 보드)

```bash
curl https://ripplechurch.net/api/testimony
```

### 신도 수 / 입교

```bash
curl https://ripplechurch.net/api/member
```

```bash
curl -X POST https://ripplechurch.net/api/member \
  -H "Content-Type: application/json" \
  -d '{"locale":"ko","joined_at":"2026-05-26T12:00:00.000Z","name":"파동","declaration":"나는 Ripple Church의 신자다"}'
```

### 주간 파동 (파동 송신자 보드)

```bash
curl https://ripplechurch.net/api/weekly-wave
```

### 주간 파동 등록

브라우저에서 `https://ripplechurch.net/ko/weekly/compose` 접속 후 관리자 비밀키로 작성하거나:

```bash
curl -X POST https://ripplechurch.net/api/weekly-wave \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: your-secret-here" \
  -d '{
    "slug": "2026-05-26",
    "published_at": "2026-05-26",
    "title_ko": "첫 주간 파동",
    "content_ko": "파동 송신자의 첫 메시지입니다.",
    "title_en": "First Weekly Wave",
    "content_en": "The Wave Sender'\''s first message.",
    "title_ja": "最初の週間の波動",
    "content_ja": "波動送信者の最初のメッセージです。"
  }'
```
