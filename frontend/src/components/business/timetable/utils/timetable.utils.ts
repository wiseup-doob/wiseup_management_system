// 시간표 유틸리티 함수

import type { 
  TimetableTimeSlot, 
  TimetableClass, 
  DaySchedule, 
  CompleteWeekSchedule,
  TimetableOptions,
  TimetableGrid
} from '../types/timetable.types'

// Phase 1: 상수 정의
const MINUTES_PER_HOUR = 60
const DEFAULT_START_HOUR = 9
const DEFAULT_END_HOUR = 23
const DEFAULT_TIME_INTERVAL = 60

// Phase 1: 시간 검증 함수들
export const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time)
}

export const isValidTimeRange = (startTime: string, endTime: string): boolean => {
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return false
  }
  return timeToMinutes(startTime) < timeToMinutes(endTime)
}

// Phase 1: 일관성 있는 색상 생성
export const generateClassColor = (classId: string, className?: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F39C12', '#E74C3C', '#9B59B6', '#3498DB', '#1ABC9C',
    '#16A085', '#27AE60', '#2980B9', '#8E44AD', '#2C3E50'
  ]

  // classId와 className을 조합하여 해시 생성
  const combined = `${classId}_${className || ''}`
  let hash = 0
  
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 32bit 정수로 변환
  }

  const index = Math.abs(hash) % colors.length
  return colors[index]
}

// 기존 함수들 (Phase 1: 강화된 에러 처리 추가)
export const timeToMinutes = (time: string): number => {
  try {
    const [hours, minutes] = time.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) {
      console.warn(`Invalid time format: ${time}`)
      return 0
    }
    return hours * MINUTES_PER_HOUR + minutes
  } catch {
    console.warn(`Failed to parse time: ${time}`)
    return 0
  }
}

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / MINUTES_PER_HOUR)
  const mins = minutes % MINUTES_PER_HOUR
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export const calculateTimeDifference = (startTime: string, endTime: string): number => {
  const startMinutes = timeToMinutes(startTime)
  const endMinutes = timeToMinutes(endTime)
  return Math.max(0, endMinutes - startMinutes)
}

export const calculateCellHeight = (startTime: string, endTime: string, timeInterval: number): number => {
  const duration = calculateTimeDifference(startTime, endTime)
  return Math.max(1, Math.ceil(duration / timeInterval))
}

export const calculateCellPosition = (startTime: string, baseTime: string, timeInterval: number): number => {
  const startMinutes = timeToMinutes(startTime)
  const baseMinutes = timeToMinutes(baseTime)
  return Math.max(0, Math.floor((startMinutes - baseMinutes) / timeInterval))
}

// Phase 1: 개선된 시간 슬롯 생성 (에러 처리 강화)
export const generateTimeSlots = (options: Partial<TimetableOptions> = {}): TimetableTimeSlot[] => {
  const { 
    startHour = DEFAULT_START_HOUR, 
    endHour = DEFAULT_END_HOUR, 
    timeInterval = DEFAULT_TIME_INTERVAL 
  } = options

  // Phase 1: 입력 검증
  if (startHour >= endHour) {
    console.error('Start hour must be less than end hour')
    return []
  }

  if (timeInterval <= 0 || timeInterval > 360) {
    console.error('Time interval must be between 1 and 360 minutes')
    return []
  }

  const timeSlots: TimetableTimeSlot[] = []
  let currentMinutes = startHour * MINUTES_PER_HOUR

  while (currentMinutes < endHour * MINUTES_PER_HOUR) {
    const startTime = minutesToTime(currentMinutes)
    const endMinutes = Math.min(currentMinutes + timeInterval, endHour * MINUTES_PER_HOUR)
    const endTime = minutesToTime(endMinutes)

    timeSlots.push({
      id: `slot_${startTime}_${endTime}`,
      startTime,
      endTime,
      duration: endMinutes - currentMinutes
    })

    currentMinutes = endMinutes
  }

  return timeSlots
}

// Phase 1: 개선된 수업 슬롯 인덱스 계산 (에러 처리 강화)
export const findSlotIndex = (
  targetTime: string, 
  timeSlots: TimetableTimeSlot[], 
  isEndTime: boolean = false
): number => {
  // Phase 1: 시간 형식 검증
  if (!isValidTimeFormat(targetTime)) {
    console.warn(`Invalid time format for slot index calculation: ${targetTime}`)
    return 0
  }

  const targetMinutes = timeToMinutes(targetTime)
  
  // 정확한 매칭 시도
  const exactMatch = timeSlots.findIndex(slot => {
    const slotTime = isEndTime ? slot.endTime : slot.startTime
    return timeToMinutes(slotTime) === targetMinutes
  })
  
  if (exactMatch !== -1) {
    return exactMatch
  }

  // 가장 가까운 슬롯 찾기
  let closestIndex = 0
  let minDifference = Infinity

  timeSlots.forEach((slot, index) => {
    const slotTime = isEndTime ? slot.endTime : slot.startTime
    const slotMinutes = timeToMinutes(slotTime)
    const difference = Math.abs(targetMinutes - slotMinutes)

    if (difference < minDifference) {
      minDifference = difference
      closestIndex = index
    }
  })

  return closestIndex
}

