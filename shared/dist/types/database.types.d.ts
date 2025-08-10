import type { BaseEntity, DateString, TimeString, DateTimeString, DateRange, TimeRange, StudentId, SeatId, AttendanceRecordId, AttendanceStatus } from './common.types';
export interface Seat extends BaseEntity {
    seatId: SeatId;
    seatNumber: number;
    row: number;
    col: number;
    status: AttendanceStatus;
    lastUpdated: DateTimeString;
    notes?: string;
}
export interface SeatAssignment extends BaseEntity {
    seatId: SeatId;
    studentId: StudentId;
    assignedDate: DateString;
    assignedBy?: string;
    notes?: string;
}
export interface StudentBasicInfo extends BaseEntity {
    id: StudentId;
    name: string;
    grade: string;
    className: string;
    status: 'active' | 'inactive';
    enrollmentDate: DateString;
    graduationDate?: DateString;
    contactInfo?: {
        phone?: string;
        email?: string;
        address?: string;
    };
    parentInfo?: {
        name?: string;
        phone?: string;
        email?: string;
    };
}
export interface StudentCurrentStatus {
    currentAttendance?: AttendanceStatus;
    lastAttendanceUpdate?: DateTimeString;
    firstAttendanceDate?: DateString;
    totalAttendanceDays?: number;
    averageCheckInTime?: TimeString;
    averageCheckOutTime?: TimeString;
}
export interface Student extends StudentBasicInfo {
    currentStatus: StudentCurrentStatus;
}
export interface AttendanceRecord extends BaseEntity {
    id: AttendanceRecordId;
    studentId: StudentId;
    seatId?: SeatId;
    date: DateString;
    status: AttendanceStatus;
    timestamp: DateTimeString;
    updatedBy?: string;
    checkInTime?: TimeString;
    checkOutTime?: TimeString;
    totalHours?: number;
    location?: string;
    notes?: string;
    isLate?: boolean;
    isEarlyLeave?: boolean;
}
export interface DailySummary extends BaseEntity {
    date: DateString;
    totalStudents: number;
    presentCount: number;
    dismissedCount: number;
    unauthorizedAbsentCount: number;
    authorizedAbsentCount: number;
    notEnrolledCount: number;
    averageCheckInTime?: TimeString;
    averageCheckOutTime?: TimeString;
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
    seatStats?: {
        [seatId: SeatId]: {
            studentId?: StudentId;
            status: AttendanceStatus;
            checkInTime?: TimeString;
            checkOutTime?: TimeString;
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
        [studentId: StudentId]: {
            totalDays: number;
            presentDays: number;
            attendanceRate: number;
            averageCheckInTime?: TimeString;
            averageCheckOutTime?: TimeString;
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
    enrollmentDateRange?: DateRange;
}
export interface AttendanceSearchParams {
    studentId?: StudentId;
    studentName?: string;
    seatId?: SeatId;
    date?: DateString;
    startDate?: DateString;
    endDate?: DateString;
    status?: AttendanceStatus;
    checkInTimeRange?: TimeRange;
    totalHoursRange?: {
        min: number;
        max: number;
    };
}
export interface SeatSearchParams {
    seatNumber?: number;
    row?: number;
    col?: number;
    studentId?: StudentId;
    status?: AttendanceStatus;
    isAssigned?: boolean;
}
export declare const COLLECTION_NAMES: {
    readonly STUDENTS: "students";
    readonly SEATS: "seats";
    readonly SEAT_ASSIGNMENTS: "seat_assignments";
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
    readonly STUDENTS_BY_ENROLLMENT_DATE: "students/enrollmentDate/Descending";
    readonly SEATS_BY_NUMBER: "seats/seatNumber/Ascending";
    readonly SEATS_BY_STUDENT: "seats/studentId/Ascending";
    readonly SEATS_BY_STATUS: "seats/status/Ascending";
    readonly SEATS_BY_ROW_COL: "seats/row/Ascending/col/Ascending";
    readonly SEAT_ASSIGNMENTS_BY_STUDENT: "seat_assignments/studentId/Ascending";
    readonly SEAT_ASSIGNMENTS_BY_SEAT: "seat_assignments/seatId/Ascending";
    readonly SEAT_ASSIGNMENTS_BY_DATE: "seat_assignments/assignedDate/Descending";
    readonly ATTENDANCE_BY_STUDENT_DATE: "attendance_records/studentId/Ascending/date/Descending";
    readonly ATTENDANCE_BY_STUDENT_STATUS: "attendance_records/studentId/Ascending/status/Ascending";
    readonly ATTENDANCE_BY_DATE_STATUS: "attendance_records/date/Ascending/status/Ascending";
    readonly ATTENDANCE_BY_STUDENT_DATE_STATUS: "attendance_records/studentId/Ascending/date/Ascending/status/Ascending";
    readonly ATTENDANCE_BY_CHECKIN_TIME: "attendance_records/checkInTime/Ascending";
    readonly ATTENDANCE_BY_SEAT: "attendance_records/seatId/Ascending";
    readonly DAILY_SUMMARIES_BY_DATE: "daily_summaries/date/Descending";
    readonly MONTHLY_REPORTS_BY_YEAR_MONTH: "monthly_reports/year/Descending/month/Descending";
};
//# sourceMappingURL=database.types.d.ts.map