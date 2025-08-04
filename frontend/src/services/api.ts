// Firebase Functions API 서비스

// 로컬 에뮬레이터 URL
const FIREBASE_FUNCTIONS_BASE_URL = 'http://127.0.0.1:5001/wiseupmanagementsystem/us-central1'

export interface Student {
  id: string
  name: string
  seatNumber: number
  grade: string
  className: string
  status: 'active' | 'inactive'
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
  error?: string
}

class ApiService {
  private baseUrl: string

  constructor() {
    this.baseUrl = FIREBASE_FUNCTIONS_BASE_URL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      console.log(`API 요청: ${this.baseUrl}${endpoint}`)
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      console.log(`응답 상태: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('API 응답 데이터:', data)
      return data
    } catch (error) {
      console.error('API request failed:', error)
      console.error('요청 URL:', `${this.baseUrl}${endpoint}`)
      console.error('요청 옵션:', options)
      
      return {
        success: false,
        message: 'API 요청 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // 학생 데이터 초기화
  async initializeStudents(): Promise<ApiResponse<Student[]>> {
    return this.request<Student[]>('/initializeStudents', {
      method: 'POST'
    })
  }

  // 학생 데이터 조회
  async getStudents(): Promise<ApiResponse<Student[]>> {
    return this.request<Student[]>('/getStudents', {
      method: 'GET'
    })
  }
}

export const apiService = new ApiService() 