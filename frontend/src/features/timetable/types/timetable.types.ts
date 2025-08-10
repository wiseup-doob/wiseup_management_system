import type { 
  TimetableItem, 
  TimeSlot, 
  DayOfWeek, 
  SubjectType, 
  ClassType,
  ClassStatus,
  Timetable,
  Class,
  Teacher,
  Classroom,
  TimetableSummary
} from '@shared/types'

// 시간표 상태 타입
export interface TimetableState {
  timeSlots: TimeSlot[]
  timetableItems: TimetableItem[]
  timetables: Timetable[]
  classes: Class[]
  teachers: Teacher[]
  classrooms: Classroom[]
  selectedTimetable: Timetable | null
  selectedItem: TimetableItem | null
  loading: boolean
  error: string | null
  isEditable: boolean
}

// 시간표 액션 타입
export interface TimetableAction {
  type: string
  payload?: any
}

// 시간표 필터 타입
export interface TimetableFilters {
  searchTerm?: string
  dayOfWeek?: DayOfWeek
  subject?: SubjectType
  teacherId?: string
  classId?: string
  isActive?: boolean
}

// 시간표 통계 타입
export interface TimetableStats {
  totalItems: number
  totalClasses: number
  totalTeachers: number
  totalClassrooms: number
  itemsByDay: Record<DayOfWeek, number>
  itemsBySubject: Record<SubjectType, number>
}
