import { Request, Response, NextFunction } from 'express';
import { ERROR_MESSAGES } from '../config/constants';

export const createErrorResponse = (response: Response, error: unknown, message: string): void => {
  console.error(`Error: ${message}`, error);
  response.status(500).json({
    success: false,
    message,
    error: error instanceof Error ? error.message : 'Unknown error',
  });
};

// Express 에러 핸들러 미들웨어
export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction): void => {
  console.error('API Error:', err);
  
  // 기본 에러 응답
  const errorResponse = {
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    meta: {
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    }
  };

  // 에러 타입에 따른 상태 코드 설정
  if (err.status) {
    res.status(err.status);
    errorResponse.error = err.code || 'CUSTOM_ERROR';
    errorResponse.message = err.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
  } else {
    res.status(500);
  }

  res.json(errorResponse);
}; 