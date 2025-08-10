// 올바른 Shared 폴더 사용 테스트
import { API_CONFIG } from '../config/api.config'
import type { 
  Student, 
  AttendanceRecord, 
  ApiResponse,
  CreateStudentRequest,
  UpdateStudentRequest
} from '@shared/types'
import type { AttendanceStatus } from '@shared/types/common.types'

// 임시 타입 정의 (향후 shared에서 제공될 예정)
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

interface AttendanceUpdateRequest {
  studentId: string
  attendanceStatus: AttendanceStatus
  updatedBy: string
  date?: string
  note?: string
}

interface ApiError {
  code: string
  message: string
  details?: any
}

// API 엔드포인트 정의
const API_ENDPOINTS = {
  STUDENTS: {
    GET_ALL: '/api/v1/attendance/students',
    GET_BY_ID: (id: string) => `/api/v1/attendance/students/${id}`,
    CREATE: '/api/v1/attendance/students',
    UPDATE: (id: string) => `/api/v1/attendance/students/${id}`,
    DELETE: (id: string) => `/api/v1/attendance/students/${id}`
  },
  ATTENDANCE: {
    GET_STATS: '/api/v1/attendance/stats',
    BULK_UPDATE: '/api/v1/attendance/bulk-update',
    UPDATE_SINGLE: (id: string) => `/api/v1/attendance/students/${id}/attendance`,
    GET_HISTORY: '/api/v1/attendance/history',
    INITIALIZE: '/api/v1/attendance/initialize'
  }
}

// 기본 API 클라이언트
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = 'http://localhost:5001') {
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
export class CorrectSharedAttendanceApiService {
  private client: ApiClient

  constructor(baseUrl?: string) {
    this.client = new ApiClient(baseUrl)
  }

  // 학생 목록 조회
  async getStudents(params?: {
    grade?: string
    className?: string
    status?: 'active' | 'inactive'
    currentAttendance?: AttendanceStatus
    searchTerm?: string
    page?: number
    limit?: number
  }): Promise<ApiResponse<Student[]>> {
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
    request: AttendanceUpdateRequest
  ): Promise<ApiResponse<void>> {
    const endpoint = API_ENDPOINTS.ATTENDANCE.UPDATE_SINGLE(studentId)
    return this.client.put<void>(endpoint, request)
  }

  // 학생 생성
  async createStudent(request: CreateStudentRequest): Promise<ApiResponse<Student>> {
    const endpoint = API_ENDPOINTS.STUDENTS.CREATE
    return this.client.post<Student>(endpoint, request)
  }

  // 학생 업데이트
  async updateStudent(id: string, request: UpdateStudentRequest): Promise<ApiResponse<Student>> {
    const endpoint = API_ENDPOINTS.STUDENTS.UPDATE(id)
    return this.client.put<Student>(endpoint, request)
  }

  // 출석 통계 조회
  async getAttendanceStats(params?: { 
    date?: string; 
    grade?: string; 
    className?: string 
  }): Promise<ApiResponse<AttendanceStats>> {
    const queryString = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryString.append(key, String(value))
        }
      })
    }
    
    const endpoint = queryString.toString() 
      ? `${API_ENDPOINTS.ATTENDANCE.GET_STATS}?${queryString.toString()}`
      : API_ENDPOINTS.ATTENDANCE.GET_STATS
    
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
    
    const endpoint = `${API_ENDPOINTS.ATTENDANCE.GET_HISTORY}?${queryString.toString()}`
    return this.client.get<AttendanceRecord[]>(endpoint)
  }
}

// 기존 API와의 호환성을 위한 래퍼
export const correctSharedAttendanceApi = {
  getStudents: (params?: any) => {
    const service = new CorrectSharedAttendanceApiService()
    return service.getStudents(params)
  },
  
  updateStudentAttendance: (studentId: string, status: AttendanceStatus) => {
    const service = new CorrectSharedAttendanceApiService()
    return service.updateAttendanceSingle(studentId, {
      studentId: studentId,
      attendanceStatus: status,
      updatedBy: 'admin'
    })
  },
  
  createStudent: (request: CreateStudentRequest) => {
    const service = new CorrectSharedAttendanceApiService()
    return service.createStudent(request)
  },
  
  updateStudent: (id: string, request: UpdateStudentRequest) => {
    const service = new CorrectSharedAttendanceApiService()
    return service.updateStudent(id, request)
  },
  
  getAttendanceStats: (params?: any) => {
    const service = new CorrectSharedAttendanceApiService()
    return service.getAttendanceStats(params)
  },
  
  getAttendanceHistory: (params: any) => {
    const service = new CorrectSharedAttendanceApiService()
    return service.getAttendanceHistory(params)
  }
} 