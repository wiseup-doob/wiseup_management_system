import {z} from "zod";

/** 반 ID 검증 (숫자 문자열) */
const classIdRegex = /^\d+$/;

/** 학생 ID 검증 (숫자 문자열) */
const studentIdRegex = /^\d+$/;

// 반-학생 상태 enum
const ClassStudentStatusEnum = z.enum(["active", "inactive", "graduated", "transferred"]);

// 반-학생 관계 스키마
export const ClassStudentSchema = z.object({
  class_id: z.string().regex(classIdRegex, {message: "Class ID must be a numeric string"}),
  student_id: z.string().regex(studentIdRegex, {message: "Student ID must be a numeric string"}),
  enrollment_date: z.date(),
  status: ClassStudentStatusEnum.default("active"),
});

// 반-학생 관계 생성 요청 스키마
export const CreateClassStudentSchema = z.object({
  class_id: z.string()
    .regex(classIdRegex, {message: "Class ID must be a numeric string"})
    .min(1, {message: "Class ID is required"}),
  student_id: z.string()
    .regex(studentIdRegex, {message: "Student ID must be a numeric string"})
    .min(1, {message: "Student ID is required"}),
  enrollment_date: z.date().optional().default(() => new Date()),
  status: ClassStudentStatusEnum.optional().default("active"),
});

// 반-학생 관계 업데이트 요청 스키마
export const UpdateClassStudentSchema = z.object({
  enrollment_date: z.date().optional(),
  status: ClassStudentStatusEnum.optional(),
});

// 반-학생 관계 조회 필터 스키마
export const ClassStudentFilterSchema = z.object({
  class_id: z.string()
    .regex(classIdRegex, {message: "Class ID must be a numeric string"})
    .optional(),
  student_id: z.string()
    .regex(studentIdRegex, {message: "Student ID must be a numeric string"})
    .optional(),
  status: ClassStudentStatusEnum.optional(),
  enrollment_date_from: z.date().optional(),
  enrollment_date_to: z.date().optional(),
});

// 반-학생 관계 ID 파라미터 검증 스키마
export const ClassStudentIdParamSchema = z.object({
  classId: z.string().regex(classIdRegex, {message: "Class ID must be a numeric string"}),
  studentId: z.string().regex(studentIdRegex, {message: "Student ID must be a numeric string"}),
});

export {
  ClassStudentStatusEnum,
};
