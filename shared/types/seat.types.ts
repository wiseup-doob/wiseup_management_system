import type { BaseEntity, FirestoreTimestamp } from './common.types'

// ===== 좌석 관련 타입 정의 =====

// 좌석 상태
export type SeatStatus = 'vacant' | 'occupied' | 'unavailable';

// 좌석 정보
export interface Seat extends BaseEntity {
  id: string;                    // 좌석 고유 ID
  seatNumber: number;            // 좌석 번호
  status: SeatStatus;            // 좌석 상태
  isActive: boolean;             // 활성화 여부
  createdAt: FirestoreTimestamp;          // 생성일
  updatedAt: FirestoreTimestamp;          // 수정일
}

// ===== 좌석 생성 요청 타입 =====
export interface CreateSeatRequest {
  seatNumber: number;            // 좌석 번호
  status?: SeatStatus;           // 좌석 상태 (기본값: 'vacant')
  isActive?: boolean;            // 활성화 여부 (기본값: true)
}

// ===== 좌석 수정 요청 타입 =====
export interface UpdateSeatRequest {
  seatNumber?: number;           // 좌석 번호
  status?: SeatStatus;           // 좌석 상태
  isActive?: boolean;            // 활성화 여부
}

// ===== 좌석 검색 파라미터 타입 =====
export interface SeatSearchParams {
  seatNumber?: number;           // 좌석 번호 검색
  status?: SeatStatus;           // 상태별 검색
  isActive?: boolean;            // 활성화 상태별 검색
  availableOnly?: boolean;       // 사용 가능한 좌석만 검색
  minSeatNumber?: number;        // 최소 좌석 번호
  maxSeatNumber?: number;        // 최대 좌석 번호
}

// ===== 좌석 통계 타입 =====
export interface SeatStatistics {
  totalSeats: number;            // 전체 좌석 수
  activeSeats: number;           // 활성 좌석 수
  inactiveSeats: number;         // 비활성 좌석 수
  seatsByStatus: Record<SeatStatus, number>; // 상태별 좌석 수
  availableSeats: number;        // 사용 가능한 좌석 수
  occupiedSeats: number;         // 사용 중인 좌석 수
  unavailableSeats: number;      // 사용 불가능한 좌석 수
}
