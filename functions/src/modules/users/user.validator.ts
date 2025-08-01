import {z} from "zod";

/** 이메일 형식 검증 */
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** 한국 전화번호 형식 검증 (010-1234-5678, 010-123-4567, 02-123-4567 등) */
const phoneRegex = /^(010|011|016|017|018|019)-\d{3,4}-\d{4}$|^(02|0[3-9]\d)-\d{3,4}-\d{4}$/;

/** 비밀번호 강도 검증 (최소 8자, 영문+숫자+특수문자 조합) */
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/** 사용자 ID 검증 (숫자 문자열) */
const userIdRegex = /^\d+$/;

/** 이름 검증 (한글, 영문, 공백 허용, 2-50자) */
const nameRegex = /^[가-힣a-zA-Z\s]{2,50}$/;

// 기본 사용자 스키마
export const UserSchema = z.object({
  user_id: z.string().regex(userIdRegex, {message: "User ID must be a numeric string"}),
  user_name: z.string()
    .min(2, {message: "Name must be at least 2 characters"})
    .max(50, {message: "Name must be at most 50 characters"})
    .regex(nameRegex, {message: "Name can only contain Korean, English letters and spaces"}),
  user_phone: z.string()
    .regex(phoneRegex, {message: "Phone number must be in Korean format (e.g., 010-1234-5678)"}),
  user_email: z.string()
    .email({message: "Invalid email format"})
    .regex(emailRegex, {message: "Email format is not valid"})
    .toLowerCase(),
  user_password_hash: z.string().min(1, {message: "Password hash is required"}),
  user_status: z.enum(["active", "inactive"], {message: "Status must be either active or inactive"}),
});

// 사용자 생성 요청 스키마 (회원가입)
export const CreateUserSchema = z.object({
  user_name: z.string()
    .min(2, {message: "Name must be at least 2 characters"})
    .max(50, {message: "Name must be at most 50 characters"})
    .regex(nameRegex, {message: "Name can only contain Korean, English letters and spaces"}),
  user_phone: z.string()
    .regex(phoneRegex, {message: "Phone number must be in Korean format (e.g., 010-1234-5678)"}),
  user_email: z.string()
    .email({message: "Invalid email format"})
    .regex(emailRegex, {message: "Email format is not valid"})
    .toLowerCase(),
  password: z.string()
    .min(8, {message: "Password must be at least 8 characters"})
    .max(100, {message: "Password must be at most 100 characters"})
    .regex(passwordRegex, {
      message: "Password must contain at least one letter, one number, and one special character (@$!%*?&)",
    }),
  user_status: z.enum(["active", "inactive"]).optional().default("active"),
});

// 사용자 업데이트 요청 스키마 (비밀번호 제외)
export const UpdateUserSchema = z.object({
  user_name: z.string()
    .min(2, {message: "Name must be at least 2 characters"})
    .max(50, {message: "Name must be at most 50 characters"})
    .regex(nameRegex, {message: "Name can only contain Korean, English letters and spaces"})
    .optional(),
  user_phone: z.string()
    .regex(phoneRegex, {message: "Phone number must be in Korean format (e.g., 010-1234-5678)"})
    .optional(),
  user_email: z.string()
    .email({message: "Invalid email format"})
    .regex(emailRegex, {message: "Email format is not valid"})
    .toLowerCase()
    .optional(),
  user_status: z.enum(["active", "inactive"]).optional(),
});

// 사용자 조회 필터 스키마
export const UserFilterSchema = z.object({
  user_status: z.enum(["active", "inactive"]).optional(),
  user_email: z.string()
    .email({message: "Invalid email format"})
    .toLowerCase()
    .optional(),
  user_phone: z.string()
    .regex(phoneRegex, {message: "Phone number must be in Korean format"})
    .optional(),
  user_name: z.string()
    .min(1, {message: "Name search query must be at least 1 character"})
    .max(50, {message: "Name search query must be at most 50 characters"})
    .optional(),
});

// 사용자 ID 파라미터 검증 스키마
export const UserIdParamSchema = z.object({
  id: z.string().regex(userIdRegex, {message: "User ID must be a numeric string"}),
});
