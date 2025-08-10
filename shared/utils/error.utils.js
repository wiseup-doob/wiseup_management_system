"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.logError = exports.normalizeError = exports.createErrorResponse = exports.AppError = exports.ERROR_MESSAGES = exports.ERROR_CODES = exports.ErrorType = void 0;
// 중앙화된 에러 처리 시스템
const api_constants_1 = require("../constants/api.constants");
// 에러 타입 정의
exports.ErrorType = {
    VALIDATION: 'VALIDATION_ERROR',
    NOT_FOUND: 'NOT_FOUND',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    CONFLICT: 'CONFLICT',
    INTERNAL: 'INTERNAL_ERROR',
    NETWORK: 'NETWORK_ERROR',
    DATABASE: 'DATABASE_ERROR',
    TIMEOUT: 'TIMEOUT_ERROR'
};
// 에러 코드 정의
exports.ERROR_CODES = {
    // 검증 오류 (400)
    INVALID_INPUT: 'INVALID_INPUT',
    MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
    INVALID_FORMAT: 'INVALID_FORMAT',
    INVALID_VALUE: 'INVALID_VALUE',
    // 인증/권한 오류 (401, 403)
    UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
    INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
    INVALID_TOKEN: 'INVALID_TOKEN',
    EXPIRED_TOKEN: 'EXPIRED_TOKEN',
    // 리소스 오류 (404, 409)
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    STUDENT_NOT_FOUND: 'STUDENT_NOT_FOUND',
    ATTENDANCE_RECORD_NOT_FOUND: 'ATTENDANCE_RECORD_NOT_FOUND',
    DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
    SEAT_NUMBER_CONFLICT: 'SEAT_NUMBER_CONFLICT',
    // 서버 오류 (500)
    INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
    DATABASE_CONNECTION_ERROR: 'DATABASE_CONNECTION_ERROR',
    DATABASE_QUERY_ERROR: 'DATABASE_QUERY_ERROR',
    EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
    // 네트워크 오류
    NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
    NETWORK_CONNECTION_ERROR: 'NETWORK_CONNECTION_ERROR',
    // 비즈니스 로직 오류
    INVALID_ATTENDANCE_STATUS: 'INVALID_ATTENDANCE_STATUS',
    INVALID_TIME_FORMAT: 'INVALID_TIME_FORMAT',
    DUPLICATE_ATTENDANCE: 'DUPLICATE_ATTENDANCE',
    STUDENT_ALREADY_EXISTS: 'STUDENT_ALREADY_EXISTS'
};
// 에러 메시지 정의
exports.ERROR_MESSAGES = {
    [exports.ERROR_CODES.INVALID_INPUT]: '입력 데이터가 유효하지 않습니다.',
    [exports.ERROR_CODES.MISSING_REQUIRED_FIELD]: '필수 필드가 누락되었습니다.',
    [exports.ERROR_CODES.INVALID_FORMAT]: '잘못된 형식입니다.',
    [exports.ERROR_CODES.INVALID_VALUE]: '유효하지 않은 값입니다.',
    [exports.ERROR_CODES.UNAUTHORIZED_ACCESS]: '인증이 필요합니다.',
    [exports.ERROR_CODES.INSUFFICIENT_PERMISSIONS]: '접근 권한이 없습니다.',
    [exports.ERROR_CODES.INVALID_TOKEN]: '유효하지 않은 토큰입니다.',
    [exports.ERROR_CODES.EXPIRED_TOKEN]: '만료된 토큰입니다.',
    [exports.ERROR_CODES.RESOURCE_NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
    [exports.ERROR_CODES.STUDENT_NOT_FOUND]: '학생을 찾을 수 없습니다.',
    [exports.ERROR_CODES.ATTENDANCE_RECORD_NOT_FOUND]: '출석 기록을 찾을 수 없습니다.',
    [exports.ERROR_CODES.DUPLICATE_RESOURCE]: '이미 존재하는 리소스입니다.',
    [exports.ERROR_CODES.SEAT_NUMBER_CONFLICT]: '이미 사용 중인 좌석 번호입니다.',
    [exports.ERROR_CODES.INTERNAL_SERVER_ERROR]: '서버 내부 오류가 발생했습니다.',
    [exports.ERROR_CODES.DATABASE_CONNECTION_ERROR]: '데이터베이스 연결에 실패했습니다.',
    [exports.ERROR_CODES.DATABASE_QUERY_ERROR]: '데이터베이스 쿼리 실행 중 오류가 발생했습니다.',
    [exports.ERROR_CODES.EXTERNAL_SERVICE_ERROR]: '외부 서비스 호출 중 오류가 발생했습니다.',
    [exports.ERROR_CODES.NETWORK_TIMEOUT]: '네트워크 요청 시간이 초과되었습니다.',
    [exports.ERROR_CODES.NETWORK_CONNECTION_ERROR]: '네트워크 연결을 확인해주세요.',
    [exports.ERROR_CODES.INVALID_ATTENDANCE_STATUS]: '유효하지 않은 출석 상태입니다.',
    [exports.ERROR_CODES.INVALID_TIME_FORMAT]: '유효하지 않은 시간 형식입니다.',
    [exports.ERROR_CODES.DUPLICATE_ATTENDANCE]: '이미 존재하는 출석 기록입니다.',
    [exports.ERROR_CODES.STUDENT_ALREADY_EXISTS]: '이미 존재하는 학생입니다.'
};
// 커스텀 에러 클래스
class AppError extends Error {
    constructor(type, code, message, statusCode = api_constants_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, details, requestId) {
        super(message || exports.ERROR_MESSAGES[code] || '알 수 없는 오류가 발생했습니다.');
        this.type = type;
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        this.timestamp = new Date().toISOString();
        this.requestId = requestId;
        // 스택 트레이스 유지
        Error.captureStackTrace(this, this.constructor);
    }
    // 에러 타입별 정적 생성자
    static validation(code, message, details, requestId) {
        return new AppError(exports.ErrorType.VALIDATION, code, message, api_constants_1.HTTP_STATUS_CODES.BAD_REQUEST, details, requestId);
    }
    static notFound(code, message, details, requestId) {
        return new AppError(exports.ErrorType.NOT_FOUND, code, message, api_constants_1.HTTP_STATUS_CODES.NOT_FOUND, details, requestId);
    }
    static unauthorized(code, message, details, requestId) {
        return new AppError(exports.ErrorType.UNAUTHORIZED, code, message, api_constants_1.HTTP_STATUS_CODES.UNAUTHORIZED, details, requestId);
    }
    static forbidden(code, message, details, requestId) {
        return new AppError(exports.ErrorType.FORBIDDEN, code, message, api_constants_1.HTTP_STATUS_CODES.FORBIDDEN, details, requestId);
    }
    static conflict(code, message, details, requestId) {
        return new AppError(exports.ErrorType.CONFLICT, code, message, api_constants_1.HTTP_STATUS_CODES.CONFLICT, details, requestId);
    }
    static internal(code, message, details, requestId) {
        return new AppError(exports.ErrorType.INTERNAL, code, message, api_constants_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, details, requestId);
    }
    static network(code, message, details, requestId) {
        return new AppError(exports.ErrorType.NETWORK, code, message, api_constants_1.HTTP_STATUS_CODES.SERVICE_UNAVAILABLE, details, requestId);
    }
    static database(code, message, details, requestId) {
        return new AppError(exports.ErrorType.DATABASE, code, message, api_constants_1.HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR, details, requestId);
    }
    static timeout(code, message, details, requestId) {
        return new AppError(exports.ErrorType.TIMEOUT, code, message, api_constants_1.HTTP_STATUS_CODES.SERVICE_UNAVAILABLE, details, requestId);
    }
}
exports.AppError = AppError;
// 에러를 API 응답 형식으로 변환
function createErrorResponse(error) {
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
exports.createErrorResponse = createErrorResponse;
// 일반 에러를 AppError로 변환
function normalizeError(error, requestId) {
    if (error instanceof AppError) {
        return error;
    }
    // Firebase 에러 처리
    if (error.code && error.message) {
        switch (error.code) {
            case 'permission-denied':
                return AppError.forbidden(exports.ERROR_CODES.INSUFFICIENT_PERMISSIONS, error.message, error, requestId);
            case 'not-found':
                return AppError.notFound(exports.ERROR_CODES.RESOURCE_NOT_FOUND, error.message, error, requestId);
            case 'already-exists':
                return AppError.conflict(exports.ERROR_CODES.DUPLICATE_RESOURCE, error.message, error, requestId);
            case 'invalid-argument':
                return AppError.validation(exports.ERROR_CODES.INVALID_INPUT, error.message, error, requestId);
            default:
                return AppError.internal(exports.ERROR_CODES.INTERNAL_SERVER_ERROR, error.message, error, requestId);
        }
    }
    // 네트워크 에러 처리
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return AppError.network(exports.ERROR_CODES.NETWORK_CONNECTION_ERROR, '네트워크 연결에 실패했습니다.', error, requestId);
    }
    // 기본 내부 서버 에러
    return AppError.internal(exports.ERROR_CODES.INTERNAL_SERVER_ERROR, error.message || '알 수 없는 오류가 발생했습니다.', error, requestId);
}
exports.normalizeError = normalizeError;
// 에러 로깅
function logError(error, context) {
    const logData = {
        timestamp: error.timestamp,
        type: error.type,
        code: error.code,
        message: error.message,
        statusCode: error.statusCode,
        requestId: error.requestId,
        details: error.details,
        context,
        stack: error.stack
    };
    // 개발 환경에서는 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
        console.error('🚨 Application Error:', logData);
    }
    else {
        // 프로덕션 환경에서는 구조화된 로깅
        console.error(JSON.stringify(logData));
    }
}
exports.logError = logError;
// 에러 처리 미들웨어
function errorHandler(error, requestId) {
    const normalizedError = normalizeError(error, requestId);
    logError(normalizedError);
    return createErrorResponse(normalizedError);
}
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.utils.js.map