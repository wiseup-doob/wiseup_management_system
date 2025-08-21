import type { BaseEntity, FirestoreTimestamp } from './common.types';
export type AssignmentStatus = 'active' | 'released';
export interface SeatAssignment extends BaseEntity {
    id: string;
    seatId: string;
    studentId: string;
    assignedDate: FirestoreTimestamp;
    status: AssignmentStatus;
    createdAt: FirestoreTimestamp;
    updatedAt: FirestoreTimestamp;
}
export interface CreateSeatAssignmentRequest {
    seatId: string;
    studentId: string;
    assignedDate: FirestoreTimestamp;
    status?: AssignmentStatus;
}
export interface UpdateSeatAssignmentRequest {
    seatId?: string;
    studentId?: string;
    assignedDate?: FirestoreTimestamp;
    status?: AssignmentStatus;
}
export interface SeatAssignmentSearchParams {
    seatId?: string;
    studentId?: string;
    status?: AssignmentStatus;
    assignedDateRange?: {
        start: FirestoreTimestamp;
        end: FirestoreTimestamp;
    };
}
export interface SeatAssignmentStatistics {
    totalAssignments: number;
    activeAssignments: number;
    assignmentsByStatus: Record<AssignmentStatus, number>;
    assignmentsBySeat: Record<string, number>;
    assignmentsByStudent: Record<string, number>;
}
//# sourceMappingURL=seat-assignment.types.d.ts.map