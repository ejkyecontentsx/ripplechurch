# Supabase 간증 보드 설정

간증 저장은 Supabase `testimonies` 테이블을 사용합니다.

## 1. Supabase 프로젝트 생성

1. https://supabase.com 로그인
2. **New project** 생성
3. 프로젝트가 준비되면 **SQL Editor** 열기
4. `supabase/schema.sql` 내용 전체 실행

## 2. API 키 복사

**Project Settings → API** 에서:

| 환경변수 | 값 |
|----------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` `public` key |

## 3. 로컬 개발

프로젝트 루트에 `.env.local` 생성:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

`npm run dev` 재시작.

> Supabase 없이 로컬만 테스트할 경우, 개발 모드에서는 `data/testimonies.json`에 자동 저장됩니다.

## 4. Vercel 배포

**Vercel → Project → Settings → Environment Variables** 에 위 두 값 등록 후 **Redeploy**.

## 5. 동작 확인

```bash
curl https://ripplechurch.net/api/testimony
# storage: "supabase" 이어야 함

curl -X POST https://ripplechurch.net/api/testimony \
  -H "Content-Type: application/json" \
  -d '{"nickname":"테스트","content":"파동 테스트"}'
```

성공 시 `testimony` 객체가 반환됩니다.
