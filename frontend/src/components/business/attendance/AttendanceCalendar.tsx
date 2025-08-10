import React from 'react'
import { BaseCalendar, type CalendarDay } from '../../base/BaseCalendar'
import type { BaseWidgetProps } from '../../../types/components'
import type { AttendanceRecord } from '@shared/types/attendance.types'
import type { AttendanceStatus } from '@shared/types/common.types'
import { ATTENDANCE_STATUS_STYLES } from '@shared/types/attendance.types'
import './AttendanceCalendar.css'

export interface AttendanceCalendarProps extends BaseWidgetProps {
  attendanceRecords: AttendanceRecord[]
  onDateClick?: (date: string) => void
  currentMonth?: Date
  onMonthChange?: (date: Date) => void
  selectedDate?: string
}

export const AttendanceCalendar = React.forwardRef<HTMLDivElement, AttendanceCalendarProps>(
  ({ 
    attendanceRecords,
    onDateClick,
    currentMonth = new Date(),
    onMonthChange,
    selectedDate,
    className = '',
    ...props 
  }, ref) => {

    // 특정 날짜의 출결 기록 찾기
    const getAttendanceForDate = (date: Date) => {
      const dateString = date.toISOString().split('T')[0]
      return attendanceRecords.find(record => record.date === dateString)
    }

    // 날짜 셀 렌더링 함수
    const renderDayContent = (day: CalendarDay) => {
      const attendance = getAttendanceForDate(day.date)
      
      if (!attendance) return null

      const statusInfo = ATTENDANCE_STATUS_STYLES[attendance.status]
      
      // 텍스트가 두 줄로 나뉘어야 하는 경우 처리
      const textLines = statusInfo.text.includes('\n') 
        ? statusInfo.text.split('\n') 
        : [statusInfo.text]

      return (
        <div 
          className={`attendance-indicator ${statusInfo.className}`}
          style={{ 
            backgroundColor: statusInfo.backgroundColor,
            color: statusInfo.color
          }}
        >
          {textLines.map((line, index) => (
            <div key={index} className="attendance-line">
              {line}
            </div>
          ))}
        </div>
      )
    }

    return (
      <BaseCalendar
        ref={ref}
        onDateClick={onDateClick}
        currentMonth={currentMonth}
        onMonthChange={onMonthChange}
        selectedDate={selectedDate}
        renderDayContent={renderDayContent}
        className={`attendance-calendar ${className}`}
        {...props}
      />
    )
  }
)

AttendanceCalendar.displayName = 'AttendanceCalendar' 