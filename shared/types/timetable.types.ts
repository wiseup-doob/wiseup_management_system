import type { DayOfWeek } from './common.types';

export interface CompleteTimetableData {
  studentId: string
  studentName: string
  grade: string
  status: 'active' | 'inactive'
  classSections: Array<{
    id: string
    name: string                    // 프론트엔드에서 사용하는 name 필드
    teacher: { name: string }       // 프론트엔드에서 사용하는 중첩 객체 구조
    classroom: { name: string }     // 프론트엔드에서 사용하는 중첩 객체 구조
    schedule: Array<{
      dayOfWeek: DayOfWeek          // 공통 타입 사용으로 엄격성 확보
      startTime: string             // 프론트앤드 백앤드 공통 타입 사용
      endTime: string               // 프론트앤드 백앤드 공통 타입 사용
    }>
    color: string
  }>
}

export interface TimetableApiResponse {
  success: boolean
  message: string
  data: CompleteTimetableData
  meta?: {
    timestamp: string
    requestId: string
    classCount: number
  }
}
