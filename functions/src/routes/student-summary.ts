import { Router } from 'express';
import { StudentSummaryController } from '../controllers/StudentSummaryController';

const router = Router();
const studentSummaryController = new StudentSummaryController();

// 학생 요약 정보 생성
router.post('/', (req, res) => studentSummaryController.createStudentSummary(req, res));

// 모든 학생 요약 정보 조회
router.get('/', (req, res) => studentSummaryController.getAllStudentSummaries(req, res));

// 학생 요약 정보 검색
router.get('/search', (req, res) => studentSummaryController.searchStudentSummaries(req, res));

// 출석률 상위 학생 조회
router.get('/top-attendance', (req, res) => studentSummaryController.getTopAttendanceStudents(req, res));

// 문제가 있는 학생 조회
router.get('/with-issues', (req, res) => studentSummaryController.getStudentsWithIssues(req, res));

// 학생 요약 정보 통계
router.get('/statistics', (req, res) => studentSummaryController.getStudentSummaryStatistics(req, res));

// 출석 상태별 학생 수 조회
router.get('/count/by-attendance-status', (req, res) => studentSummaryController.getStudentCountByAttendanceStatus(req, res));

// 일별 출석 현황 요약
router.get('/daily-attendance-summary', (req, res) => studentSummaryController.getDailyAttendanceSummary(req, res));

// 학생 ID로 요약 정보 조회
router.get('/by-student/:studentId', (req, res) => studentSummaryController.getStudentSummaryByStudentId(req, res));

// 특정 학생 요약 정보 조회
router.get('/:id', (req, res) => studentSummaryController.getStudentSummaryById(req, res));

// 학생 요약 정보 수정
router.put('/:id', (req, res) => studentSummaryController.updateStudentSummary(req, res));

// 학생 요약 정보 삭제
router.delete('/:id', (req, res) => studentSummaryController.deleteStudentSummary(req, res));

export { router as studentSummaryRoutes };
