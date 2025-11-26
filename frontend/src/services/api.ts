// Firebase Functions API 서비스 - 백엔드 데이터 구조와 통일
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
  SeatAssignment,
  AttendanceStatus,
  DateString,
  TimeString,
  DateTimeString,
  ClassSection,
  CreateClassSectionRequest,
  UpdateClassSectionRequest,
  ClassSectionSearchParams,
  ClassSectionStatistics,
  Teacher,
  Course,
  Classroom,
  StudentSearchParams,
  StudentDependencies,
  HierarchicalDeleteResponse,
  TeacherDependencies,
  TeacherHierarchicalDeleteResponse,
  ClassroomDependencies,
  ClassroomHierarchicalDeleteResponse,
  ClassSectionDependencies,
  ClassSectionHierarchicalDeleteResponse
} from '@shared/types';
import type { ClassSectionWithStudents } from '../features/class/types/class.types';
import type { StudentTimetableResponse } from '../features/schedule/types/timetable.types';
import type { TimetableVersion, CreateTimetableVersionRequest, UpdateTimetableVersionRequest, CopyTimetableVersionRequest } from '../features/schedule/types/timetable-version.types';
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
  // FirestoreTimestamp를 string으로 변환하는 헬퍼 함수
  private convertFirestoreTimestampToString(timestamp: any): string {
    if (timestamp instanceof Date) {
      return timestamp.toISOString().split('T')[0];
    }
    if (typeof timestamp === 'string') {
      return timestamp;
    }
    if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
      return timestamp.toDate().toISOString().split('T')[0];
    }
    return '';
  }

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
      if (!response.ok) {
        // 404 에러는 "리소스를 찾을 수 없음"이므로 특별 처리
        if (response.status === 404) {
          // 404 에러를 정상적인 응답으로 변환
          const notFoundResponse: ApiResponse<T> = {
            success: false,
            message: data.message || data.error || 'Resource not found',
            data: null as T,
            meta: {
              timestamp: new Date().toISOString(),
              requestId,
              count: 0
            }
          };
          return notFoundResponse;
        }
        
        const errorMessage = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
        throw AppError.internal(
          ERROR_CODES.EXTERNAL_SERVICE_ERROR,
          errorMessage,
          {
            status: response.status,
            statusText: response.statusText,
            endpoint,
            requestId
          },
          requestId
        );
      }

      // 성공 응답 검증
      if (!data.success) {
        throw AppError.internal(
          ERROR_CODES.EXTERNAL_SERVICE_ERROR,
          data.message || 'API 요청이 실패했습니다',
          {
            endpoint,
            requestId,
            apiError: data.error
          },
          requestId
        );
      }

      return data;
    } catch (error) {
      const normalizedError = normalizeError(error, requestId);
      
      logError(normalizedError, {
        component: 'ApiService',
        action: 'request',
        endpoint,
        requestId
      });
      
      throw normalizedError;
    }
  }

  // ===== 학생 관리 API =====

  async getStudents(status?: StudentStatus): Promise<ApiResponse<Student[]>> {
    const endpoint = status
      ? `${API_ENDPOINTS.STUDENTS.GET_ALL}?status=${status}`
      : API_ENDPOINTS.STUDENTS.GET_ALL;
    return this.request<Student[]>(endpoint);
  }

  async searchStudents(params: StudentSearchParams): Promise<ApiResponse<Student[]>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        if (typeof value === 'object') {
          // 날짜 범위 처리
          if (key.endsWith('Range')) {
            searchParams.append(`${key}.start`, value.start);
            searchParams.append(`${key}.end`, value.end);
          }
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    const endpoint = searchParams.toString() 
      ? `${API_ENDPOINTS.STUDENTS.SEARCH}?${searchParams.toString()}`
      : API_ENDPOINTS.STUDENTS.SEARCH;
    
    return this.request<Student[]>(endpoint);
  }

  async getStudentById(id: string): Promise<ApiResponse<Student>> {
    return this.request<Student>(API_ENDPOINTS.STUDENTS.GET_BY_ID(id));
  }

  // ===== 학생 시간표 관리 API =====

  async getStudentTimetable(studentId: string): Promise<ApiResponse<StudentTimetableResponse['data']>> {
    return this.request<StudentTimetableResponse['data']>(
      API_ENDPOINTS.STUDENT_TIMETABLES.GET_BY_STUDENT(studentId)
    );
  }

  // 학생 시간표에 수업 추가
  async addClassToStudentTimetable(studentId: string, classSectionId: string): Promise<ApiResponse<StudentTimetableResponse['data']>> {
    return this.request<StudentTimetableResponse['data']>(
      API_ENDPOINTS.STUDENT_TIMETABLES.ADD_CLASS(studentId),
      {
        method: 'POST',
        body: JSON.stringify({ classSectionId })
      }
    );
  }

  // 학생 시간표에서 수업 제거
  async removeClassFromStudentTimetable(studentId: string, classSectionId: string): Promise<ApiResponse<StudentTimetableResponse['data']>> {
    return this.request<StudentTimetableResponse['data']>(
      API_ENDPOINTS.STUDENT_TIMETABLES.REMOVE_CLASS(studentId),
      {
        method: 'POST',
        body: JSON.stringify({ classSectionId })
      }
    );
  }

  // 학생별 버전별 시간표 조회
  async getStudentTimetableByVersion(studentId: string, versionId: string): Promise<ApiResponse<StudentTimetableResponse['data']>> {
    return this.request<StudentTimetableResponse['data']>(
      API_ENDPOINTS.STUDENT_TIMETABLES.GET_BY_STUDENT_AND_VERSION(studentId, versionId)
    );
  }

  // 학생 시간표에 수업 추가 (버전별)
  async addClassToStudentTimetableByVersion(studentId: string, versionId: string, classSectionId: string): Promise<ApiResponse<StudentTimetableResponse['data']>> {
    return this.request<StudentTimetableResponse['data']>(
      API_ENDPOINTS.STUDENT_TIMETABLES.ADD_CLASS_BY_VERSION(studentId, versionId),
      {
        method: 'POST',
        body: JSON.stringify({ classSectionId })
      }
    );
  }

  // 학생 시간표에서 수업 제거 (버전별)
  async removeClassFromStudentTimetableByVersion(studentId: string, versionId: string, classSectionId: string): Promise<ApiResponse<StudentTimetableResponse['data']>> {
    return this.request<StudentTimetableResponse['data']>(
      API_ENDPOINTS.STUDENT_TIMETABLES.REMOVE_CLASS_BY_VERSION(studentId, versionId),
      {
        method: 'POST',
        body: JSON.stringify({ classSectionId })
      }
    );
  }

  // ===== 시간표 버전 관리 API =====

  // 모든 버전 조회
  async getTimetableVersions(): Promise<ApiResponse<TimetableVersion[]>> {
    return this.request<TimetableVersion[]>(API_ENDPOINTS.TIMETABLE_VERSIONS.GET_ALL);
  }

  // 활성 버전 조회
  async getActiveTimetableVersion(): Promise<ApiResponse<TimetableVersion>> {
    return this.request<TimetableVersion>(API_ENDPOINTS.TIMETABLE_VERSIONS.GET_ACTIVE);
  }

  // 버전 조회
  async getTimetableVersionById(id: string): Promise<ApiResponse<TimetableVersion>> {
    return this.request<TimetableVersion>(API_ENDPOINTS.TIMETABLE_VERSIONS.GET_BY_ID(id));
  }

  // 버전 생성
  async createTimetableVersion(data: CreateTimetableVersionRequest): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>(API_ENDPOINTS.TIMETABLE_VERSIONS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 버전 수정
  async updateTimetableVersion(id: string, data: UpdateTimetableVersionRequest): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.TIMETABLE_VERSIONS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  // 버전 삭제
  async deleteTimetableVersion(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.TIMETABLE_VERSIONS.DELETE(id), {
      method: 'DELETE'
    });
  }

  // 버전 활성화
  async activateTimetableVersion(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.TIMETABLE_VERSIONS.ACTIVATE(id), {
      method: 'POST'
    });
  }

  // 버전 복사
  async copyTimetableVersion(sourceVersionId: string, data: CopyTimetableVersionRequest): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>(API_ENDPOINTS.TIMETABLE_VERSIONS.COPY(sourceVersionId), {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 특정 버전의 모든 학생 시간표 일괄 초기화
  async bulkInitializeTimetables(versionId: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.TIMETABLE_VERSIONS.BULK_INITIALIZE(versionId), {
      method: 'POST'
    });
  }

  async checkMigrationStatus(): Promise<ApiResponse<{total: number, migrated: number, unmigrated: number}>> {
    return this.request<{total: number, migrated: number, unmigrated: number}>(API_ENDPOINTS.TIMETABLE_VERSIONS.MIGRATION_STATUS, {
      method: 'GET'
    });
  }

  async migrateTimetablesToVersion(versionId: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.TIMETABLE_VERSIONS.MIGRATE(versionId), {
      method: 'POST'
    });
  }

  async migrateAllToVersion(versionId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/timetable-versions/migration/${versionId}/all`, {
      method: 'POST'
    });
  }

  // ===== 학생 관리 API =====

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

  async getAttendanceRecords(params?: AttendanceSearchParams): Promise<ApiResponse<AttendanceRecord[]>> {
    let endpoint = API_ENDPOINTS.ATTENDANCE.GET_RECORDS;
    
    if (params) {
      const searchParams = new URLSearchParams();
      
      // ✅ types.ts에 존재하는 속성들만 사용
      if (params.studentId) searchParams.append('studentId', params.studentId);
      if (params.date) searchParams.append('date', params.date);
      if (params.status) searchParams.append('status', params.status);
      if (params.updatedBy) searchParams.append('updatedBy', params.updatedBy);
      if (params.isLate !== undefined) searchParams.append('isLate', params.isLate.toString());
      if (params.hasLateIssues !== undefined) searchParams.append('hasLateIssues', params.hasLateIssues.toString());
      if (params.hasAbsentIssues !== undefined) searchParams.append('hasAbsentIssues', params.hasAbsentIssues.toString());
      if (params.hasDismissedIssues !== undefined) searchParams.append('hasDismissedIssues', params.hasDismissedIssues.toString());
      
      // ✅ dateRange는 types.ts의 타입에 맞게 처리
      if (params.dateRange) {
        // FirestoreTimestamp를 string으로 변환
        const startDate = this.convertFirestoreTimestampToString(params.dateRange.start);
        const endDate = this.convertFirestoreTimestampToString(params.dateRange.end);
        
        searchParams.append('startDate', startDate);
        searchParams.append('endDate', endDate);
      }
      
      if (searchParams.toString()) {
        endpoint += `?${searchParams.toString()}`;
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

  async getAttendanceByStudent(studentId: string, dateRange?: { start: DateString; end: DateString }): Promise<ApiResponse<AttendanceRecord[]>> {
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

  async getAttendanceByDate(date: DateString): Promise<ApiResponse<AttendanceRecord[]>> {
    return this.request<AttendanceRecord[]>(API_ENDPOINTS.ATTENDANCE.GET_BY_DATE(date));
  }

  async getAttendanceStatistics(dateRange?: { start: DateString; end: DateString }): Promise<ApiResponse<any>> {
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
    attendanceStatus: AttendanceStatus,
    checkInTime?: TimeString,
    checkOutTime?: TimeString,
    notes?: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.STUDENTS.UPDATE_ATTENDANCE(studentId), {
      method: 'PUT',
      body: JSON.stringify({
        status: attendanceStatus,
        updatedBy: 'admin',
        checkInTime,
        checkOutTime,
        notes
      })
    });
  }

  async getAttendanceHistory(
    studentId: string,
    days: number = 7
  ): Promise<ApiResponse<AttendanceRecord[]>> {
    const endDate = new Date().toISOString().split('T')[0] as DateString;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0] as DateString;
    
    return this.getAttendanceByStudent(studentId, { start: startDate, end: endDate });
  }

  // ===== 좌석 관리 API =====

  async getSeats(): Promise<ApiResponse<Seat[]>> {
    return this.request<Seat[]>(API_ENDPOINTS.SEATS.GET_ALL);
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
    return this.request<SeatAssignment[]>('/api/seat-assignments'); // ✨ FIX: 백엔드 라우트와 일치
  }

  async getSeatAssignmentBySeatId(seatId: string): Promise<ApiResponse<SeatAssignment>> {
    return this.request<SeatAssignment>(`/api/seat-assignments/seat/${seatId}`);
  }

  async getSeatAssignmentByStudentId(studentId: string): Promise<ApiResponse<SeatAssignment>> {
    return this.request<SeatAssignment>(`/api/seat-assignments/student/${studentId}`);
  }

  async assignStudentToSeat(seatId: string, studentId: string, assignedBy?: string, notes?: string): Promise<ApiResponse<void>> {
    return this.request<void>('/api/seat-assignments', { // ✨ FIX: 백엔드 라우트와 일치
      method: 'POST',
      body: JSON.stringify({
        seatId,
        studentId,
        assignedBy,
        notes
      })
    });
  }

  async unassignStudentFromSeat(seatId: string, unassignedBy?: string, notes?: string): Promise<ApiResponse<void>> {
    return this.request<void>('/api/seat-assignments/release', { // ✨ FIX: 백엔드 라우트와 일치
      method: 'POST',
      body: JSON.stringify({
        seatId,
        unassignedBy,
        notes
      })
    });
  }

  async bulkAssignStudents(assignments: Array<{ seatId: string; studentId: string }>, assignedBy?: string): Promise<ApiResponse<void>> {
    return this.request<void>('/api/seat-assignments/batch', { // ✨ FIX: 백엔드 라우트와 일치
      method: 'POST',
      body: JSON.stringify({
        assignments,
        assignedBy
      })
    });
  }

  async getAssignmentStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/seat-assignments/stats/overview'); // ✨ FIX: 백엔드 라우트와 일치
  }

  // ===== 출석 초기화 API =====

  async initializeAttendanceData(date?: DateString, resetExisting?: boolean): Promise<ApiResponse<void>> {
    return this.request<void>('/api/attendance/initialize', { // ✨ FIX: 백엔드 라우트와 일치
      method: 'POST',
      body: JSON.stringify({
        date,
        options: {
          resetExisting
        }
      })
    });
  }

  async initializeTodayAttendanceData(resetExisting?: boolean): Promise<ApiResponse<void>> {
    return this.request<void>('/api/attendance/initialize-today', { // ✨ FIX: 백엔드 라우트와 일치
      method: 'POST',
      body: JSON.stringify({
        options: {
          resetExisting
        }
      })
    });
  }

  // ===== 좌석 초기화 API =====

  async initializeSeats(rows: number, cols: number, startNumber?: number): Promise<ApiResponse<void>> {
    return this.request<void>('/api/seats/batch/create', { // ✨ FIX: 백엔드 라우트와 일치
      method: 'POST',
      body: JSON.stringify({
        rows,
        cols,
        startNumber
      })
    });
  }

  // ===== 좌석 헬스체크 API =====

  async checkSeatHealth(): Promise<ApiResponse<any>> {
    return this.request<any>('/api/seats/stats/overview'); // ✨ FIX: 백엔드 라우트와 일치
  }

  async autoRepairSeats(): Promise<ApiResponse<void>> {
    return this.request<void>('/api/seats/batch/deactivate', { // ✨ FIX: 백엔드 라우트와 일치
      method: 'POST'
    });
  }

  // ===== 좌석 상태 업데이트 API =====

  async updateSeatStatus(seatId: string, status: AttendanceStatus, updatedBy?: string, notes?: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/seats/${seatId}/status`, { // ✨ FIX: 백엔드 라우트와 일치
      method: 'PATCH',
      body: JSON.stringify({
        status,
        updatedBy,
        notes
      })
    });
  }

  // ===== 좌석 교환 API =====

  async swapSeatPositions(seatId1: string, seatId2: string, swappedBy?: string): Promise<ApiResponse<void>> {
    return this.request<void>('/api/seats/swap', { // ✨ FIX: 백엔드 라우트와 일치
      method: 'POST',
      body: JSON.stringify({
        seatId1,
        seatId2,
        swappedBy
      })
    });
  }

  // ===== 일괄 출석 업데이트 API =====

  async bulkUpdateAttendance(updates: Array<{
    studentId: string;
    seatId?: string;
    status: AttendanceStatus;
    checkInTime?: TimeString;
    checkOutTime?: TimeString;
    notes?: string;
  }>, updatedBy?: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.ATTENDANCE.BULK_UPDATE, {
      method: 'POST',
      body: JSON.stringify({
        updates,
        updatedBy
      })
    });
  }

  // ===== 학생 초기화 API =====

  async initializeStudents(): Promise<ApiResponse<void>> {
    return this.request<void>('/api/students/initialize', { // ✨ FIX: 백엔드 라우트와 일치
      method: 'POST'
    });
  }

  // ===== 통합 초기화 API =====

  async initializeAllData(): Promise<ApiResponse<void>> {
    return this.request<void>('/api/initialization/all', { // ✨ FIX: 백엔드 라우트와 일치
      method: 'POST'
    });
  }

  // ===== 색상 관련 API =====

  /**
   * 색상 팔레트 조회 (색상 코드와 이름을 함께 반환)
   */
  async getColorPalette(): Promise<ApiResponse<Array<{ code: string; name: string }>>> {
    return this.request<Array<{ code: string; name: string }>>('/api/colors/palette');
  }

  // ===== 수업 관리 API =====

  // 모든 수업 조회
  async getClassSections(): Promise<ApiResponse<ClassSection[]>> {
    return this.request<ClassSection[]>(API_ENDPOINTS.CLASS_SECTIONS.GET_ALL);
  }

  // 모든 수업을 상세 정보와 함께 조회 (Course, Teacher, Classroom 포함)
  async getClassSectionsWithDetails(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/api/class-sections/with-details');
  }

  // 특정 수업 조회 (ID로)
  async getClassSectionById(id: string): Promise<ApiResponse<ClassSection>> {
    return this.request<ClassSection>(`${API_ENDPOINTS.CLASS_SECTIONS.GET_BY_ID}/${id}`);
  }

  // 특정 수업을 상세 정보와 함께 조회 (ID로)
  async getClassSectionWithDetailsById(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/api/class-sections/${id}/with-details`);
  }

  async createClassSection(data: CreateClassSectionRequest): Promise<ApiResponse<ClassSection>> {
    return this.request<ClassSection>(API_ENDPOINTS.CLASS_SECTIONS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Course와 ClassSection을 한번에 생성하는 새로운 API
  async createClassWithCourse(data: {
    courseName: string;
    subject: string;
    difficulty?: string;
    name: string;
    teacherId: string;
    classroomId: string;
    schedule: Array<{ dayOfWeek: string; startTime: string; endTime: string }>;
    maxStudents: number;
    description?: string;
    notes?: string;
  }): Promise<ApiResponse<{ course: any; classSection: ClassSection }>> {
    // API_ENDPOINTS가 제대로 로드되었는지 확인하고, 실패 시 하드코딩된 엔드포인트 사용
    let endpoint = API_ENDPOINTS?.CLASS_SECTIONS?.CREATE_WITH_COURSE;
    
    if (!endpoint) {
      console.warn('⚠️ API_ENDPOINTS 로드 실패, 하드코딩된 엔드포인트 사용:', {
        API_ENDPOINTS,
        CLASS_SECTIONS: API_ENDPOINTS?.CLASS_SECTIONS,
        CREATE_WITH_COURSE: API_ENDPOINTS?.CLASS_SECTIONS?.CREATE_WITH_COURSE
      });
                    endpoint = '/api/class-sections/create-with-course'; // ✨ FIX: 백엔드 라우트와 일치
    }
    
    console.log('🔍 createClassWithCourse 호출:', { endpoint, fullUrl: `${FIREBASE_FUNCTIONS_BASE_URL}${endpoint}` });
    
    return this.request<{ course: any; classSection: ClassSection }>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateClassSection(id: string, data: UpdateClassSectionRequest): Promise<ApiResponse<ClassSection>> {
    return this.request<ClassSection>(API_ENDPOINTS.CLASS_SECTIONS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteClassSection(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.CLASS_SECTIONS.DELETE(id), {
      method: 'DELETE'
    });
  }

  async searchClassSections(params: ClassSectionSearchParams): Promise<ApiResponse<ClassSection[]>> {
    let endpoint = API_ENDPOINTS.CLASS_SECTIONS.SEARCH;

    if (params) {
      const searchParams = new URLSearchParams();

      if (params.name) searchParams.append('name', params.name);
      if (params.courseId) searchParams.append('courseId', params.courseId);
      if (params.teacherId) searchParams.append('teacherId', params.teacherId);
      if (params.classroomId) searchParams.append('classroomId', params.classroomId);
      if (params.status) searchParams.append('status', params.status);

      if (searchParams.toString()) {
        endpoint += `?${searchParams.toString()}`;
      }
    }

    return this.request<ClassSection[]>(endpoint);
  }

  async getClassSectionsByTeacher(teacherId: string): Promise<ApiResponse<ClassSection[]>> {
    return this.request<ClassSection[]>(API_ENDPOINTS.CLASS_SECTIONS.GET_BY_TEACHER(teacherId));
  }

  async getClassSectionsByCourse(courseId: string): Promise<ApiResponse<ClassSection[]>> {
    return this.request<ClassSection[]>(API_ENDPOINTS.CLASS_SECTIONS.GET_BY_COURSE(courseId));
  }

  async getClassSectionsByClassroom(classroomId: string): Promise<ApiResponse<ClassSection[]>> {
    return this.request<ClassSection[]>(API_ENDPOINTS.CLASS_SECTIONS.GET_BY_CLASSROOM(classroomId));
  }

  async getClassSectionStats(): Promise<ApiResponse<ClassSectionStatistics>> {
    return this.request<ClassSectionStatistics>(API_ENDPOINTS.CLASS_SECTIONS.GET_STATS);
  }

  // ===== 수업 계층적 삭제 API =====

  // 수업 의존성 확인
  async getClassSectionDependencies(classSectionId: string): Promise<ApiResponse<ClassSectionDependencies>> {
    return this.request(API_ENDPOINTS.CLASS_SECTIONS.GET_DEPENDENCIES(classSectionId));
  }

  // 수업 계층적 삭제
  async deleteClassSectionHierarchically(classSectionId: string): Promise<ApiResponse<ClassSectionHierarchicalDeleteResponse>> {
    return this.request(API_ENDPOINTS.CLASS_SECTIONS.DELETE_HIERARCHICALLY(classSectionId), {
      method: 'DELETE'
    });
  }

  // 시간 충돌 검증
  async validateTimeConflict(data: {
    teacherId: string;
    classroomId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    excludeId?: string;
  }): Promise<ApiResponse<{ hasConflict: boolean; message: string }>> {
    return this.request<{ hasConflict: boolean; message: string }>('/api/class-sections/validate-time-conflict', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // 시간표 통계 조회
  async getScheduleStatistics(): Promise<ApiResponse<{
    totalClasses: number;
    classesByDay: Record<string, number>;
    classesByTime: Record<string, number>;
    mostBusyTime: string;
    leastBusyTime: string;
  }>> {
    return this.request<{
      totalClasses: number;
      classesByDay: Record<string, number>;
      classesByTime: Record<string, number>;
      mostBusyTime: string;
      leastBusyTime: string;
    }>('/api/class-sections/schedule-statistics');
  }

  // ===== 새로운 단순화된 시간표 API (Frontend 전용) =====

  // ClassSection의 schedule 정보를 기반으로 시간표 그리드 생성
  // 기존 백엔드 라우트만 사용하도록 수정
  async getTimetableFromClassSections(params?: {
    dayOfWeek?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<ClassSection[]>> {
    // 기존 백엔드의 /api/class-sections 엔드포인트 사용
    return this.request<ClassSection[]>(API_ENDPOINTS.CLASS_SECTIONS.GET_ALL);
  }

  // ClassSection 기반 시간표 그리드 조회 (기존 getTimetableGrid 대체)
  async getTimetableGrid(params?: {
    dayOfWeek?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<ClassSection[]>> {
    // ClassSection API를 사용하여 시간표 데이터 조회
    return this.getTimetableFromClassSections(params);
  }

  // ===== 교사 관리 API =====

  async getTeachers(): Promise<ApiResponse<Teacher[]>> {
    return this.request<Teacher[]>(API_ENDPOINTS.TEACHERS.GET_ALL);
  }

  async getTeacherById(id: string): Promise<ApiResponse<Teacher>> {
    return this.request<Teacher>(API_ENDPOINTS.TEACHERS.GET_BY_ID(id));
  }

  async createTeacher(data: any): Promise<ApiResponse<Teacher>> {
    return this.request<Teacher>(API_ENDPOINTS.TEACHERS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateTeacher(id: string, data: any): Promise<ApiResponse<Teacher>> {
    return this.request<Teacher>(API_ENDPOINTS.TEACHERS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteTeacher(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.TEACHERS.DELETE(id), {
      method: 'DELETE'
    });
  }

  async searchTeachers(params?: any): Promise<ApiResponse<Teacher[]>> {
    let endpoint = API_ENDPOINTS.TEACHERS.SEARCH;
    
    if (params) {
      const searchParams = new URLSearchParams();
      
      if (params.name) searchParams.append('name', params.name);
      if (params.subject) searchParams.append('subject', params.subject);
      if (params.status) searchParams.append('status', params.status);
      
      if (searchParams.toString()) {
        endpoint += `?${searchParams.toString()}`;
      }
    }
    
    return this.request<Teacher[]>(endpoint);
  }

  // ===== 교사 계층적 삭제 API =====

  // 교사 의존성 확인
  async getTeacherDependencies(teacherId: string): Promise<ApiResponse<TeacherDependencies>> {
    return this.request(API_ENDPOINTS.TEACHERS.GET_DEPENDENCIES(teacherId));
  }

  // 교사 계층적 삭제
  async deleteTeacherHierarchically(teacherId: string): Promise<ApiResponse<TeacherHierarchicalDeleteResponse>> {
    return this.request(API_ENDPOINTS.TEACHERS.DELETE_HIERARCHICALLY(teacherId), {
      method: 'DELETE'
    });
  }

  // ===== 강의 관리 API =====

  async getCourses(): Promise<ApiResponse<Course[]>> {
    return this.request<Course[]>(API_ENDPOINTS.COURSES.GET_ALL);
  }

  async getCourseById(id: string): Promise<ApiResponse<Course>> {
    return this.request<Course>(API_ENDPOINTS.COURSES.GET_BY_ID(id));
  }

  async createCourse(data: any): Promise<ApiResponse<Course>> {
    return this.request<Course>(API_ENDPOINTS.COURSES.CREATE, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCourse(id: string, data: any): Promise<ApiResponse<Course>> {
    return this.request<Course>(API_ENDPOINTS.COURSES.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteCourse(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.COURSES.DELETE(id), {
      method: 'DELETE'
    });
  }

  async searchCourses(params?: any): Promise<ApiResponse<Course[]>> {
    let endpoint = API_ENDPOINTS.COURSES.SEARCH;
    
    if (params) {
      const searchParams = new URLSearchParams();
      
      if (params.name) searchParams.append('name', params.name);
      if (params.grade) searchParams.append('grade', params.grade);
      if (params.subject) searchParams.append('subject', params.subject);
      
      if (searchParams.toString()) {
        endpoint += `?${searchParams.toString()}`;
      }
    }
    
    return this.request<Course[]>(endpoint);
  }

  // ===== 강의실 관리 API =====

  async getClassrooms(): Promise<ApiResponse<Classroom[]>> {
    return this.request<Classroom[]>(API_ENDPOINTS.CLASSROOMS.GET_ALL);
  }

  async getClassroomById(id: string): Promise<ApiResponse<Classroom>> {
    return this.request<Classroom>(API_ENDPOINTS.CLASSROOMS.GET_BY_ID(id));
  }

  async createClassroom(data: any): Promise<ApiResponse<Classroom>> {
    return this.request<Classroom>(API_ENDPOINTS.CLASSROOMS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateClassroom(id: string, data: any): Promise<ApiResponse<Classroom>> {
    return this.request<Classroom>(API_ENDPOINTS.CLASSROOMS.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteClassroom(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.CLASSROOMS.DELETE(id), {
      method: 'DELETE'
    });
  }

  async searchClassrooms(params?: any): Promise<ApiResponse<Classroom[]>> {
    let endpoint = API_ENDPOINTS.CLASSROOMS.SEARCH;
    
    if (params) {
      const searchParams = new URLSearchParams();
      
      if (params.name) searchParams.append('name', params.name);
      if (params.capacity) searchParams.append('capacity', params.capacity);
      if (params.status) searchParams.append('status', params.status);
      
      if (searchParams.toString()) {
        endpoint += `?${searchParams.toString()}`;
      }
    }
    
    return this.request<Classroom[]>(endpoint);
  }

  // ===== 강의실 계층적 삭제 API =====

  // 강의실 의존성 확인
  async getClassroomDependencies(classroomId: string): Promise<ApiResponse<ClassroomDependencies>> {
    return this.request(API_ENDPOINTS.CLASSROOMS.GET_DEPENDENCIES(classroomId));
  }

  // 강의실 계층적 삭제
  async deleteClassroomHierarchically(classroomId: string): Promise<ApiResponse<ClassroomHierarchicalDeleteResponse>> {
    return this.request(API_ENDPOINTS.CLASSROOMS.DELETE_HIERARCHICALLY(classroomId), {
      method: 'DELETE'
    });
  }

  // ===== 학생 계층적 삭제 API =====

  // 학생 의존성 확인
  async getStudentDependencies(studentId: string): Promise<ApiResponse<StudentDependencies>> {
    return this.request(API_ENDPOINTS.STUDENTS.GET_DEPENDENCIES(studentId));
  }

  // 학생 계층적 삭제
  async deleteStudentHierarchically(studentId: string): Promise<ApiResponse<HierarchicalDeleteResponse>> {
    return this.request(API_ENDPOINTS.STUDENTS.DELETE_HIERARCHICALLY(studentId), {
      method: 'DELETE'
    });
  }

  // 수업에 학생 추가
  async addStudentToClass(classSectionId: string, studentId: string, versionId?: string): Promise<ApiResponse<any>> {
    try {
      const endpoint = API_ENDPOINTS.CLASS_SECTIONS.ADD_STUDENT(classSectionId, studentId);
      const url = versionId ? `${endpoint}?versionId=${versionId}` : endpoint;

      return await this.request(
        url,
        {
          method: 'POST',
          body: JSON.stringify({ studentId })
        }
      );
    } catch (error) {
      throw normalizeError(error, '수업에 학생 추가 중 오류가 발생했습니다.');
    }
  }

  // 수업에서 학생 제거
  async removeStudentFromClass(classSectionId: string, studentId: string, versionId?: string): Promise<ApiResponse<any>> {
    try {
      const endpoint = API_ENDPOINTS.CLASS_SECTIONS.REMOVE_STUDENT(classSectionId, studentId);
      const url = versionId ? `${endpoint}?versionId=${versionId}` : endpoint;

      return await this.request(
        url,
        {
          method: 'DELETE'
        }
      );
    } catch (error) {
      throw normalizeError(error, '수업에서 학생 제거 중 오류가 발생했습니다.');
    }
  }

  // 수업에 등록된 학생 목록 조회
  async getEnrolledStudents(classSectionId: string, versionId?: string): Promise<ApiResponse<Student[]>> {
    try {
      const endpoint = API_ENDPOINTS.CLASS_SECTIONS.GET_ENROLLED_STUDENTS(classSectionId);
      const url = versionId ? `${endpoint}?versionId=${versionId}` : endpoint;

      return await this.request(url);
    } catch (error) {
      throw normalizeError(error, '등록된 학생 목록 조회 중 오류가 발생했습니다.');
    }
  }

  // 선생님의 수업 목록과 수강생 정보 조회
  async getTeacherClassesWithStudents(teacherId: string): Promise<ApiResponse<ClassSectionWithStudents[]> & { statistics?: any }> {
    try {
      return await this.request<ClassSectionWithStudents[]>(`/api/teachers/${teacherId}/classes-with-students`);
    } catch (error) {
      throw normalizeError(error, '선생님 수업 및 수강생 정보 조회 중 오류가 발생했습니다.');
    }
  }
}

// 싱글톤 인스턴스 생성
export const apiService = new ApiService(); 