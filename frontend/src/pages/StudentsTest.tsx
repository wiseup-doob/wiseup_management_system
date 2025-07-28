import React, { useState } from 'react'

// 🌐 API Base URL (로컬 개발용)
const API_BASE = 'http://localhost:5001/wiseupmanagementsystem/us-central1/api'

interface ApiResponse {
  success: boolean
  data?: any
  error?: string
}

const StudentsTest: React.FC = () => {
  const [results, setResults] = useState<Record<string, ApiResponse>>({})
  const [testStudentId, setTestStudentId] = useState<string>('')
  const [testUserId, setTestUserId] = useState<string>('')
  const [searchFilters, setSearchFilters] = useState({
    user_id: '',
    name: '',
    school: '',
    grade: ''
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

  // 👥 전체 학생 목록 조회
  const testGetAllStudents = () => {
    callApi('getAllStudents', '/students')
  }

  // 👤 특정 학생 조회
  const testGetStudentById = () => {
    if (!testStudentId) {
      alert('Student ID를 입력하세요!')
      return
    }
    callApi('getStudentById', `/students/${testStudentId}`)
  }

  // 🆕 user_id로 학생 조회
  const testGetStudentByUserId = () => {
    if (!testUserId) {
      alert('User ID를 입력하세요!')
      return
    }
    callApi('getStudentByUserId', `/students/user/${testUserId}`)
  }

  // 🔍 학생 검색 (필터)
  const testSearchStudents = () => {
    const params = new URLSearchParams()
    if (searchFilters.user_id) params.append('user_id', searchFilters.user_id)
    if (searchFilters.name) params.append('name', searchFilters.name)
    if (searchFilters.school) params.append('school', searchFilters.school)
    if (searchFilters.grade) params.append('grade', searchFilters.grade)
    
    const queryString = params.toString()
    callApi('searchStudents', `/students/search${queryString ? `?${queryString}` : ''}`)
  }

  // ✏️ 학생 생성
  const testCreateStudent = () => {
    if (!testStudentId || !testUserId) {
      alert('Student ID와 User ID를 모두 입력하세요!')
      return
    }
    
    const studentData = {
      user_id: testUserId,
      name: '김철수',
      school: '서울고등학교',
      grade: 2,
      phoneNumber: '010-1234-5678',
      targetUniversity: '서울대학교'
    }
    callApi('createStudent', `/students/${testStudentId}`, {
      method: 'POST',
      body: JSON.stringify(studentData)
    })
  }

  // ✏️ 학생 정보 수정
  const testUpdateStudent = () => {
    if (!testStudentId) {
      alert('Student ID를 입력하세요!')
      return
    }
    
    const updateData = {
      name: '수정된이름',
      school: '부산고등학교',
      grade: 3,
      phoneNumber: '010-9999-8888',
      targetUniversity: '연세대학교'
    }
    callApi('updateStudent', `/students/${testStudentId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
  }

  // 🗑️ 학생 삭제
  const testDeleteStudent = () => {
    if (!testStudentId) {
      alert('Student ID를 입력하세요!')
      return
    }
    
    if (!confirm('정말로 학생을 삭제하시겠습니까?')) {
      return
    }
    
    callApi('deleteStudent', `/students/${testStudentId}`, {
      method: 'DELETE'
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
        📚 Students API 테스트 페이지
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
        {/* Student ID 입력 */}
        <div>
          <label style={{ 
            color: '#495057',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            <strong>🆔 Student ID:</strong>
          </label>
          <input
            type="text"
            value={testStudentId}
            onChange={(e) => setTestStudentId(e.target.value)}
            placeholder="학생 ID 입력 (예: student_001)"
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

        {/* User ID 입력 */}
        <div>
          <label style={{ 
            color: '#495057',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            <strong>🔑 User ID:</strong>
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
            <input
              type="text"
              value={searchFilters.user_id}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, user_id: e.target.value }))}
              placeholder="User ID 검색"
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
              type="text"
              value={searchFilters.school}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, school: e.target.value }))}
              placeholder="학교 검색"
              style={{ 
                padding: '8px', 
                border: '2px solid #ced4da', 
                borderRadius: '5px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            <select
              value={searchFilters.grade}
              onChange={(e) => setSearchFilters(prev => ({ ...prev, grade: e.target.value }))}
              style={{ 
                padding: '8px', 
                border: '2px solid #ced4da', 
                borderRadius: '5px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="">학년 선택</option>
              <option value="1">1학년</option>
              <option value="2">2학년</option>
              <option value="3">3학년</option>
            </select>
          </div>
        </div>
      </div>

      {/* API 테스트 버튼들 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <button 
          onClick={testGetAllStudents}
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
          👥 전체 학생 조회
        </button>
        
        <button 
          onClick={testGetStudentById}
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
          👤 ID로 학생 조회
        </button>
        
        <button 
          onClick={testGetStudentByUserId}
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
          🔑 User ID로 조회
        </button>
        
        <button 
          onClick={testSearchStudents}
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
          🔍 학생 검색
        </button>
        
        <button 
          onClick={testCreateStudent}
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
          ➕ 학생 생성
        </button>
        
        <button 
          onClick={testUpdateStudent}
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
          ✏️ 학생 수정
        </button>
        
        <button 
          onClick={testDeleteStudent}
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
          🗑️ 학생 삭제
        </button>
      </div>

      {/* 테스트 결과 표시 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        <ResultDisplay name="👥 전체 학생" result={results.getAllStudents} />
        <ResultDisplay name="👤 ID로 조회" result={results.getStudentById} />
        <ResultDisplay name="🔑 User ID로 조회" result={results.getStudentByUserId} />
        <ResultDisplay name="🔍 학생 검색" result={results.searchStudents} />
        <ResultDisplay name="➕ 학생 생성" result={results.createStudent} />
        <ResultDisplay name="✏️ 학생 수정" result={results.updateStudent} />
        <ResultDisplay name="🗑️ 학생 삭제" result={results.deleteStudent} />
      </div>

      {/* 사용 가이드 */}
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#e7f3ff', 
        borderRadius: '10px',
        border: '2px solid #007bff',
        color: '#004085'
      }}>
        <h3 style={{ color: '#004085', marginBottom: '15px' }}>📖 사용 가이드</h3>
        <ol style={{ lineHeight: '1.6' }}>
          <li><strong>전체 학생 조회:</strong> 시스템의 모든 학생 목록 확인</li>
          <li><strong>ID로 조회:</strong> 특정 학생 ID로 상세 정보 조회</li>
          <li><strong>User ID로 조회:</strong> 사용자 ID로 연결된 학생 정보 검색</li>
          <li><strong>학생 검색:</strong> User ID, 이름, 학교, 학년으로 필터링</li>
          <li><strong>학생 생성:</strong> 새로운 학생 정보 등록 (User ID 연결)</li>
          <li><strong>학생 수정:</strong> 기존 학생 정보 업데이트</li>
          <li><strong>학생 삭제:</strong> 학생 완전 삭제 (주의!)</li>
        </ol>
        
        <h4 style={{ color: '#004085', marginTop: '20px', marginBottom: '10px' }}>🔧 API 설정</h4>
        <p style={{ margin: '5px 0' }}>현재 API Base URL: <code style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '2px 6px', 
          borderRadius: '3px',
          border: '1px solid #dee2e6',
          color: '#495057'
        }}>{API_BASE}</code></p>
        <p style={{ margin: '5px 0' }}>먼저 Auth 페이지에서 회원가입을 하여 User ID를 생성하세요.</p>
        
        <h4 style={{ color: '#004085', marginTop: '20px', marginBottom: '10px' }}>💡 팁</h4>
        <ul style={{ lineHeight: '1.6' }}>
          <li>Auth 페이지에서 회원가입 후 받은 user_id를 여기서 사용하세요</li>
          <li>학생 생성 시 Student ID와 User ID를 모두 입력해야 합니다</li>
          <li>검색 필터는 단독으로도, 조합해서도 사용 가능합니다</li>
          <li>User ID로 조회하면 해당 사용자와 연결된 학생 정보를 찾을 수 있습니다</li>
          <li>삭제 기능은 신중히 사용하세요 (복구 불가능)</li>
        </ul>
        
        <h4 style={{ color: '#004085', marginTop: '20px', marginBottom: '10px' }}>🎯 테스트 순서 추천</h4>
        <ol style={{ lineHeight: '1.6' }}>
          <li>Auth 페이지에서 회원가입 → User ID 획득</li>
          <li>Student ID와 User ID 입력</li>
          <li>"학생 생성" 버튼으로 테스트 데이터 생성</li>
          <li>"User ID로 조회"로 연결 확인</li>
          <li>다른 검색 기능들 테스트</li>
        </ol>
      </div>
    </div>
  )
}

export default StudentsTest 