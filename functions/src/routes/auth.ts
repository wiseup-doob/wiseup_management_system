import * as functions from "firebase-functions";
import { AuthController } from '../controllers/AuthController';
import { AuthService } from '../services/auth/AuthService';
import { setCorsHeaders, handleOptionsRequest } from '../middleware/cors';
import { createErrorResponse } from '../middleware/errorHandler';

// HTTP 핸들러 팩토리
const createHttpHandler = (handler: (request: any, response: any) => Promise<void>) => {
  return functions.https.onRequest(async (request, response) => {
    setCorsHeaders(response);

    if (handleOptionsRequest(response)) {
      return;
    }

    try {
      await handler(request, response);
    } catch (error) {
      createErrorResponse(response, error, "요청 처리 중 오류가 발생했습니다.");
    }
  });
};

// 인증 서비스 및 컨트롤러 인스턴스
const authService = new AuthService();
const authController = new AuthController(authService);

// 인증 라우트
export const authRoutes = {
  // 관리자 계정 초기화
  initializeAdmin: createHttpHandler(async (request, response) => {
    await authController.initializeAdmin(request, response);
  }),
  
  // 로그인
  login: createHttpHandler(async (request, response) => {
    await authController.login(request, response);
  }),
  
  // 회원가입
  register: createHttpHandler(async (request, response) => {
    await authController.register(request, response);
  }),
  
  // 로그아웃
  logout: createHttpHandler(async (request, response) => {
    await authController.logout(request, response);
  }),
  
  // 토큰 갱신
  refreshToken: createHttpHandler(async (request, response) => {
    await authController.refreshToken(request, response);
  }),
  
  // 현재 사용자 정보 조회
  getCurrentUser: createHttpHandler(async (request, response) => {
    await authController.getCurrentUser(request, response);
  }),
  
  // 토큰 검증
  verifyToken: createHttpHandler(async (request, response) => {
    await authController.verifyToken(request, response);
  }),
}; 