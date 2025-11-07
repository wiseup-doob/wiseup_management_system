import React, { useCallback, useRef, useEffect, useState, useMemo } from 'react'
import { useDrop, useDrag } from 'react-dnd'
import type { TimetableGrid, TimetableClass } from './types/timetable.types'
import { TIMETABLE_CONSTANTS, DAYS } from './constants/timetable.constants'
import { timeCalculations } from './utils/timeCalculations'
import { useTimetable } from './hooks/useTimetable'
import { TimetableHeader } from './TimetableHeader'
import { TimetableTimeColumn } from './TimetableTimeColumn'
import { TimetableCell } from './TimetableCell'
import './TimetableWidget.css'

export interface TimetableWidgetProps {
  data?: any | any[] // 백엔드에서 받은 원시 데이터 (단일 객체 또는 배열)
  startHour?: number
  endHour?: number
  // timeInterval prop 제거 - 30분으로 고정
  showConflicts?: boolean
  showEmptySlots?: boolean
  showTimeLabels?: boolean
  onClassClick?: (classData: TimetableClass) => void
  onDrop?: (item: any) => void
  enableRemoveDrag?: boolean // 🆕 시간표에서 드래그로 제거 기능 활성화 옵션
  onRenderComplete?: () => void // 🆕 시간표 렌더링 완료 콜백
  className?: string
}

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

// 🆕 드래그 가능한 시간표 수업 카드 컴포넌트
interface DraggableTimetableClassProps {
  cls: TimetableClass
  dayOfWeek: string
  position: { left: number; top: number; width: number; height: number }
  isOverlapped: boolean
  overlapWidth: number
  overlapLeft: number
  zIndex: number
  onClassClick?: (classData: TimetableClass) => void
  enableDrag: boolean
}

