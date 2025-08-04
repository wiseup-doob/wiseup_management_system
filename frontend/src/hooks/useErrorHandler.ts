import { useCallback } from 'react'
import { useAppDispatch } from './useAppDispatch'
import { setError } from '../features/attendance/slice/attendanceSlice'
import { addNotification } from '../store/slices/uiSlice'
import { handleApiError, getErrorMessage } from '../utils/errorHandler'

export const useErrorHandler = () => {
  const dispatch = useAppDispatch()
  
  const handleError = useCallback((error: unknown) => {
    const appError = handleApiError(error)
    const message = getErrorMessage(error)
    
    // Redux store에 에러 상태 저장
    dispatch(setError(message))
    
    // 알림 표시
    dispatch(addNotification({
      message,
      type: 'error'
    }))
    
    // 콘솔에 에러 로깅
    console.error('Error handled:', appError)
  }, [dispatch])
  
  const clearError = useCallback(() => {
    dispatch(setError(null))
  }, [dispatch])
  
  return { handleError, clearError }
} 