import { forwardRef, useState } from 'react'
import { BaseWidget } from './BaseWidget'
import { Button } from '../buttons/Button'
import { Label } from '../labels/Label'
import type { BaseWidgetProps } from '../../types/components'
import './BaseCalendar.css'

export interface CalendarDay {
  date: Date
  dayNumber: number
  isCurrentMonth: boolean
  isToday?: boolean
  isSelected?: boolean
}

export interface BaseCalendarProps extends BaseWidgetProps {
  onDateClick?: (date: string) => void
  currentMonth?: Date
  onMonthChange?: (date: Date) => void
  selectedDate?: string
  renderDayContent?: (day: CalendarDay) => React.ReactNode
}

export const BaseCalendar = forwardRef<HTMLDivElement, BaseCalendarProps>(
  ({ 
    onDateClick,
    currentMonth = new Date(),
    onMonthChange,
    selectedDate,
    renderDayContent,
    className = '',
    ...props 
  }, ref) => {
    const [currentDate, setCurrentDate] = useState(currentMonth)

    // 월 변경 핸들러
    const handleMonthChange = (direction: 'prev' | 'next') => {
      const newDate = new Date(currentDate)
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      setCurrentDate(newDate)
      onMonthChange?.(newDate)
    }

    // 날짜 클릭 핸들러
    const handleDateClick = (date: Date) => {
      const dateString = date.toISOString().split('T')[0]
      onDateClick?.(dateString)
    }

    // 오늘 날짜 확인
    const isToday = (date: Date) => {
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }

    // 선택된 날짜 확인
    const isSelected = (date: Date) => {
      if (!selectedDate) return false
      const dateString = date.toISOString().split('T')[0]
      return dateString === selectedDate
    }

    // 캘린더 그리드 생성
    const generateCalendarGrid = (): CalendarDay[][] => {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth()
      
      // 월의 첫 번째 날과 마지막 날
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      // 첫 번째 날의 요일 (0: 일요일, 1: 월요일, ...)
      const firstDayOfWeek = firstDay.getDay()
      // 월의 총 일수
      const daysInMonth = lastDay.getDate()
      
      // 이전 달의 마지막 날들
      const prevMonthLastDay = new Date(year, month, 0)
      const prevMonthDays = prevMonthLastDay.getDate()
      
      const grid: CalendarDay[][] = []
      let dayCount = 1
      
      // 6주 x 7일 그리드 생성
      for (let week = 0; week < 6; week++) {
        const weekDays: CalendarDay[] = []
        
        for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
          let date: Date
          let isCurrentMonth = false
          let dayNumber: number
          
          if (week === 0 && dayOfWeek < firstDayOfWeek) {
            // 이전 달의 날들
            const prevDay = prevMonthDays - (firstDayOfWeek - dayOfWeek - 1)
            date = new Date(year, month - 1, prevDay)
            dayNumber = prevDay
          } else if (dayCount > daysInMonth) {
            // 다음 달의 날들
            const nextDay = dayCount - daysInMonth
            date = new Date(year, month + 1, nextDay)
            dayNumber = nextDay
          } else {
            // 현재 달의 날들
            date = new Date(year, month, dayCount)
            dayNumber = dayCount
            isCurrentMonth = true
            dayCount++
          }
          
          weekDays.push({
            date,
            dayNumber,
            isCurrentMonth,
            isToday: isToday(date),
            isSelected: isSelected(date)
          })
        }
        
        grid.push(weekDays)
      }
      
      return grid
    }

    const calendarGrid = generateCalendarGrid()
    const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    const dayNames = ['일', '월', '화', '수', '목', '금', '토']
    
    // 오늘 날짜 정보
    const today = new Date()
    const isCurrentMonthToday = currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()

    return (
      <BaseWidget
        ref={ref}
        className={`base-calendar ${className}`}
        {...props}
      >
        {/* 헤더 */}
        <BaseWidget className="calendar-header">
          <Button
            variant="secondary"
            size="small"
            onClick={() => handleMonthChange('prev')}
            className="month-nav-button"
          >
            ‹
          </Button>
          <BaseWidget className="month-title-container">
            <Label variant="heading" size="medium" className="month-title">
              {monthNames[currentDate.getMonth()]}
            </Label>
            {!isCurrentMonthToday && (
              <Label variant="default" size="small" className="today-indicator">
                오늘: {today.getMonth() + 1}월 {today.getDate()}일
              </Label>
            )}
          </BaseWidget>
          <Button
            variant="secondary"
            size="small"
            onClick={() => handleMonthChange('next')}
            className="month-nav-button"
          >
            ›
          </Button>
        </BaseWidget>

        {/* 요일 헤더 */}
        <BaseWidget className="calendar-weekdays">
          {dayNames.map((day, index) => (
            <div key={day} className={`weekday-header ${index === 0 ? 'sunday' : ''}`}>
              <Label variant="default" size="small" className="weekday-label">
                {day}
              </Label>
            </div>
          ))}
        </BaseWidget>

        {/* 캘린더 그리드 */}
        <BaseWidget className="calendar-grid">
          {calendarGrid.map((week, weekIndex) => (
            <BaseWidget key={weekIndex} className="calendar-week">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${day.isToday ? 'today' : ''} ${day.isSelected ? 'selected' : ''}`}
                  onClick={() => handleDateClick(day.date)}
                >
                  <Label 
                    variant="default" 
                    size="small" 
                    className="day-number"
                    style={{ color: day.isCurrentMonth ? '#333' : '#ccc' }}
                  >
                    {day.dayNumber}
                  </Label>
                  {renderDayContent && renderDayContent(day)}
                </div>
              ))}
            </BaseWidget>
          ))}
        </BaseWidget>
      </BaseWidget>
    )
  }
)

BaseCalendar.displayName = 'BaseCalendar' 