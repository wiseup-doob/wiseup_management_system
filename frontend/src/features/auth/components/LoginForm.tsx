import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import type { LoginCredentials } from '../types/auth.types'
import './LoginForm.css'

interface LoginFormProps {
  onSuccess?: () => void
  onError?: (error: string) => void
}

export const LoginForm = ({ onSuccess, onError }: LoginFormProps) => {
  const { login, isLoading, error, clearError } = useAuth()
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!credentials.email || !credentials.password) {
      onError?.('이메일과 비밀번호를 입력해주세요.')
      return
    }

    const result = await login(credentials)
    
    if (result.success) {
      onSuccess?.()
    } else {
      onError?.(result.error || '로그인에 실패했습니다.')
    }
  }

  return (
    <div className="login-form">
      <h2>로그인</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">이메일</label>
          <input
            type="email"
            id="email"
            name="email"
            value={credentials.email}
            onChange={handleInputChange}
            placeholder="이메일을 입력하세요"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            name="password"
            value={credentials.password}
            onChange={handleInputChange}
            placeholder="비밀번호를 입력하세요"
            required
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="rememberMe"
              checked={credentials.rememberMe}
              onChange={handleInputChange}
              disabled={isLoading}
            />
            로그인 상태 유지
          </label>
        </div>

        <button 
          type="submit" 
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="login-links">
        <a href="/forgot-password">비밀번호 찾기</a>
        <a href="/register">회원가입</a>
      </div>
    </div>
  )
} 