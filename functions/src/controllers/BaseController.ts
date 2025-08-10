import type { ApiResponse } from '@shared/types';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

export abstract class BaseController {
  protected createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
    return createSuccessResponse(data, message);
  }
  
  protected createErrorResponse(message: string, error?: string): ApiResponse<never> {
    return createErrorResponse(message, error);
  }

  protected sendSuccess<T>(res: any, data: T, message?: string): void {
    res.json(this.createSuccessResponse(data, message));
  }

  protected sendError(res: any, message: string, statusCode: number = 500, error?: string): void {
    // 상세 에러 메시지를 함께 내려 클라이언트/콘솔에서 문제 원인 파악을 돕는다
    res.status(statusCode).json(this.createErrorResponse(message, error));
  }
} 