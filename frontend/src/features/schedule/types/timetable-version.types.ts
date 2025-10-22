export interface TimetableVersion {
  id: string
  name: string
  displayName: string
  startDate?: string // ISO string - 선택사항 (UI 표시용)
  endDate?: string   // ISO string - 선택사항 (UI 표시용)
  isActive: boolean
  description?: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateTimetableVersionRequest {
  name: string
  displayName: string
  startDate?: string  // 선택사항
  endDate?: string    // 선택사항
  description?: string
  order?: number
}

export interface UpdateTimetableVersionRequest {
  name?: string
  displayName?: string
  startDate?: string
  endDate?: string
  isActive?: boolean
  description?: string
  order?: number
}

export interface CopyTimetableVersionRequest {
  name: string
  displayName: string
  startDate?: string  // 선택사항
  endDate?: string    // 선택사항
  description?: string
  order?: number
}
