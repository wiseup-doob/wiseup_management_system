// 시간표 위젯 타입 정의

// CSS 커스텀 프로퍼티를 포함한 스타일 타입
export interface TimetableGridStyles extends React.CSSProperties {
  '--grid-row-count'?: number
  '--grid-row-height'?: string
  '--start-hour'?: number
  '--end-hour'?: number
  '--time-interval'?: number
}

// 시간표 기본 타입
export interface TimetableTimeSlot {
  id: string
  startTime: string
  endTime: string
  duration: number // 분 단위
}

// 요일별 수업 정보
export interface TimetableClass {
  id: string
  name: string
  teacherName: string
  classroomName: string
  startTime: string
  endTime: string
  duration: number
  startSlotIndex: number
  endSlotIndex: number
  color: string
  status: 'active' | 'inactive' | 'cancelled'
  isOutOfRange?: boolean // Phase 4-1: 범위 외 수업 체크
  layoutInfo?: {
    width: string
    left: string
    zIndex: number
    isOverlapped: boolean
  }
}

// 요일별 수업 그룹
export interface DaySchedule {
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  classes: TimetableClass[]
}

// 모든 요일을 포함하는 완전한 일정 배열
export interface CompleteWeekSchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

// Phase 1: 충돌 타입 업데이트
export interface TimetableConflict {
  day: string
  conflictId: string
  classes: TimetableClass[]
  conflictType: 'overlap' | 'adjacent'
}

// 시간표 그리드 데이터
export interface TimetableGrid {
  timeSlots: TimetableTimeSlot[]
  daySchedules: DaySchedule[]
  completeWeekSchedule: CompleteWeekSchedule
  conflicts: TimetableConflict[]
  gridStyles: TimetableGridStyles
}

// 시간표 옵션
export interface TimetableOptions {
  startHour: number
  endHour: number
  timeInterval: number
}

// 시간표 위젯 Props
export interface TimetableWidgetProps {
  // 데이터 소스 (이미 처리된 TimetableGrid 데이터)
  data?: TimetableGrid
  
  // 시간대 설정
  startHour?: number // 기본값: 9
  endHour?: number   // 기본값: 23
  timeInterval?: number // 기본값: 30 (분)
  
  // 스타일링
  className?: string
  theme?: 'light' | 'dark'
  
  // 이벤트 핸들러
  onClassClick?: (classData: TimetableClass) => void
  onTimeSlotClick?: (timeSlot: TimetableTimeSlot) => void
  
  // 표시 옵션
  showConflicts?: boolean
  showEmptySlots?: boolean
  showTimeLabels?: boolean
}

// 개별 셀 컴포넌트 Props
export interface TimetableCellProps {
  classData: TimetableClass
  className?: string
  onClick?: (classData: TimetableClass) => void
}

// 요일 헤더 컴포넌트 Props
export interface TimetableHeaderProps {
  days: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>
  className?: string
}

// 시간 컬럼 컴포넌트 Props
export interface TimetableTimeColumnProps {
  timeSlots: TimetableTimeSlot[]
  className?: string
}

// 백엔드 데이터 변환 결과
export interface BackendDataTransformResult {
  completeWeekSchedule: CompleteWeekSchedule
  daySchedules: DaySchedule[]
  conflicts: Array<{
    day: string
    time: string
    classes: TimetableClass[]
  }>
}
