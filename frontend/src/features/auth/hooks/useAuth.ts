import { useAppDispatch } from '../../../hooks/useAppDispatch'
import { useAppSelector } from '../../../hooks/useAppSelector'
import { 
  loginUser, 
  logoutUser, 
  refreshToken, 
  getCurrentUser,
  setError,
  clearAuth 
} from '../slice/authSlice'
import type { LoginCredentials, RegisterRequest, ChangePasswordRequest } from '../types/auth.types'

export const useAuth = () => {
  const dispatch = useAppDispatch()
  const auth = useAppSelector(state => state.auth)

  const login = async (credentials: LoginCredentials) => {
    try {
      await dispatch(loginUser(credentials)).unwrap()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '로그인에 실패했습니다.' 
      }
    }
  }

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '로그아웃에 실패했습니다.' 
      }
    }
  }

  const refreshUserToken = async () => {
    try {
      await dispatch(refreshToken()).unwrap()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '토큰 갱신에 실패했습니다.' 
      }
    }
  }

  const fetchCurrentUser = async () => {
    try {
      await dispatch(getCurrentUser()).unwrap()
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '사용자 정보 조회에 실패했습니다.' 
      }
    }
  }

  const clearError = () => {
    dispatch(setError(null))
  }

  const forceLogout = () => {
    dispatch(clearAuth())
  }

  return {
    // 상태
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    token: auth.token,
    lastLoginAt: auth.lastLoginAt,

    // 액션
    login,
    logout,
    refreshUserToken,
    fetchCurrentUser,
    clearError,
    forceLogout
  }
} 