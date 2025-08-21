import { Router } from 'express';
import { TeacherController } from '../controllers/TeacherController';

const router = Router();
const teacherController = new TeacherController();

// ===== 기본 CRUD 라우트 =====

// 강사 생성
router.post('/', teacherController.createTeacher.bind(teacherController));

// 모든 강사 조회
router.get('/', teacherController.getAllTeachers.bind(teacherController));

// 강사 조회 (ID로)
router.get('/:id', teacherController.getTeacherById.bind(teacherController));

// 강사 수정
router.put('/:id', teacherController.updateTeacher.bind(teacherController));

// 강사 삭제
router.delete('/:id', teacherController.deleteTeacher.bind(teacherController));

// ===== 검색 및 통계 라우트 =====

// 강사 검색
router.get('/search', teacherController.searchTeachers.bind(teacherController));

// 강사 통계 조회
router.get('/statistics', teacherController.getTeacherStatistics.bind(teacherController));

// ===== 기타 기능 라우트 =====

// 강사 데이터 검증
router.post('/validate', teacherController.validateTeacherData.bind(teacherController));

// ===== 계층적 삭제 관련 라우트 =====

// 교사 의존성 확인
router.get('/:id/dependencies', teacherController.getTeacherDependencies.bind(teacherController));

// 교사 계층적 삭제
router.delete('/:id/hierarchical', teacherController.deleteTeacherHierarchically.bind(teacherController));

export { router as teacherRoutes };
