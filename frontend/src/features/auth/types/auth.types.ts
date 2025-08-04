export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'teacher' | 'student'
  avatar?: string
  lastLoginAt?: Date
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

export interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  lastLoginAt: Date | null
}

export interface AuthAction {
  type: string
  payload?: any
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role: 'teacher' | 'student'
}

export interface PasswordResetRequest {
  email: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
} 