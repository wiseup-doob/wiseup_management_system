import { Router, Request, Response, NextFunction } from 'express';
import { container } from '../config/container';
import { AuthController } from '../controllers/AuthController';

// Express Router 생성
const router = Router();

// 컨트롤러 해결 함수
const getAuthController = (): AuthController => {
  return container.resolve<AuthController>('AuthController');
};

// 에러 핸들링 래퍼
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ===== 인증 라우트 =====

// POST /initialize-admin - 관리자 초기화
router.post('/initialize-admin', asyncHandler(async (req: Request, res: Response) => {
  await getAuthController().initializeAdmin(req, res);
}));

// POST /login - 로그인
router.post('/login', asyncHandler(async (req: Request, res: Response) => {
  await getAuthController().login(req, res);
}));

// POST /register - 회원가입
router.post('/register', asyncHandler(async (req: Request, res: Response) => {
  await getAuthController().register(req, res);
}));

// POST /logout - 로그아웃
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  await getAuthController().logout(req, res);
}));

// POST /refresh - 토큰 갱신
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  await getAuthController().refreshToken(req, res);
}));

// GET /current-user - 현재 사용자 조회
router.get('/current-user', asyncHandler(async (req: Request, res: Response) => {
  await getAuthController().getCurrentUser(req, res);
}));

// POST /verify - 토큰 검증
router.post('/verify', asyncHandler(async (req: Request, res: Response) => {
  await getAuthController().verifyToken(req, res);
}));

export const authRouter: Router = router; 