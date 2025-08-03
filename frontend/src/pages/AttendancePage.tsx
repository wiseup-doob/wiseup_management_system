import './AttendancePage.css'
import Button from '../components/Button/Button'
import ImageButton from '../components/Button/ImageButton'
import Grid from '../components/Grid/Grid'
import { useState } from 'react'

function AttendancePage() {
  // 자리별 출결 상태 관리
  const [attendanceStatus, setAttendanceStatus] = useState<Record<number, 'present' | 'absent' | 'late'>>({})

  const handleSeatClick = (seatIndex: number) => {
    console.log(`자리 ${seatIndex} 클릭`)
    // 출결 상태 토글 (present -> absent -> late -> present)
    const currentStatus = attendanceStatus[seatIndex]
    const nextStatus = currentStatus === 'present' ? 'absent' : 
                      currentStatus === 'absent' ? 'late' : 'present'
    
    setAttendanceStatus(prev => ({
      ...prev,
      [seatIndex]: nextStatus
    }))
  }

  const getButtonVariant = (seatIndex: number) => {
    const status = attendanceStatus[seatIndex]
    switch (status) {
      case 'present': return 'primary'
      case 'absent': return 'danger'
      case 'late': return 'secondary'
      default: return 'ghost'
    }
  }

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
        
        <Grid columns={6} rows={8} gap="8px" className="seat-grid">
          {Array.from({ length: 48 }, (_, index) => (
            <Button
              key={index}
              variant={getButtonVariant(index)}
              size="small"
              className="seat-button"
              onClick={() => handleSeatClick(index)}
              onHover={() => console.log(`자리 ${index} 호버`)}
              onFocus={() => console.log(`자리 ${index} 포커스`)}
            >
              학생{index + 1}
            </Button>
          ))}
        </Grid>
        
        <div className="door-indicator">
          문
        </div>
      </div>
    </div>
  )
}

export default AttendancePage 