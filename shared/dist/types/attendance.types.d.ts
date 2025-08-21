import type { BaseEntity, FirestoreTimestamp, AttendanceStatus } from './common.types';
export interface AttendanceRecord extends BaseEntity {
    id: string;
    studentId: string;
    date: FirestoreTimestamp;
    status: AttendanceStatus;
    timestamp: FirestoreTimestamp;
    updatedBy?: string;
    checkInTime?: FirestoreTimestamp;
    checkOutTime?: FirestoreTimestamp;
    notes?: string;
    isLate?: boolean;
    createdAt: FirestoreTimestamp;
    updatedAt: FirestoreTimestamp;
}
export interface CreateAttendanceRecordRequest {
    studentId: string;
    date: FirestoreTimestamp;
    status: AttendanceStatus;
    timestamp: FirestoreTimestamp;
    updatedBy?: string;
    checkInTime?: FirestoreTimestamp;
    checkOutTime?: FirestoreTimestamp;
    notes?: string;
    isLate?: boolean;
}
export interface UpdateAttendanceRecordRequest {
    status?: AttendanceStatus;
    timestamp?: FirestoreTimestamp;
    updatedBy?: string;
    checkInTime?: FirestoreTimestamp;
    checkOutTime?: FirestoreTimestamp;
    notes?: string;
    isLate?: boolean;
}
export interface AttendanceSearchParams {
    studentId?: string;
    date?: FirestoreTimestamp;
    dateRange?: {
        start: FirestoreTimestamp;
        end: FirestoreTimestamp;
    };
    status?: AttendanceStatus;
    updatedBy?: string;
    isLate?: boolean;
    hasLateIssues?: boolean;
    hasAbsentIssues?: boolean;
    hasDismissedIssues?: boolean;
}
export interface AttendanceStatistics {
    totalRecords: number;
    presentCount: number;
    dismissedCount: number;
    absentCount: number;
    lateCount: number;
    attendanceRate: number;
    averageCheckInTime: string;
    averageCheckOutTime: string;
    recordsByStatus: Record<AttendanceStatus, number>;
    recordsByDate: Record<string, number>;
    recordsByStudent: Record<string, number>;
}
export interface DailyAttendanceSummary {
    date: FirestoreTimestamp;
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    dismissedCount: number;
    attendanceRate: number;
}
export interface AttendanceRecordWithDetails extends AttendanceRecord {
    studentName: string;
    seatNumber?: number;
    className?: string;
    grade?: string;
}
export interface BulkAttendanceUpdateRequest {
    records: Array<{
        id: string;
        updates: UpdateAttendanceRecordRequest;
    }>;
}
export interface BulkAttendanceUpdateResponse {
    success: number;
    failed: number;
    errors: Array<{
        id: string;
        error: string;
    }>;
}
export interface AttendanceTimelineItem {
    id: string;
    time: string;
    status: AttendanceStatus;
    activity: string;
    location?: string;
    notes?: string;
    studentId: string;
    studentName: string;
}
//# sourceMappingURL=attendance.types.d.ts.map