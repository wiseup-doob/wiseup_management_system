import {z} from "zod";

// 사용자 역할 할당 스키마
const AssignUserRoleSchema = z.object({
  user_id: z.string().min(1, "사용자 ID는 필수입니다"),
  role_id: z.string().min(1, "역할 ID는 필수입니다"),
});

// 사용자 역할 조회 필터 스키마
const UserRoleFilterSchema = z.object({
  user_id: z.string().optional(),
  role_id: z.string().optional(),
});

export {
  AssignUserRoleSchema,
  UserRoleFilterSchema,
};
