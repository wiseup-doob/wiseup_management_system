import './TimetableHeader.css'

interface TimetableHeaderProps {
  days: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>
  className?: string
}

/**
 * 시간표의 요일 헤더를 표시하는 컴포넌트
 * 월, 화, 수, 목, 금, 토, 일 요일 헤더 표시
 * 한국어 요일명으로 표시
 */
export function TimetableHeader({ days, className = '' }: TimetableHeaderProps) {
  const dayLabels: Record<string, string> = {
    monday: '월',
    tuesday: '화',
    wednesday: '수',
    thursday: '목',
    friday: '금',
    saturday: '토',
    sunday: '일'
  }

  return (
    <div className={`timetable-header ${className}`}>
      {/* 요일별 헤더 */}
      {days.map((day) => (
        <div
          key={day}
          className={`day-header ${day === 'saturday' ? 'saturday' : ''} ${day === 'sunday' ? 'sunday' : ''}`}
        >
          <span className="day-label">{dayLabels[day]}</span>
        </div>
      ))}
    </div>
  )
}
