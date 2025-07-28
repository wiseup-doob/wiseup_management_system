import React, { useState } from 'react'

// 🌐 API Base URL (로컬 개발용)
const API_BASE = 'http://localhost:5001/wiseupmanagementsystem/us-central1/api'

interface ApiResponse {
  success: boolean
  data?: any
  error?: string
}

const UsersTest: React.FC = () => {
  const [results, setResults] = useState<Record<string, ApiResponse>>({})
  const [testUserId, setTestUserId] = useState<string>('')
  const [searchFilters, setSearchFilters] = useState({
    status: '',
    name: '',
    email: '',
    phone: ''
  })

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
      } else {
        setResults(prev => ({ ...prev, [name]: { success: false, error: data.message || 'API Error' } }))
      }
    } catch (error) {
      setResults(prev => ({ ...prev, [name]: { success: false, error: String(error) } }))
    }
  }

  // 👥 전체 사용자 목록 조회
  const testGetAllUsers = () => {
    callApi('getAllUsers', '/users')
  }

  // 👤 특정 사용자 조회
  const testGetUserById = () => {
    if (!testUserId) {
      alert('User ID를 입력하세요!')
      return
    }
    callApi('getUserById', `/users/${testUserId}`)
  }

  // 📧 이메일로 사용자 조회
  const testGetUserByEmail = () => {
    const email = 'test@example.com'
    callApi('getUserByEmail', `/users/email/${email}`)
  }

  // 🔍 사용자 검색 (필터)
  const testSearchUsers = () => {
    const params = new URLSearchParams()
    if (searchFilters.status) params.append('status', searchFilters.status)
    if (searchFilters.name) params.append('name', searchFilters.name)
    if (searchFilters.email) params.append('email', searchFilters.email)
    if (searchFilters.phone) params.append('phone', searchFilters.phone)
    
    const queryString = params.toString()
    callApi('searchUsers', `/users/search${queryString ? `?${queryString}` : ''}`)
  }

  // ✏️ 사용자 프로필 수정
  const testUpdateUser = () => {
    if (!testUserId) {
      alert('User ID를 입력하세요!')
      return
    }
    
    const updateData = {
      name: '수정된이름',
      phone: '010-9999-8888',
      email: 'updated@example.com',
      status: 'inactive'
    }
    callApi('updateUser', `/users/${testUserId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
  }

  // 🗑️ 사용자 삭제
  const testDeleteUser = () => {
    if (!testUserId) {
      alert('User ID를 입력하세요!')
      return
    }
    
    if (!confirm('정말로 사용자를 삭제하시겠습니까?')) {
      return
    }
    
    callApi('deleteUser', `/users/${testUserId}`, {
      method: 'DELETE'
    })
  }

  // ✅ 이메일 중복 체크
  const testCheckEmail = () => {
    const email = 'test@example.com'
    callApi('checkEmail', `/users/check/email/${email}`)
  }

  // ✅ 전화번호 중복 체크
  const testCheckPhone = () => {
    const phone = '010-1234-5678'
    callApi('checkPhone', `/users/check/phone/${phone}`)
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
          maxHeight: '200px',
          backgroundColor: '#ffffff',
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
        👤 Users API 테스트 페이지
      </h1>
      
      {/* 입력 폼들 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #dee2e6'
      }}>
        {/* User ID 입력 */}
        <div>
          <label style={{ 
            color: '#495057',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            <strong>🔑 Test User ID:</strong>
          </label>
          <input
            type="text"
            value={testUserId}
            onChange={(e) => setTestUserId(e.target.value)}
            placeholder="사용자 ID 입력 (예: 1703123456789)"
            style={{ 
              width: '100%', 
              padding: '10px', 
              marginTop: '8px',
              border: '2px solid #ced4da',
              borderRadius: '5px',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s ease'
            }}
            onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#007bff'}
            onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = '#ced4da'}
          />
        </div>

        {/* 검색 필터 */}
        <div>
          <label style={{ 
            color: '#495057',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            <strong>🔍 검색 필터:</strong>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            <select
              value={searchFilters.status}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, status: e.target.value }))}
              style={{ 
                padding: '8px', 
                border: '2px solid #ced4da', 
                borderRadius: '5px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="">상태 선택</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <input
              type="text"
              value={searchFilters.name}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, name: e.target.value }))}
              placeholder="이름 검색"
              style={{ 
                padding: '8px', 
                border: '2px solid #ced4da', 
                borderRadius: '5px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <input
              type="email"
              value={searchFilters.email}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, email: e.target.value }))}
              placeholder="이메일 검색"
              style={{ 
                padding: '8px', 
                border: '2px solid #ced4da', 
                borderRadius: '5px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <input
              type="text"
              value={searchFilters.phone}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="전화번호 검색"
              style={{ 
                padding: '8px', 
                border: '2px solid #ced4da', 
                borderRadius: '5px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* API 테스트 버튼들 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <button 
          onClick={testGetAllUsers}
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
          👥 전체 사용자 조회
        </button>
        
        <button 
          onClick={testGetUserById}
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
          👤 ID로 사용자 조회
        </button>
        
        <button 
          onClick={testGetUserByEmail}
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
          📧 이메일로 조회
        </button>
        
        <button 
          onClick={testSearchUsers}
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
          🔍 사용자 검색
        </button>
        
        <button 
          onClick={testUpdateUser}
          style={{ 
            padding: '15px', 
            fontSize: '14px', 
            backgroundColor: '#20c997', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#1aa085'}
          onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#20c997'}
        >
          ✏️ 프로필 수정
        </button>
        
        <button 
          onClick={testDeleteUser}
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
          🗑️ 사용자 삭제
        </button>
        
        <button 
          onClick={testCheckEmail}
          style={{ 
            padding: '15px', 
            fontSize: '14px', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#5a6268'}
          onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#6c757d'}
        >
          ✅ 이메일 중복체크
        </button>
        
        <button 
          onClick={testCheckPhone}
          style={{ 
            padding: '15px', 
            fontSize: '14px', 
            backgroundColor: '#17a2b8', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#138496'}
          onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#17a2b8'}
        >
          ✅ 전화번호 중복체크
        </button>
      </div>

      {/* 테스트 결과 표시 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        <ResultDisplay name="👥 전체 사용자" result={results.getAllUsers} />
        <ResultDisplay name="👤 ID로 조회" result={results.getUserById} />
        <ResultDisplay name="📧 이메일로 조회" result={results.getUserByEmail} />
        <ResultDisplay name="🔍 사용자 검색" result={results.searchUsers} />
        <ResultDisplay name="✏️ 프로필 수정" result={results.updateUser} />
        <ResultDisplay name="🗑️ 사용자 삭제" result={results.deleteUser} />
        <ResultDisplay name="✅ 이메일 중복체크" result={results.checkEmail} />
        <ResultDisplay name="✅ 전화번호 중복체크" result={results.checkPhone} />
      </div>

      {/* 사용 가이드 */}
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#d1ecf1', 
        borderRadius: '10px',
        border: '2px solid #17a2b8',
        color: '#0c5460'
      }}>
        <h3 style={{ color: '#0c5460', marginBottom: '15px' }}>📖 사용 가이드</h3>
        <ol style={{ lineHeight: '1.6' }}>
          <li><strong>전체 사용자 조회:</strong> 시스템의 모든 사용자 목록 확인</li>
          <li><strong>ID로 조회:</strong> 특정 사용자 ID로 상세 정보 조회</li>
          <li><strong>이메일로 조회:</strong> test@example.com으로 사용자 검색</li>
          <li><strong>사용자 검색:</strong> 상태, 이름, 이메일, 전화번호로 필터링</li>
          <li><strong>프로필 수정:</strong> 사용자 정보 업데이트 (비밀번호 제외)</li>
          <li><strong>사용자 삭제:</strong> 사용자 완전 삭제 (주의!)</li>
          <li><strong>중복 체크:</strong> 이메일/전화번호 사용 가능 여부 확인</li>
        </ol>
        
        <h4 style={{ color: '#0c5460', marginTop: '20px', marginBottom: '10px' }}>🔧 API 설정</h4>
        <p style={{ margin: '5px 0' }}>현재 API Base URL: <code style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '2px 6px', 
          borderRadius: '3px',
          border: '1px solid #dee2e6',
          color: '#495057'
        }}>{API_BASE}</code></p>
        <p style={{ margin: '5px 0' }}>먼저 Auth 페이지에서 회원가입을 하여 테스트 데이터를 생성하세요.</p>
        
        <h4 style={{ color: '#0c5460', marginTop: '20px', marginBottom: '10px' }}>💡 팁</h4>
        <ul style={{ lineHeight: '1.6' }}>
          <li>Auth 페이지에서 회원가입 후 받은 user_id를 여기서 사용하세요</li>
          <li>검색 필터는 단독으로도, 조합해서도 사용 가능합니다</li>
          <li>삭제 기능은 신중히 사용하세요 (복구 불가능)</li>
        </ul>
      </div>
    </div>
  )
}

export default UsersTest 