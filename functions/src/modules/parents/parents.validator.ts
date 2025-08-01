import {z} from "zod";

/** 사용자 ID 검증 (숫자 문자열) */
const userIdRegex = /^\d+$/;

/** 부모 ID 검증 (parent_로 시작하는 문자열) */
const parentIdRegex = /^parent_\d+_[a-zA-Z0-9]+$/;

/** 학생 ID 검증 (student_로 시작하는 문자열) */
const studentIdRegex = /^student_\d+_[a-zA-Z0-9]+$/;

/** 한국 전화번호 형식 검증 */
const phoneRegex = /^(010|011|016|017|018|019)-\d{3,4}-\d{4}$|^(02|0[3-9]\d)-\d{3,4}-\d{4}$/;

/** 관계 검증 (부, 모, 보호자 등) */
const relationshipRegex = /^[가-힣]{1,10}$/;


// 부모 스키마
export const ParentSchema = z.object({
  user_id: z.string().regex(userIdRegex, {message: "User ID must be a numeric string"}),
  parent_id: z.string().regex(parentIdRegex, {message: "Parent ID must start with parent_"}),
  relationship: z.string().regex(relationshipRegex, {message: "Relationship must be in Korean (e.g., 부, 모, 보호자)"}).optional(),
  emergency_contact: z.string().regex(phoneRegex, {message: "Emergency contact must be in Korean phone format"}).optional(),
  occupation: z.string().max(100, {message: "Occupation must be at most 100 characters"}).optional(),
});

// 부모 생성 요청 스키마
export const CreateParentSchema = z.object({
  user_id: z.string().regex(userIdRegex, {message: "User ID must be a numeric string"}),
  relationship: z.string().regex(relationshipRegex, {message: "Relationship must be in Korean (e.g., 부, 모, 보호자)"}).optional(),
  emergency_contact: z.string().regex(phoneRegex, {message: "Emergency contact must be in Korean phone format"}).optional(),
  occupation: z.string().max(100, {message: "Occupation must be at most 100 characters"}).optional(),
});

// 부모 업데이트 요청 스키마
export const UpdateParentSchema = z.object({
  relationship: z.string().regex(relationshipRegex, {message: "Relationship must be in Korean (e.g., 부, 모, 보호자)"}).optional(),
  emergency_contact: z.string().regex(phoneRegex, {message: "Emergency contact must be in Korean phone format"}).optional(),
  occupation: z.string().max(100, {message: "Occupation must be at most 100 characters"}).optional(),
});

// 부모-학생 관계 생성 요청 스키마
export const CreateParentStudentSchema = z.object({
  parent_id: z.string().regex(parentIdRegex, {message: "Parent ID must start with parent_"}),
  student_id: z.string().regex(studentIdRegex, {message: "Student ID must start with student_"}),
  user_id: z.string().regex(userIdRegex, {message: "User ID must be a numeric string"}),
  relationship: z.string().regex(relationshipRegex, {message: "Relationship must be in Korean (e.g., 부, 모, 보호자)"}).optional(),
  is_primary_contact: z.boolean().optional(),
});

// 부모 조회 필터 스키마
export const ParentFilterSchema = z.object({
  user_id: z.string().regex(userIdRegex, {message: "User ID must be a numeric string"}).optional(),
  relationship: z.string().regex(relationshipRegex, {message: "Relationship must be in Korean (e.g., 부, 모, 보호자)"}).optional(),
});

// 부모-학생 관계 조회 필터 스키마
export const ParentStudentFilterSchema = z.object({
  parent_id: z.string().regex(parentIdRegex, {message: "Parent ID must start with parent_"}).optional(),
  student_id: z.string().regex(studentIdRegex, {message: "Student ID must start with student_"}).optional(),
  user_id: z.string().regex(userIdRegex, {message: "User ID must be a numeric string"}).optional(),
  is_primary_contact: z.boolean().optional(),
});

// 부모 ID 파라미터 검증 스키마
export const ParentIdParamSchema = z.object({
  parentId: z.string().regex(parentIdRegex, {message: "Parent ID must start with parent_"}),
});

// 학생 ID 파라미터 검증 스키마
export const StudentIdParamSchema = z.object({
  studentId: z.string().regex(studentIdRegex, {message: "Student ID must start with student_"}),
});

// 사용자 ID 파라미터 검증 스키마
export const UserIdParamSchema = z.object({
  userId: z.string().regex(userIdRegex, {message: "User ID must be a numeric string"}),
});

// 부모-학생 관계 파라미터 검증 스키마
export const ParentStudentParamSchema = z.object({
  parentId: z.string().regex(parentIdRegex, {message: "Parent ID must start with parent_"}),
  studentId: z.string().regex(studentIdRegex, {message: "Student ID must start with student_"}),
});
