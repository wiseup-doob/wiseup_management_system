import { ApiResponse } from '../types/common';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

export abstract class BaseController {
  protected createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
    return createSuccessResponse(data, message);
  }
  
  protected createErrorResponse(message: string, error?: string): ApiResponse<never> {
    return createErrorResponse(message, error);
  }
} 