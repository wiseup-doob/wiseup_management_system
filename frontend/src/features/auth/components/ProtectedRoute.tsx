import { useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
  redirectTo?: string
}

export const ProtectedRoute = ({ 
  children, 
  fallback = <div>인증이 필요합니다.</div>,
  redirectTo = '/login'
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, fetchCurrentUser, user } = useAuth()

  useEffect(() => {
    // 인증 상태가 없지만 토큰이 있는 경우 사용자 정보 조회 시도
    if (!isAuthenticated && !isLoading && !user) {
      fetchCurrentUser()
    }
  }, [isAuthenticated, isLoading, user, fetchCurrentUser])

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>인증 확인 중...</p>
      </div>
    )
  }

  // 인증되지 않은 경우
  if (!isAuthenticated) {
    // 리다이렉트 처리
    useEffect(() => {
      window.location.href = redirectTo
    }, [redirectTo])
    
    return <>{fallback}</>
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return <>{children}</>
} 