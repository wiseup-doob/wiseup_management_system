import React from 'react'
import './ClassTable.css'

interface ClassTableProps {
  className?: string
  classSchedules?: ClassSchedule[]
}

// ClassSchedule 타입 정의
interface ClassSchedule {
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  startTime: string
  endTime: string
}

export const ClassTable: React.FC<ClassTableProps> = ({ className = '', classSchedules = [] }) => {
  // 요일 표시명
  const dayNames: Record<string, string> = {
    monday: '월',
    tuesday: '화',
    wednesday: '수',
    thursday: '목',
    friday: '금',
    saturday: '토',
    sunday: '일'
  }

  // 전체 요일 (월~일 7일 모두 표시)
  const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  // 고정 시간대 (9:00부터 17:00까지 1시간 단위)
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
  ]

  // 특정 요일과 시간대에 수업이 있는지 확인
  const hasClassAtTime = (day: string, timeSlot: string) => {
    return classSchedules.some(schedule => 
      schedule.dayOfWeek === day && schedule.startTime === timeSlot
    )
  }

  // 특정 요일과 시간대의 수업 정보 가져오기
  const getClassAtTime = (day: string, timeSlot: string) => {
    return classSchedules.find(schedule => 
      schedule.dayOfWeek === day && schedule.startTime === timeSlot
    )
  }

  // 수업이 없을 때 표시할 내용
  if (!classSchedules || classSchedules.length === 0) {
    return (
      <div className={`class-table ${className}`}>
        <div className="class-table-empty">
          <p>등록된 수업 일정이 없습니다.</p>
          <p>수업을 추가하면 시간표가 표시됩니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`class-table ${className}`}>
      <div className="class-table-header">
        <h3>수업 시간표</h3>
      </div>
      
      <div className="class-table-content">
        <table className="timetable">
          <thead>
            <tr>
              <th className="time-header">시간</th>
              {allDays.map(day => (
                <th key={day} className="day-header">
                  {dayNames[day]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(timeSlot => (
              <tr key={timeSlot}>
                <td className="time-cell">{timeSlot}</td>
                {allDays.map(day => {
                  const hasClass = hasClassAtTime(day, timeSlot)
                  const classInfo = getClassAtTime(day, timeSlot)
                  
                  return (
                    <td key={`${day}-${timeSlot}`} className={`schedule-cell ${hasClass ? 'has-class' : ''}`}>
                      {hasClass && classInfo ? (
                        <div className="class-info">
                          <div className="class-time">
                            {classInfo.startTime} - {classInfo.endTime}
                          </div>
                        </div>
                      ) : (
                        <span className="no-class">-</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {classSchedules.length > 0 && (
        <div className="schedule-summary">
          <h4>수업 일정 요약</h4>
          <div className="schedule-list">
            {classSchedules.map((schedule, index) => (
              <div key={index} className="schedule-item">
                <span className="day">{dayNames[schedule.dayOfWeek]}</span>
                <span className="time">{schedule.startTime} - {schedule.endTime}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ClassTable
