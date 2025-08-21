import type { BaseEntity, FirestoreTimestamp, AttendanceStatus } from './common.types'

// ===== 출석 관련 타입 정의 =====

// 출석 기록
export interface AttendanceRecord extends BaseEntity {
  id: string;                    // 출석 기록 고유 ID
  studentId: string;             // 학생 ID
  date: FirestoreTimestamp;      // 출석 날짜
  status: AttendanceStatus;      // 출석 상태
  timestamp: FirestoreTimestamp; // 기록 시간
  updatedBy?: string;            // 업데이트한 사용자
  checkInTime?: FirestoreTimestamp; // 등원 시간
  checkOutTime?: FirestoreTimestamp; // 하원 시간
  notes?: string;                // 메모
  isLate?: boolean;              // 지각 여부
  createdAt: FirestoreTimestamp; // 생성일
  updatedAt: FirestoreTimestamp; // 수정일
}

// ===== 출석 기록 생성 요청 타입 =====
export interface CreateAttendanceRecordRequest {
  studentId: string;             // 학생 ID
  date: FirestoreTimestamp;      // 출석 날짜
  status: AttendanceStatus;      // 출석 상태
  timestamp: FirestoreTimestamp; // 기록 시간
  updatedBy?: string;            // 업데이트한 사용자
  checkInTime?: FirestoreTimestamp; // 등원 시간
  checkOutTime?: FirestoreTimestamp; // 하원 시간
  notes?: string;                // 메모
  isLate?: boolean;              // 지각 여부
}

// ===== 출석 기록 수정 요청 타입 =====
export interface UpdateAttendanceRecordRequest {
  status?: AttendanceStatus;      // 출석 상태
  timestamp?: FirestoreTimestamp; // 기록 시간
  updatedBy?: string;            // 업데이트한 사용자
  checkInTime?: FirestoreTimestamp; // 등원 시간
  checkOutTime?: FirestoreTimestamp; // 하원 시간
  notes?: string;                // 메모
  isLate?: boolean;              // 지각 여부
}

// ===== 출석 기록 검색 파라미터 타입 =====
export interface AttendanceSearchParams {
  studentId?: string;             // 학생별 검색
  date?: FirestoreTimestamp;      // 특정 날짜 검색
  dateRange?: {                   // 날짜 범위 검색
    start: FirestoreTimestamp;
    end: FirestoreTimestamp;
  };
  status?: AttendanceStatus;      // 상태별 검색
  updatedBy?: string;             // 업데이트한 사용자별 검색
  isLate?: boolean;               // 지각 여부별 검색
  hasLateIssues?: boolean;        // 지각 문제가 있는 학생 검색
  hasAbsentIssues?: boolean;      // 결석 문제가 있는 학생 검색
  hasDismissedIssues?: boolean;   // 하원 문제가 있는 학생 검색
}

// ===== 출석 통계 타입 =====
export interface AttendanceStatistics {
  totalRecords: number;           // 전체 출석 기록 수
  presentCount: number;           // 등원 수
  dismissedCount: number;         // 하원 수
  absentCount: number;            // 결석 수
  lateCount: number;              // 지각 수
  attendanceRate: number;         // 출석률
  averageCheckInTime: string;     // 평균 등원 시간
  averageCheckOutTime: string;    // 평균 하원 시간
  recordsByStatus: Record<AttendanceStatus, number>; // 상태별 기록 수
  recordsByDate: Record<string, number>; // 날짜별 기록 수
  recordsByStudent: Record<string, number>; // 학생별 기록 수
}

export interface DailyAttendanceSummary {
  date: FirestoreTimestamp;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  dismissedCount: number;
  attendanceRate: number;
}

export interface AttendanceRecordWithDetails extends AttendanceRecord {
  studentName: string;
  seatNumber?: number;
  className?: string;
  grade?: string;
}

export interface BulkAttendanceUpdateRequest {
  records: Array<{
    id: string;
    updates: UpdateAttendanceRecordRequest;
  }>;
}

export interface BulkAttendanceUpdateResponse {
  success: number;
  failed: number;
  errors: Array<{
    id: string;
    error: string;
  }>;
}

// ===== 출석 타임라인 아이템 타입 =====
export interface AttendanceTimelineItem {
  id: string;
  time: string;
  status: AttendanceStatus;
  activity: string;
  location?: string;
  notes?: string;
  studentId: string;
  studentName: string;
} 