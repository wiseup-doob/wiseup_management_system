import { useMemo } from 'react'
import type { TimetableGrid, TimetableOptions } from '../types/timetable.types'
import type { ClassSectionWithDetails } from '../../../../features/class/types/class.types'
import { 
  detectTimeConflicts,
  generateClassColor,
  isValidTimeRange,
  timeToMinutes,
  findSlotIndex
} from '../utils/timetable.utils'

export interface UseTimetableOptions extends Partial<TimetableOptions> {
  enableDebug?: boolean
}

export interface UseTimetableReturn {
  timetableGrid: TimetableGrid | null
  isEmpty: boolean
  isValid: boolean
  error: string | null
}

// Phase 4-1: 고정된 전체 시간 슬롯 생성 함수
const generateFixedTimeSlots = (
  startHour: number,
  endHour: number,
  timeInterval: number
): { time: string, minutes: number }[] => {
  const slots: { time: string, minutes: number }[] = []
  const startMinutes = startHour * 60
  const endMinutes = endHour * 60
  
  for (let minutes = startMinutes; minutes < endMinutes; minutes += timeInterval) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    slots.push({ time: timeString, minutes })
  }
  
  return slots
}

// Phase 4-1: 단순화된 데이터 변환 함수 (고정 시간 범위 적용)
const transformClassToTimetableData = (
  classItem: ClassSectionWithDetails,
  timeSlots: { time: string, minutes: number }[],
  options: UseTimetableOptions
): TimetableGrid => {
  const { enableDebug = false, startHour = 9, endHour = 23, timeInterval = 60 } = options

  // Phase 4-1: 고정된 시간 범위 정의
  const fixedTimeRange = {
    startMinutes: startHour * 60,  // 9:00 = 540분
    endMinutes: endHour * 60       // 23:00 = 1380분
  }

  // 1. 스케줄 데이터를 TimetableClass 배열로 변환
  const timetableClasses = classItem.schedule.map(schedule => {
    // 시간 유효성 검사
    if (!isValidTimeRange(schedule.startTime, schedule.endTime)) {
      if (enableDebug) {
        console.warn(`Invalid time range for class ${classItem.name}:`, schedule)
      }
      return null
    }

    const startMinutes = timeToMinutes(schedule.startTime)
    const endMinutes = timeToMinutes(schedule.endTime)

    // Phase 4-1: 고정 시간 범위 기준으로 슬롯 인덱스 계산
    const startSlotIndex = Math.floor((startMinutes - fixedTimeRange.startMinutes) / timeInterval)
    const endSlotIndex = Math.ceil((endMinutes - fixedTimeRange.startMinutes) / timeInterval)

    // Phase 4-1: 범위 외 수업 체크
    const isOutOfRange = startMinutes < fixedTimeRange.startMinutes || endMinutes > fixedTimeRange.endMinutes

    return {
      id: `${classItem.id}_${schedule.dayOfWeek}_${schedule.startTime}`,
      name: classItem.name || 'Unknown Class',
      teacherName: classItem.teacher?.name || classItem.teacherId || '미정',
      classroomName: classItem.classroom?.name || classItem.classroomId || '미정',
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      duration: endMinutes - startMinutes,
      startSlotIndex: Math.max(0, startSlotIndex), // 음수 방지
      endSlotIndex: Math.max(1, endSlotIndex), // 최소 1개 슬롯
      color: generateClassColor(classItem.id, classItem.name),
      status: 'active' as const,
      isOutOfRange
    }
  }).filter((cls): cls is NonNullable<typeof cls> => cls !== null)

  // 2. 요일별로 그룹화
  const dayGroups = timetableClasses.reduce((acc, cls) => {
    const day = cls.startTime ? 
      classItem.schedule.find(s => s.startTime === cls.startTime)?.dayOfWeek || 'monday' : 
      'monday'
    
    if (!acc[day]) {
      acc[day] = []
    }
    acc[day].push(cls)
    return acc
  }, {} as Record<string, any[]>)

  // 3. 모든 요일 생성 (빈 요일 포함)
  const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
  const daySchedules = allDays.map(day => ({
    dayOfWeek: day,
    classes: dayGroups[day] || []
  }))

  // 4. 충돌 감지
  const conflicts = detectTimeConflicts(daySchedules)

  // 5. 그리드 스타일 생성 (고정 시간 범위 기준)
  const gridStyles = {
    '--grid-row-count': timeSlots.length,
    '--grid-column-count': 7,
    '--start-hour': startHour,
    '--end-hour': endHour,
    '--time-interval': timeInterval,
    '--fixed-start-minutes': fixedTimeRange.startMinutes,
    '--fixed-end-minutes': fixedTimeRange.endMinutes
  }

  return {
    timeSlots: timeSlots.map(slot => ({
      id: `slot_${slot.time}`,
      startTime: slot.time,
      endTime: slot.time, // 단일 시간 슬롯
      duration: timeInterval
    })),
    daySchedules,
    completeWeekSchedule: dayGroups as any,
    conflicts,
    gridStyles
  }
}

