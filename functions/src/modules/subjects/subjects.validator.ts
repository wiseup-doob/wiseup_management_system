import {z} from "zod";

/** 과목 ID 검증 (숫자 문자열) */
const subjectIdRegex = /^\d+$/;

/** 과목 이름 검증 (한글, 영문, 공백 허용, 2-50자) */
const subjectNameRegex = /^[가-힣a-zA-Z\s]{2,50}$/;

// 기본 과목 스키마 (ERD에 맞춰 정확히 구현)
export const SubjectSchema = z.object({
  subject_id: z.string().regex(subjectIdRegex, {message: "Subject ID must be a numeric string"}),
  subject_name: z.string()
    .min(2, {message: "Subject name must be at least 2 characters"})
    .max(50, {message: "Subject name must be at most 50 characters"})
    .regex(subjectNameRegex, {message: "Subject name can only contain Korean, English letters and spaces"}),
});

// 과목 생성 요청 스키마 (ERD에 맞춰 정확히 구현)
export const CreateSubjectSchema = z.object({
  subject_name: z.string()
    .min(2, {message: "Subject name must be at least 2 characters"})
    .max(50, {message: "Subject name must be at most 50 characters"})
    .regex(subjectNameRegex, {message: "Subject name can only contain Korean, English letters and spaces"}),
});

// 과목 업데이트 요청 스키마 (ERD에 맞춰 정확히 구현)
export const UpdateSubjectSchema = z.object({
  subject_name: z.string()
    .min(2, {message: "Subject name must be at least 2 characters"})
    .max(50, {message: "Subject name must be at most 50 characters"})
    .regex(subjectNameRegex, {message: "Subject name can only contain Korean, English letters and spaces"})
    .optional(),
});

// 과목 조회 필터 스키마 (ERD에 맞춰 정확히 구현)
export const SubjectFilterSchema = z.object({
  subject_name: z.string()
    .min(1, {message: "Subject name search must be at least 1 character"})
    .max(50, {message: "Subject name search must be at most 50 characters"})
    .optional(),
});

// 과목 ID 파라미터 검증 스키마
export const SubjectIdParamSchema = z.object({
  id: z.string().regex(subjectIdRegex, {message: "Subject ID must be a numeric string"}),
});
