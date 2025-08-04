export class AppError extends Error {
  public code: string
  public statusCode?: number

  constructor(
    message: string,
    code: string,
    statusCode?: number
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends AppError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR', 0)
    this.name = 'NetworkError'
  }
}

export class ApiError extends AppError {
  constructor(message: string, statusCode: number) {
    super(message, 'API_ERROR', statusCode)
    this.name = 'ApiError'
  }
}

export const handleApiError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, 'UNKNOWN_ERROR')
  }
  
  return new AppError('알 수 없는 오류가 발생했습니다', 'UNKNOWN_ERROR')
}

export const handleValidationError = (field: string, message: string): ValidationError => {
  return new ValidationError(`${field}: ${message}`)
}

export const handleNetworkError = (error: Error): NetworkError => {
  return new NetworkError(`네트워크 오류: ${error.message}`)
}

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError
}

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError
}

export const isNetworkError = (error: unknown): error is NetworkError => {
  return error instanceof NetworkError
}

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return '알 수 없는 오류가 발생했습니다'
}

export const getErrorCode = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.code
  }
  
  return 'UNKNOWN_ERROR'
} 