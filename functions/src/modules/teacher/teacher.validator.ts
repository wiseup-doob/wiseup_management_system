import {z} from "zod";

/** 선생님 ID 검증 (숫자 문자열) */
const teacherIdRegex = /^\d+$/;

/** 이름 검증 (한글, 영문, 공백 허용, 2-50자) */
const nameRegex = /^[가-힣a-zA-Z\s]{2,50}$/;

/** 사용자 ID 검증 (숫자 문자열) */
const userIdRegex = /^\d+$/;

/** 클래스 ID 검증 (숫자 문자열) */
const classIdRegex = /^\d+$/;

// 선생님 과목 ENUM (ERD에 맞게 정의)
const TeacherSubjectEnum = z.enum([
  "MATH",
  "ENGLISH",
  "KOREAN",
  "SCIENCE",
  "SOCIAL_STUDIES",
  "PHYSICAL_EDUCATION",
  "ART",
  "MUSIC",
  "TECHNOLOGY",
  "OTHER",
]);

// 기본 선생님 스키마
export const TeacherSchema = z.object({
  teacher_id: z.string().regex(teacherIdRegex, {message: "Teacher ID must be a numeric string"}),
  user_id: z.string().regex(userIdRegex, {message: "User ID must be a numeric string"}),
  class_id: z.string().regex(classIdRegex, {message: "Class ID must be a numeric string"}),
  teacher_name: z.string()
    .min(2, {message: "Name must be at least 2 characters"})
    .max(50, {message: "Name must be at most 50 characters"})
    .regex(nameRegex, {message: "Name can only contain Korean, English letters and spaces"}),
  teacher_subject: TeacherSubjectEnum,
});

// 선생님 생성 요청 스키마
export const CreateTeacherSchema = z.object({
  user_id: z.string()
    .regex(userIdRegex, {message: "User ID must be a numeric string"})
    .min(1, {message: "User ID is required"}),
  class_id: z.string()
    .regex(classIdRegex, {message: "Class ID must be a numeric string"})
    .min(1, {message: "Class ID is required"}),
  teacher_name: z.string()
    .min(2, {message: "Name must be at least 2 characters"})
    .max(50, {message: "Name must be at most 50 characters"})
    .regex(nameRegex, {message: "Name can only contain Korean, English letters and spaces"}),
  teacher_subject: TeacherSubjectEnum,
});

// 선생님 업데이트 요청 스키마
export const UpdateTeacherSchema = z.object({
  class_id: z.string()
    .regex(classIdRegex, {message: "Class ID must be a numeric string"})
    .optional(),
  teacher_name: z.string()
    .min(2, {message: "Name must be at least 2 characters"})
    .max(50, {message: "Name must be at most 50 characters"})
    .regex(nameRegex, {message: "Name can only contain Korean, English letters and spaces"})
    .optional(),
  teacher_subject: TeacherSubjectEnum.optional(),
});

// 선생님 조회 필터 스키마
export const TeacherFilterSchema = z.object({
  user_id: z.string()
    .regex(userIdRegex, {message: "User ID must be a numeric string"})
    .optional(),
  class_id: z.string()
    .regex(classIdRegex, {message: "Class ID must be a numeric string"})
    .optional(),
  teacher_name: z.string()
    .min(1, {message: "Name search query must be at least 1 character"})
    .max(50, {message: "Name search query must be at most 50 characters"})
    .optional(),
  teacher_subject: TeacherSubjectEnum.optional(),
});

// 선생님 ID 파라미터 검증 스키마
export const TeacherIdParamSchema = z.object({
  id: z.string().regex(teacherIdRegex, {message: "Teacher ID must be a numeric string"}),
});
