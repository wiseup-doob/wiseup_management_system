import { PublicUser } from '../users/user.types'

// 로그인 요청 타입
export interface LoginRequest {
  email: string;
  password: string;
}

// 회원가입 요청 타입
export interface RegisterRequest {
  name: string;
  phone: string;
  email: string;
  password: string;
  status?: 'active' | 'inactive';
}

// 로그인 응답 타입
export interface LoginResponse {
  user: PublicUser;        // Users 모듈의 타입 재사용
  token?: string;          // JWT 토큰 (추후 구현)
  refreshToken?: string;   // 리프레시 토큰 (추후 구현)
}

// 비밀번호 변경 요청 타입
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// 비밀번호 재설정 요청 타입
export interface ResetPasswordRequest {
  email: string;
}

// 비밀번호 재설정 확인 타입
export interface ConfirmResetPasswordRequest {
  token: string;
  newPassword: string;
}

// 토큰 검증 응답 타입
export interface TokenVerifyResponse {
  valid: boolean;
  user?: {
    user_id: string;
    email: string;
    status: 'active' | 'inactive';
  };
  expired?: boolean;
}

// JWT 페이로드 타입
export interface JWTPayload {
  user_id: string;
  email: string;
  status: 'active' | 'inactive';
  iat?: number;  // issued at
  exp?: number;  // expires at
}

// 인증 세션 타입
export interface AuthSession {
  user_id: string;
  email: string;
  loginAt: FirebaseFirestore.Timestamp;
  lastActiveAt: FirebaseFirestore.Timestamp;
  ipAddress?: string;
  userAgent?: string;
} 