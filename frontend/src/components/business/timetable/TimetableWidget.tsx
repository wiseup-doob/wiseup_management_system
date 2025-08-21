import React, { useMemo, useCallback, useRef } from 'react'
import { useDrop } from 'react-dnd'
import type { TimetableGrid, TimetableClass } from './types/timetable.types'
import './TimetableWidget.css'

export interface TimetableWidgetProps {
  data: TimetableGrid
  startHour?: number
  endHour?: number
  timeInterval?: number
  showConflicts?: boolean
  showEmptySlots?: boolean
  showTimeLabels?: boolean
  onClassClick?: (classData: TimetableClass) => void
  onDrop?: (item: any) => void
  className?: string
}

const DAY_LABELS = {
  monday: '월', tuesday: '화', wednesday: '수',
  thursday: '목', friday: '금', saturday: '토', sunday: '일'
} as const

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

// Phase 2: 실제 시간 기반 겹침 감지
const detectRealTimeOverlaps = (classes: TimetableClass[]): TimetableClass[][] => {
  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return h * 60 + m
  }

  const overlaps: TimetableClass[][] = []
  const processed = new Set<string>()

  classes.forEach((cls1) => {
    if (processed.has(cls1.id)) return

    const start1 = timeToMinutes(cls1.startTime)
    const end1 = timeToMinutes(cls1.endTime)
    const group = [cls1]

    classes.forEach((cls2) => {
      if (cls1.id === cls2.id || processed.has(cls2.id)) return

      const start2 = timeToMinutes(cls2.startTime)
      const end2 = timeToMinutes(cls2.endTime)

      // 실제 시간 겹침 확인: (start1 < end2) && (start2 < end1)
      if (start1 < end2 && start2 < end1) {
        group.push(cls2)
        processed.add(cls2.id)
      }
    })

    if (group.length > 1) {
      overlaps.push(group)
      group.forEach(cls => processed.add(cls.id))
    } else {
      processed.add(cls1.id)
    }
  })

  return overlaps
}

// Phase 2: 겹친 수업들에 레이아웃 정보 추가
const processOverlappingClasses = (classes: TimetableClass[]): (TimetableClass & { layoutInfo?: any })[] => {
  const allOverlaps = detectRealTimeOverlaps(classes)
  const layoutMap = new Map<string, any>()

  allOverlaps.forEach((group) => {
    group.forEach((cls, index) => {
      layoutMap.set(cls.id, {
        width: `${Math.floor(100 / group.length)}%`,
        left: `${Math.floor((index * 100) / group.length)}%`,
        zIndex: 20 + index,
        isOverlapped: true
      })
    })
  })

  return classes.map(cls => ({
    ...cls,
    layoutInfo: layoutMap.get(cls.id) || { width: '100%', left: '0%', zIndex: 20, isOverlapped: false }
  }))
}

export const TimetableWidget: React.FC<TimetableWidgetProps> = ({
  data,
  startHour = 9,
  endHour = 23,
  timeInterval = 60,
  showConflicts = false,
  showEmptySlots = false,
  showTimeLabels = true,
  onClassClick,
  onDrop,
  className = ''
}) => {

  // 드롭 존 설정
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'class-section',
    drop: (item: any) => {
      if (onDrop) {
        onDrop(item)
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  })

  const dropRef = useRef<HTMLDivElement>(null)
  drop(dropRef)

  // Phase 4-2: 고정 시간 범위 기반 전체 시간 슬롯 생성 (컴포넌트 내부)
  const fullTimeSlots = useMemo(() => {
    const slots: { time: string }[] = []
    const startMinutes = startHour * 60
    const endMinutes = endHour * 60
    for (let minutes = startMinutes; minutes < endMinutes; minutes += timeInterval) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
      slots.push({ time: timeString })
    }
    return slots
  }, [startHour, endHour, timeInterval])

  // Phase 2: CSS 변수 스타일 계산 (행 수만 전달)
  const gridStyle = useMemo(() => {
    return {
      '--timetable-columns': DAYS.length,
      '--timetable-rows': fullTimeSlots.length,
      '--timetable-time-interval': `${timeInterval}px`
    } as React.CSSProperties
  }, [fullTimeSlots.length, timeInterval])

  // Phase 2: 수업 위치 계산 (grid 기반 디버그용)
  const calculateClassPosition = useCallback((cls: TimetableClass, dayIndex: number) => {
    const startRow = cls.startSlotIndex + 2 // +2는 헤더 행
    const spanRows = Math.max(1, cls.endSlotIndex - cls.startSlotIndex + 1)
    const column = dayIndex + 2 // +2는 시간 컬럼

    return {
      gridRow: `${startRow} / span ${spanRows}`,
      gridColumn: column
    }
  }, [])

  // Phase 2: 각 요일별 처리된 수업 데이터
  const processedDaySchedules = useMemo(() => {
    return DAYS.map(day => {
      const daySchedule = data?.daySchedules?.find(d => d.dayOfWeek === day)
      const classes = daySchedule?.classes || []
      return {
        day,
        classes: processOverlappingClasses(classes)
      }
    })
  }, [data?.daySchedules])

  return (
    <div 
      ref={dropRef}
      className={`timetable-widget ${className} ${isOver ? 'drop-over' : ''} ${canDrop ? 'drop-can' : ''}`}
      style={gridStyle}
    >
      <table className="timetable-table">
        <thead>
          <tr>
            <th className="timetable-header-cell timetable-time-header">시간</th>
            {DAYS.map((day) => (
              <th key={day} className="timetable-header-cell">
                {DAY_LABELS[day]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {fullTimeSlots.map((slot, timeIndex) => (
            <tr key={timeIndex} className="timetable-row">
              <td className="timetable-time-cell">
                {slot.time}
              </td>
              {DAYS.map((day, dayIndex) => {
                const daySchedule = data?.daySchedules?.find(d => d.dayOfWeek === day)
                const classes = daySchedule?.classes || []
                
                // Phase 2: 겹치는 수업 처리 적용
                const processedClasses = processOverlappingClasses(classes)
                
                return (
                  <td key={`${day}-${timeIndex}`} className="timetable-cell">
                    {/* 이 시간대에 시작하는 수업들 */}
                    {processedClasses
                      .filter(cls => cls.startSlotIndex === timeIndex)
                      .map((cls, classIndex) => {
                        const spanRows = Math.max(1, cls.endSlotIndex - cls.startSlotIndex + 1)
                        
                        return (
                          <div
                            key={`${cls.id}-${classIndex}`}
                            className={`timetable-class-cell ${showConflicts && cls.layoutInfo?.isOverlapped ? 'conflict' : ''}`}
                            style={{
                              position: 'absolute',
                              top: '2px',
                              left: cls.layoutInfo ? `${cls.layoutInfo.left}` : '0',
                              right: cls.layoutInfo ? 'auto' : '0',
                              width: cls.layoutInfo ? cls.layoutInfo.width : '100%',
                              height: `calc(${spanRows} * 60px - 4px)`,
                              backgroundColor: cls.color || 'var(--timetable-accent-color)',
                              zIndex: cls.layoutInfo?.zIndex || 20,
                              cursor: onClassClick ? 'pointer' : 'default'
                            }}
                            onClick={() => onClassClick?.(cls)}
                          >
                            <div className="class-name">{cls.name}</div>
                            <div className="class-time">
                              <div className="time-start">{cls.startTime}</div>
                              <div className="time-separator">~</div>
                              <div className="time-end">{cls.endTime}</div>
                            </div>
                          </div>
                        )
                      })}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