const DraggableTimetableClass: React.FC<DraggableTimetableClassProps> = ({
  cls,
  dayOfWeek,
  position,
  isOverlapped,
  overlapWidth,
  overlapLeft,
  zIndex,
  onClassClick,
  enableDrag
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'timetable-class-remove',
    item: {
      type: 'timetable-class-remove',
      classSection: cls,
      id: cls.id,
      source: 'timetable',
      dayOfWeek
    },
    canDrag: enableDrag,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })

  const dragRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (enableDrag && dragRef.current) {
      drag(dragRef.current)
    }
  }, [enableDrag, drag])

  return (
    <div
      ref={dragRef}
      className={`timetable-class-overlay ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'absolute',
        left: isOverlapped
          ? `${position.left + (overlapLeft * position.width / 100)}px`
          : `${position.left}px`,
        top: `${position.top}px`,
        width: isOverlapped
          ? `${overlapWidth * position.width / 100}px`
          : `${position.width}px`,
        height: `${position.height}px`,
        backgroundColor: cls.color || 'var(--timetable-accent-color)',
        zIndex: zIndex,
        cursor: enableDrag ? 'move' : (onClassClick ? 'pointer' : 'default'),
        opacity: isDragging ? 0.5 : 1,
        transition: isDragging ? 'none' : 'opacity 0.2s, transform 0.2s'
      }}
      onClick={() => !isDragging && onClassClick?.(cls)}
    >
      <TimetableCell
        classData={cls}
        className="timetable-cell-overlay"
      />
    </div>
  )
}

export const TimetableWidget: React.FC<TimetableWidgetProps> = ({
  data = [],
  startHour = 9,
  endHour = 23,
  // timeInterval 제거
  showConflicts = false,
  showEmptySlots = false,
  showTimeLabels = true,
  onClassClick,
  onDrop,
  enableRemoveDrag = false,
  onRenderComplete, // 🆕 추가
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
  const tableRef = useRef<HTMLTableElement>(null)
  const [classPositions, setClassPositions] = useState<{[key: string]: {left: number, top: number, width: number, height: number}}>({})
  
  drop(dropRef)

  // ✅ useTimetable 훅 사용하여 데이터 가공
  // data가 단일 객체인 경우 배열로 변환, 배열인 경우 그대로 사용
  const dataArray = useMemo(() => {
    if (!data) return []
    
    console.log('🔍 TimetableWidget received data:', data)
    console.log('🔍 Data type:', typeof data)
    console.log('🔍 Is array:', Array.isArray(data))
    console.log('🔍 Data content:', JSON.stringify(data, null, 2))
    
    if (Array.isArray(data)) {
      return data
    } else {
      // 단일 객체인 경우 배열로 변환
      return [data]
    }
  }, [data])
  
  const { timetableGrid } = useTimetable(dataArray, {
    startHour,
    endHour
  })
  
  console.log('🔍 TimetableWidget useTimetable result:', timetableGrid)
  
  // ✅ timetableGrid에서 데이터 추출
  const { timeSlots, daySchedules, gridStyles } = timetableGrid || {}
  const fullTimeSlots = timeSlots || []
  
  console.log('🔍 TimetableWidget extracted data:', { timeSlots, daySchedules, gridStyles })
  
  // ✅ 기존 gridStyles와 TIMETABLE_CONSTANTS 통합
  const gridStyle = {
    '--timetable-columns': DAYS.length + 1, // +1은 시간 컬럼
    '--timetable-rows': fullTimeSlots.length,
    '--timetable-time-interval': TIMETABLE_CONSTANTS.SLOT_HEIGHT_PX, // ✅ 30px 고정
    '--dynamic-rows': fullTimeSlots.length,
    ...gridStyles // 기존 gridStyles와 병합
  } as React.CSSProperties

  // 셀 위치 계산 함수 (CSS Grid 방식)
  const getCellPosition = useCallback((dayIndex: number, timeIndex: number) => {
    if (!tableRef.current) return null
    
    // CSS Grid에서 특정 셀의 위치 계산
    const gridContainer = tableRef.current
    const containerRect = dropRef.current?.getBoundingClientRect()
    
    if (!containerRect) return null
    
    // Grid 셀의 크기 계산
    const gridRect = gridContainer.getBoundingClientRect()
    const cellWidth = (gridRect.width - 80) / DAYS.length // 80px는 시간 열 너비
    const cellHeight = 30 // 고정 셀 높이
    
    // 위치 계산
    const left = 80 + (dayIndex * cellWidth) // 시간 열 너비(80px) + 요일별 오프셋
    const top = 50 + (timeIndex * cellHeight) // 헤더 높이(50px) + 시간별 오프셋
    
    return {
      left: left,
      top: top,
      width: cellWidth
      // height는 제거 - calculateClassPositions에서 계산된 duration 사용
    }
  }, [])

  // 모든 수업의 위치 계산
  const calculateClassPositions = useCallback(() => {
    if (!daySchedules) return
    
    const positions: {[key: string]: {left: number, top: number, width: number, height: number}} = {}
    
    daySchedules.forEach((daySchedule) => {
      const dayIndex = DAYS.indexOf(daySchedule.dayOfWeek)
      if (dayIndex === -1) return
      
      daySchedule.classes.forEach((cls) => {
        const startSlotIndex = timeCalculations.calculateSlotIndex(cls.startTime, startHour)
        const duration = timeCalculations.calculateHeight(cls.startTime, cls.endTime, startHour)
        
        // 디버깅 로그 추가
        console.log(`🔍 수업 높이 계산:`, {
          수업명: cls.name,
          시작시간: cls.startTime,
          끝시간: cls.endTime,
          시작슬롯: startSlotIndex,
          계산된높이: duration,
          예상높이: `${cls.startTime}~${cls.endTime} = ${duration}px`
        })
        
        const cellPos = getCellPosition(dayIndex, startSlotIndex)
        if (cellPos) {
          const key = `${cls.id}-${daySchedule.dayOfWeek}`
          positions[key] = {
            left: cellPos.left,
            top: cellPos.top,
            width: cellPos.width,
            height: duration // cellPos.height 대신 duration 직접 사용
          }
          
          // 실제 적용될 스타일 로그
          console.log(`🔍 실제 적용될 스타일:`, {
            수업명: cls.name,
            시작시간: cls.startTime,
            끝시간: cls.endTime,
            left: `${cellPos.left}px`,
            top: `${cellPos.top}px`,
            width: `${cellPos.width}px`,
            height: `${duration}px`
          })
        }
      })
    })
    
    setClassPositions(positions)
  }, [daySchedules, startHour, getCellPosition])

  // 컴포넌트 마운트 후와 데이터 변경 시 위치 계산
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateClassPositions()
      // 🆕 렌더링 완료 콜백 호출
      onRenderComplete?.()
    }, 100) // DOM 렌더링 완료 후 계산

    return () => clearTimeout(timer)
  }, [calculateClassPositions, onRenderComplete]) // 🆕 dependency에 onRenderComplete 추가

  // 윈도우 리사이즈 시 재계산
  useEffect(() => {
    const handleResize = () => {
      calculateClassPositions()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [calculateClassPositions])

  return (
    <div 
      ref={dropRef}
      className={`timetable-widget ${className} ${isOver ? 'drop-over' : ''} ${canDrop ? 'drop-can' : ''}`}
    >
      {/* CSS Grid 방식으로 변경 */}
      <div 
        ref={tableRef}
        className="timetable-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `80px repeat(${DAYS.length}, 1fr)`,
          gridTemplateRows: `50px repeat(${fullTimeSlots.length}, 30px)`,
          gap: '0',
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      >
        {/* 헤더 행 */}
        <div className="timetable-time-header">
          <span className="header-label">시간</span>
        </div>
        {DAYS.map((day) => (
          <div key={day} className="timetable-day-header">
            <TimetableHeader 
              days={[day]} 
              className="timetable-header-cell"
            />
          </div>
        ))}
        
        {/* 시간 열과 요일별 셀들 */}
        {fullTimeSlots.map((slot, timeIndex) => (
          <>
            <div key={`time-${timeIndex}`} className="timetable-time-cell">
              <TimetableTimeColumn 
                timeSlots={[slot]}
                className="timetable-time-slot"
              />
            </div>
            {DAYS.map((day) => (
              <div 
                key={`${day}-${timeIndex}`} 
                className="timetable-day-cell"
                data-day={day}
                data-time={timeIndex}
              >
                {/* 빈 셀 - 수업은 위에 오버레이 */}
              </div>
            ))}
          </>
        ))}
      </div>
      
      {/* 수업들을 계산된 위치에 오버레이 */}
      {daySchedules?.map((daySchedule) => {
        const dayIndex = DAYS.indexOf(daySchedule.dayOfWeek)
        if (dayIndex === -1) return null

        return daySchedule.classes.map((cls) => {
          const key = `${cls.id}-${daySchedule.dayOfWeek}`
          const position = classPositions[key]

          if (!position) return null

          // 겹침 레이아웃 정보 계산
          const isOverlapped = cls.layoutInfo?.isOverlapped || false
          const overlapWidth = isOverlapped && cls.layoutInfo ? parseFloat(cls.layoutInfo.width) : 100
          const overlapLeft = isOverlapped && cls.layoutInfo ? parseFloat(cls.layoutInfo.left) : 0
          const zIndex = cls.layoutInfo?.zIndex || 10

          // 🆕 드래그 가능한 컴포넌트 사용
          return (
            <DraggableTimetableClass
              key={key}
              cls={cls}
              dayOfWeek={daySchedule.dayOfWeek}
              position={position}
              isOverlapped={isOverlapped}
              overlapWidth={overlapWidth}
              overlapLeft={overlapLeft}
              zIndex={zIndex}
              onClassClick={onClassClick}
              enableDrag={enableRemoveDrag}
            />
          )
        })
      })}
    </div>
  )
}