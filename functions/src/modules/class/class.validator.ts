import {z} from "zod";

// 반 이름 정규식 (한글, 영문, 숫자, 공백 허용)
const classNameRegex = /^[가-힣a-zA-Z0-9\s]+$/;

// 반 스키마
const ClassSchema = z.object({
  class_id: z.string().min(1, "반 ID는 필수입니다"),
  subject_id: z.string().min(1, "과목 ID는 필수입니다"),
  class_name: z.string()
    .min(1, "반 이름은 필수입니다")
    .max(50, "반 이름은 50자 이하여야 합니다")
    .regex(classNameRegex, "반 이름은 한글, 영문, 숫자, 공백만 허용됩니다"),
  createdAt: z.any(),
  updatedAt: z.any(),
});

// 반 생성 스키마
const CreateClassSchema = z.object({
  subject_id: z.string().min(1, "과목 ID는 필수입니다"),
  class_name: z.string()
    .min(1, "반 이름은 필수입니다")
    .max(50, "반 이름은 50자 이하여야 합니다")
    .regex(classNameRegex, "반 이름은 한글, 영문, 숫자, 공백만 허용됩니다"),
});

// 반 업데이트 스키마
const UpdateClassSchema = z.object({
  subject_id: z.string().min(1, "과목 ID는 필수입니다").optional(),
  class_name: z.string()
    .min(1, "반 이름은 필수입니다")
    .max(50, "반 이름은 50자 이하여야 합니다")
    .regex(classNameRegex, "반 이름은 한글, 영문, 숫자, 공백만 허용됩니다")
    .optional(),
});

// 반 조회 필터 스키마
const ClassFilterSchema = z.object({
  subject_id: z.string().optional(),
  class_name: z.string().optional(),
});

export {
  ClassSchema,
  CreateClassSchema,
  UpdateClassSchema,
  ClassFilterSchema,
};
