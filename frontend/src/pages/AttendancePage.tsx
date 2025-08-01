import './AttendancePage.css'

function AttendancePage() {
  return (
    <div className="attendance-page">
      <h1 className="page-title">출결 관리</h1>
      
      <div className="search-section">
        <input 
          type="text" 
          placeholder="원생을 검색하세요" 
          className="search-input"
        />
      </div>

      <div className="seat-arrangement-section">
        <h2 className="section-title">자리배치도 편집</h2>
        
        <div className="seat-grid">
          {/* 8행 6열 그리드 - 나중에 실제 구현 */}
          {Array.from({ length: 48 }, (_, index) => (
            <div key={index} className="seat-block">
              학생{index + 1}
            </div>
          ))}
        </div>
        
        <div className="door-indicator">
          문
        </div>
      </div>
    </div>
  )
}

export default AttendancePage 