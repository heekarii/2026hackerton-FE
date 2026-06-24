# 관리자 AI 분석 API 계약

모든 프런트엔드 호출은 `VITE_API_BASE_URL`을 기준으로 합니다. 로컬 개발은 `/api` Vite 프록시를 사용하고, 배포 환경은 실제 백엔드 URL을 설정합니다.

## 현재 Swagger에 있는 API

### `GET /complaints`

관리자 통계의 원본입니다. 각 민원은 `occurred_at`, `location`, 그리고 `ai_category`, `ai_urgency`, `ai_department`, `ai_expected_days` 등 AI 분석 필드를 포함해야 합니다.

### `POST /openai/analyze`

```json
{ "text": "민원 본문" }
```

미분류 민원을 관리자 화면에서 재분석할 때 사용합니다. 응답은 분류, 긴급도, 민감도, 추천 부서, 요약, 키워드, 예상 기간, 권장 조치를 포함합니다.

### `POST /complaints`

민원 등록 API입니다. 현재 프런트는 `title`, `content`, `desired_solution`, `location_name`, `occurred_at`, `is_anonymous`를 전송합니다.

## 구현이 필요한 관리자 API

### `PUT /admin/complaints/{complaintId}/analysis`

관리자가 실행한 AI 분석 결과를 영구 저장합니다.

### `GET /admin/analytics/complaints`

대시보드 집계 API입니다. 카테고리별 건수·긴급 건수·평균 예상 처리일·주간 증감, 시간대별 건수, 위치별 건수를 반환합니다.

### `POST /admin/workflows`

담당 부서, 긴급도, 작업 단계로 워크플로우를 생성합니다.

### `PATCH /admin/workflows/{workflowId}`

워크플로우 상태와 단계 상태를 변경합니다.

### `POST /admin/repeat-limits/{userId}`

반복 등록 제한 시간을 설정합니다.

### `POST /admin/reports`

학기 또는 연말 리포트를 생성하고 다운로드 URL을 반환합니다.
