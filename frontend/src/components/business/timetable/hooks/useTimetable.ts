import { useMemo } from 'react'
import { timeCalculations } from '../utils/timeCalculations'
import { TIMETABLE_CONSTANTS } from '../constants/timetable.constants'
import type { TimetableGrid, DaySchedule, TimetableClass, TimetableTimeSlot } from '../types/timetable.types'

// 시간 슬롯 생성
const generateTimeSlots = (startHour: number, endHour: number): TimetableTimeSlot[] => {
  const slots: TimetableTimeSlot[] = []
  const startMinutes = startHour * 60
  const endMinutes = endHour * 60
  const timeInterval = TIMETABLE_CONSTANTS.TIME_INTERVAL // 상수 사용
  
  for (let minutes = startMinutes; minutes < endMinutes; minutes += timeInterval) {
    const startTime = timeCalculations.minutesToTime(minutes)
    const endTime = timeCalculations.minutesToTime(minutes + timeInterval)
    
    slots.push({
      id: `slot-${startTime}`,
      startTime,
      endTime,
      duration: timeInterval
    })
  }
  
  return slots
}

// 백엔드 데이터를 프론트엔드 형식으로 변환
const transformBackendData = (classSections: any[]): Record<string, TimetableClass[]> => {
  // 입력 데이터가 배열이 아니거나 null/undefined인 경우 빈 객체 반환
  if (!Array.isArray(classSections)) {
    console.warn('transformBackendData: classSections is not an array:', classSections)
    return {}
  }
  
  console.log('🔍 transformBackendData input:', classSections)
  
  const result = classSections.reduce((acc, section) => {
    console.log('🔍 Processing section:', section)
    console.log('🔍 Section schedule:', section.schedule)
    console.log('🔍 Schedule type:', typeof section.schedule)
    
    if (section.schedule && Array.isArray(section.schedule)) {
      console.log('🔍 Schedule is array, processing...')
      section.schedule.forEach((schedule: any) => {
        const day = schedule.dayOfWeek || 'monday'
        
        if (!acc[day]) {
          acc[day] = []
        }
        
        const timetableClass = {
          id: section.id,
          name: section.name,
          teacherName: section.teacher?.name || '',
          classroomName: section.classroom?.name || '',
          startTime: schedule.startTime || '09:00',
          endTime: schedule.endTime || '10:00',
          duration: timeCalculations.timeToMinutes(schedule.endTime || '10:00') - 
                   timeCalculations.timeToMinutes(schedule.startTime || '09:00'),
          color: section.color || '#3498db',
          status: 'active'
        }
        
        console.log('🔍 Created timetable class:', timetableClass)
        acc[day].push(timetableClass)
      })
    } else if (section.schedule && typeof section.schedule === 'string') {
      console.log('🔍 Schedule is string, trying to parse...')
      try {
        const parsedSchedule = JSON.parse(section.schedule)
        if (Array.isArray(parsedSchedule)) {
          parsedSchedule.forEach((schedule: any) => {
            const day = schedule.dayOfWeek || 'monday'
            
            if (!acc[day]) {
              acc[day] = []
            }
            
            const timetableClass = {
              id: section.id,
              name: section.name,
              teacherName: section.teacher?.name || '',
              classroomName: section.classroom?.name || '',
              startTime: schedule.startTime || '09:00',
              endTime: schedule.endTime || '10:00',
              duration: timeCalculations.timeToMinutes(schedule.endTime || '10:00') - 
                       timeCalculations.timeToMinutes(schedule.startTime || '09:00'),
              color: section.color || '#3498db',
              status: 'active'
            }
            
            console.log('🔍 Created timetable class from parsed string:', timetableClass)
            acc[day].push(timetableClass)
          })
        }
      } catch (error) {
        console.warn('Failed to parse schedule string:', error)
      }
    } else {
      console.log('🔍 No valid schedule found for section:', section.id)
    }
    
    return acc
  }, {} as Record<string, TimetableClass[]>)
  
  console.log('🔍 transformBackendData result:', result)
  return result
}

