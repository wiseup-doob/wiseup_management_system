import { ApiResponse } from '../types/common';

export const createSuccessResponse = <T>(data: T, message?: string): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
  };
};

export const createErrorResponse = (message: string, error?: string): ApiResponse<never> => {
  return {
    success: false,
    message,
    error,
  };
}; 