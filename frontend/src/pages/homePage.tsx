import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../routes/paths'

function HomePage() {
    const navigate = useNavigate()
    
    const buttonStyle = {
        padding: '15px 25px',
        margin: '10px',
        fontSize: '16px',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        minWidth: '200px'
    }

    const apiTestButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#4caf50',
        color: 'white',
        fontWeight: 'bold'
    }

    const regularButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#2196f3',
        color: 'white'
    }

    return (
        <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            maxWidth: '800px', 
            margin: '0 auto',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h1 style={{ 
                color: '#333', 
                marginBottom: '40px',
                fontSize: '2.5em'
            }}>
                🏠 WiseUp Management System
            </h1>
            
            <div style={{ marginBottom: '40px' }}>
                <h2 style={{ color: '#666', marginBottom: '20px' }}>🧪 API 테스트 페이지</h2>
                <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    justifyContent: 'center',
                    gap: '10px'
                }}>
                    <button 
                        onClick={() => navigate(ROUTES.AUTH_TEST)}
                        style={apiTestButtonStyle}
                    >
                        🔐 Auth API 테스트
                    </button>
                    
                    <button 
                        onClick={() => navigate(ROUTES.USERS_TEST)}
                        style={apiTestButtonStyle}
                    >
                        👤 Users API 테스트
                    </button>

                    <button
                        onClick={() => navigate(ROUTES.STUDENTS_TEST)}
                        style={{
                            ...buttonStyle,
                            backgroundColor: '#6f42c1',
                            marginBottom: '20px'
                        }}
                        onMouseOver={(e) => (e.target as HTMLElement).style.backgroundColor = '#5a2d91'}
                        onMouseOut={(e) => (e.target as HTMLElement).style.backgroundColor = '#6f42c1'}
                    >
                        📚 Students API 테스트
                    </button>
                </div>
            </div>

            <div>
                <h2 style={{ color: '#666', marginBottom: '20px' }}>📄 기존 페이지</h2>
                <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    justifyContent: 'center',
                    gap: '10px'
                }}>
                    <button 
                        onClick={() => navigate(ROUTES.GREETING)}
                        style={regularButtonStyle}
                    >
                        👋 Greeting 페이지
                    </button>
                    
                    <button 
                        onClick={() => navigate(ROUTES.STUDENTTEST)}
                        style={regularButtonStyle}
                    >
                        🎓 Student Test 페이지
                    </button>
                </div>
            </div>

            {/* 사용 가이드 */}
            <div style={{ 
                marginTop: '60px', 
                padding: '20px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '10px',
                textAlign: 'left'
            }}>
                <h3 style={{ color: '#333', marginBottom: '15px' }}>📖 사용 가이드</h3>
                <ol style={{ color: '#666', lineHeight: '1.6' }}>
                    <li><strong>🔐 Auth API 테스트:</strong> 회원가입, 로그인, 비밀번호 변경 등 인증 기능 테스트</li>
                    <li><strong>👤 Users API 테스트:</strong> 사용자 조회, 검색, 프로필 수정, 삭제 등 사용자 관리 기능 테스트</li>
                    <li><strong>📚 Students API 테스트:</strong> 학생 정보 등록, User ID 연동, 학생 검색, 수정, 삭제 등 학생 관리 기능 테스트</li>
                    <li><strong>테스트 순서:</strong> Auth 페이지에서 회원가입 → Users 페이지에서 사용자 관리 → Students 페이지에서 User ID 연동 학생 정보 관리</li>
                </ol>
                
                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px', 
                    backgroundColor: '#fff3e0', 
                    borderRadius: '5px',
                    border: '1px solid #ffcc02'
                }}>
                    <h4 style={{ color: '#e65100', margin: '0 0 10px 0' }}>⚠️ 주의사항</h4>
                    <p style={{ color: '#bf360c', margin: 0, fontSize: '14px' }}>
                        API 테스트 전에 백엔드 Firebase Functions 서버가 실행 중인지 확인하세요.<br/>
                        <code>firebase emulators:start</code> 또는 배포된 서버를 사용해야 합니다.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default HomePage
