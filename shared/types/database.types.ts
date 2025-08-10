// 개선된 데이터베이스 구조를 위한 타입 정의
import type { 
  BaseEntity, 
  DateString, 
  TimeString, 
  DateTimeString, 
  DateRange, 
  TimeRange,
  StudentId,
  SeatId,
  AttendanceRecordId,
  AttendanceStatus
} from './common.types';

// ===== UUID 유틸리티 타입 =====
// UUID 타입은 common.types.ts에서 정의됨

// ===== 좌석 관련 타입 =====

// 좌석 정보 (seats 컬렉션)
export interface Seat extends BaseEntity {
  seatId: SeatId;           // "seat_001", "seat_002", ...
  seatNumber: number;       // 1, 2, 3, ...
  row: number;              // 행 번호
  col: number;              // 열 번호
  // ❌ studentId 제거 - 좌석 배정 정보는 seat_assignments에서 관리
  // ❌ assignedDate 제거 - 배정 날짜는 seat_assignments에서 관리
  status: AttendanceStatus; // 좌석 상태 (available, occupied, maintenance 등)
  lastUpdated: DateTimeString;      // 마지막 업데이트 시간
  notes?: string;           // 좌석 관련 메모
}

// 좌석 배정 정보
export interface SeatAssignment extends BaseEntity {
  seatId: SeatId;
  studentId: StudentId;
  assignedDate: DateString;     // 배정 날짜
  assignedBy?: string;      // 배정한 사용자 ID
  notes?: string;           // 배정 관련 메모
}

// ===== 학생 관련 타입 (UUID 기반) =====

// 기본 학생 정보 (students 컬렉션)
export interface StudentBasicInfo extends BaseEntity {
  id: StudentId;                 // UUID 기반 학생 ID
  name: string;
  grade: string;
  className: string;
  status: 'active' | 'inactive';
  enrollmentDate: DateString;   // 입학 날짜
  graduationDate?: DateString;  // 졸업/퇴학 날짜
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  parentInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
}

// 학생 현재 상태 (students 컬렉션의 하위 필드)
export interface StudentCurrentStatus {
  currentAttendance?: AttendanceStatus;
  lastAttendanceUpdate?: DateTimeString; // 마지막 출석 업데이트 시간
  firstAttendanceDate?: DateString; // 첫 등원일
  totalAttendanceDays?: number;
  averageCheckInTime?: TimeString; // 평균 등원 시간
  averageCheckOutTime?: TimeString; // 평균 하원 시간
}

// 통합된 학생 정보 (API 응답용)
export interface Student extends StudentBasicInfo {
  currentStatus: StudentCurrentStatus;
}

// ===== 출석 기록 타입 (UUID 기반) =====

// 출석 기록 (attendance_records 컬렉션)
export interface AttendanceRecord extends BaseEntity {
  id: AttendanceRecordId;               // `${studentId}_${date}` 형식
  studentId: StudentId;          // UUID 기반 학생 ID
  seatId?: SeatId;          // 해당 날짜의 좌석 ID
  date: DateString;             // 출석 날짜
  status: AttendanceStatus;
  timestamp: DateTimeString;        // 출석 기록 시간
  updatedBy?: string;
  
  // 시간 정보
  checkInTime?: TimeString;     // 등원 시간
  checkOutTime?: TimeString;    // 하원 시간
  totalHours?: number;      // 총 등원 시간 (시간 단위)
  
  // 위치 및 메모
  location?: string;
  notes?: string;
  
  // 계산된 필드
  isLate?: boolean;         // 지각 여부
  isEarlyLeave?: boolean;   // 조퇴 여부
}

// ===== 통계 타입 (UUID 기반) =====

// 일별 요약 통계 (daily_summaries 컬렉션)
export interface DailySummary extends BaseEntity {
  date: DateString; // 요약 날짜
  totalStudents: number;
  presentCount: number;
  dismissedCount: number;
  unauthorizedAbsentCount: number;
  authorizedAbsentCount: number;
  notEnrolledCount: number;
  
  // 시간별 통계
  averageCheckInTime?: TimeString;
  averageCheckOutTime?: TimeString;
  lateCount?: number;
  earlyLeaveCount?: number;
  
  // 클래스별 통계
  classStats?: {
    [className: string]: {
      present: number;
      dismissed: number;
      unauthorizedAbsent: number;
      authorizedAbsent: number;
      notEnrolled: number;
    };
  };
  
  // 좌석별 통계
  seatStats?: {
    [seatId: SeatId]: {
      studentId?: StudentId;
      status: AttendanceStatus;
      checkInTime?: TimeString;
      checkOutTime?: TimeString;
    };
  };
}

