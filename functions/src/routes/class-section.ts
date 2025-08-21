import { Router } from 'express';
import { ClassSectionController } from '../controllers/ClassSectionController';

const router = Router();
const classSectionController = new ClassSectionController();

// ===== 기본 CRUD 라우트 =====

// 수업 생성
router.post('/', classSectionController.createClassSection.bind(classSectionController));

// 모든 수업 조회
router.get('/', classSectionController.getAllClassSections.bind(classSectionController));

// 모든 수업을 상세 정보와 함께 조회 (Course, Teacher, Classroom 포함)
router.get('/with-details', classSectionController.getAllClassSectionsWithDetails.bind(classSectionController));

// 수업 조회 (ID로)
router.get('/:id', classSectionController.getClassSectionById.bind(classSectionController));

// 수업을 상세 정보와 함께 조회 (ID로)
router.get('/:id/with-details', classSectionController.getClassSectionWithDetailsById.bind(classSectionController));

// 수업 수정
router.put('/:id', classSectionController.updateClassSection.bind(classSectionController));

// 수업 삭제
router.delete('/:id', classSectionController.deleteClassSection.bind(classSectionController));

// ===== 의존성 및 계층적 삭제 라우트 =====

// 수업 의존성 확인
router.get('/:id/dependencies', classSectionController.getClassSectionDependencies.bind(classSectionController));

// 수업 계층적 삭제
router.delete('/:id/hierarchical', classSectionController.deleteClassSectionHierarchically.bind(classSectionController));

// 수업에 학생 추가
router.post('/:id/students/:studentId', classSectionController.addStudentToClass.bind(classSectionController));

// 수업에서 학생 제거
router.delete('/:id/students/:studentId', classSectionController.removeStudentFromClass.bind(classSectionController));

// 수업에 등록된 학생 목록 조회
router.get('/:id/students', classSectionController.getEnrolledStudents.bind(classSectionController));

// Course와 ClassSection을 한번에 생성하는 새로운 엔드포인트
router.post('/create-with-course', classSectionController.createClassWithCourse.bind(classSectionController));

// ===== 검색 및 통계 라우트 =====

// 수업 검색
router.get('/search', classSectionController.searchClassSections.bind(classSectionController));

// 수업 통계 조회
router.get('/statistics', classSectionController.getClassSectionStatistics.bind(classSectionController));

// 시간 충돌 검증
router.post('/validate-time-conflict', classSectionController.validateTimeConflict.bind(classSectionController));

// 시간표 통계 조회
router.get('/schedule-statistics', classSectionController.getScheduleStatistics.bind(classSectionController));

export { router as classSectionRoutes };
