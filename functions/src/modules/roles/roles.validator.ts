import {z} from "zod";

// 역할 ID enum
const RoleIdEnum = z.enum(["student", "parent", "teacher", "admin"]);

// 역할 이름 정규식 (한글, 영문, 숫자, 공백 허용)
const roleNameRegex = /^[가-힣a-zA-Z0-9\s]+$/;

// 역할 스키마
const RoleSchema = z.object({
  role_id: RoleIdEnum,
  role_name: z.string()
    .min(1, "역할 이름은 필수입니다")
    .max(50, "역할 이름은 50자 이하여야 합니다")
    .regex(roleNameRegex, "역할 이름은 한글, 영문, 숫자, 공백만 허용됩니다"),
  createdAt: z.any(),
  updatedAt: z.any(),
});

// 역할 생성 스키마
const CreateRoleSchema = z.object({
  role_id: RoleIdEnum,
  role_name: z.string()
    .min(1, "역할 이름은 필수입니다")
    .max(50, "역할 이름은 50자 이하여야 합니다")
    .regex(roleNameRegex, "역할 이름은 한글, 영문, 숫자, 공백만 허용됩니다"),
});

// 역할 업데이트 스키마
const UpdateRoleSchema = z.object({
  role_name: z.string()
    .min(1, "역할 이름은 필수입니다")
    .max(50, "역할 이름은 50자 이하여야 합니다")
    .regex(roleNameRegex, "역할 이름은 한글, 영문, 숫자, 공백만 허용됩니다")
    .optional(),
});

// 역할 조회 필터 스키마
const RoleFilterSchema = z.object({
  role_id: RoleIdEnum.optional(),
  role_name: z.string().optional(),
});

export {
  RoleSchema,
  CreateRoleSchema,
  UpdateRoleSchema,
  RoleFilterSchema,
  RoleIdEnum,
};
