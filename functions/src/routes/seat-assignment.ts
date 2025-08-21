import { Router } from 'express';
import { SeatAssignmentController } from '../controllers/SeatAssignmentController';

const router = Router();
const seatAssignmentController = new SeatAssignmentController();

// 좌석 배정 생성
router.post('/', (req, res) => seatAssignmentController.createSeatAssignment(req, res));

// 좌석 배정 조회 (ID로)
router.get('/:id', (req, res) => seatAssignmentController.getSeatAssignmentById(req, res));

// 좌석 배정 수정
router.put('/:id', (req, res) => seatAssignmentController.updateSeatAssignment(req, res));

// 좌석 배정 삭제
router.delete('/:id', (req, res) => seatAssignmentController.deleteSeatAssignment(req, res));

// 모든 좌석 배정 조회
router.get('/', (req, res) => seatAssignmentController.getAllSeatAssignments(req, res));

// 활성 좌석 배정만 조회
router.get('/status/active', (req, res) => seatAssignmentController.getActiveSeatAssignments(req, res));

// 특정 좌석의 배정 조회
router.get('/seat/:seatId', (req, res) => seatAssignmentController.getSeatAssignmentsBySeatId(req, res));

// 특정 학생의 좌석 배정 조회
router.get('/student/:studentId', (req, res) => seatAssignmentController.getSeatAssignmentsByStudentId(req, res));

// 특정 날짜의 좌석 배정 조회
router.get('/date/:date', (req, res) => seatAssignmentController.getSeatAssignmentsByDate(req, res));

// 좌석 배정 검색
router.get('/search/query', (req, res) => seatAssignmentController.searchSeatAssignments(req, res));

// 좌석 배정 통계 조회
router.get('/stats/overview', (req, res) => seatAssignmentController.getSeatAssignmentStatistics(req, res));

// 좌석 배정 상태 변경
router.patch('/:id/status', (req, res) => seatAssignmentController.updateSeatAssignmentStatus(req, res));

// 좌석 배정 해제
router.post('/:id/release', (req, res) => seatAssignmentController.releaseSeatAssignment(req, res));

// 학생의 현재 활성 좌석 배정 조회
router.get('/student/:studentId/current', (req, res) => seatAssignmentController.getCurrentSeatAssignment(req, res));

// 좌석의 현재 활성 배정 조회
router.get('/seat/:seatId/current', (req, res) => seatAssignmentController.getCurrentSeatAssignmentBySeat(req, res));

// 학생의 좌석 배정 기록 조회
router.get('/student/:studentId/history', (req, res) => seatAssignmentController.getStudentSeatAssignmentHistory(req, res));

// 좌석의 배정 기록 조회
router.get('/seat/:seatId/history', (req, res) => seatAssignmentController.getSeatAssignmentHistory(req, res));

export { router as seatAssignmentRoutes };
