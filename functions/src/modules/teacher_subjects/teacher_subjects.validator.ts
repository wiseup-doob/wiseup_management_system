import {z} from "zod";

/** 선생님 ID 검증 (숫자 문자열) */
const teacherIdRegex = /^\d+$/;

/** 과목 ID 검증 (숫자 문자열) */
const subjectIdRegex = /^\d+$/;

// 선생님-과목 관계 스키마
export const TeacherSubjectSchema = z.object({
  teacher_id: z.string().regex(teacherIdRegex, {message: "Teacher ID must be a numeric string"}),
  subject_id: z.string().regex(subjectIdRegex, {message: "Subject ID must be a numeric string"}),
  is_primary: z.boolean().default(false),
});

// 선생님-과목 관계 생성 요청 스키마
export const CreateTeacherSubjectSchema = z.object({
  teacher_id: z.string()
    .regex(teacherIdRegex, {message: "Teacher ID must be a numeric string"})
    .min(1, {message: "Teacher ID is required"}),
  subject_id: z.string()
    .regex(subjectIdRegex, {message: "Subject ID must be a numeric string"})
    .min(1, {message: "Subject ID is required"}),
  is_primary: z.boolean().optional().default(false),
});

// 선생님-과목 관계 업데이트 요청 스키마
export const UpdateTeacherSubjectSchema = z.object({
  is_primary: z.boolean().optional(),
});

// 선생님-과목 관계 조회 필터 스키마
export const TeacherSubjectFilterSchema = z.object({
  teacher_id: z.string()
    .regex(teacherIdRegex, {message: "Teacher ID must be a numeric string"})
    .optional(),
  subject_id: z.string()
    .regex(subjectIdRegex, {message: "Subject ID must be a numeric string"})
    .optional(),
  is_primary: z.boolean().optional(),
});

// 선생님-과목 관계 ID 파라미터 검증 스키마
export const TeacherSubjectIdParamSchema = z.object({
  teacherId: z.string().regex(teacherIdRegex, {message: "Teacher ID must be a numeric string"}),
  subjectId: z.string().regex(subjectIdRegex, {message: "Subject ID must be a numeric string"}),
});
