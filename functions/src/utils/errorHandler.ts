import { ERROR_MESSAGES } from '../config/constants';

export enum ErrorType {
  VALIDATION = 'VALIDATION',
  DATABASE = 'DATABASE',
  API = 'API',
  AUTHENTICATION = 'AUTHENTICATION',
  STUDENT = 'STUDENT',
  ATTENDANCE = 'ATTENDANCE',
  UNKNOWN = 'UNKNOWN'
}

export interface ServerError {
  type: ErrorType;
  message: string;
  statusCode: number;
  details?: any;
  timestamp: Date;
}

export interface ValidationError {
  type: ErrorType.VALIDATION;
  field: string;
  message: string;
  value?: any;
}

export interface DatabaseError {
  type: ErrorType.DATABASE;
  operation: string;
  collection?: string;
  documentId?: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: string;
  statusCode: number;
  timestamp: string;
}

export class ErrorHandler {
  static createValidationError(field: string, message: string, value?: any): ValidationError {
    return {
      type: ErrorType.VALIDATION,
      field,
      message,
      value
    };
  }

  static createDatabaseError(operation: string, message: string, collection?: string, documentId?: string): DatabaseError {
    return {
      type: ErrorType.DATABASE,
      operation,
      collection,
      documentId,
      message
    };
  }

  static createStudentError(message: string, studentId?: string): ServerError {
    return {
      type: ErrorType.STUDENT,
      message: message || ERROR_MESSAGES.STUDENT_NOT_FOUND,
      statusCode: 404,
      details: { studentId },
      timestamp: new Date()
    };
  }

  static createAttendanceError(message: string, studentId?: string, status?: string): ServerError {
    return {
      type: ErrorType.ATTENDANCE,
      message: message || ERROR_MESSAGES.INVALID_ATTENDANCE_STATUS,
      statusCode: 400,
      details: { studentId, status },
      timestamp: new Date()
    };
  }

  static createApiErrorResponse(error: ServerError): ApiErrorResponse {
    return {
      success: false,
      message: error.message,
      error: error.type,
      statusCode: error.statusCode,
      timestamp: error.timestamp.toISOString()
    };
  }

  static logError(error: ServerError, context?: string): void {
    const logData = {
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
      context,
      timestamp: error.timestamp.toISOString()
    };
    
    console.error('Server Error logged:', logData);
    
    // TODO: 실제 로깅 서비스로 전송
    // firebase.logger.error('server_error', logData);
  }

  static getHttpStatusCode(errorType: ErrorType): number {
    switch (errorType) {
      case ErrorType.VALIDATION:
        return 400;
      case ErrorType.AUTHENTICATION:
        return 401;
      case ErrorType.STUDENT:
        return 404;
      case ErrorType.ATTENDANCE:
        return 400;
      case ErrorType.DATABASE:
        return 500;
      case ErrorType.API:
        return 500;
      default:
        return 500;
    }
  }

  static handleGeneralError(error: any, context?: string): ServerError {
    if (error instanceof Error) {
      return {
        type: ErrorType.UNKNOWN,
        message: error.message || ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
        statusCode: 500,
        details: { originalError: error.message },
        timestamp: new Date()
      };
    }
    
    return {
      type: ErrorType.UNKNOWN,
      message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      statusCode: 500,
      details: error,
      timestamp: new Date()
    };
  }
} 