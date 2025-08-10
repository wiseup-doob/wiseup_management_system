import type { Seat } from '../types/database.types';
/**
 * 좌석 데이터 생성 (8x8 그리드, 64개 좌석)
 */
export declare function generateSeatData(): Seat[];
/**
 * 좌석 그리드 생성 (8x8 그리드 기준)
 */
export declare function generateSeatGrid(totalSeats?: number): Seat[];
/**
 * 좌석 번호로 좌석 찾기
 */
export declare function findSeatByNumber(seats: Seat[], seatNumber: number): Seat | undefined;
/**
 * 좌석 ID로 좌석 찾기
 */
export declare function findSeatById(seats: Seat[], seatId: string): Seat | undefined;
/**
 * 학생 ID로 좌석 찾기 (seat_assignments 기반으로 변경 필요)
 * ❌ 이 함수는 더 이상 사용하지 않음 - seat_assignments에서 조회해야 함
 */
export declare function findSeatByStudentId(_seats: Seat[], _studentId: string): Seat | undefined;
/**
 * 좌석 할당 (seat_assignments 기반으로 변경 필요)
 * ❌ 이 함수는 더 이상 사용하지 않음 - seat_assignments에서 관리해야 함
 */
export declare function assignSeat(_seats: Seat[], _seatId: string, _studentId: string): Seat[];
/**
 * 좌석 할당 해제 (seat_assignments 기반으로 변경 필요)
 * ❌ 이 함수는 더 이상 사용하지 않음 - seat_assignments에서 관리해야 함
 */
export declare function unassignSeat(_seats: Seat[], _seatId: string): Seat[];
/**
 * 좌석 상태 시각화 (seat_assignments 기반으로 변경 필요)
 * ❌ 이 함수는 더 이상 사용하지 않음 - seat_assignments에서 조회해야 함
 */
export declare function visualizeSeatGrid(_seats: Seat[], rows?: number, cols?: number): string;
/**
 * 할당된 좌석 수 계산 (seat_assignments 기반으로 변경 필요)
 * ❌ 이 함수는 더 이상 사용하지 않음 - seat_assignments에서 조회해야 함
 */
export declare function getAssignedSeatCount(_seats: Seat[]): number;
/**
 * 좌석 할당 상태 확인 (seat_assignments 기반으로 변경 필요)
 * ❌ 이 함수는 더 이상 사용하지 않음 - seat_assignments에서 조회해야 함
 */
export declare function isSeatAssigned(_seat: Seat): boolean;
//# sourceMappingURL=seat.d.ts.map