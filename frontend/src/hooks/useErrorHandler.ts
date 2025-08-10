import { useCallback } from 'react'
import { useAppDispatch } from './useAppDispatch'
import { setError } from '../features/attendance/slice/attendanceSlice'
import { addNotification } from '../store/slices/uiSlice'
import { ErrorHandler, type AppError } from '../utils/errorHandler'

export const useErrorHandler = () => {
  const dispatch = useAppDispatch()
  
  const handleError = useCallback((error: unknown) => {
    let appError: AppError;
    
    if (error instanceof Error) {
      appError = ErrorHandler.createApiError(error);
    } else {
      appError = {
        type: 'UNKNOWN' as any,
        message: '알 수 없는 오류가 발생했습니다.',
        details: error
      };
    }
    
    const message = ErrorHandler.getUserFriendlyMessage(appError);
    
    // Redux store에 에러 상태 저장
    dispatch(setError(message))
    
    // 알림 표시
    dispatch(addNotification({
      message,
      type: 'error'
    }))
    
    // 에러 로깅
    ErrorHandler.logError(appError, {
      component: 'useErrorHandler',
      action: 'handleError',
      timestamp: new Date()
    });
  }, [dispatch])
  
  const clearError = useCallback(() => {
    dispatch(setError(null))
  }, [dispatch])
  
  return { handleError, clearError }
} 