import type { ClassSection } from '@shared/types/class-section.types'

// Course 정보를 포함한 ClassSection
export interface ClassSectionWithDetails extends ClassSection {
  course?: {
    id: string;
    name: string;
    subject: string;
    difficulty?: string;
    description?: string;
    isActive: boolean;
  } | null;
  teacher?: {
    id: string;
    name: string;
    subjects?: string[];
  } | null;
  classroom?: {
    id: string;
    name: string;
    capacity?: number;
  } | null;
}

export interface Class {
  id: string
  name: string
  grade: string
  classNumber: string
  teacherName: string
  maxStudents: number
  currentStudents: number
  roomNumber: string
  schedule: string
  status: 'active' | 'inactive' | 'completed'
  startDate: string
  endDate?: string
  description?: string
}

export interface ClassState {
  classes: ClassSectionWithDetails[]
  selectedClass: ClassSectionWithDetails | null
  searchTerm: string
  isLoading: boolean
  error: string | null
  filters: {
    teacherName: string
    status: string
  }
  
  // ===== 시간표 관련 상태 =====
  // 사용자 정의 시간대
  customTimeSlots: CustomTimeSlot[]
  // 시간표 그리드 데이터 (ClassSection 기반)
  timetableGrid: {
    timeSlots: Array<{
      startTime: string
      endTime: string
    }>
    classes: Array<{
      id: string
      name: string
      courseName: string
      teacherName: string
      classroomName: string
      schedule: Array<{
        dayOfWeek: string
        startTime: string
        endTime: string
      }>
    }>
    daysOfWeek: string[]
  } | null
  // 시간표 편집 모드
  isTimetableEditMode: boolean
  // 선택된 시간대
  selectedTimeSlot: CustomTimeSlot | null
  // 시간표 통계
  scheduleStatistics: ScheduleStatistics | null
  // 시간 충돌 검증 결과
  timeConflictValidation: TimeConflictValidation | null
}

export interface ClassFormData {
  name: string
  grade: string
  classNumber: string
  teacherName: string
  maxStudents: number
  roomNumber: string
  schedule: string
  description?: string
}

// 백엔드 API 호출을 위한 확장된 타입
export interface ClassFormDataWithIds {
  name: string
  courseId: string
  teacherId: string
  classroomId: string
  maxStudents: number
  currentStudents?: number
  status?: 'active' | 'inactive' | 'completed'
  description?: string
  schedule: string
  // 색상 필드 추가
  color?: string
}

export type ClassStatus = 'active' | 'inactive' | 'completed'

// ===== 시간표 관련 타입 (Frontend 전용) =====

export interface ScheduleBlock {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  classSectionId: string;
}

export interface ScheduleGrid {
  id: string;
  classSectionId: string;
  schedule: ScheduleBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleSearchParams {
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  teacherId?: string;
  courseId?: string;
  classroomId?: string;
}

export interface TimeConflictValidation {
  hasConflict: boolean;
  conflicts: Array<{
    classSectionId: string;
    className: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    conflictType: 'teacher' | 'classroom' | 'student';
    conflictDetails: string;
  }>;
}

export interface ScheduleStatistics {
  totalClasses: number;
  classesByDay: Record<string, number>;
  classesByTime: Record<string, number>;
  conflicts: number;
  totalHours: number;
  averageClassDuration: number;
}

export interface CustomTimeSlot {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  color?: string;
}

// ===== 색상 관련 타입 =====

export interface ColorPaletteItem {
  code: string;
  name: string;
}

export interface ColorPaletteResponse {
  success: boolean;
  data: ColorPaletteItem[];
  message: string;
}

export interface CreateScheduleBlockRequest {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  classSectionId: string;
  color?: string;
  notes?: string;
}

export interface UpdateScheduleBlockRequest {
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
  color?: string;
  notes?: string;
}

export interface CreateScheduleGridRequest {
  classSectionId: string;
  schedule: CreateScheduleBlockRequest[];
  name?: string;
  description?: string;
}

export interface UpdateScheduleGridRequest {
  schedule?: CreateScheduleBlockRequest[];
  name?: string;
  description?: string;
}
