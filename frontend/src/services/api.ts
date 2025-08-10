// Firebase Functions API 서비스 - v2 구조
import { API_CONFIG } from '../config/api.config';
import type {
  Student,
  AttendanceRecord,
  ApiResponse,
  CreateStudentRequest,
  UpdateStudentRequest,
  CreateAttendanceRecordRequest,
  UpdateAttendanceRecordRequest,
  AttendanceSearchParams,
  Seat,
  SeatAssignment
} from '@shared/types';
import {
  API_ENDPOINTS
} from '@shared/constants';
import { 
  AppError, 
  ERROR_CODES, 
  normalizeError, 
  logError 
} from '@shared/utils/error.utils';

const FIREBASE_FUNCTIONS_BASE_URL = API_CONFIG.BASE_URL;

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const url = `${FIREBASE_FUNCTIONS_BASE_URL}${endpoint}`;
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data: ApiResponse<T> = await response.json();

      // HTTP 응답 상태 상세 로깅
      console.log('🌐 === HTTP 응답 상세 정보 ===');
      console.log('📊 HTTP 상태:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
        headers: Object.fromEntries(response.headers.entries())
      });
      console.log('📄 응답 데이터 원본:', {
        rawData: data,
        dataType: typeof data,
        dataKeys: Object.keys(data),
        dataConstructor: data?.constructor?.name
      });

      // 메타데이터 로깅 및 처리
      if (data.meta) {
        console.log('API 응답 메타데이터:', {
          timestamp: data.meta.timestamp,
          version: data.meta.version,
          requestId: data.meta.requestId,
          count: data.meta.count
        });
      }

      // 에러 응답 처리
      if (!response.ok || !data.success) {
        console.error('❌ === API 에러 응답 감지 ===');
        console.error('🚨 HTTP 상태:', response.status, response.statusText);
        console.error('🚨 응답 데이터:', data);
        console.error('🚨 응답 성공 여부:', data.success);
        console.error('🚨 에러 메시지:', data.error || data.message);
        
        const errorMessage = data.error || data.message || `HTTP ${response.status}: ${response.statusText}`;
        const appError = AppError.internal(ERROR_CODES.EXTERNAL_SERVICE_ERROR, errorMessage, data, requestId);
        logError(appError, { component: 'ApiService', action: 'request' });
        throw appError;
      }

      return data;
    } catch (error) {
      console.error('API 요청 오류:', error);
      
      // 네트워크 에러 처리
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const appError = AppError.network(ERROR_CODES.NETWORK_CONNECTION_ERROR, '네트워크 연결에 실패했습니다.', error, requestId);
        logError(appError, { component: 'ApiService', action: 'request' });
        
        const errorResponse: ApiResponse<T> = {
          success: false,
          error: appError.message,
          message: 'API 요청 중 오류가 발생했습니다.',
          meta: {
            timestamp: new Date().toISOString(),
            version: 'v2',
            requestId: requestId
          }
        };
        return errorResponse;
      }

      // 기타 에러 처리
      const normalizedError = normalizeError(error, requestId);
      logError(normalizedError, { component: 'ApiService', action: 'request' });
      
      const errorResponse: ApiResponse<T> = {
        success: false,
        error: normalizedError.message,
        message: 'API 요청 중 오류가 발생했습니다.',
        meta: {
          timestamp: new Date().toISOString(),
          version: 'v2',
          requestId: requestId
        }
      };
      return errorResponse;
    }
  }

  // ===== 학생 관리 API =====

  async initializeStudents(): Promise<ApiResponse<Student[]>> {
    return this.request<Student[]>(API_ENDPOINTS.STUDENTS.INITIALIZE, {
      method: 'POST'
    });
  }

  async getStudents(): Promise<ApiResponse<Student[]>> {
    return this.request<Student[]>(API_ENDPOINTS.STUDENTS.GET_ALL);
  }

  async getStudentById(id: string): Promise<ApiResponse<Student>> {
    return this.request<Student>(API_ENDPOINTS.STUDENTS.GET_BY_ID(id));
  }

  async createStudent(data: CreateStudentRequest): Promise<ApiResponse<Student>> {
    return this.request<Student>(API_ENDPOINTS.STUDENTS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateStudent(id: string, data: UpdateStudentRequest): Promise<ApiResponse<Student>> {
    return this.request<Student>(API_ENDPOINTS.STUDENTS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteStudent(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.STUDENTS.DELETE(id), {
      method: 'DELETE'
    });
  }

  // ===== 출석 관리 API =====

  async getAttendanceRecords(filters?: AttendanceSearchParams): Promise<ApiResponse<AttendanceRecord[]>> {
    let endpoint = API_ENDPOINTS.ATTENDANCE.GET_RECORDS;
    
    if (filters) {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, String(value));
          }
        }
      });
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
    }
    
    return this.request<AttendanceRecord[]>(endpoint);
  }

  async getAttendanceRecordById(id: string): Promise<ApiResponse<AttendanceRecord>> {
    return this.request<AttendanceRecord>(API_ENDPOINTS.ATTENDANCE.GET_RECORD_BY_ID(id));
  }

  async createAttendanceRecord(data: CreateAttendanceRecordRequest): Promise<ApiResponse<AttendanceRecord>> {
    return this.request<AttendanceRecord>(API_ENDPOINTS.ATTENDANCE.CREATE_RECORD, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateAttendanceRecord(id: string, data: UpdateAttendanceRecordRequest): Promise<ApiResponse<AttendanceRecord>> {
    return this.request<AttendanceRecord>(API_ENDPOINTS.ATTENDANCE.UPDATE_RECORD(id), {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteAttendanceRecord(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.ATTENDANCE.DELETE_RECORD(id), {
      method: 'DELETE'
    });
  }

  async getAttendanceByStudent(studentId: string, dateRange?: { start: string; end: string }): Promise<ApiResponse<AttendanceRecord[]>> {
    let endpoint = API_ENDPOINTS.ATTENDANCE.GET_BY_STUDENT(studentId);
    
    if (dateRange) {
      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      endpoint += `?${params.toString()}`;
    }
    
    return this.request<AttendanceRecord[]>(endpoint);
  }

  async getAttendanceByDate(date: string): Promise<ApiResponse<AttendanceRecord[]>> {
    return this.request<AttendanceRecord[]>(API_ENDPOINTS.ATTENDANCE.GET_BY_DATE(date));
  }

  async getAttendanceStatistics(dateRange?: { start: string; end: string }): Promise<ApiResponse<any>> {
    let endpoint = API_ENDPOINTS.ATTENDANCE.GET_STATS;
    
    if (dateRange) {
      const params = new URLSearchParams({
        startDate: dateRange.start,
        endDate: dateRange.end
      });
      endpoint += `?${params.toString()}`;
    }
    
    return this.request<any>(endpoint);
  }

  async updateStudentAttendance(
    studentId: string,
    attendanceStatus: string,
    checkInTime?: string,
    checkOutTime?: string,
    location?: string,
    notes?: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.STUDENTS.UPDATE_ATTENDANCE(studentId), {
      method: 'PUT',
      body: JSON.stringify({
        status: attendanceStatus,
        updatedBy: 'admin',
        checkInTime,
        checkOutTime,
        location,
        notes
      })
    });
  }

  async getAttendanceHistory(
    studentId: string,
    days: number = 7
  ): Promise<ApiResponse<AttendanceRecord[]>> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return this.getAttendanceByStudent(studentId, { start: startDate, end: endDate });
  }

  // ===== 좌석 관리 API =====

  async getSeats(): Promise<ApiResponse<Seat[]>> {
    return this.request<Seat[]>('/api/seats');
  }

  async getSeatById(seatId: string): Promise<ApiResponse<Seat>> {
    return this.request<Seat>(API_ENDPOINTS.SEATS.GET_BY_ID(seatId));
  }

  async getSeatByStudent(studentId: string): Promise<ApiResponse<Seat>> {
    return this.request<Seat>(API_ENDPOINTS.SEATS.GET_BY_STUDENT(studentId));
  }

  async getSeatStats(): Promise<ApiResponse<any>> {
    return this.request<any>(API_ENDPOINTS.SEATS.GET_STATS);
  }

  // ===== 좌석 배정 API =====

  async getSeatAssignments(): Promise<ApiResponse<SeatAssignment[]>> {
    return this.request<SeatAssignment[]>('/api/assignments/all');
  }

  async getSeatAssignmentBySeatId(seatId: string): Promise<ApiResponse<SeatAssignment>> {
    return this.request<SeatAssignment>(`/api/assignments/seat/${seatId}`);
  }

  async getSeatAssignmentByStudentId(studentId: string): Promise<ApiResponse<SeatAssignment>> {
    return this.request<SeatAssignment>(`/api/assignments/student/${studentId}`);
  }

  async assignStudentToSeat(studentId: string, seatId: string): Promise<ApiResponse<SeatAssignment>> {
    return this.request<SeatAssignment>('/api/assignments/assign', {
      method: 'POST',
      body: JSON.stringify({ studentId, seatId })
    });
  }

  async unassignStudentFromSeat(studentId: string, seatId: string): Promise<ApiResponse<boolean>> {
    return this.request<boolean>('/api/assignments/unassign', {
      method: 'POST',
      body: JSON.stringify({ studentId, seatId })
    });
  }

  async bulkAssignStudents(studentIds: string[]): Promise<ApiResponse<SeatAssignment[]>> {
    return this.request<SeatAssignment[]>('/api/assignments/bulk-assign', {
      method: 'POST',
      body: JSON.stringify({ studentIds })
    });
  }

  // ===== 시스템 API =====

  // 좌석 배치(번호) 스왑
  async swapSeatPositions(seatAId: string, seatBId: string): Promise<ApiResponse<void>> {
    return this.request<void>('/api/seats/swap', {
      method: 'POST',
      body: JSON.stringify({ seatAId, seatBId })
    });
  }

  async checkSeatHealth(): Promise<ApiResponse<{
    status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
    totalSeats: number;
    assignedSeats: number;
    mismatchedSeats: number;
    issues: Array<{
      seatId: string;
      type: 'MISMATCH' | 'ORPHANED' | 'DUPLICATE';
      description: string;
    }>;
    lastChecked: string;
  }>> {
    return this.request('/api/seats/health');
  }

  async autoRepairSeats(): Promise<ApiResponse<{
    repaired: number;
    failed: number;
    details: Array<{ seatId: string; action: string; success: boolean; error?: string }>;
  }>> {
    return this.request('/api/seats/repair', {
      method: 'POST'
    });
  }

  async getHealth(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/health');
  }

  async getVersion(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/version');
  }
}

export const apiService = new ApiService(); 