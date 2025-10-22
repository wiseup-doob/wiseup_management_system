import type { BaseEntity, FirestoreTimestamp } from './common.types'

// ===== 시간표 버전 관련 타입 =====

export interface TimetableVersion extends BaseEntity {
  id: string
  name: string
  displayName: string
  startDate?: FirestoreTimestamp  // 선택사항 (UI 표시용)
  endDate?: FirestoreTimestamp    // 선택사항 (UI 표시용)
  isActive: boolean
  description?: string
  order: number
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export interface CreateTimetableVersionRequest {
  name: string
  displayName: string
  startDate?: FirestoreTimestamp  // 선택사항
  endDate?: FirestoreTimestamp    // 선택사항
  description?: string
  order?: number
}

export interface UpdateTimetableVersionRequest {
  name?: string
  displayName?: string
  startDate?: FirestoreTimestamp
  endDate?: FirestoreTimestamp
  isActive?: boolean
  description?: string
  order?: number
}

export interface TimetableVersionSearchParams {
  isActive?: boolean
}

export interface CopyTimetableVersionRequest {
  sourceVersionId: string
  targetVersionId: string
  targetVersionName: string
  targetStartDate?: FirestoreTimestamp  // 선택사항
  targetEndDate?: FirestoreTimestamp    // 선택사항
}
