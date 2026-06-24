const ACCESS_TOKEN_KEY = 'campus-complaints.access-token'
const AUTH_USER_KEY = 'campus-complaints.auth-user'

export type AuthUser = {
  id?: number
  name?: string
  nickname?: string
  email: string
  department?: string | null
  student_id?: string | null
  role?: string
}

export function saveAccessToken(accessToken: string) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
}

export function saveAuthUser(user: AuthUser) {
  sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

export function getAuthUser(): AuthUser | null {
  const serializedUser = sessionStorage.getItem(AUTH_USER_KEY)
  if (!serializedUser) return null

  try {
    return JSON.parse(serializedUser) as AuthUser
  } catch {
    sessionStorage.removeItem(AUTH_USER_KEY)
    return null
  }
}

export function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

export function clearAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(AUTH_USER_KEY)
}
