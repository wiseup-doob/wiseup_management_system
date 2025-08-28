import type { TimetableTimeSlot } from './types/timetable.types'
import './TimetableTimeColumn.css'

interface TimetableTimeColumnProps {
  timeSlots: TimetableTimeSlot[]
  className?: string
}

/**
 * 시간표의 시간 열을 표시하는 컴포넌트
 * 9:00 ~ 23:00 시간대를 30분 또는 1시간 간격으로 표시
 * CSS Grid의 grid-row를 활용하여 정확한 위치에 배치
 */
export function TimetableTimeColumn({ timeSlots, className = '' }: TimetableTimeColumnProps) {
  return (
    <div className={`timetable-time-column ${className}`}>
      {timeSlots.map((timeSlot) => (
        <div key={timeSlot.id} className="time-slot">
          <span className="time-label">
            {timeSlot.startTime}
          </span>
        </div>
      ))}
    </div>
  )
}
