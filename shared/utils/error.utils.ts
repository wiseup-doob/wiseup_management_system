// 중앙화된 에러 처리 시스템
import { HTTP_STATUS_CODES } from '../constants/api.constants';

// 에러 타입 정의
export const ErrorType = {
  VALIDATION: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  INTERNAL: 'INTERNAL_ERROR',
  NETWORK: 'NETWORK_ERROR',
  DATABASE: 'DATABASE_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR'
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

// 에러 코드 정의
export const ERROR_CODES = {
  // 일반 오류
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_VALUE: 'INVALID_VALUE',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // 인증 및 권한 오류
  UNAUTHORIZED: 'UNAUTHORIZED',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // 데이터베이스 오류
  DATABASE_CONNECTION_ERROR: 'DATABASE_CONNECTION_ERROR',
  DATABASE_QUERY_ERROR: 'DATABASE_QUERY_ERROR',
  DATABASE_TRANSACTION_ERROR: 'DATABASE_TRANSACTION_ERROR',
  
  // 리소스 오류
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  STUDENT_NOT_FOUND: 'STUDENT_NOT_FOUND',
  SEAT_NOT_FOUND: 'SEAT_NOT_FOUND',
  ATTENDANCE_RECORD_NOT_FOUND: 'ATTENDANCE_RECORD_NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  SEAT_NUMBER_CONFLICT: 'SEAT_NUMBER_CONFLICT',
  
  // 비즈니스 로직 오류
  STUDENT_ALREADY_EXISTS: 'STUDENT_ALREADY_EXISTS',
  SEAT_ALREADY_ASSIGNED: 'SEAT_ALREADY_ASSIGNED',
  INVALID_ATTENDANCE_STATUS: 'INVALID_ATTENDANCE_STATUS',
  INVALID_TIME_FORMAT: 'INVALID_TIME_FORMAT',
  DUPLICATE_ATTENDANCE: 'DUPLICATE_ATTENDANCE',
  
  // 외부 서비스 오류
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  NETWORK_CONNECTION_ERROR: 'NETWORK_CONNECTION_ERROR',
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  
  // 시스템 오류
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED'
} as const;

// 에러 메시지 정의
export const ERROR_MESSAGES = {
  [ERROR_CODES.INVALID_INPUT]: '입력 데이터가 유효하지 않습니다.',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: '필수 필드가 누락되었습니다.',
  [ERROR_CODES.INVALID_FORMAT]: '잘못된 형식입니다.',
  [ERROR_CODES.INVALID_VALUE]: '유효하지 않은 값입니다.',
  
  [ERROR_CODES.UNAUTHORIZED_ACCESS]: '인증이 필요합니다.',
  [ERROR_CODES.INSUFFICIENT_PERMISSIONS]: '접근 권한이 없습니다.',
  [ERROR_CODES.INVALID_TOKEN]: '유효하지 않은 토큰입니다.',
  [ERROR_CODES.EXPIRED_TOKEN]: '만료된 토큰입니다.',
  
  [ERROR_CODES.RESOURCE_NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  [ERROR_CODES.STUDENT_NOT_FOUND]: '학생을 찾을 수 없습니다.',
  [ERROR_CODES.ATTENDANCE_RECORD_NOT_FOUND]: '출석 기록을 찾을 수 없습니다.',
  [ERROR_CODES.DUPLICATE_RESOURCE]: '이미 존재하는 리소스입니다.',
  [ERROR_CODES.SEAT_NUMBER_CONFLICT]: '이미 사용 중인 좌석 번호입니다.',
  
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: '서버 내부 오류가 발생했습니다.',
  [ERROR_CODES.DATABASE_CONNECTION_ERROR]: '데이터베이스 연결에 실패했습니다.',
  [ERROR_CODES.DATABASE_QUERY_ERROR]: '데이터베이스 쿼리 실행 중 오류가 발생했습니다.',
  [ERROR_CODES.EXTERNAL_SERVICE_ERROR]: '외부 서비스 호출 중 오류가 발생했습니다.',
  
  [ERROR_CODES.NETWORK_TIMEOUT]: '네트워크 요청 시간이 초과되었습니다.',
  [ERROR_CODES.NETWORK_CONNECTION_ERROR]: '네트워크 연결을 확인해주세요.',
  
  [ERROR_CODES.INVALID_ATTENDANCE_STATUS]: '유효하지 않은 출석 상태입니다.',
  [ERROR_CODES.INVALID_TIME_FORMAT]: '유효하지 않은 시간 형식입니다.',
  [ERROR_CODES.DUPLICATE_ATTENDANCE]: '이미 존재하는 출석 기록입니다.',
  [ERROR_CODES.STUDENT_ALREADY_EXISTS]: '이미 존재하는 학생입니다.'
} as const;

// 커스텀 에러 클래스
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly timestamp: string;
  public readonly requestId?: string;

  constructor(
    type: ErrorType,
    code: string,
    message?: string,
    statusCode: number = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
    details?: any,
    requestId?: string
  ) {
    super(message || ERROR_MESSAGES[code as keyof typeof ERROR_MESSAGES] || '알 수 없는 오류가 발생했습니다.');
    
    this.type = type;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
    
    // 스택 트레이스 유지 (Node.js 환경에서만 사용)
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // 에러 타입별 정적 생성자
  static validation(code: string, message?: string, details?: any, requestId?: string): AppError {
    return new AppError(ErrorType.VALIDATION, code, message, HTTP_STATUS_CODES.BAD_REQUEST, details, requestId);
  }

  static badRequest(code: string, message?: string, details?: any, requestId?: string): AppError {
    return new AppError(ErrorType.VALIDATION, code, message, HTTP_STATUS_CODES.BAD_REQUEST, details, requestId);
  }

  static notFound(code: string, message?: string, details?: any, requestId?: string): AppError {
    return new AppError(ErrorType.NOT_FOUND, code, message, HTTP_STATUS_CODES.NOT_FOUND, details, requestId);
  }

  static unauthorized(code: string, message?: string, details?: any, requestId?: string): AppError {
    return new AppError(ErrorType.UNAUTHORIZED, code, message, HTTP_STATUS_CODES.UNAUTHORIZED, details, requestId);
  }

  static forbidden(code: string, message?: string, details?: any, requestId?: string): AppError {
    return new AppError(ErrorType.FORBIDDEN, code, message, HTTP_STATUS_CODES.FORBIDDEN, details, requestId);
  }

  static conflict(code: string, message?: string, details?: any, requestId?: string): AppError {
    return new AppError(ErrorType.CONFLICT, code, message, HTTP_STATUS_CODES.CONFLICT, details, requestId);
  }

  static internal(code: string, message?: string, details?: any, requestId?: string): AppError {
    return new AppError(ErrorType.INTERNAL, code, message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, details, requestId);
  }

  static network(code: string, message?: string, details?: any, requestId?: string): AppError {
    return new AppError(ErrorType.NETWORK, code, message, HTTP_STATUS_CODES.SERVICE_UNAVAILABLE, details, requestId);
  }

  static database(code: string, message?: string, details?: any, requestId?: string): AppError {
    return new AppError(ErrorType.DATABASE, code, message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, details, requestId);
  }

  static timeout(code: string, message?: string, details?: any, requestId?: string): AppError {
    return new AppError(ErrorType.TIMEOUT, code, message, HTTP_STATUS_CODES.SERVICE_UNAVAILABLE, details, requestId);
  }
}

// 에러 응답 형식
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  code: string;
  type: ErrorType;
  statusCode: number;
  timestamp: string;
  requestId?: string;
  details?: any;
  meta?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

// 에러를 API 응답 형식으로 변환
export function createErrorResponse(error: AppError): ErrorResponse {
  return {
    success: false,
    error: error.message,
    message: error.message,
    code: error.code,
    type: error.type,
    statusCode: error.statusCode,
    timestamp: error.timestamp,
    requestId: error.requestId,
    details: error.details,
    meta: {
      timestamp: error.timestamp,
      version: 'v2',
      requestId: error.requestId
    }
  };
}

// 일반 에러를 AppError로 변환
export function normalizeError(error: any, requestId?: string): AppError {
  if (error instanceof AppError) {
    return error;
  }

  // Firebase 에러 처리
  if (error.code && error.message) {
    switch (error.code) {
      case 'permission-denied':
        return AppError.forbidden(ERROR_CODES.INSUFFICIENT_PERMISSIONS, error.message, error, requestId);
      case 'not-found':
        return AppError.notFound(ERROR_CODES.RESOURCE_NOT_FOUND, error.message, error, requestId);
      case 'already-exists':
        return AppError.conflict(ERROR_CODES.DUPLICATE_RESOURCE, error.message, error, requestId);
      case 'invalid-argument':
        return AppError.validation(ERROR_CODES.INVALID_INPUT, error.message, error, requestId);
      default:
        return AppError.internal(ERROR_CODES.INTERNAL_SERVER_ERROR, error.message, error, requestId);
    }
  }

  // 네트워크 에러 처리
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return AppError.network(ERROR_CODES.NETWORK_CONNECTION_ERROR, '네트워크 연결에 실패했습니다.', error, requestId);
  }

  // 기본 내부 서버 에러
  return AppError.internal(
    ERROR_CODES.INTERNAL_SERVER_ERROR,
    error.message || '알 수 없는 오류가 발생했습니다.',
    error,
    requestId
  );
}

// 에러 로깅 함수
export const logError = (
  error: AppError, 
  context?: { 
    component?: string; 
    action?: string; 
    userId?: string;
    [key: string]: any; // 추가 속성 허용
  }
): void => {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      requestId: error.requestId
    },
    context: context || {}
  };

  console.error('🚨 Application Error:', logData);
  
  // 실제 프로덕션에서는 로깅 서비스로 전송
  // 예: Sentry, LogRocket, CloudWatch 등
};

// 에러 처리 미들웨어
export function errorHandler(error: any, requestId?: string) {
  const normalizedError = normalizeError(error, requestId);
  logError(normalizedError);
  return createErrorResponse(normalizedError);
} 