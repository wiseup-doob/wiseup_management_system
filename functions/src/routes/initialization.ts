import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../config/container';
import { InitializationController } from '../controllers/InitializationController';

// Express Router 생성
const router = Router();

// 컨트롤러 해결 함수
const getInitializationController = (): InitializationController => {
  return container.resolve<InitializationController>('InitializationController');
};

// 에러 핸들링 래퍼
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ===== 초기화 라우트 =====

// POST /all - 모든 데이터 초기화 (학생 + 좌석 + 출석)
router.post('/all', asyncHandler(async (req: Request, res: Response) => {
  console.log('initializeAllData 함수 호출됨');
  await getInitializationController().initializeAllData(req, res);
}));

export const initializationRouter: Router = router;
