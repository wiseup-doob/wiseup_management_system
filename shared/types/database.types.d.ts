import type { BaseEntity } from './common.types';
import type { AttendanceStatus } from './attendance.types';
export interface StudentBasicInfo extends BaseEntity {
    name: string;
    grade: string;
    className: string;
    seatNumber: number;
    status: 'active' | 'inactive';
}
export interface StudentCurrentStatus {
    currentAttendance?: AttendanceStatus;
    lastAttendanceUpdate?: string;
    firstAttendanceDate?: string;
    totalAttendanceDays?: number;
    averageCheckInTime?: string;
    averageCheckOutTime?: string;
}
export interface Student extends StudentBasicInfo {
    currentStatus: StudentCurrentStatus;
}
export interface AttendanceRecord extends BaseEntity {
    studentId: string;
    date: string;
    status: AttendanceStatus;
    timestamp: string;
    updatedBy?: string;
    checkInTime?: string;
    checkOutTime?: string;
    totalHours?: number;
    location?: string;
    notes?: string;
    isLate?: boolean;
    isEarlyLeave?: boolean;
}
export interface DailySummary extends BaseEntity {
    date: string;
    totalStudents: number;
    presentCount: number;
    dismissedCount: number;
    unauthorizedAbsentCount: number;
    authorizedAbsentCount: number;
    notEnrolledCount: number;
    averageCheckInTime?: string;
    averageCheckOutTime?: string;
    lateCount?: number;
    earlyLeaveCount?: number;
    classStats?: {
        [className: string]: {
            present: number;
            dismissed: number;
            unauthorizedAbsent: number;
            authorizedAbsent: number;
            notEnrolled: number;
        };
    };
}
export interface MonthlyReport extends BaseEntity {
    year: number;
    month: number;
    totalStudents: number;
    totalAttendanceDays: number;
    averageAttendanceRate: number;
    statusStats: {
        present: number;
        dismissed: number;
        unauthorizedAbsent: number;
        authorizedAbsent: number;
        notEnrolled: number;
    };
    studentStats?: {
        [studentId: string]: {
            totalDays: number;
            presentDays: number;
            attendanceRate: number;
            averageCheckInTime?: string;
            averageCheckOutTime?: string;
            lateCount: number;
            earlyLeaveCount: number;
        };
    };
}
export interface StudentSearchParams {
    name?: string;
    grade?: string;
    className?: string;
    status?: 'active' | 'inactive';
    currentAttendance?: AttendanceStatus;
    seatNumber?: number;
}
export interface AttendanceSearchParams {
    studentId?: string;
    studentName?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    status?: AttendanceStatus;
    checkInTimeRange?: {
        start: string;
        end: string;
    };
    totalHoursRange?: {
        min: number;
        max: number;
    };
}
export declare const COLLECTION_NAMES: {
    readonly STUDENTS: "students";
    readonly ATTENDANCE_RECORDS: "attendance_records";
    readonly DAILY_SUMMARIES: "daily_summaries";
    readonly MONTHLY_REPORTS: "monthly_reports";
};
export declare const REQUIRED_INDEXES: {
    readonly STUDENTS_BY_NAME: "students/name/Ascending";
    readonly STUDENTS_BY_GRADE: "students/grade/Ascending";
    readonly STUDENTS_BY_CLASS: "students/className/Ascending";
    readonly STUDENTS_BY_SEAT: "students/seatNumber/Ascending";
    readonly STUDENTS_BY_STATUS: "students/status/Ascending";
    readonly ATTENDANCE_BY_STUDENT_DATE: "attendance_records/studentId/Ascending/date/Descending";
    readonly ATTENDANCE_BY_STUDENT_STATUS: "attendance_records/studentId/Ascending/status/Ascending";
    readonly ATTENDANCE_BY_DATE_STATUS: "attendance_records/date/Ascending/status/Ascending";
    readonly ATTENDANCE_BY_STUDENT_DATE_STATUS: "attendance_records/studentId/Ascending/date/Ascending/status/Ascending";
    readonly ATTENDANCE_BY_CHECKIN_TIME: "attendance_records/checkInTime/Ascending";
    readonly DAILY_SUMMARIES_BY_DATE: "daily_summaries/date/Descending";
    readonly MONTHLY_REPORTS_BY_YEAR_MONTH: "monthly_reports/year/Descending/month/Descending";
};
