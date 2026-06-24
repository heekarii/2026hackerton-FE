import { ApiError } from './api-error'
import { mockApiRequest, shouldUseMockApi } from './mock-api'

export { ApiError } from './api-error'

type ErrorPayload = {
  detail?: string | Array<{ msg?: string }>
  message?: string
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') return fallback

  const { detail, message } = payload as ErrorPayload

  if (typeof message === 'string') return message
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) return detail[0]?.msg ?? fallback

  return fallback
}

function getRequestUrl(path: string) {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '')

  if (!baseUrl) {
    throw new ApiError(
      'API 서버 주소가 설정되지 않았습니다. .env.local에 VITE_API_BASE_URL을 입력해 주세요.',
      0,
    )
  }

  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (shouldUseMockApi()) {
    return mockApiRequest<T>(path, options)
  }

  let response: Response

  try {
    response = await fetch(getRequestUrl(path), {
      ...options,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...options.headers,
      },
    })
  } catch (error) {
    if (error instanceof ApiError) throw error

    throw new ApiError('서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.', 0)
  }

  const responseText = await response.text()
  const payload: unknown = responseText ? JSON.parse(responseText) : undefined

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(payload, '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.'),
      response.status,
    )
  }

  return payload as T
}
