import { Router } from 'express';
import { SeatController } from '../controllers/SeatController';

const router = Router();
const seatController = new SeatController();

// 좌석 생성
router.post('/', (req, res) => seatController.createSeat(req, res));

// 좌석 조회 (ID로)
router.get('/:id', (req, res) => seatController.getSeatById(req, res));

// 좌석 수정
router.put('/:id', (req, res) => seatController.updateSeat(req, res));

// 좌석 삭제
router.delete('/:id', (req, res) => seatController.deleteSeat(req, res));

// 모든 좌석 조회
router.get('/', (req, res) => seatController.getAllSeats(req, res));

// 활성 좌석만 조회
router.get('/status/active', (req, res) => seatController.getActiveSeats(req, res));

// 사용 가능한 좌석만 조회
router.get('/status/available', (req, res) => seatController.getAvailableSeats(req, res));

// 좌석 번호별로 정렬된 조회
router.get('/order/by-number', (req, res) => seatController.getSeatsByNumber(req, res));

// 상태별 좌석 조회
router.get('/status/:status', (req, res) => seatController.getSeatsByStatus(req, res));

// 좌석 검색
router.get('/search/query', (req, res) => seatController.searchSeats(req, res));

// 좌석 통계 조회
router.get('/stats/overview', (req, res) => seatController.getSeatStatistics(req, res));

// 좌석 상태 변경
router.patch('/:id/status', (req, res) => seatController.updateSeatStatus(req, res));

// 좌석 활성화/비활성화
router.patch('/:id/active', (req, res) => seatController.toggleSeatActive(req, res));

// 다음 사용 가능한 좌석 번호 찾기
router.get('/next/available-number', (req, res) => seatController.getNextAvailableSeatNumber(req, res));

// 좌석 일괄 생성
router.post('/batch/create', (req, res) => seatController.createMultipleSeats(req, res));

// 좌석 일괄 비활성화
router.post('/batch/deactivate', (req, res) => seatController.deactivateMultipleSeats(req, res));

export { router as seatRoutes };
