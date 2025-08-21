import type { BaseEntity, FirestoreTimestamp, AttendanceStatus } from './common.types';
export interface StudentSummary extends BaseEntity {
    studentId: string;
    studentName: string;
    currentAttendance: AttendanceStatus;
    lastAttendanceUpdate: FirestoreTimestamp;
    totalAttendanceDays: number;
    attendanceRate: number;
    lateCount: number;
    earlyLeaveCount: number;
    absentCount: number;
    dismissedCount: number;
    averageCheckInTime: string;
    averageCheckOutTime: string;
    lastCheckInDate: FirestoreTimestamp;
    lastCheckOutDate: FirestoreTimestamp;
    createdAt: FirestoreTimestamp;
    updatedAt: FirestoreTimestamp;
}
export interface CreateStudentSummaryRequest {
    studentId: string;
    studentName: string;
    currentAttendance: AttendanceStatus;
    lastAttendanceUpdate: FirestoreTimestamp;
    totalAttendanceDays?: number;
    attendanceRate?: number;
    lateCount?: number;
    earlyLeaveCount?: number;
    absentCount?: number;
    dismissedCount?: number;
    averageCheckInTime?: string;
    averageCheckOutTime?: string;
    lastCheckInDate?: FirestoreTimestamp;
    lastCheckOutDate?: FirestoreTimestamp;
    hasLateIssues?: boolean;
    hasAbsentIssues?: boolean;
    hasDismissedIssues?: boolean;
}
export interface UpdateStudentSummaryRequest {
    studentName?: string;
    currentAttendance?: AttendanceStatus;
    lastAttendanceUpdate?: FirestoreTimestamp;
    totalAttendanceDays?: number;
    attendanceRate?: number;
    lateCount?: number;
    earlyLeaveCount?: number;
    absentCount?: number;
    dismissedCount?: number;
    averageCheckInTime?: string;
    averageCheckOutTime?: string;
    lastCheckInDate?: FirestoreTimestamp;
    lastCheckOutDate?: FirestoreTimestamp;
    hasLateIssues?: boolean;
    hasAbsentIssues?: boolean;
    hasDismissedIssues?: boolean;
}
export interface StudentSummarySearchParams {
    studentId?: string;
    studentName?: string;
    currentAttendance?: AttendanceStatus;
    minAttendanceRate?: number;
    maxAttendanceRate?: number;
    hasLateIssues?: boolean;
    hasAbsentIssues?: boolean;
    hasDismissedIssues?: boolean;
    lastAttendanceUpdateRange?: {
        start: FirestoreTimestamp;
        end: FirestoreTimestamp;
    };
}
export interface StudentSummaryStatistics {
    totalStudents: number;
    averageAttendanceRate: number;
    studentsWithIssues: number;
    studentsByAttendanceStatus: Record<AttendanceStatus, number>;
    topAttendanceStudents: string[];
    studentsNeedingAttention: string[];
}
//# sourceMappingURL=student-summary.types.d.ts.map