import { ERROR_MESSAGES } from '../config/constants';

export const ErrorType = {
  NETWORK: 'NETWORK',
  API: 'API',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  UNKNOWN: 'UNKNOWN'
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  originalError?: Error;
}

export interface ValidationError extends AppError {
  type: 'VALIDATION';
  field?: string;
  value?: any;
}

export interface ApiError extends AppError {
  type: 'API';
  statusCode?: number;
  endpoint?: string;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  timestamp: Date;
}

export class ErrorHandler {
  static createApiError(error: any, endpoint?: string): ApiError {
    return {
      type: ErrorType.API,
      message: error.message || ERROR_MESSAGES.API_ERROR,
      details: error,
      endpoint,
      originalError: error instanceof Error ? error : undefined
    };
  }

  static createValidationError(message: string, field?: string, value?: any): ValidationError {
    return {
      type: ErrorType.VALIDATION,
      message: message || ERROR_MESSAGES.VALIDATION_ERROR,
      field,
      value
    };
  }

  static createNetworkError(error: any): AppError {
    return {
      type: ErrorType.NETWORK,
      message: ERROR_MESSAGES.NETWORK_ERROR,
      details: error,
      originalError: error instanceof Error ? error : undefined
    };
  }

  static handleApiResponse(response: Response): Promise<any> {
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
      throw this.createApiError(error, response.url);
    }
    return response.json();
  }

  static handleAttendanceError(error: any): AppError {
    if (error.type === ErrorType.API) {
      return error;
    }
    
    if (error.message?.includes('네트워크')) {
      return this.createNetworkError(error);
    }
    
    return {
      type: ErrorType.UNKNOWN,
      message: ERROR_MESSAGES.UNKNOWN_ERROR,
      details: error,
      originalError: error instanceof Error ? error : undefined
    };
  }

  static logError(error: AppError, context?: ErrorContext): void {
    const logData = {
      type: error.type,
      message: error.message,
      details: error.details,
      context,
      timestamp: new Date().toISOString()
    };
    
    console.error('Error logged:', logData);
    
    // TODO: 실제 로깅 서비스로 전송
    // analytics.track('error', logData);
  }

  static getUserFriendlyMessage(error: AppError): string {
    switch (error.type) {
      case ErrorType.NETWORK:
        return ERROR_MESSAGES.NETWORK_ERROR;
      case ErrorType.API:
        return ERROR_MESSAGES.API_ERROR;
      case ErrorType.VALIDATION:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case ErrorType.AUTHENTICATION:
        return '인증이 필요합니다. 다시 로그인해주세요.';
      default:
        return ERROR_MESSAGES.UNKNOWN_ERROR;
    }
  }
} 