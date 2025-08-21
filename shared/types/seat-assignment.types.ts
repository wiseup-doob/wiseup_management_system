import type { BaseEntity, FirestoreTimestamp } from './common.types'

// ===== 좌석 배정 관련 타입 정의 =====

// 좌석 배정 상태
export type AssignmentStatus = 'active' | 'released';

// 좌석 배정 정보
export interface SeatAssignment extends BaseEntity {
  id: string;                    // 배정 고유 ID
  seatId: string;                // `seats` 컬렉션의 ID
  studentId: string;             // `students` 컬렉션의 ID
  assignedDate: FirestoreTimestamp;    // 배정 날짜
  status: AssignmentStatus;      // 배정 상태
  createdAt: FirestoreTimestamp;          // 생성일
  updatedAt: FirestoreTimestamp;          // 수정일
}

// ===== 좌석 배정 생성 요청 타입 =====
export interface CreateSeatAssignmentRequest {
  seatId: string;                // 좌석 ID
  studentId: string;             // 학생 ID
  assignedDate: FirestoreTimestamp;    // 배정 날짜
  status?: AssignmentStatus;     // 배정 상태 (기본값: 'active')
}

// ===== 좌석 배정 수정 요청 타입 =====
export interface UpdateSeatAssignmentRequest {
  seatId?: string;               // 좌석 ID
  studentId?: string;            // 학생 ID
  assignedDate?: FirestoreTimestamp;   // 배정 날짜
  status?: AssignmentStatus;     // 배정 상태
}

// ===== 좌석 배정 검색 파라미터 타입 =====
export interface SeatAssignmentSearchParams {
  seatId?: string;               // 좌석별 검색
  studentId?: string;            // 학생별 검색
  status?: AssignmentStatus;     // 상태별 검색
  assignedDateRange?: {          // 배정 날짜 범위 검색
    start: FirestoreTimestamp;
    end: FirestoreTimestamp;
  };
}

// ===== 좌석 배정 통계 타입 =====
export interface SeatAssignmentStatistics {
  totalAssignments: number;      // 전체 배정 수
  activeAssignments: number;     // 활성 배정 수
  assignmentsByStatus: Record<AssignmentStatus, number>; // 상태별 배정 수
  assignmentsBySeat: Record<string, number>; // 좌석별 배정 수
  assignmentsByStudent: Record<string, number>; // 학생별 배정 수
}
