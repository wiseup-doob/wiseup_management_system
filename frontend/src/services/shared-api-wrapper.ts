// Shared 폴더 래퍼 - 상대 경로 사용
import type { 
  Student,
  AttendanceRecord 
} from '@shared/types'
import type { AttendanceStatus } from '@shared/types/common.types'
import { config } from '../config/environment';

// 임시 AttendanceStats 타입 정의 (향후 shared에서 제공될 예정)
interface AttendanceStats {
  totalStudents: number
  presentCount: number
  absentCount: number
  dismissedCount: number
  authorizedAbsentCount: number
  unauthorizedAbsentCount: number
  attendanceRate: number
  date: string
}

// API 응답 타입 정의
interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

// 요청 타입 정의
interface GetStudentsRequest {
  grade?: string
  className?: string
  status?: 'active' | 'inactive'
  currentAttendance?: AttendanceStatus
  searchTerm?: string
  page?: number
  limit?: number
}

interface BulkAttendanceUpdateRequest {
  updates: Array<{
    studentId: string
    status: AttendanceStatus
    note?: string
  }>
  date: string
  updatedBy: string
  batchId?: string
}

interface SingleAttendanceUpdateRequest {
  status: AttendanceStatus
  date: string
  updatedBy: string
  note?: string
  location?: string
  method?: 'manual' | 'qr' | 'nfc' | 'auto'
}

// API 엔드포인트 - shared 상수 사용
import { API_ENDPOINTS } from '@shared/constants';

// API_ENDPOINTS_LOCAL 제거하고 직접 API_ENDPOINTS 사용

// 기본 API 클라이언트
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = config.api.baseURL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      const requestOptions: RequestInit = {
        method,
        headers
      }

      if (data && method !== 'GET') {
        requestOptions.body = JSON.stringify(data)
      }

      const response = await fetch(url, requestOptions)
      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP ${response.status}`)
      }

      return responseData
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        error: 'API_REQUEST_FAILED'
      }
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint)
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data)
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data)
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint)
  }
}

// 출석 관리 서비스
export class SharedAttendanceApiService {
  private client: ApiClient

  constructor(baseUrl?: string) {
    this.client = new ApiClient(baseUrl)
  }

  // 학생 목록 조회
  async getStudents(params?: GetStudentsRequest): Promise<ApiResponse<Student[]>> {
    const queryString = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryString.append(key, String(value))
        }
      })
    }
    
    const endpoint = queryString.toString() 
      ? `${API_ENDPOINTS.STUDENTS.GET_ALL}?${queryString.toString()}`
      : API_ENDPOINTS.STUDENTS.GET_ALL
    
    return this.client.get<Student[]>(endpoint)
  }

  // 개별 출석 업데이트
  async updateAttendanceSingle(
    studentId: string,
    request: SingleAttendanceUpdateRequest
  ): Promise<ApiResponse<void>> {
    const endpoint = API_ENDPOINTS.ATTENDANCE.UPDATE(studentId)
    return this.client.put<void>(endpoint, request)
  }

  // 배치 출석 업데이트
  async updateAttendanceBulk(request: BulkAttendanceUpdateRequest): Promise<ApiResponse<void>> {
    const endpoint = API_ENDPOINTS.ATTENDANCE.CREATE_BULK
    return this.client.put<void>(endpoint, request)
  }

  // 출석 통계 조회
  async getAttendanceStats(params?: { date?: string; grade?: string; className?: string }): Promise<ApiResponse<AttendanceStats>> {
    const queryString = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryString.append(key, String(value))
        }
      })
    }
    
    const endpoint = queryString.toString() 
      ? `${API_ENDPOINTS.ATTENDANCE.GET_STATUS_STATISTICS}?${queryString.toString()}`
      : API_ENDPOINTS.ATTENDANCE.GET_STATUS_STATISTICS
    
    return this.client.get<AttendanceStats>(endpoint)
  }

  // 출석 기록 조회
  async getAttendanceHistory(params: {
    studentId?: string
    startDate: string
    endDate: string
    status?: AttendanceStatus
  }): Promise<ApiResponse<AttendanceRecord[]>> {
    const queryString = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, String(value))
      }
    })
    
    const endpoint = `${API_ENDPOINTS.ATTENDANCE.GET_BY_STUDENT}?${queryString.toString()}`
    return this.client.get<AttendanceRecord[]>(endpoint)
  }

  // 초기화
  async initializeAttendance(request: {
    grade: string
    className: string
    seatCount: number
    createdBy: string
    studentNames?: string[]
  }): Promise<ApiResponse<Student[]>> {
    const endpoint = API_ENDPOINTS.ATTENDANCE.CREATE
    return this.client.post<Student[]>(endpoint, request)
  }
}

// 기존 API와의 호환성을 위한 래퍼
export const sharedAttendanceApi = {
  getStudents: (params?: GetStudentsRequest) => {
    const service = new SharedAttendanceApiService()
    return service.getStudents(params)
  },
  
  updateStudentAttendance: (studentId: string, status: AttendanceStatus) => {
    const service = new SharedAttendanceApiService()
    return service.updateAttendanceSingle(studentId, {
      status,
      date: new Date().toISOString().split('T')[0],
      updatedBy: 'admin'
    })
  },
  
  initializeStudents: () => {
    const service = new SharedAttendanceApiService()
    return service.initializeAttendance({
      grade: '1학년',
      className: 'A반',
      seatCount: 48,
      createdBy: 'admin'
    })
  }
} 