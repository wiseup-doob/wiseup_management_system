import type { AttendanceRecord as NewAttendanceRecord } from './database.types';
export type AttendanceStatus = 'present' | 'dismissed' | 'unauthorized_absent' | 'authorized_absent' | 'not_enrolled';
export interface AttendanceRecord {
    date: string;
    status: AttendanceStatus;
    timestamp: string;
    updatedBy?: string;
    checkInTime?: string;
    checkOutTime?: string;
    totalHours?: number;
    notes?: string;
}
export type { AttendanceRecord as AttendanceRecordV2 } from './database.types';
export interface AttendanceTimeRecord {
    date: string;
    studentId: string;
    checkInTime: string;
    checkOutTime?: string;
    totalHours?: number;
    status: AttendanceStatus;
    location?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    updatedBy?: string;
}
export interface Seat {
    id: string;
    studentName: string;
    status: AttendanceStatus;
    row: number;
    col: number;
}
export interface AttendanceStats {
    total: number;
    present: number;
    dismissed: number;
    unauthorized_absent: number;
    authorized_absent: number;
}
export interface AttendanceAction {
    type: 'update' | 'reset' | 'mark_all_present';
    seatId?: string;
    status?: AttendanceStatus;
}
export interface AttendanceUpdateRequest {
    studentId: string;
    attendanceStatus: AttendanceStatus;
    updatedBy?: string;
    checkInTime?: string;
    checkOutTime?: string;
    location?: string;
    notes?: string;
}
export type { DailySummary, MonthlyReport, AttendanceSearchParams } from './database.types';
export type { CreateAttendanceRecordRequest, UpdateAttendanceRecordRequest, GetAttendanceRecordsRequest, GetAttendanceRecordsResponse, BulkAttendanceUpdateRequest, BulkAttendanceUpdateResponse, GetAttendanceStatsRequest, GetAttendanceStatsResponse } from './api.types';
export type TransformToNewAttendanceRecord = (oldRecord: AttendanceRecord) => NewAttendanceRecord;
export type TransformToOldAttendanceRecord = (newRecord: NewAttendanceRecord) => AttendanceRecord;
export type AttendanceRecordVersion = 'v1' | 'v2';
export type AttendanceRecordUnion = AttendanceRecord | NewAttendanceRecord;
export declare const isOldAttendanceRecord: (record: AttendanceRecordUnion) => record is AttendanceRecord;
export declare const isNewAttendanceRecord: (record: AttendanceRecordUnion) => record is NewAttendanceRecord;
export declare const ATTENDANCE_STATUS: {
    readonly PRESENT: "present";
    readonly DISMISSED: "dismissed";
    readonly UNAUTHORIZED_ABSENT: "unauthorized_absent";
    readonly AUTHORIZED_ABSENT: "authorized_absent";
    readonly NOT_ENROLLED: "not_enrolled";
};
export declare const ATTENDANCE_STATUS_LABELS: {
    readonly present: "등원";
    readonly dismissed: "하원";
    readonly unauthorized_absent: "무단결석";
    readonly authorized_absent: "사유결석";
    readonly not_enrolled: "미등원";
};
export declare const ATTENDANCE_STATUS_COLORS: {
    readonly present: "#3B82F6";
    readonly dismissed: "#9CA3AF";
    readonly unauthorized_absent: "#EF4444";
    readonly authorized_absent: "#F97316";
    readonly not_enrolled: "#6B7280";
};
export interface AttendanceValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export interface AttendanceValidationRule {
    field: keyof AttendanceRecord | keyof NewAttendanceRecord;
    required: boolean;
    validator?: (value: any) => boolean;
    errorMessage: string;
}
export interface AttendanceStatistics {
    totalRecords: number;
    statusCounts: Record<AttendanceStatus, number>;
    averageCheckInTime?: string;
    averageCheckOutTime?: string;
    lateCount: number;
    earlyLeaveCount: number;
    averageAttendanceRate: number;
}
export interface AttendanceFilter {
    studentId?: string;
    dateRange?: {
        start: string;
        end: string;
    };
    status?: AttendanceStatus[];
    checkInTimeRange?: {
        start: string;
        end: string;
    };
    checkOutTimeRange?: {
        start: string;
        end: string;
    };
    location?: string;
    updatedBy?: string;
}
