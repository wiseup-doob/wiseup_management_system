import { Router } from 'express';
import { ClassroomController } from '../controllers/ClassroomController';

const router = Router();
const classroomController = new ClassroomController();

// ===== 기본 CRUD 라우트 =====

// 교실 생성
router.post('/', classroomController.createClassroom.bind(classroomController));

// 모든 교실 조회
router.get('/', classroomController.getAllClassrooms.bind(classroomController));

// 교실 조회 (ID로)
router.get('/:id', classroomController.getClassroomById.bind(classroomController));

// 교실 수정
router.put('/:id', classroomController.updateClassroom.bind(classroomController));

// 교실 삭제
router.delete('/:id', classroomController.deleteClassroom.bind(classroomController));

// ===== 의존성 및 계층적 삭제 라우트 =====

// 강의실 의존성 확인
router.get('/:id/dependencies', classroomController.getClassroomDependencies.bind(classroomController));

// 강의실 계층적 삭제
router.delete('/:id/hierarchical', classroomController.deleteClassroomHierarchically.bind(classroomController));

// ===== 검색 및 통계 라우트 =====

// 교실 검색
router.get('/search', classroomController.searchClassrooms.bind(classroomController));

// 교실 통계 조회
router.get('/statistics', classroomController.getClassroomStatistics.bind(classroomController));

// ===== 기타 기능 라우트 =====

// 교실 데이터 검증
router.post('/validate', classroomController.validateClassroomData.bind(classroomController));

export { router as classroomRoutes };