// 모든 요일을 포함하는 완전한 주간 일정 생성
const createCompleteWeekSchedule = (groupedByDay: Record<string, TimetableClass[]>): DaySchedule[] => {
  const allDays: Array<keyof Record<string, TimetableClass[]>> = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ]
  
  return allDays.map(day => ({
    dayOfWeek: day as any,
    classes: groupedByDay[day] || [] // 데이터가 없으면 빈 배열
  }))
}

// 시간 충돌 검증
const detectTimeConflicts = (daySchedules: DaySchedule[]): Array<{
  day: string
  time: string
  classes: TimetableClass[]
}> => {
  const conflicts: Array<{
    day: string
    time: string
    classes: TimetableClass[]
  }> = []
  
  daySchedules.forEach(daySchedule => {
    const classes = daySchedule.classes
    const processed = new Set<string>()
    
    classes.forEach((cls1) => {
      if (processed.has(cls1.id)) return
      
      const start1 = timeCalculations.timeToMinutes(cls1.startTime)
      const end1 = timeCalculations.timeToMinutes(cls1.endTime)
      const group = [cls1]
      
      classes.forEach((cls2) => {
        if (cls1.id === cls2.id || processed.has(cls2.id)) return
        
        const start2 = timeCalculations.timeToMinutes(cls2.startTime)
        const end2 = timeCalculations.timeToMinutes(cls2.endTime)
        
        // 시간 겹침 확인
        if (start1 < end2 && start2 < end1) {
          group.push(cls2)
          processed.add(cls2.id)
        }
      })
      
      if (group.length > 1) {
        conflicts.push({
          day: daySchedule.dayOfWeek,
          time: cls1.startTime,
          classes: group
        })
        group.forEach(cls => processed.add(cls.id))
      } else {
        processed.add(cls1.id)
      }
    })
  })
  
  return conflicts
}

