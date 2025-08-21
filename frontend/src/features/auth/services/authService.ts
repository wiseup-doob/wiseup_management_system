import type { 
  LoginCredentials, 
  AuthResponse, 
  User, 
  RegisterRequest, 
  PasswordResetRequest,
  ChangePasswordRequest 
} from '../types/auth.types'
import { config } from '../../../config/environment';

// Firebase Functions API 서비스
const FIREBASE_FUNCTIONS_BASE_URL = config.api.baseURL;

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

class AuthService {
  private baseUrl: string

  constructor() {
    this.baseUrl = FIREBASE_FUNCTIONS_BASE_URL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }

      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      if (options.headers) {
        Object.assign(headers, options.headers)
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers,
        ...options,
      })

      if (!response.ok) {
        if (response.status === 401) {
          // 토큰이 만료된 경우 자동 로그아웃
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.')
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Auth API request failed:', error)
      return {
        success: false,
        message: '인증 요청 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // 로그인
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || '로그인에 실패했습니다.')
    }

    return response.data
  }

  // 회원가입
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || '회원가입에 실패했습니다.')
    }

    return response.data
  }

  // 로그아웃
  async logout(): Promise<void> {
    await this.request<void>('/logout', {
      method: 'POST'
    })
  }

  // 토큰 갱신
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      throw new Error('리프레시 토큰이 없습니다.')
    }

    const response = await this.request<AuthResponse>('/refreshToken', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || '토큰 갱신에 실패했습니다.')
    }

    return response.data
  }

  // 현재 사용자 정보 조회
  async getCurrentUser(): Promise<User> {
    const response = await this.request<User>('/getCurrentUser', {
      method: 'GET'
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || '사용자 정보 조회에 실패했습니다.')
    }

    return response.data
  }

  // 비밀번호 재설정 요청
  async requestPasswordReset(email: string): Promise<void> {
    const response = await this.request<void>('/password-reset', {
      method: 'POST',
      body: JSON.stringify({ email })
    })

    if (!response.success) {
      throw new Error(response.error || '비밀번호 재설정 요청에 실패했습니다.')
    }
  }

  // 비밀번호 변경
  async changePassword(passwordData: ChangePasswordRequest): Promise<void> {
    const response = await this.request<void>('/change-password', {
      method: 'POST',
      body: JSON.stringify(passwordData)
    })

    if (!response.success) {
      throw new Error(response.error || '비밀번호 변경에 실패했습니다.')
    }
  }

  // 사용자 프로필 업데이트
  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await this.request<User>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    })

    if (!response.success || !response.data) {
      throw new Error(response.error || '프로필 업데이트에 실패했습니다.')
    }

    return response.data
  }

  // 토큰 유효성 검사
  isTokenValid(): boolean {
    const token = localStorage.getItem('token')
    if (!token) return false

    try {
      // JWT 토큰의 만료 시간 확인 (실제로는 서버에서 검증)
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      
      return payload.exp > currentTime
    } catch {
      return false
    }
  }

  // 자동 로그인 시도
  async tryAutoLogin(): Promise<User | null> {
    if (!this.isTokenValid()) {
      return null
    }

    try {
      return await this.getCurrentUser()
    } catch {
      return null
    }
  }
}

export const authService = new AuthService() 