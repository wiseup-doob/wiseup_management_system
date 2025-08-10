import { Router } from 'express';
import { SeatAssignmentController } from '../controllers/SeatAssignmentController';
import { SeatAssignmentService } from '../services/assignment/SeatAssignmentService';

const router: Router = Router();
const seatAssignmentService = new SeatAssignmentService();
const seatAssignmentController = new SeatAssignmentController(seatAssignmentService);

// 학생을 좌석에 배정
router.post('/assign', (req, res) => {
  seatAssignmentController.assignStudentToSeat(req, res);
});

// 좌석에서 학생 배정 해제
router.post('/unassign', (req, res) => {
  seatAssignmentController.unassignStudentFromSeat(req, res);
});

// 학생들을 좌석에 일괄 배정
router.post('/bulk-assign', (req, res) => {
  seatAssignmentController.bulkAssignStudents(req, res);
});

// 좌석 ID로 배정 정보 조회
router.get('/seat/:seatId', (req, res) => {
  seatAssignmentController.getAssignmentBySeatId(req, res);
});

// 학생 ID로 배정 정보 조회
router.get('/student/:studentId', (req, res) => {
  seatAssignmentController.getAssignmentByStudentId(req, res);
});

// 모든 배정 정보 조회
router.get('/all', (req, res) => {
  seatAssignmentController.getAllAssignments(req, res);
});

// 배정 통계 조회
router.get('/stats', (req, res) => {
  seatAssignmentController.getAssignmentStats(req, res);
});

export default router;