// 월별 리포트 (monthly_reports 컬렉션)
export interface MonthlyReport extends BaseEntity {
  year: number;
  month: number; // 1-12
  totalStudents: number;
  totalAttendanceDays: number;
  averageAttendanceRate: number; // 0-1
  
  // 출석 상태별 통계
  statusStats: {
    present: number;
    dismissed: number;
    unauthorizedAbsent: number;
    authorizedAbsent: number;
    notEnrolled: number;
  };
  
  // 학생별 상세 통계
  studentStats?: {
    [studentId: StudentId]: {
      totalDays: number;
      presentDays: number;
      attendanceRate: number;
      averageCheckInTime?: TimeString;
      averageCheckOutTime?: TimeString;
      lateCount: number;
      earlyLeaveCount: number;
    };
  };
}

// ===== 검색 및 필터링 타입 =====

// 학생 검색 파라미터
export interface StudentSearchParams {
  name?: string;
  grade?: string;
  className?: string;
  status?: 'active' | 'inactive';
  currentAttendance?: AttendanceStatus;
  enrollmentDateRange?: DateRange;
}

// 출석 검색 파라미터
export interface AttendanceSearchParams {
  studentId?: StudentId;
  studentName?: string;
  seatId?: SeatId;
  date?: DateString;
  startDate?: DateString;
  endDate?: DateString;
  status?: AttendanceStatus;
  checkInTimeRange?: TimeRange;
  totalHoursRange?: {
    min: number;
    max: number;
  };
}

// 좌석 검색 파라미터
export interface SeatSearchParams {
  seatNumber?: number;
  row?: number;
  col?: number;
  studentId?: StudentId;
  status?: AttendanceStatus;
  isAssigned?: boolean; // 배정 여부
}

// ===== 컬렉션 이름 =====

// 데이터베이스 컬렉션 이름
export const COLLECTION_NAMES = {
  STUDENTS: 'students',
  SEATS: 'seats',
  SEAT_ASSIGNMENTS: 'seat_assignments',
  ATTENDANCE_RECORDS: 'attendance_records',
  DAILY_SUMMARIES: 'daily_summaries',
  MONTHLY_REPORTS: 'monthly_reports',
} as const;

// ===== 인덱스 정의 =====

// 인덱스 정의
export const REQUIRED_INDEXES = {
  // students 컬렉션 인덱스
  STUDENTS_BY_NAME: 'students/name/Ascending',
  STUDENTS_BY_GRADE: 'students/grade/Ascending',
  STUDENTS_BY_CLASS: 'students/className/Ascending',
  STUDENTS_BY_SEAT: 'students/seatNumber/Ascending',
  STUDENTS_BY_STATUS: 'students/status/Ascending',
  STUDENTS_BY_ENROLLMENT_DATE: 'students/enrollmentDate/Descending',
  
  // seats 컬렉션 인덱스
  SEATS_BY_NUMBER: 'seats/seatNumber/Ascending',
  SEATS_BY_STUDENT: 'seats/studentId/Ascending',
  SEATS_BY_STATUS: 'seats/status/Ascending',
  SEATS_BY_ROW_COL: 'seats/row/Ascending/col/Ascending',
  
  // seat_assignments 컬렉션 인덱스
  SEAT_ASSIGNMENTS_BY_STUDENT: 'seat_assignments/studentId/Ascending',
  SEAT_ASSIGNMENTS_BY_SEAT: 'seat_assignments/seatId/Ascending',
  SEAT_ASSIGNMENTS_BY_DATE: 'seat_assignments/assignedDate/Descending',
  
  // attendance_records 컬렉션 인덱스
  ATTENDANCE_BY_STUDENT_DATE: 'attendance_records/studentId/Ascending/date/Descending',
  ATTENDANCE_BY_STUDENT_STATUS: 'attendance_records/studentId/Ascending/status/Ascending',
  ATTENDANCE_BY_DATE_STATUS: 'attendance_records/date/Ascending/status/Ascending',
  ATTENDANCE_BY_STUDENT_DATE_STATUS: 'attendance_records/studentId/Ascending/date/Ascending/status/Ascending',
  ATTENDANCE_BY_CHECKIN_TIME: 'attendance_records/checkInTime/Ascending',
  ATTENDANCE_BY_SEAT: 'attendance_records/seatId/Ascending',
  
  // daily_summaries 컬렉션 인덱스
  DAILY_SUMMARIES_BY_DATE: 'daily_summaries/date/Descending',
  
  // monthly_reports 컬렉션 인덱스
  MONTHLY_REPORTS_BY_YEAR_MONTH: 'monthly_reports/year/Descending/month/Descending',
} as const; 