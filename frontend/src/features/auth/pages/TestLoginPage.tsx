import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import './LoginPage.css'

export const TestLoginPage = () => {
  const { login, isAuthenticated, user, error } = useAuth()
  const [email, setEmail] = useState('admin@test.com')
  const [password, setPassword] = useState('admin')
  const [isLoading, setIsLoading] = useState(false)
  const [loginResult, setLoginResult] = useState<string>('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginResult('')

    try {
      const result = await login({ email, password, rememberMe: false })
      
      if (result.success) {
        setLoginResult('✅ 로그인 성공!')
      } else {
        setLoginResult(`❌ 로그인 실패: ${result.error}`)
      }
    } catch (error) {
      setLoginResult(`❌ 오류: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    // 로그아웃 로직은 useAuth 훅에서 제공
    setLoginResult('로그아웃 처리됨')
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>WiseUp 관리 시스템 - 테스트</h1>
          <p>인증 시스템 테스트 페이지</p>
        </div>
        
        <div style={{ padding: '2rem' }}>
          <h2>테스트 계정</h2>
          <p><strong>이메일:</strong> admin@test.com</p>
          <p><strong>비밀번호:</strong> admin</p>
          
          <hr style={{ margin: '1rem 0' }} />
          
          <h3>현재 상태</h3>
          <p><strong>인증 상태:</strong> {isAuthenticated ? '✅ 로그인됨' : '❌ 로그아웃됨'}</p>
          {user && (
            <p><strong>사용자:</strong> {user.name} ({user.email}) - {user.role}</p>
          )}
          
          {error && (
            <p style={{ color: 'red' }}><strong>에러:</strong> {error}</p>
          )}
          
          <hr style={{ margin: '1rem 0' }} />
          
          <h3>로그인 테스트</h3>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label>
                이메일:
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </label>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label>
                비밀번호:
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}
                />
              </label>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? '로그인 중...' : '로그인 테스트'}
            </button>
          </form>
          
          {loginResult && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '0.75rem', 
              backgroundColor: loginResult.includes('성공') ? '#d4edda' : '#f8d7da',
              border: `1px solid ${loginResult.includes('성공') ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '4px',
              color: loginResult.includes('성공') ? '#155724' : '#721c24'
            }}>
              {loginResult}
            </div>
          )}
          
          <hr style={{ margin: '1rem 0' }} />
          
          <h3>API 엔드포인트 테스트</h3>
          <p>백엔드 API가 실행 중인지 확인:</p>
          <button
            onClick={async () => {
              try {
                const response = await fetch('http://127.0.0.1:5001/wiseupmanagementsystem/us-central1/initializeAdmin', {
                  method: 'POST'
                })
                const data = await response.json()
                setLoginResult(`API 응답: ${JSON.stringify(data, null, 2)}`)
              } catch (error) {
                setLoginResult(`API 오류: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '0.5rem'
            }}
          >
            관리자 계정 초기화
          </button>
          
          <button
            onClick={async () => {
              try {
                const response = await fetch('http://127.0.0.1:5001/wiseupmanagementsystem/us-central1/login', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    email: 'admin@test.com',
                    password: 'admin'
                  })
                })
                const data = await response.json()
                setLoginResult(`로그인 API 응답: ${JSON.stringify(data, null, 2)}`)
              } catch (error) {
                setLoginResult(`로그인 API 오류: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            }}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            로그인 API 테스트
          </button>
        </div>
        
        <div className="login-footer">
          <p>&copy; 2024 WiseUp. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
} 