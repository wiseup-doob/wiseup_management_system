import type { Seat } from '../types/seat.types';
export declare function isSeatAvailable(seat: Seat): boolean;
export declare function findSeatByNumber(seats: Seat[], seatNumber: number): Seat | undefined;
export declare function getAvailableSeats(seats: Seat[]): Seat[];
export declare function updateSeatStatus(seat: Seat, newStatus: 'vacant' | 'occupied' | 'unavailable'): Seat;
//# sourceMappingURL=seat.d.ts.map