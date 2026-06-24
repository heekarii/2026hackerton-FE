# Campus Voice Frontend

캠퍼스 민원 분석 플랫폼의 프론트엔드입니다.

## 시작하기

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

`.env.local`에 FastAPI 서버 주소를 입력합니다.

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_LOGIN_ENDPOINT=/auth/login
```

로그인 API는 `POST /auth/login`을 기본값으로 사용합니다. FastAPI Swagger의 실제 인증 경로가 다르면 `VITE_LOGIN_ENDPOINT`만 수정하면 됩니다.