// 겹친 수업들에 레이아웃 정보 추가
const processOverlappingClasses = (daySchedules: DaySchedule[]): DaySchedule[] => {
  return daySchedules.map(daySchedule => {
    const classes = daySchedule.classes
    
    // 겹침 감지
    const overlaps: TimetableClass[][] = []
    const processed = new Set<string>()
    
    classes.forEach((cls1) => {
      if (processed.has(cls1.id)) return
      
      const start1 = timeCalculations.timeToMinutes(cls1.startTime)
      const end1 = timeCalculations.timeToMinutes(cls1.endTime)
      const group = [cls1]
      
      classes.forEach((cls2) => {
        if (cls1.id === cls2.id || processed.has(cls2.id)) return
        
        const start2 = timeCalculations.timeToMinutes(cls2.startTime)
        const end2 = timeCalculations.timeToMinutes(cls2.endTime)
        
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
    
    // 겹친 수업들에 레이아웃 정보 추가
    const layoutMap = new Map<string, any>()
    
    overlaps.forEach((group) => {
      group.forEach((cls, index) => {
        layoutMap.set(cls.id, {
          width: `${Math.floor(100 / group.length)}%`,
          left: `${Math.floor((index * 100) / group.length)}%`,
          zIndex: 20 + index,
          isOverlapped: true
        })
      })
    })
    
    // 모든 수업에 레이아웃 정보 적용
    const processedClasses = classes.map(cls => ({
      ...cls,
      layoutInfo: layoutMap.get(cls.id) || { 
        width: '100%', 
        left: '0%', 
        zIndex: 20, 
        isOverlapped: false 
      }
    }))
    
    return {
      ...daySchedule,
      classes: processedClasses
    }
  })
}

// CSS Grid 스타일 동적 생성
const generateGridStyles = (startHour: number, endHour: number): React.CSSProperties => {
  const totalHours = endHour - startHour
  const timeInterval = TIMETABLE_CONSTANTS.TIME_INTERVAL // 상수 사용
  const totalSlots = Math.floor(totalHours * 60 / timeInterval)
  
  return {
    '--grid-row-count': totalSlots,
    '--grid-row-height': TIMETABLE_CONSTANTS.SLOT_HEIGHT_PX, // 상수 사용
    gridTemplateRows: `50px repeat(${totalSlots}, ${TIMETABLE_CONSTANTS.SLOT_HEIGHT_PX})` // 상수 사용
  } as React.CSSProperties
}

export const useTimetable = (rawData: any[] = [], options?: { 
  startHour?: number
  endHour?: number
  // timeInterval 제거
}) => {
  const { startHour = 9, endHour = 23 } = options || {}
  
  const timetableGrid = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return null
    }
    
    console.log('🔍 useTimetable input:', rawData)
    
    // 데이터 구조 감지 및 classSections 추출
    let classSections: any[] = []
    
    if (rawData.length === 1 && rawData[0] && typeof rawData[0] === 'object') {
      const firstItem = rawData[0]
      
      // SchedulePage에서 전달된 timetableData 구조인 경우
      if (firstItem.classSections && Array.isArray(firstItem.classSections)) {
        console.log('🔍 TimetableData 구조 감지됨')
        classSections = firstItem.classSections
      }
      // ClassPage에서 전달된 단일 ClassSection인 경우
      else if (firstItem.schedule && Array.isArray(firstItem.schedule)) {
        console.log('🔍 ClassSection 구조 감지됨')
        classSections = rawData
      }
      // 기타 경우
      else {
        console.log('🔍 기타 구조, rawData 그대로 사용')
        classSections = rawData
      }
    } else {
      // 배열인 경우 그대로 사용
      classSections = rawData
    }
    
    console.log('🔍 추출된 classSections:', classSections)
    
    if (classSections.length === 0) {
      return null
    }
    
    // 30분 고정으로 시간 슬롯 생성
    const timeSlots = generateTimeSlots(startHour, endHour)
    
    // 2. 백엔드 데이터를 프론트엔드 형식으로 변환
    const groupedByDay = transformBackendData(classSections)
    console.log('🔍 useTimetable groupedByDay:', groupedByDay)
    
    // 3. 모든 요일을 포함하는 완전한 주간 일정 생성
    const daySchedules = createCompleteWeekSchedule(groupedByDay)
    console.log('🔍 useTimetable daySchedules:', daySchedules)
    
    // 4. 겹치는 수업들에 레이아웃 정보 추가
    const processedDaySchedules = processOverlappingClasses(daySchedules)
    console.log('🔍 useTimetable processedDaySchedules:', processedDaySchedules)
    
    // 5. 시간 충돌 검증
    const conflicts = detectTimeConflicts(processedDaySchedules)
    console.log('🔍 useTimetable conflicts:', conflicts)
    
    // 6. CSS Grid 스타일 동적 생성
    const gridStyles = generateGridStyles(startHour, endHour) // 30분 고정
    console.log('🔍 useTimetable gridStyles:', gridStyles)
    
    const result = {
      timeSlots,
      daySchedules: processedDaySchedules, // 처리된 일정 사용
      conflicts,
      gridStyles
    }
    
    console.log('🔍 useTimetable result:', result)
    return result
  }, [rawData, startHour, endHour])
  
  // 추가 상태들 계산
  const isEmpty = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return true
    return rawData.length === 0
  }, [rawData])
  
  const isValid = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return false
    return rawData.length > 0
  }, [rawData])
  
  const error = useMemo(() => {
    if (!rawData || !Array.isArray(rawData)) return '데이터가 유효하지 않습니다'
    return null
  }, [rawData])
  
  return { 
    timetableGrid,
    isEmpty,
    isValid,
    error
  }
}
