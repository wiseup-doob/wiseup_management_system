import type { TimetableClass } from './types/timetable.types'
import './TimetableCell.css'

interface TimetableCellProps {
  classData: TimetableClass
  className?: string
  onClick?: (classData: TimetableClass) => void
}

/**
 * 개별 수업 정보를 표시하는 셀 컴포넌트
 * 수업 이름, 시간, 선생, 강의실 정보를 세로로 표시
 */
export function TimetableCell({ classData, className = '', onClick }: TimetableCellProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(classData)
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'inactive':
        return 'inactive'
      case 'cancelled':
        return 'cancelled'
      default:
        return 'active'
    }
  }

  return (
    <div
      className={`timetable-cell ${getStatusClass(classData.status)} ${className}`}
      onClick={handleClick}
      style={{
        // backgroundColor 제거 - 각 라벨에서 개별 처리
        cursor: onClick ? 'pointer' : 'default'
      }}
      title={`${classData.name} - ${classData.teacherName} (${classData.classroomName})`}
    >
      <div className="cell-content">
        {/* 수업 이름 */}
        <div className="class-name">{classData.name}</div>
        
        {/* 시작 시간 */}
        <div className="time-start">{classData.startTime}</div>
        
        {/* 구분선 */}
        <div className="time-separator">~</div>
        
        {/* 끝 시간 */}
        <div className="time-end">{classData.endTime}</div>
        
        {/* 선생 이름 */}
        <div className="teacher-name">{classData.teacherName}</div>
        
        {/* 강의실 */}
        <div className="classroom-name">{classData.classroomName}</div>
      </div>
      
      {/* 비활성 표시 */}
      {classData.status === 'inactive' && (
        <div className="inactive-overlay">
          <span>비활성</span>
        </div>
      )}
      
      {/* 취소 표시 */}
      {classData.status === 'cancelled' && (
        <div className="cancelled-overlay">
          <span>취소됨</span>
        </div>
      )}
    </div>
  )
}
