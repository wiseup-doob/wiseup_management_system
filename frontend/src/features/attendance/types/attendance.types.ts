import type { Student, AttendanceRecord, Seat } from '@shared/types';
import type { AttendanceStatus } from '@shared/types/common.types';

// 프론트엔드에서 사용하는 좌석 정보 (shared 타입 확장)
export interface SeatWithStudent extends Seat {
  // ❌ studentName 제거 - seat_assignments에서 관리
  currentAssignment?: {
    studentId: string;
    studentName: string;
    status: AttendanceStatus;
    assignedDate: string;
  } | null;
}

// 좌석 배정 정보 (API 응답용)
export interface SeatAssignmentResponse {
  id: string;
  seatId: string;
  studentId: string;
  studentName: string;
  assignedDate: string;
  status: AttendanceStatus;
}

// 출결 관리 상태
export interface AttendanceState {
  seats: SeatWithStudent[];
  students: Student[];
  seatAssignments: SeatAssignmentResponse[];
  searchTerm: string;
  selectedSeat: string | null;
  isLoading: boolean;
  error: string | null;
}

// 출결 통계
export interface AttendanceStats {
  total: number;
  present: number;
  dismissed: number;
  unauthorized_absent: number;
  authorized_absent: number;
}

// 출결 액션
export interface AttendanceAction {
  seatId: string;
  status: AttendanceStatus;
} 