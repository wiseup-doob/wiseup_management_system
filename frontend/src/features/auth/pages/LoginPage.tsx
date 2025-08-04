import { useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/LoginForm'
import { useAuth } from '../hooks/useAuth'
import './LoginPage.css'

export const LoginPage = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // 이미 로그인된 경우 홈으로 리다이렉트
  if (isAuthenticated) {
    navigate('/')
    return null
  }

  const handleLoginSuccess = () => {
    navigate('/')
  }

  const handleLoginError = (error: string) => {
    console.error('Login error:', error)
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>WiseUp 관리 시스템</h1>
          <p>교육 관리 시스템에 오신 것을 환영합니다</p>
        </div>
        
        <LoginForm 
          onSuccess={handleLoginSuccess}
          onError={handleLoginError}
        />
        
        <div className="login-footer">
          <p>&copy; 2024 WiseUp. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
} 