export const useTimetable = (
  classItem: ClassSectionWithDetails | null,
  options: UseTimetableOptions = {}
): UseTimetableReturn => {
  return useMemo(() => {
    const { enableDebug = false, startHour = 9, endHour = 23, timeInterval = 60, ...timetableOptions } = options

    // 1. 빈 데이터 체크
    if (!classItem) {
      if (enableDebug) console.log('❌ No class item provided')
      return {
        timetableGrid: null,
        isEmpty: true,
        isValid: false,
        error: 'No class data provided'
      }
    }

    // 2. 스케줄 데이터 검증
    if (!classItem.schedule || !Array.isArray(classItem.schedule) || classItem.schedule.length === 0) {
      if (enableDebug) console.log('❌ Invalid or empty schedule:', classItem.schedule)
      return {
        timetableGrid: null,
        isEmpty: true,
        isValid: false,
        error: 'No valid schedule data found'
      }
    }

    try {
      // 3. Phase 4-1: 고정된 전체 시간 슬롯 생성
      const timeSlots = generateFixedTimeSlots(startHour, endHour, timeInterval)
      
      if (enableDebug) {
        console.log('🎯 Phase 4-1: 고정 시간 슬롯 생성:', {
          startHour,
          endHour,
          timeInterval,
          timeSlotsCount: timeSlots.length,
          timeRange: `${startHour}:00 - ${endHour}:00`
        })
      }

      // 4. Phase 4-1: 단순화된 데이터 변환 (고정 시간 범위 적용)
      const timetableGrid = transformClassToTimetableData(classItem, timeSlots, {
        ...timetableOptions,
        startHour,
        endHour,
        timeInterval,
        enableDebug
      })

      // 5. 유효성 검사
      const isEmpty = timetableGrid.daySchedules.every(day => day.classes.length === 0)
      const isValid = timetableGrid.timeSlots.length > 0

      // 6. 디버그 정보 출력
      if (enableDebug) {
        console.group('🎯 Timetable Debug Info (Phase 4-1)')
        console.log('✅ Class Item:', classItem.name)
        console.log('📅 Schedule Count:', classItem.schedule.length)
        console.log('⏰ Fixed Time Slots:', timetableGrid.timeSlots.length)
        console.log('📊 Day Schedules:', timetableGrid.daySchedules.map(d => 
          `${d.dayOfWeek}: ${d.classes.length} classes`
        ))
        console.log('⚠️ Conflicts:', timetableGrid.conflicts.length)
        console.log('🎯 Fixed Time Range:', `${startHour}:00 - ${endHour}:00`)
        console.groupEnd()
      }

      return {
        timetableGrid,
        isEmpty,
        isValid,
        error: null
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      if (enableDebug) {
        console.error('❌ Timetable generation failed:', error)
      }
      return {
        timetableGrid: null,
        isEmpty: true,
        isValid: false,
        error: errorMessage
      }
    }
  }, [
    classItem?.id,
    classItem?.name,
    classItem?.schedule,
    options.startHour,
    options.endHour,
    options.timeInterval,
    options.enableDebug
  ])
}

// 레거시 호환성을 위한 래퍼 (기존 코드가 깨지지 않도록)
export const useTimetableDeprecated = (
  classItem: ClassSectionWithDetails | null,
  options?: Partial<TimetableOptions>
) => {
  const result = useTimetable(classItem, options)
  
  // 기존 인터페이스 형태로 반환
  return {
    timetableGrid: result.timetableGrid,
    utils: {
      getClassCountByDay: (day: string) => {
        const daySchedule = result.timetableGrid?.completeWeekSchedule?.[day as keyof typeof result.timetableGrid.completeWeekSchedule]
        return daySchedule?.classes?.length || 0
      },
      getTotalClassCount: () => {
        return result.timetableGrid?.daySchedules?.reduce((total, day) => total + day.classes.length, 0) || 0
      },
      getDaysWithConflicts: () => {
        return [...new Set(result.timetableGrid?.conflicts?.map(c => c.day) || [])]
      },
      getEmptyDays: () => {
        return result.timetableGrid?.daySchedules
          ?.filter(day => day.classes.length === 0)
          ?.map(day => day.dayOfWeek) || []
      }
    },
    options: options || {}
  }
}
