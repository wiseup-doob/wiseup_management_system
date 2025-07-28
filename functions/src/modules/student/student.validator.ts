import { z } from 'zod'

// user_id 정규식 (users 모듈과 동일)
const userIdRegex = /^\d{13}$/

export const StudentSchema = z.object({
  user_id: z.string().regex(userIdRegex, "user_id는 13자리 숫자여야 합니다"),
  name: z.string().min(1),
  school: z.string().min(1),
  grade: z.number().int().min(1).max(3).optional(),
  phoneNumber: z.string().optional(),
  targetUniversity: z.string().optional()  // 🔧 오타 수정
})

export const StudentFilterSchema = z.object({
  user_id: z.string().regex(userIdRegex).optional(),
  name: z.string().optional(),
  school: z.string().optional(),
  grade: z.number().int().min(1).max(3).optional()
})