import {z} from "zod";

/** 한국 이름 검증 (한글, 영문, 공백 허용, 1-50자) */
const nameRegex = /^[가-힣a-zA-Z\s]{1,50}$/;

/** 사용자 ID 검증 (숫자 문자열) */
const userIdRegex = /^\d+$/;

/** 학생 ID 검증 (STU_로 시작하는 문자열) */
const studentIdRegex = /^STU_\d+$/;

// 학생 생성 요청 스키마
export const CreateStudentSchema = z.object({
  user_id: z.string().regex(userIdRegex, {message: "User ID must be a numeric string"}),
  student_name: z.string()
    .min(1, {message: "Student name must be at least 1 character"})
    .max(50, {message: "Student name must be at most 50 characters"})
    .regex(nameRegex, {message: "Student name can only contain Korean, English letters and spaces"}),
  student_target_univ: z.string()
    .max(100, {message: "Target university must be at most 100 characters"})
    .optional(),
  student_photo: z.string().url({message: "Student photo must be a valid URL"}).optional(),
  student_age: z.string()
    .max(10, {message: "Student age must be at most 10 characters"})
    .optional(),
  student_schoolname: z.string()
    .max(100, {message: "School name must be at most 100 characters"})
    .optional(),
});

// 학생 업데이트 요청 스키마
export const UpdateStudentSchema = z.object({
  student_name: z.string()
    .min(1, {message: "Student name must be at least 1 character"})
    .max(50, {message: "Student name must be at most 50 characters"})
    .regex(nameRegex, {message: "Student name can only contain Korean, English letters and spaces"})
    .optional(),
  student_target_univ: z.string()
    .max(100, {message: "Target university must be at most 100 characters"})
    .optional(),
  student_photo: z.string().url({message: "Student photo must be a valid URL"}).optional(),
  student_age: z.string()
    .max(10, {message: "Student age must be at most 10 characters"})
    .optional(),
  student_schoolname: z.string()
    .max(100, {message: "School name must be at most 100 characters"})
    .optional(),
});

// 학생 ID 파라미터 검증 스키마
export const StudentIdParamSchema = z.object({
  studentId: z.string().regex(studentIdRegex, {message: "Student ID must start with STU_"}),
});

// 학생 조회 필터 스키마
export const StudentFilterSchema = z.object({
  student_name: z.string()
    .min(1, {message: "Student name search query must be at least 1 character"})
    .max(50, {message: "Student name search query must be at most 50 characters"})
    .optional(),
  student_target_univ: z.string()
    .max(100, {message: "Target university must be at most 100 characters"})
    .optional(),
  student_schoolname: z.string()
    .max(100, {message: "School name must be at most 100 characters"})
    .optional(),
  user_id: z.string().regex(userIdRegex, {message: "User ID must be a numeric string"}).optional(),
});

// 부모-학생 관계 생성 스키마
export const CreateParentStudentSchema = z.object({
  parent_id: z.string().regex(userIdRegex, {message: "Parent ID must be a numeric string"}),
  student_id: z.string().regex(studentIdRegex, {message: "Student ID must start with STU_"}),
});

// 부모 ID 파라미터 검증 스키마
export const ParentIdParamSchema = z.object({
  parentId: z.string().regex(userIdRegex, {message: "Parent ID must be a numeric string"}),
});
