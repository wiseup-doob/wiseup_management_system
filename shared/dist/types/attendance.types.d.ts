import type { AttendanceRecord as NewAttendanceRecord } from './database.types';
import type { DateString, TimeString, DateTimeString, AttendanceStatus } from './common.types';
export interface AttendanceRecord {
    date: DateString;
    status: AttendanceStatus;
    timestamp: DateTimeString;
    updatedBy?: string;
    checkInTime?: TimeString;
    checkOutTime?: TimeString;
    totalHours?: number;
    notes?: string;
}
export type { AttendanceRecord as AttendanceRecordV2 } from './database.types';
export interface AttendanceTimeRecord {
    date: DateString;
    studentId: string;
    checkInTime: TimeString;
    checkOutTime?: TimeString;
    totalHours?: number;
    status: AttendanceStatus;
    location?: string;
    notes?: string;
    createdAt: DateTimeString;
    updatedAt: DateTimeString;
    updatedBy?: string;
}
export interface AttendanceTimelineItem {
    time: string;
    activity: string;
    status: AttendanceStatus;
    location?: string;
    notes?: string;
}
export interface AttendanceStatusInfo {
    text: string;
    className: string;
    backgroundColor: string;
    color: string;
    borderColor?: string;
    dotColor: string;
}
export declare const ATTENDANCE_STATUS_STYLES: Record<AttendanceStatus, AttendanceStatusInfo>;
export declare const DEFAULT_ATTENDANCE_ACTIVITIES: readonly [{
    readonly time: "08:30";
    readonly activity: "등원";
    readonly location: "정문";
}, {
    readonly time: "09:00";
    readonly activity: "출석체크";
}, {
    readonly time: "12:00";
    readonly activity: "점심시간";
}, {
    readonly time: "13:00";
    readonly activity: "오후수업";
}, {
    readonly time: "15:00";
    readonly activity: "휴식시간";
}, {
    readonly time: "17:30";
    readonly activity: "하원";
    readonly location: "정문";
}];
export declare const ATTENDANCE_TO_TIMELINE_STATUS: Record<AttendanceStatus, 'completed' | 'in-progress' | 'pending' | 'cancelled'>;
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
    checkInTime?: TimeString;
    checkOutTime?: TimeString;
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
export interface AttendanceTransformers {
    toNew: TransformToNewAttendanceRecord;
    toOld: TransformToOldAttendanceRecord;
    validate: (record: AttendanceRecordUnion) => boolean;
}
export declare const ATTENDANCE_STATUS: {
    readonly PRESENT: "present";
    readonly DISMISSED: "dismissed";
    readonly UNAUTHORIZED_ABSENT: "unauthorized_absent";
    readonly AUTHORIZED_ABSENT: "authorized_absent";
};
export declare const ATTENDANCE_ACTION_TYPES: {
    readonly UPDATE: "update";
    readonly RESET: "reset";
    readonly MARK_ALL_PRESENT: "mark_all_present";
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
    averageCheckInTime?: TimeString;
    averageCheckOutTime?: TimeString;
    lateCount: number;
    earlyLeaveCount: number;
    averageAttendanceRate: number;
}
export interface AttendanceFilter {
    studentId?: string;
    dateRange?: {
        start: DateString;
        end: DateString;
    };
    status?: AttendanceStatus[];
    checkInTimeRange?: {
        start: TimeString;
        end: TimeString;
    };
    checkOutTimeRange?: {
        start: TimeString;
        end: TimeString;
    };
    location?: string;
    updatedBy?: string;
}
//# sourceMappingURL=attendance.types.d.ts.map