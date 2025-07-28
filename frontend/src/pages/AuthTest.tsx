import React, { useState } from 'react'

// 🌐 API Base URL (로컬 개발용)
const API_BASE = 'http://localhost:5001/wiseupmanagementsystem/us-central1/api'

interface ApiResponse {
  success: boolean
  data?: any
  error?: string
}

const AuthTest: React.FC = () => {
  const [results, setResults] = useState<Record<string, ApiResponse>>({})
  const [currentUserId, setCurrentUserId] = useState<string>('')

  // 🔧 API 호출 헬퍼 함수
  const callApi = async (name: string, url: string, options: RequestInit = {}) => {
    try {
      setResults(prev => ({ ...prev, [name]: { success: false, data: 'Loading...' } }))
      
      const response = await fetch(`${API_BASE}${url}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResults(prev => ({ ...prev, [name]: { success: true, data } }))
        
        // 로그인/회원가입 성공 시 user_id 저장
        if ((name === 'register' || name === 'login') && data.user?.user_id) {
          setCurrentUserId(data.user.user_id)
        }
      } else {
        setResults(prev => ({ ...prev, [name]: { success: false, error: data.message || 'API Error' } }))
      }
    } catch (error) {
      setResults(prev => ({ ...prev, [name]: { success: false, error: String(error) } }))
    }
  }

  // 🆕 회원가입 테스트
  const testRegister = () => {
    const userData = {
      name: '테스트유저',
      phone: '010-1234-5678',
      email: 'test@example.com',
      password: 'TestPass123!',
      status: 'active'
    }
    callApi('register', '/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })
  }

  // 🔑 로그인 테스트
  const testLogin = () => {
    const loginData = {
      email: 'test@example.com',
      password: 'TestPass123!'
    }
    callApi('login', '/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData)
    })
  }

  // 🔒 비밀번호 변경 테스트
  const testChangePassword = () => {
    if (!currentUserId) {
      alert('먼저 로그인하세요!')
      return
    }
    
    const passwordData = {
      currentPassword: 'TestPass123!',
      newPassword: 'NewTestPass456!'
    }
    callApi('changePassword', `/auth/password/${currentUserId}`, {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    })
  }

  // 🚪 로그아웃 테스트
  const testLogout = () => {
    if (!currentUserId) {
      alert('먼저 로그인하세요!')
      return
    }
    
    callApi('logout', `/auth/logout/${currentUserId}`, {
      method: 'POST'
    })
  }

  // 📧 비밀번호 재설정 요청 테스트
  const testPasswordReset = () => {
    const resetData = {
      email: 'test@example.com'
    }
    callApi('passwordReset', '/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify(resetData)
    })
  }

  // 🎨 결과 표시 컴포넌트
  const ResultDisplay = ({ name, result }: { name: string, result?: ApiResponse }) => (
    <div style={{ 
      margin: '10px 0', 
      padding: '15px', 
      border: '2px solid #ddd', 
      borderRadius: '10px',
      backgroundColor: result?.success ? '#d4edda' : result?.error ? '#f8d7da' : '#f8f9fa',
      borderColor: result?.success ? '#28a745' : result?.error ? '#dc3545' : '#6c757d'
    }}>
      <h4 style={{ 
        margin: '0 0 10px 0',
        color: result?.success ? '#155724' : result?.error ? '#721c24' : '#495057',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        {name}
      </h4>
      {result ? (
        <pre style={{ 
          fontSize: '12px', 
          overflow: 'auto',
          backgroundColor: result?.success ? '#ffffff' : result?.error ? '#ffffff' : '#ffffff',
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #e9ecef',
          margin: 0,
          whiteSpace: 'pre-wrap',
          color: result?.success ? '#155724' : result?.error ? '#721c24' : '#495057'
        }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : (
        <p style={{ 
          margin: 0,
          color: '#6c757d',
          fontStyle: 'italic'
        }}>
          테스트를 실행하세요
        </p>
      )}
    </div>
  )

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        textAlign: 'center',
        color: '#212529',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        🔐 Auth API 테스트 페이지
      </h1>
      
      {/* 현재 사용자 ID 표시 */}
      {currentUserId && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#cce7ff', 
          borderRadius: '10px', 
          marginBottom: '20px',
          border: '2px solid #007bff',
          color: '#004085',
          fontWeight: 'bold'
        }}>
          <strong>현재 로그인된 사용자 ID:</strong> {currentUserId}
        </div>
      )}

      {/* API 테스트 버튼들 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <button 
          onClick={testRegister}
          style={{ 
            padding: '15px', 
            fontSize: '14px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#218838'}
          onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#28a745'}
        >
          🆕 회원가입 테스트
        </button>
        
        <button 
          onClick={testLogin}
          style={{ 
            padding: '15px', 
            fontSize: '14px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#007bff'}
        >
          🔑 로그인 테스트
        </button>
        
        <button 
          onClick={testChangePassword}
          style={{ 
            padding: '15px', 
            fontSize: '14px', 
            backgroundColor: '#fd7e14', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#e55d00'}
          onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#fd7e14'}
        >
          🔒 비밀번호 변경
        </button>
        
        <button 
          onClick={testLogout}
          style={{ 
            padding: '15px', 
            fontSize: '14px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#c82333'}
          onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#dc3545'}
        >
          🚪 로그아웃 테스트
        </button>
        
        <button 
          onClick={testPasswordReset}
          style={{ 
            padding: '15px', 
            fontSize: '14px', 
            backgroundColor: '#6f42c1', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#5a2d91'}
          onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#6f42c1'}
        >
          📧 비밀번호 재설정
        </button>
      </div>

      {/* 테스트 결과 표시 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        <ResultDisplay name="🆕 회원가입" result={results.register} />
        <ResultDisplay name="🔑 로그인" result={results.login} />
        <ResultDisplay name="🔒 비밀번호 변경" result={results.changePassword} />
        <ResultDisplay name="🚪 로그아웃" result={results.logout} />
        <ResultDisplay name="📧 비밀번호 재설정" result={results.passwordReset} />
      </div>

      {/* 사용 가이드 */}
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#fff3cd', 
        borderRadius: '10px',
        border: '2px solid #ffc107',
        color: '#856404'
      }}>
        <h3 style={{ color: '#856404', marginBottom: '15px' }}>📖 사용 가이드</h3>
        <ol style={{ lineHeight: '1.6' }}>
          <li><strong>회원가입:</strong> test@example.com 계정으로 새 사용자 생성</li>
          <li><strong>로그인:</strong> 생성된 계정으로 로그인 (user_id 자동 저장)</li>
          <li><strong>비밀번호 변경:</strong> 로그인 후 사용 가능</li>
          <li><strong>로그아웃:</strong> 현재 로그인된 사용자 로그아웃</li>
          <li><strong>비밀번호 재설정:</strong> 이메일로 재설정 요청</li>
        </ol>
        
        <h4 style={{ color: '#856404', marginTop: '20px', marginBottom: '10px' }}>🔧 API 설정</h4>
        <p style={{ margin: '5px 0' }}>현재 API Base URL: <code style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '2px 6px', 
          borderRadius: '3px',
          border: '1px solid #dee2e6',
          color: '#495057'
        }}>{API_BASE}</code></p>
        <p style={{ margin: '5px 0' }}>로컬 개발 시 Firebase Functions 서버가 실행 중이어야 합니다.</p>
      </div>
    </div>
  )
}

export default AuthTest 