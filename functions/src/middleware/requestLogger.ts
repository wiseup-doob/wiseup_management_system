import { Request, Response, NextFunction } from 'express';

// 요청 로깅 미들웨어
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // 요청 정보 로깅
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Request ID: ${requestId}`);
  
  // 응답 완료 후 로깅
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - Request ID: ${requestId}`);
  });
  
  // Request ID를 헤더에 추가
  req.headers['x-request-id'] = requestId;
  
  next();
};
