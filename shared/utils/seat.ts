// 좌석 관련 유틸리티 함수들
import type { Seat } from '../types/seat.types';

// 좌석 상태 확인
export function isSeatAvailable(seat: Seat): boolean {
  return seat.status === 'vacant' && seat.isActive;
}

// 좌석 번호로 좌석 찾기
export function findSeatByNumber(seats: Seat[], seatNumber: number): Seat | undefined {
  return seats.find(seat => seat.seatNumber === seatNumber);
}

// 사용 가능한 좌석 필터링
export function getAvailableSeats(seats: Seat[]): Seat[] {
  return seats.filter(seat => isSeatAvailable(seat));
}

// 좌석 상태 업데이트
export function updateSeatStatus(seat: Seat, newStatus: 'vacant' | 'occupied' | 'unavailable'): Seat {
  return {
    ...seat,
    status: newStatus,
    updatedAt: new Date() as any // FirestoreTimestamp 타입으로 변환 필요
  };
}
