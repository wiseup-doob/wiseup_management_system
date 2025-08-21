import { Router } from 'express';
import { CourseController } from '../controllers/CourseController';

const router = Router();
const courseController = new CourseController();

// 강의 생성
router.post('/', (req, res) => courseController.createCourse(req, res));

// 모든 강의 조회
router.get('/', (req, res) => courseController.getAllCourses(req, res));

// 강의 검색
router.get('/search', (req, res) => courseController.searchCourses(req, res));

// 강의 통계 조회
router.get('/statistics', (req, res) => courseController.getCourseStatistics(req, res));

// 강의 활성화/비활성화 토글
router.patch('/:id/toggle-status', (req, res) => courseController.toggleCourseStatus(req, res));

// 특정 강의 조회
router.get('/:id', (req, res) => courseController.getCourseById(req, res));

// 강의 수정
router.put('/:id', (req, res) => courseController.updateCourse(req, res));

// 강의 삭제
router.delete('/:id', (req, res) => courseController.deleteCourse(req, res));

export { router as courseRoutes };