// 기존 함수들 (Phase 1: 에러 처리 강화)
export const generateRandomColor = (id: string): string => {
  // Phase 1: 기존 함수를 새로운 색상 생성 함수로 대체
  return generateClassColor(id)
}

export const groupClassesByDay = (classes: any[], timeSlots: TimetableTimeSlot[]): Record<string, TimetableClass[]> => {
  return classes.reduce((acc, classItem) => {
    const day = classItem.schedule?.dayOfWeek || 'monday'
    
    if (!acc[day]) {
      acc[day] = []
    }
    
    // Phase 1: 시간 유효성 검증
    const startTime = classItem.schedule?.startTime || '09:00'
    const endTime = classItem.schedule?.endTime || '10:00'
    
    if (!isValidTimeRange(startTime, endTime)) {
      console.warn(`Invalid time range for class ${classItem.name}: ${startTime} - ${endTime}`)
      return acc
    }
    
    const startSlotIndex = findSlotIndex(startTime, timeSlots, false)
    const endSlotIndex = findSlotIndex(endTime, timeSlots, true)
    
    acc[day].push({
      id: classItem.id,
      name: classItem.name,
      teacherName: classItem.teacherName,
      classroomName: classItem.classroomName,
      startTime,
      endTime,
      duration: calculateTimeDifference(startTime, endTime),
      startSlotIndex,
      endSlotIndex,
      color: generateClassColor(classItem.id, classItem.name),
      status: 'active'
    })
    
    return acc
  }, {} as Record<string, TimetableClass[]>)
}

export const createCompleteWeekSchedule = (classes: any[], timeSlots: TimetableTimeSlot[]): CompleteWeekSchedule => {
  const groupedByDay = groupClassesByDay(classes, timeSlots)
  
  const allDays: Array<keyof CompleteWeekSchedule> = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ]
  
  return allDays.reduce((acc, day) => {
    acc[day] = {
      dayOfWeek: day,
      classes: groupedByDay[day] || []
    }
    return acc
  }, {} as CompleteWeekSchedule)
}

export const isDayEmpty = (daySchedule: DaySchedule): boolean => {
  return !daySchedule.classes || daySchedule.classes.length === 0
}

export const detectTimeConflicts = (daySchedules: DaySchedule[]): Array<{
  day: string
  conflictId: string
  classes: TimetableClass[]
  conflictType: 'overlap' | 'adjacent'
}> => {
  const conflicts: Array<{
    day: string
    conflictId: string
    classes: TimetableClass[]
    conflictType: 'overlap' | 'adjacent'
  }> = []

  daySchedules.forEach(daySchedule => {
    const { dayOfWeek, classes } = daySchedule
    
    if (classes.length <= 1) return

    // 시간순 정렬
    const sortedClasses = [...classes].sort((a, b) => 
      timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
    )

    // 겹침 및 인접 감지
    for (let i = 0; i < sortedClasses.length - 1; i++) {
      for (let j = i + 1; j < sortedClasses.length; j++) {
        const class1 = sortedClasses[i]
        const class2 = sortedClasses[j]

        const start1 = timeToMinutes(class1.startTime)
        const end1 = timeToMinutes(class1.endTime)
        const start2 = timeToMinutes(class2.startTime)
        const end2 = timeToMinutes(class2.endTime)

        // 겹침 확인
        if (start1 < end2 && start2 < end1) {
          const conflictId = `${dayOfWeek}_${start1}_${end1}_${start2}_${end2}`
          conflicts.push({
            day: dayOfWeek,
            conflictId,
            classes: [class1, class2],
            conflictType: 'overlap'
          })
        }
        // 인접 확인 (같은 시간에 시작하거나 끝나는 경우)
        else if (end1 === start2 || end2 === start1) {
          const conflictId = `${dayOfWeek}_adjacent_${start1}_${end1}_${start2}_${end2}`
          conflicts.push({
            day: dayOfWeek,
            conflictId,
            classes: [class1, class2],
            conflictType: 'adjacent'
          })
        }
      }
    }
  })

  return conflicts
}

export const calculateGridRowCount = (startHour: number, endHour: number, timeInterval: number): number => {
  const totalMinutes = (endHour - startHour) * 60
  return Math.ceil(totalMinutes / timeInterval)
}

export const generateGridStyles = (startHour: number, endHour: number, timeInterval: number): React.CSSProperties => {
  const rowCount = calculateGridRowCount(startHour, endHour, timeInterval)
  return {
    '--grid-row-count': rowCount,
    '--grid-column-count': 7,
    '--start-hour': startHour,
    '--end-hour': endHour,
    '--time-interval': timeInterval
  } as React.CSSProperties
}

export const transformBackendData = (classes: any[], timeSlots: TimetableTimeSlot[]): CompleteWeekSchedule => {
  return createCompleteWeekSchedule(classes, timeSlots)
}

export const transformToArrayForUI = (completeSchedule: CompleteWeekSchedule): DaySchedule[] => {
  return Object.values(completeSchedule)
}
