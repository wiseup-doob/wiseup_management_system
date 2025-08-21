import type { 
  StudentTimetableResponse, 
  ClassSectionWithSchedule,
  ClassSchedule 
} from '../types/timetable.types'
import type { 
  TimetableGrid, 
  TimetableTimeSlot, 
  DaySchedule, 
  TimetableClass,
  CompleteWeekSchedule 
} from '../../../components/business/timetable/types/timetable.types'

// 시간을 분 단위로 변환
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// 분을 시간 형식으로 변환
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// 시간 슬롯 인덱스 계산
export const calculateSlotIndex = (time: string, startHour: number, timeInterval: number): number => {
  const minutes = timeToMinutes(time)
  const startMinutes = startHour * 60
  return Math.floor((minutes - startMinutes) / timeInterval)
}

// 시간 슬롯 생성
export const generateTimeSlots = (startHour: number, endHour: number, timeInterval: number): TimetableTimeSlot[] => {
  const slots: TimetableTimeSlot[] = []
  const startMinutes = startHour * 60
  const endMinutes = endHour * 60
  
  for (let minutes = startMinutes; minutes < endMinutes; minutes += timeInterval) {
    const startTime = minutesToTime(minutes)
    const endTime = minutesToTime(minutes + timeInterval)
    
    slots.push({
      id: `slot-${startTime}`,
      startTime,
      endTime,
      duration: timeInterval
    })
  }
  
  return slots
}

// 색상 생성 (간단한 해시 기반)
export const generateClassColor = (className: string): string => {
  const colors = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#e67e22', '#34495e', '#16a085', '#c0392b'
  ]
  
  let hash = 0
  for (let i = 0; i < className.length; i++) {
    hash = className.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

// 백엔드 응답을 TimetableClass로 변환
export const transformClassSectionToTimetableClass = (
  classSection: ClassSectionWithSchedule,
  startHour: number,
  timeInterval: number
): TimetableClass[] => {
  return classSection.schedule.map((schedule, index) => {
    const startSlotIndex = calculateSlotIndex(schedule.startTime, startHour, timeInterval)
    const endSlotIndex = calculateSlotIndex(schedule.endTime, startHour, timeInterval)
    
    return {
      id: `${classSection.id}-${index}`,
      name: classSection.name,                           // ✅ name 사용 (courseName 아님)
      teacherName: classSection.teacher?.name || '',     // ✅ teacher.name 사용 (teacherName 아님)
      classroomName: classSection.classroom?.name || '', // ✅ classroom.name 사용 (classroomName 아님)
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      duration: timeToMinutes(schedule.endTime) - timeToMinutes(schedule.startTime),
      startSlotIndex,
      endSlotIndex,
      color: classSection.color || generateClassColor(classSection.name), // ✅ name 사용
      status: 'active'
    }
  })
}

// 요일별 수업 그룹화
export const groupClassesByDay = (
  classSections: ClassSectionWithSchedule[],
  startHour: number,
  timeInterval: number
): DaySchedule[] => {
  const dayMap = new Map<string, TimetableClass[]>()
  
  // 요일 순서 정의
  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  
  // 각 요일 초기화
  dayOrder.forEach(day => {
    dayMap.set(day, [])
  })
  
  // 수업을 요일별로 그룹화
  classSections.forEach(classSection => {
    const timetableClasses = transformClassSectionToTimetableClass(classSection, startHour, timeInterval)
    
    // 각 timetableClass를 해당하는 schedule의 dayOfWeek에 추가
    timetableClasses.forEach((timetableClass, index) => {
      // index를 사용하여 해당하는 schedule의 dayOfWeek를 가져옴
      if (classSection.schedule && classSection.schedule[index]) {
        const day = classSection.schedule[index].dayOfWeek
        const existingClasses = dayMap.get(day) || []
        existingClasses.push(timetableClass)
        dayMap.set(day, existingClasses)
      }
    })
  })
  
  // DaySchedule 배열로 변환
  return dayOrder.map(day => ({
    dayOfWeek: day as any,
    classes: dayMap.get(day) || []
  }))
}

// CompleteWeekSchedule 생성
export const createCompleteWeekSchedule = (daySchedules: DaySchedule[]): CompleteWeekSchedule => {
  const weekSchedule: CompleteWeekSchedule = {
    monday: { dayOfWeek: 'monday', classes: [] },
    tuesday: { dayOfWeek: 'tuesday', classes: [] },
    wednesday: { dayOfWeek: 'wednesday', classes: [] },
    thursday: { dayOfWeek: 'thursday', classes: [] },
    friday: { dayOfWeek: 'friday', classes: [] },
    saturday: { dayOfWeek: 'saturday', classes: [] },
    sunday: { dayOfWeek: 'sunday', classes: [] }
  }
  
  daySchedules.forEach(daySchedule => {
    weekSchedule[daySchedule.dayOfWeek] = daySchedule
  })
  
  return weekSchedule
}

// 메인 변환 함수 (단순화)
export const transformStudentTimetableResponse = (
  response: StudentTimetableResponse['data'],
  startHour: number,
  endHour: number,
  timeInterval: number
): TimetableGrid => {
  // 시간 슬롯 생성
  const timeSlots = generateTimeSlots(startHour, endHour, timeInterval)
  
  // 요일별 수업 그룹화
  const daySchedules = groupClassesByDay(response.classSections, startHour, timeInterval)
  
  // CompleteWeekSchedule 생성
  const completeWeekSchedule = createCompleteWeekSchedule(daySchedules)
  
  // CSS 변수 스타일 (TimetableGridStyles 타입에 맞게 수정)
  const gridStyles = {
    '--grid-row-count': timeSlots.length,
    '--grid-row-height': `${timeInterval}px`,
    '--start-hour': startHour,
    '--end-hour': endHour,
    '--time-interval': timeInterval
  }
  
  return {
    timeSlots,
    daySchedules,
    completeWeekSchedule,
    conflicts: [], // 충돌 감지 제거 - 빈 배열로
    gridStyles
  }
}
