// 애플리케이션 에러 기본 클래스
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 리소스 찾을 수 없음 에러
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id 
      ? `${resource} with id ${id} not found`
      : `${resource} not found`;
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

// 중복 리소스 에러
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

// 유효하지 않은 입력 에러
export class ValidationError extends AppError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, 400);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// 권한 없음 에러
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

// 금지된 작업 에러
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

// 데이터베이스 에러
export class DatabaseError extends AppError {
  constructor(message: string, originalError?: Error) {
    super(`Database error: ${message}`, 500, false);
    this.name = 'DatabaseError';
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

// 타입 안전한 에러 생성 헬퍼 함수들
export const createNotFoundError = (resource: string, id?: string): NotFoundError => {
  return new NotFoundError(resource, id);
};

export const createConflictError = (message: string): ConflictError => {
  return new ConflictError(message);
};

export const createValidationError = (message: string, field?: string): ValidationError => {
  return new ValidationError(message, field);
};

export const createDatabaseError = (message: string, originalError?: Error): DatabaseError => {
  return new DatabaseError(message, originalError);
};

// 에러 타입 가드 함수들
export const isAppError = (error: any): error is AppError => {
  return error instanceof AppError;
};

export const isNotFoundError = (error: any): error is NotFoundError => {
  return error instanceof NotFoundError;
};

export const isConflictError = (error: any): error is ConflictError => {
  return error instanceof ConflictError;
};

export const isValidationError = (error: any): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isDatabaseError = (error: any): error is DatabaseError => {
  return error instanceof DatabaseError;
}; 