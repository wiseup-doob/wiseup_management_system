import {Router} from "express";
import {asyncWrap} from "../../common/asyncWrap";
import {validate, validateQuery} from "../../common/validator";
import {
  CreateStudentSchema,
  UpdateStudentSchema,
  StudentFilterSchema,
  CreateParentStudentSchema,
} from "./student.validator";
import {
  createStudentController,
  getStudentByIdController,
  getStudentByUserIdController,
  getStudentWithUserController,
  updateStudentController,
  deleteStudentController,
  getAllStudentsController,
  getStudentsByFilterController,
  createParentStudentRelationController,
  getParentsByStudentController,
  getStudentsByParentController,
} from "./student.controller";

const router = Router();

// 학생 생성
router.post(
  "/",
  validate(CreateStudentSchema),
  asyncWrap(createStudentController)
);

// 모든 학생 조회
router.get(
  "/",
  asyncWrap(getAllStudentsController)
);

// 학생 ID로 조회
router.get(
  "/:studentId",
  asyncWrap(getStudentByIdController)
);

// 사용자 ID로 학생 조회
router.get(
  "/user/:userId",
  asyncWrap(getStudentByUserIdController)
);

// 학생과 사용자 정보 함께 조회
router.get(
  "/:studentId/with-user",
  asyncWrap(getStudentWithUserController)
);

// 학생 업데이트
router.put(
  "/:studentId",
  validate(UpdateStudentSchema),
  asyncWrap(updateStudentController)
);

// 학생 삭제
router.delete(
  "/:studentId",
  asyncWrap(deleteStudentController)
);

// 필터로 학생 조회 (쿼리 파라미터 사용)
router.get(
  "/filter/search",
  validateQuery(StudentFilterSchema),
  asyncWrap(getStudentsByFilterController)
);

// 부모-학생 관계 생성
router.post(
  "/parent-relation",
  validate(CreateParentStudentSchema),
  asyncWrap(createParentStudentRelationController)
);

// 학생의 부모 목록 조회
router.get(
  "/:studentId/parents",
  asyncWrap(getParentsByStudentController)
);

// 부모의 학생 목록 조회
router.get(
  "/parent/:parentId/students",
  asyncWrap(getStudentsByParentController)
);

export default router;
