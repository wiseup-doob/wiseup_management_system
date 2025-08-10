import { API_CONFIG } from '../config/api.config'
import { API_ENDPOINTS } from '@shared/constants'
import type { 
  Timetable, 
  TimetableItem, 
  TimeSlot, 
  Class, 
  Teacher, 
  Classroom,
  TimetableSummary,
  CreateTimetableRequest,
  UpdateTimetableRequest,
  CreateTimetableItemRequest,
  TimetableSearchParams,
  ApiResponse
} from '@shared/types'

const FIREBASE_FUNCTIONS_BASE_URL = API_CONFIG.BASE_URL

class TimetableApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      const url = `${FIREBASE_FUNCTIONS_BASE_URL}${endpoint}`
      console.log('🌐 API 요청:', {
        method: options.method || 'GET',
        url,
        endpoint,
        baseUrl: FIREBASE_FUNCTIONS_BASE_URL
      })
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'x-request-id': requestId,
          ...options.headers,
        },
      })

      console.log('📡 API 응답:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      })

      const data: ApiResponse<T> = await response.json()
      console.log('📦 API 데이터:', data)

      if (!response.ok || !data.success) {
        const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`
        console.error('❌ API 오류:', errorMessage)
        throw new Error(errorMessage)
      }

      console.log('✅ API 성공:', data)
      return data
    } catch (error) {
      console.error('💥 Timetable API 요청 오류:', {
        error,
        message: error instanceof Error ? error.message : '알 수 없는 오류',
        endpoint,
        baseUrl: FIREBASE_FUNCTIONS_BASE_URL
      })
      
      const errorResponse: ApiResponse<T> = {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
        message: '시간표 API 요청 중 오류가 발생했습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v1',
          requestId: requestId
        }
      }
      return errorResponse
    }
  }

  // ===== 시간표 관리 API =====

  async createTimetable(data: CreateTimetableRequest): Promise<ApiResponse<Timetable>> {
    return this.request<Timetable>(API_ENDPOINTS.TIMETABLE.TIMETABLES.CREATE, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateTimetable(id: string, data: UpdateTimetableRequest): Promise<ApiResponse<Timetable>> {
    return this.request<Timetable>(API_ENDPOINTS.TIMETABLE.TIMETABLES.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async getTimetable(id: string): Promise<ApiResponse<Timetable>> {
    return this.request<Timetable>(API_ENDPOINTS.TIMETABLE.TIMETABLES.GET_BY_ID(id))
  }

  async getAllTimetables(searchParams?: TimetableSearchParams): Promise<ApiResponse<Timetable[]>> {
    const params = new URLSearchParams()
    if (searchParams?.isActive !== undefined) {
      params.append('isActive', searchParams.isActive.toString())
    }
    {
      const base = API_ENDPOINTS.TIMETABLE.TIMETABLES.GET_ALL
      const url = params.toString() ? `${base}?${params.toString()}` : base
      return this.request<Timetable[]>(url)
    }
  }

  async deleteTimetable(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.TIMETABLE.TIMETABLES.DELETE(id), {
      method: 'DELETE'
    })
  }

  // ===== 시간표 항목 관리 API =====

  async createTimetableItem(data: CreateTimetableItemRequest): Promise<ApiResponse<TimetableItem>> {
    return this.request<TimetableItem>(API_ENDPOINTS.TIMETABLE.ITEMS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateTimetableItem(id: string, data: Partial<TimetableItem>): Promise<ApiResponse<TimetableItem>> {
    return this.request<TimetableItem>(API_ENDPOINTS.TIMETABLE.ITEMS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async getTimetableItem(id: string): Promise<ApiResponse<TimetableItem>> {
    return this.request<TimetableItem>(API_ENDPOINTS.TIMETABLE.ITEMS.GET_BY_ID(id))
  }

  async getTimetableItems(timetableId: string): Promise<ApiResponse<TimetableItem[]>> {
    return this.request<TimetableItem[]>(API_ENDPOINTS.TIMETABLE.ITEMS.GET_BY_TIMETABLE(timetableId))
  }

  async deleteTimetableItem(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.TIMETABLE.ITEMS.DELETE(id), {
      method: 'DELETE'
    })
  }

  // ===== 시간대 관리 API =====

  async createTimeSlot(data: Omit<TimeSlot, 'id'>): Promise<ApiResponse<TimeSlot>> {
    return this.request<TimeSlot>(API_ENDPOINTS.TIMETABLE.TIME_SLOTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getAllTimeSlots(): Promise<ApiResponse<TimeSlot[]>> {
    return this.request<TimeSlot[]>(API_ENDPOINTS.TIMETABLE.TIME_SLOTS.GET_ALL)
  }

  // ===== 수업 관리 API =====

  async createClass(data: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Class>> {
    return this.request<Class>(API_ENDPOINTS.TIMETABLE.CLASSES.CREATE, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getAllClasses(): Promise<ApiResponse<Class[]>> {
    return this.request<Class[]>(API_ENDPOINTS.TIMETABLE.CLASSES.GET_ALL)
  }

  // ===== 교사 관리 API =====

  async createTeacher(data: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Teacher>> {
    return this.request<Teacher>(API_ENDPOINTS.TIMETABLE.TEACHERS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getAllTeachers(): Promise<ApiResponse<Teacher[]>> {
    return this.request<Teacher[]>(API_ENDPOINTS.TIMETABLE.TEACHERS.GET_ALL)
  }

  // ===== 강의실 관리 API =====

  async createClassroom(data: Omit<Classroom, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Classroom>> {
    return this.request<Classroom>(API_ENDPOINTS.TIMETABLE.CLASSROOMS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getAllClassrooms(): Promise<ApiResponse<Classroom[]>> {
    return this.request<Classroom[]>(API_ENDPOINTS.TIMETABLE.CLASSROOMS.GET_ALL)
  }

  // 신규: 학생별 시간표 항목 조회
  async getStudentTimetableItems(studentId: string, params?: { from?: string; to?: string; dayOfWeek?: string }): Promise<ApiResponse<TimetableItem[]>> {
    const base = API_ENDPOINTS.TIMETABLE.STUDENTS.GET_ITEMS(studentId)
    const search = new URLSearchParams()
    if (params?.from) search.append('from', params.from)
    if (params?.to) search.append('to', params.to)
    if (params?.dayOfWeek) search.append('dayOfWeek', params.dayOfWeek)
    const url = search.toString() ? `${base}?${search.toString()}` : base
    return this.request<TimetableItem[]>(url)
  }

  // 신규: 학생별 개인 시간표 보장/조회
  async ensureStudentTimetable(studentId: string): Promise<ApiResponse<Timetable>> {
    return this.request<Timetable>(API_ENDPOINTS.TIMETABLE.STUDENTS.ENSURE_TIMETABLE(studentId), {
      method: 'POST'
    })
  }

  // ===== 통계 및 요약 API =====

  async getTimetableSummary(id: string): Promise<ApiResponse<TimetableSummary>> {
    return this.request<TimetableSummary>(API_ENDPOINTS.TIMETABLE.TIMETABLES.SUMMARY(id))
  }

  // ===== 초기화 API =====

  async initializeTimetableData(): Promise<ApiResponse<any>> {
    return this.request<any>(API_ENDPOINTS.TIMETABLE.INIT.INITIALIZE, {
      method: 'POST'
    })
  }

  async clearTimetableData(): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.TIMETABLE.INIT.CLEAR, {
      method: 'DELETE'
    })
  }
}

export const timetableService = new TimetableApiService()
