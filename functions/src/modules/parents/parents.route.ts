import {Router} from "express";
import {ParentsController} from "./parents.controller";

const router = Router();
const parentsController = new ParentsController();

// 부모 관리 라우트
router.post("/", parentsController.createParent.bind(parentsController));
router.get("/", parentsController.getAllParents.bind(parentsController));
router.get("/:parentId", parentsController.getParent.bind(parentsController));
router.get("/user/:userId", parentsController.getParentByUserId.bind(parentsController));
router.put("/:parentId", parentsController.updateParent.bind(parentsController));
router.delete("/:parentId", parentsController.deleteParent.bind(parentsController));

// 부모-학생 관계 관리 라우트
router.post("/relationship", parentsController.createParentStudent.bind(parentsController));
router.get("/:parentId/students", parentsController.getStudentsByParent.bind(parentsController));
router.get("/student/:studentId/parents", parentsController.getParentsByStudent.bind(parentsController));
router.get("/:parentId/with-students", parentsController.getParentWithStudents.bind(parentsController));
router.get("/student/:studentId/with-parents", parentsController.getStudentWithParents.bind(parentsController));
router.delete("/:parentId/student/:studentId", parentsController.deleteParentStudent.bind(parentsController));

export default router;
