export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'teacher' | 'student'
  avatar?: string
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
  expiresIn: number
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  role: 'teacher' | 'student'
}

export interface AuthError {
  code: string
  message: string
}

export interface TokenPayload {
  userId: string
  email: string
  role: string
  iat: number
  exp: number
} 