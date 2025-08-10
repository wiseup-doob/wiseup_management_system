import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../config/container';
import { SeatController } from '../controllers/SeatController';

// Express Router 생성
const router = Router();

// 컨트롤러 해결 함수
const getSeatController = (): SeatController => {
  return container.resolve<SeatController>('SeatController');
};

// 에러 핸들링 래퍼
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ===== 좌석 관리 라우트 =====

// GET / - 좌석 목록 조회
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  console.log('getAllSeats 함수 호출됨');
  await getSeatController().getAllSeats(req, res);
}));

// GET /stats - 좌석 통계 조회
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  console.log('getSeatStats 함수 호출됨');
  await getSeatController().getSeatStats(req, res);
}));

// GET /:seatId - 특정 좌석 조회

router.get('/:seatId', asyncHandler(async (req: Request, res: Response) => {
  console.log('getSeatById 함수 호출됨');
  await getSeatController().getSeatById(req, res);
}));

// PUT /status - 좌석 상태 업데이트
router.put('/status', asyncHandler(async (req: Request, res: Response) => {
  console.log('updateSeatStatus 함수 호출됨');
  await getSeatController().updateSeatStatus(req, res);
}));

// POST /swap - 좌석 배치(번호) 교환
router.post('/swap', asyncHandler(async (req: Request, res: Response) => {
  await getSeatController().swapSeatPositions(req, res);
}));

// GET /health - 좌석 데이터 헬스체크
router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  await getSeatController().checkSeatHealth(req, res);
}));

// POST /repair - 좌석 데이터 자동 복구
router.post('/repair', asyncHandler(async (req: Request, res: Response) => {
  await getSeatController().autoRepairSeats(req, res);
}));

// ===== 초기화 라우트 =====

// POST /initialize - 좌석 데이터 초기화
router.post('/initialize', asyncHandler(async (req: Request, res: Response) => {
  console.log('initializeSeats 함수 호출됨');
  await getSeatController().initializeSeats(req, res);
}));

export const seatRouter: Router = router;
