// 출석 관리 관련 타입 정의 - 백엔드 데이터 구조와 통일
import type { 
  Student, 
  Seat, 
  SeatAssignment,
  AttendanceRecord,
  AttendanceStatus,
  DateString,
  TimeString,
  DateTimeString
} from '@shared/types';

// ===== 좌석 배정 응답 타입 (백엔드 API 응답과 일치) =====
export interface SeatAssignmentResponse extends SeatAssignment {
  // 백엔드에서 반환하는 추가 필드들
  studentName?: string;        // 학생 이름 (API 응답에서 제공)
  currentAttendance?: AttendanceStatus; // 현재 출석 상태
}

// ===== 좌석과 학생 정보를 결합한 타입 =====
export interface SeatWithStudent extends Seat {
  // 좌석 기본 정보는 Seat에서 상속받음
  
  // 현재 배정된 학생 정보
  currentAssignment?: SeatAssignmentResponse;
  
  // 프론트엔드에서 사용하는 추가 필드
  studentId?: string;
  studentName?: string;
  currentAttendance?: AttendanceStatus; // 현재 출석 상태
}

// ===== 출석 상태별 스타일 정보 =====
export interface AttendanceStatusStyle {
  text: string;
  className: string;
  backgroundColor: string;
  color: string;
  borderColor?: string;
  dotColor: string;
}



// ===== 좌석 헬스체크 관련 타입 =====
export interface SeatHealthStatus {
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
}

// ===== 출석 통계 타입 =====
export interface AttendanceStats {
  total: number;
  present: number;
  dismissed: number;
  unauthorized_absent: number;
  authorized_absent: number;
  not_enrolled: number;
}

// ===== 출석 액션 타입 =====
export interface AttendanceAction {
  type: 'update' | 'reset' | 'mark_all_present';
  seatId?: string;
  status?: AttendanceStatus;
}

// ===== 출석 업데이트 요청 타입 =====
export interface AttendanceUpdateRequest {
  studentId: string;
  attendanceStatus: AttendanceStatus;
  updatedBy?: string;
  checkInTime?: TimeString;
  checkOutTime?: TimeString;
  location?: string;
  notes?: string;
}

// ===== 좌석 편집 모드 타입 =====
export type EditingMode = 'none' | 'remove' | 'move';

// ===== 좌석 편집 상태 타입 =====
export interface SeatEditState {
  mode: EditingMode;
  sourceSeatId: string | null;
  pendingChangesCount: number;
}

// ===== 출석 검색 결과 타입 =====
export interface AttendanceSearchResult {
  students: Student[];
  seats: SeatWithStudent[];
  assignments: SeatAssignmentResponse[];
}

// ===== 출석 필터 타입 =====
export interface AttendanceFilter {
  date?: DateString;
  status?: AttendanceStatus[];
  grade?: string;
  className?: string;
  searchTerm?: string;
}

// ===== 출석 일괄 업데이트 타입 =====
export interface BulkAttendanceUpdate {
  updates: Array<{
    studentId: string;
    seatId?: string;
    status: AttendanceStatus;
    checkInTime?: TimeString;
    checkOutTime?: TimeString;
    notes?: string;
  }>;
  updatedBy?: string;
}

// ===== 출석 기록 타입 (백엔드와 일치) =====
export interface AttendanceRecordResponse extends AttendanceRecord {
  // 백엔드에서 반환하는 추가 필드들
  studentName?: string;
  seatNumber?: number;
}

// ===== 출석 통계 응답 타입 =====
export interface AttendanceStatsResponse {
  totalStudents: number;
  presentCount: number;
  dismissedCount: number;
  unauthorizedAbsentCount: number;
  authorizedAbsentCount: number;
  notEnrolledCount: number;
  averageCheckInTime?: TimeString;
  averageCheckOutTime?: TimeString;
  lateCount: number;
  earlyLeaveCount: number;
}

// ===== 좌석 배정 요청 타입 =====
export interface SeatAssignmentRequest {
  seatId: string;
  studentId: string;
  assignedBy?: string;
  notes?: string;
}

// ===== 좌석 배정 해제 요청 타입 =====
export interface SeatUnassignmentRequest {
  seatId: string;
  unassignedBy?: string;
  notes?: string;
}

// ===== 좌석 교환 요청 타입 =====
export interface SeatSwapRequest {
  seatId1: string;
  seatId2: string;
  swappedBy?: string;
  notes?: string;
}

// ===== 좌석 상태 업데이트 요청 타입 =====
export interface SeatStatusUpdateRequest {
  seatId: string;
  status: AttendanceStatus;
  updatedBy?: string;
  notes?: string;
}

// ===== 좌석 초기화 요청 타입 =====
export interface SeatInitializationRequest {
  rows: number;
  cols: number;
  startNumber?: number;
  initializedBy?: string;
}

// ===== 출석 초기화 요청 타입 =====
export interface AttendanceInitializationRequest {
  date: DateString;
  initializedBy?: string;
  options?: {
    resetExisting?: boolean;
    defaultStatus?: AttendanceStatus;
  };
}

// ===== API 응답 타입들 =====
export interface SeatAssignmentApiResponse {
  success: boolean;
  message?: string;
  data?: SeatAssignmentResponse[];
  error?: string;
  meta?: {
    timestamp?: string;
    version?: string;
    requestId?: string;
    count?: number;
  };
}

export interface SeatApiResponse {
  success: boolean;
  message?: string;
  data?: Seat[];
  error?: string;
  meta?: {
    timestamp?: string;
    version?: string;
    requestId?: string;
    count?: number;
  };
}

export interface StudentApiResponse {
  success: boolean;
  message?: string;
  data?: Student[];
  error?: string;
  meta?: {
    timestamp?: string;
    version?: string;
    requestId?: string;
    count?: number;
  };
}

// ===== 유틸리티 타입 =====
export type AttendanceStatusFilter = AttendanceStatus | 'all';

export interface AttendanceTimeRange {
  start: TimeString;
  end: TimeString;
}

export interface AttendanceDateRange {
  start: DateString;
  end: DateString;
} 