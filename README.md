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
VITE_API_BASE_URL=https://two026hackerton-be.onrender.com
VITE_OPENAPI_URL=https://two026hackerton-be.onrender.com/openapi.json
```

현재 Swagger에는 `GET /`와 `GET /health`만 등록되어 있습니다. 백엔드에서 JWT 로그인 API를 Swagger에 등록한 뒤 아래처럼 실제 경로를 추가하세요.

```bash
VITE_LOGIN_ENDPOINT=/auth/login
```

학교 이메일 인증 회원가입에는 아래 API 경로도 필요합니다.

```bash
VITE_SIGNUP_SEND_CODE_ENDPOINT=/auth/email-verification/send
VITE_SIGNUP_VERIFY_CODE_ENDPOINT=/auth/email-verification/verify
VITE_SIGNUP_ENDPOINT=/auth/signup
```
