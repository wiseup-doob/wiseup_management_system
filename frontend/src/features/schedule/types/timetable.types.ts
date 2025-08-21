import type { TimetableGrid } from '../../../components/business/timetable/types/timetable.types'
import type { CompleteTimetableData, TimetableApiResponse } from '@shared/types'

// 학생 시간표 기본 정보 (shared/types와 일치)
export interface StudentTimetable extends Omit<CompleteTimetableData, 'classSections'> {
  id: string
  classSections: ClassSectionWithSchedule[]
  createdAt: string
  updatedAt: string
}

// 수업 섹션 정보 (스케줄 포함) - shared/types와 일치
export type ClassSectionWithSchedule = CompleteTimetableData['classSections'][0]

// 수업 스케줄 정보 (shared/types와 일치)
export type ClassSchedule = CompleteTimetableData['classSections'][0]['schedule'][0]

// 백엔드 API 응답 타입 (shared/types와 일치)
export type StudentTimetableResponse = TimetableApiResponse

// TimetableWidget에 전달할 데이터 타입
export interface TimetableData {
  timetableGrid: TimetableGrid
  isEmpty: boolean
  hasConflicts: boolean
  conflictCount: number
}
