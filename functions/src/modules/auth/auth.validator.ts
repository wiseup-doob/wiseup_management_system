import { z } from 'zod'

/** 이메일 형식 검증 */
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

/** 한국 전화번호 형식 검증 (010-1234-5678, 010-123-4567, 02-123-4567 등) */
const phoneRegex = /^(010|011|016|017|018|019)-\d{3,4}-\d{4}$|^(02|0[3-9]\d)-\d{3,4}-\d{4}$/

/** 비밀번호 강도 검증 (최소 8자, 영문+숫자+특수문자 조합) */
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/

/** 사용자 ID 검증 (숫자 문자열) */
const userIdRegex = /^\d+$/

/** 이름 검증 (한글, 영문, 공백 허용, 2-50자) */
const nameRegex = /^[가-힣a-zA-Z\s]{2,50}$/

// 회원가입 요청 스키마
export const RegisterSchema = z.object({
  name: z.string()
    .min(2, { message: 'Name must be at least 2 characters' })
    .max(50, { message: 'Name must be at most 50 characters' })
    .regex(nameRegex, { message: 'Name can only contain Korean, English letters and spaces' }),
  phone: z.string()
    .regex(phoneRegex, { message: 'Phone number must be in Korean format (e.g., 010-1234-5678)' }),
  email: z.string()
    .email({ message: 'Invalid email format' })
    .regex(emailRegex, { message: 'Email format is not valid' })
    .toLowerCase(),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters' })
    .max(100, { message: 'Password must be at most 100 characters' })
    .regex(passwordRegex, { 
      message: 'Password must contain at least one letter, one number, and one special character (@$!%*?&)' 
    }),
  status: z.enum(['active', 'inactive']).optional().default('active')
})

// 로그인 요청 스키마
export const LoginSchema = z.object({
  email: z.string()
    .email({ message: 'Invalid email format' })
    .regex(emailRegex, { message: 'Email format is not valid' })
    .toLowerCase(),
  password: z.string()
    .min(1, { message: 'Password is required' })
    .max(100, { message: 'Password is too long' })
})

// 비밀번호 변경 스키마
export const ChangePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, { message: 'Current password is required' }),
  newPassword: z.string()
    .min(8, { message: 'New password must be at least 8 characters' })
    .max(100, { message: 'New password must be at most 100 characters' })
    .regex(passwordRegex, { 
      message: 'New password must contain at least one letter, one number, and one special character (@$!%*?&)' 
    })
}).refine(({ currentPassword, newPassword }) => currentPassword !== newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword']
})

// 비밀번호 재설정 요청 스키마
export const ResetPasswordSchema = z.object({
  email: z.string()
    .email({ message: 'Invalid email format' })
    .regex(emailRegex, { message: 'Email format is not valid' })
    .toLowerCase()
})

// 비밀번호 재설정 확인 스키마
export const ConfirmResetPasswordSchema = z.object({
  token: z.string()
    .min(1, { message: 'Reset token is required' }),
  newPassword: z.string()
    .min(8, { message: 'New password must be at least 8 characters' })
    .max(100, { message: 'New password must be at most 100 characters' })
    .regex(passwordRegex, { 
      message: 'New password must contain at least one letter, one number, and one special character (@$!%*?&)' 
    })
})

// 사용자 ID 파라미터 검증 스키마 (인증용)
export const UserIdParamSchema = z.object({
  id: z.string().regex(userIdRegex, { message: 'User ID must be a numeric string' })
})

// JWT 토큰 스키마
export const TokenSchema = z.object({
  token: z.string().min(1, { message: 'Token is required' })
}) 