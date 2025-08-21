import type { BaseEntity, FirestoreTimestamp, AttendanceStatus } from './common.types'

// ===== 학생 요약 정보 관련 타입 정의 =====

// 학생 요약 정보
export interface StudentSummary extends BaseEntity {
  studentId: string;              // 학생 ID
  studentName: string;            // 학생 이름
  currentAttendance: AttendanceStatus; // 현재 출석 상태
  lastAttendanceUpdate: FirestoreTimestamp; // 마지막 출석 업데이트 시간
  totalAttendanceDays: number;    // 총 출석 일수
  attendanceRate: number;         // 출석률
  lateCount: number;              // 지각 횟수
  earlyLeaveCount: number;        // 조퇴 횟수
  absentCount: number;            // 결석 횟수
  dismissedCount: number;         // 하원 횟수
  averageCheckInTime: string;     // 평균 등원 시간
  averageCheckOutTime: string;    // 평균 하원 시간
  lastCheckInDate: FirestoreTimestamp; // 마지막 등원일
  lastCheckOutDate: FirestoreTimestamp; // 마지막 하원일
  createdAt: FirestoreTimestamp;          // 생성일
  updatedAt: FirestoreTimestamp;          // 수정일
}

// ===== 학생 요약 정보 생성 요청 타입 =====
export interface CreateStudentSummaryRequest {
  studentId: string;              // 학생 ID
  studentName: string;            // 학생 이름
  currentAttendance: AttendanceStatus; // 현재 출석 상태
  lastAttendanceUpdate: FirestoreTimestamp; // 마지막 출석 업데이트 시간
  totalAttendanceDays?: number;   // 총 출석 일수 (기본값: 0)
  attendanceRate?: number;        // 출석률 (기본값: 0)
  lateCount?: number;             // 지각 횟수 (기본값: 0)
  earlyLeaveCount?: number;       // 조퇴 횟수 (기본값: 0)
  absentCount?: number;           // 결석 횟수 (기본값: 0)
  dismissedCount?: number;        // 하원 횟수 (기본값: 0)
  averageCheckInTime?: string;    // 평균 등원 시간
  averageCheckOutTime?: string;   // 평균 하원 시간
  lastCheckInDate?: FirestoreTimestamp; // 마지막 등원일
  lastCheckOutDate?: FirestoreTimestamp; // 마지막 하원일
  hasLateIssues?: boolean;        // 지각 문제 여부 (기본값: false)
  hasAbsentIssues?: boolean;      // 결석 문제 여부 (기본값: false)
  hasDismissedIssues?: boolean;   // 하원 문제 여부 (기본값: false)
}

// ===== 학생 요약 정보 수정 요청 타입 =====
export interface UpdateStudentSummaryRequest {
  studentName?: string;            // 학생 이름
  currentAttendance?: AttendanceStatus; // 현재 출석 상태
  lastAttendanceUpdate?: FirestoreTimestamp; // 마지막 출석 업데이트 시간
  totalAttendanceDays?: number;    // 총 출석 일수
  attendanceRate?: number;         // 출석률
  lateCount?: number;              // 지각 횟수
  earlyLeaveCount?: number;        // 조퇴 횟수
  absentCount?: number;            // 결석 횟수
  dismissedCount?: number;         // 하원 횟수
  averageCheckInTime?: string;     // 평균 등원 시간
  averageCheckOutTime?: string;    // 평균 하원 시간
  lastCheckInDate?: FirestoreTimestamp; // 마지막 등원일
  lastCheckOutDate?: FirestoreTimestamp; // 마지막 하원일
  hasLateIssues?: boolean;         // 지각 문제 여부
  hasAbsentIssues?: boolean;       // 결석 문제 여부
  hasDismissedIssues?: boolean;    // 하원 문제 여부
}

// ===== 학생 요약 정보 검색 파라미터 타입 =====
export interface StudentSummarySearchParams {
  studentId?: string;              // 학생 ID로 검색
  studentName?: string;            // 학생 이름으로 검색
  currentAttendance?: AttendanceStatus; // 현재 출석 상태별 검색
  minAttendanceRate?: number;      // 최소 출석률
  maxAttendanceRate?: number;      // 최대 출석률
  hasLateIssues?: boolean;         // 지각 문제 여부별 검색
  hasAbsentIssues?: boolean;       // 결석 문제 여부별 검색
  hasDismissedIssues?: boolean;    // 하원 문제 여부별 검색
  lastAttendanceUpdateRange?: {    // 마지막 출석 업데이트 범위
    start: FirestoreTimestamp;
    end: FirestoreTimestamp;
  };
}

// ===== 학생 요약 정보 통계 타입 =====
export interface StudentSummaryStatistics {
  totalStudents: number;           // 전체 학생 수
  averageAttendanceRate: number;   // 평균 출석률
  studentsWithIssues: number;      // 문제가 있는 학생 수
  studentsByAttendanceStatus: Record<AttendanceStatus, number>; // 출석 상태별 학생 수
  topAttendanceStudents: string[]; // 출석률 상위 학생들
  studentsNeedingAttention: string[]; // 주의가 필요한 학생들
}
