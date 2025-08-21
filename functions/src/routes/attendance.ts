import { Router } from 'express';
import { AttendanceController } from '../controllers/AttendanceController';

const router = Router();
const attendanceController = new AttendanceController();

// 출석 기록 생성
router.post('/', (req, res) => attendanceController.createAttendanceRecord(req, res));

// 모든 출석 기록 조회
router.get('/', (req, res) => attendanceController.getAllAttendanceRecords(req, res));

// 출석 기록 검색
router.get('/search', (req, res) => attendanceController.searchAttendanceRecords(req, res));

// 학생별 출석 기록 조회
router.get('/student/:studentId', (req, res) => attendanceController.getAttendanceRecordsByStudentId(req, res));

// 특정 날짜의 출석 기록 조회
router.get('/date/:date', (req, res) => attendanceController.getAttendanceRecordsByDate(req, res));

// 날짜 범위의 출석 기록 조회
router.get('/date-range', (req, res) => attendanceController.getAttendanceRecordsByDateRange(req, res));

// 학생별 출석 통계 조회
router.get('/statistics/student/:studentId', (req, res) => attendanceController.getStudentAttendanceStatistics(req, res));

// 일별 출석 현황 요약
router.get('/summary/daily/:date', (req, res) => attendanceController.getDailyAttendanceSummary(req, res));

// 월별 출석 통계
router.get('/statistics/monthly/:year/:month', (req, res) => attendanceController.getMonthlyAttendanceStatistics(req, res));

// 출석 상태별 통계
router.get('/statistics/by-status', (req, res) => attendanceController.getAttendanceStatusStatistics(req, res));

// 지각/조퇴 학생 목록
router.get('/issues', (req, res) => attendanceController.getStudentsWithAttendanceIssues(req, res));

// 일괄 출석 기록 생성
router.post('/bulk', (req, res) => attendanceController.createBulkAttendanceRecords(req, res));

// 출석 기록 복사
router.post('/copy', (req, res) => attendanceController.copyAttendanceRecords(req, res));

// 특정 출석 기록 조회
router.get('/:id', (req, res) => attendanceController.getAttendanceRecordById(req, res));

// 출석 기록 수정
router.put('/:id', (req, res) => attendanceController.updateAttendanceRecord(req, res));

// 출석 기록 삭제
router.delete('/:id', (req, res) => attendanceController.deleteAttendanceRecord(req, res));

export { router as attendanceRoutes };
