// API 구조를 위한 타입 정의
import type { 
  Student, 
  AttendanceRecord,
  StudentSearchParams,
  AttendanceSearchParams
} from './database.types';
import type { 
  AttendanceStatus,
  ApiResponse
} from './common.types';

// ===== 학생 관련 API =====

// 학생 목록 조회 요청
export interface GetStudentsRequest {
  search?: StudentSearchParams;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'seatNumber' | 'grade' | 'className';
  sortOrder?: 'asc' | 'desc';
}

// 학생 목록 조회 응답
export interface GetStudentsResponse {
  students: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 학생 상세 조회 응답
export interface GetStudentResponse {
  student: Student;
  recentAttendance: AttendanceRecord[];
  statistics: {
    totalDays: number;
    presentDays: number;
    attendanceRate: number;
    averageCheckInTime?: string;
    averageCheckOutTime?: string;
    lateCount: number;
    earlyLeaveCount: number;
  };
}

// 학생 생성 요청
export interface CreateStudentRequest {
  name: string;
  grade: string;
  className: string;
  seatNumber: number;
  status?: 'active' | 'inactive';
}

// 학생 업데이트 요청
export interface UpdateStudentRequest {
  name?: string;
  grade?: string;
  className?: string;
  seatNumber?: number;
  status?: 'active' | 'inactive';
}

// ===== 출석 관련 API =====

// 출석 기록 생성/업데이트 요청
export interface CreateAttendanceRecordRequest {
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string; // HH:MM
  checkOutTime?: string; // HH:MM
  location?: string;
  notes?: string;
  updatedBy?: string;
}

// 출석 기록 업데이트 요청
export interface UpdateAttendanceRecordRequest {
  status?: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  location?: string;
  notes?: string;
  updatedBy?: string;
}

// 출석 기록 조회 요청
export interface GetAttendanceRecordsRequest {
  search?: AttendanceSearchParams;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'checkInTime' | 'totalHours';
  sortOrder?: 'asc' | 'desc';
}

// 출석 기록 조회 응답
export interface GetAttendanceRecordsResponse {
  records: AttendanceRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 일별 요약 조회 요청
export interface GetDailySummaryRequest {
  date?: string; // YYYY-MM-DD
  startDate?: string;
  endDate?: string;
}

// 일별 요약 조회 응답
export interface GetDailySummaryResponse {
  summaries: any[];
  total: number;
}

// 월별 리포트 조회 요청
export interface GetMonthlyReportRequest {
  year: number;
  month: number;
}

// 월별 리포트 조회 응답
export interface GetMonthlyReportResponse {
  report: any;
}

// ===== 통계 관련 API =====

// 출석 통계 조회 요청
export interface GetAttendanceStatsRequest {
  startDate?: string;
  endDate?: string;
  grade?: string;
  className?: string;
  studentId?: string;
}

// 출석 통계 응답
export interface GetAttendanceStatsResponse {
  totalStudents: number;
  totalDays: number;
  averageAttendanceRate: number;
  
  // 상태별 통계
  statusStats: {
    present: number;
    dismissed: number;
    unauthorizedAbsent: number;
    authorizedAbsent: number;
    notEnrolled: number;
  };
  
  // 시간별 통계
  timeStats: {
    averageCheckInTime?: string;
    averageCheckOutTime?: string;
    lateCount: number;
    earlyLeaveCount: number;
  };
  
  // 클래스별 통계
  classStats: {
    [className: string]: {
      totalStudents: number;
      averageAttendanceRate: number;
      statusStats: {
        present: number;
        dismissed: number;
        unauthorizedAbsent: number;
        authorizedAbsent: number;
        notEnrolled: number;
      };
    };
  };
}

// ===== 배치 처리 API =====

// 일괄 출석 업데이트 요청
export interface BulkAttendanceUpdateRequest {
  records: CreateAttendanceRecordRequest[];
}

// 일괄 출석 업데이트 응답
export interface BulkAttendanceUpdateResponse {
  success: number;
  failed: number;
  errors: Array<{
    studentId: string;
    date: string;
    error: string;
  }>;
}

// ===== 검색 관련 API =====

// 학생 검색 요청
export interface SearchStudentsRequest {
  query: string;
  filters?: {
    grade?: string;
    className?: string;
    status?: 'active' | 'inactive';
    currentAttendance?: AttendanceStatus;
  };
  page?: number;
  limit?: number;
}

// 학생 검색 응답
export interface SearchStudentsResponse {
  students: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 출석 기록 검색 요청
export interface SearchAttendanceRecordsRequest {
  query: string;
  filters?: {
    status?: AttendanceStatus;
    dateRange?: {
      start: string;
      end: string;
    };
    timeRange?: {
      start: string;
      end: string;
    };
  };
  page?: number;
  limit?: number;
}

// 출석 기록 검색 응답
export interface SearchAttendanceRecordsResponse {
  records: AttendanceRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== API 응답 래퍼 =====

// 성공 응답 래퍼
export type ApiSuccessResponse<T> = ApiResponse<T>;

// 오류 응답 래퍼
export type ApiErrorResponse = ApiResponse<null>;

// 페이지네이션 메타데이터
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 페이지네이션 응답
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
} 