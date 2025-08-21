import type { BaseEntity, FirestoreTimestamp } from './common.types';
export type SeatStatus = 'vacant' | 'occupied' | 'unavailable';
export interface Seat extends BaseEntity {
    id: string;
    seatNumber: number;
    status: SeatStatus;
    isActive: boolean;
    createdAt: FirestoreTimestamp;
    updatedAt: FirestoreTimestamp;
}
export interface CreateSeatRequest {
    seatNumber: number;
    status?: SeatStatus;
    isActive?: boolean;
}
export interface UpdateSeatRequest {
    seatNumber?: number;
    status?: SeatStatus;
    isActive?: boolean;
}
export interface SeatSearchParams {
    seatNumber?: number;
    status?: SeatStatus;
    isActive?: boolean;
    availableOnly?: boolean;
    minSeatNumber?: number;
    maxSeatNumber?: number;
}
export interface SeatStatistics {
    totalSeats: number;
    activeSeats: number;
    inactiveSeats: number;
    seatsByStatus: Record<SeatStatus, number>;
    availableSeats: number;
    occupiedSeats: number;
    unavailableSeats: number;
}
//# sourceMappingURL=seat.types.d.ts.map