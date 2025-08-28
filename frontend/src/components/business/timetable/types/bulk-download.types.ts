import type { DownloadOptions, DownloadProgress } from './download.types'

/**
 * 전체 다운로드 옵션
 */
export interface BulkDownloadOptions extends DownloadOptions {
  zipFilename: string // ZIP 파일명
  includeStudentInfo: boolean // 학생 정보 포함 여부
}

/**
 * 전체 다운로드 결과
 */
export interface BulkDownloadResult {
  success: boolean
  message: string
  totalStudents: number
  successCount: number
  failedCount: number
  errors: string[]
  zipFile?: Blob
  zipFilename?: string
}

/**
 * 학생 선택 정보
 */
export interface StudentSelection {
  id: string
  name: string
  grade: string
  status: string
  isSelected: boolean
  timetableData?: any
  error?: string
}

/**
 * 전체 다운로드 진행 상태
 */
export interface BulkDownloadProgress {
  currentStudent: StudentSelection | null
  completedCount: number
  failedCount: number
  totalCount: number
  progressPercentage: number
  isProcessing: boolean
}

/**
 * 전체 다운로드 모달 Props
 */
export interface BulkTimetableDownloadModalProps {
  isOpen: boolean
  onClose: () => void
  students: StudentSelection[]
  onStudentsUpdate?: (students: StudentSelection[]) => void
}

/**
 * 일괄 이미지 생성 옵션
 */
export interface BulkImageGenerationOptions {
  students: StudentSelection[]
  options: BulkDownloadOptions
  onProgress?: (progress: BulkDownloadProgress) => void
  onCancel?: () => void
}
