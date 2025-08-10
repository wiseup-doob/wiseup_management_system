import type { Student, AttendanceRecord, StudentSearchParams, AttendanceSearchParams } from './database.types';
import type { AttendanceStatus } from './attendance.types';
import type { ApiResponse } from './common.types';
export interface GetStudentsRequest {
    search?: StudentSearchParams;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'seatNumber' | 'grade' | 'className';
    sortOrder?: 'asc' | 'desc';
}
export interface GetStudentsResponse {
    students: Student[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GetStudentResponse {
    student: Student;
    recentAttendance: AttendanceRecord[];
    statistics: {
        totalDays: number;
        presentDays: number;
        attendanceRate: number;
        averageCheckInTime?: string;
        averageCheckOutTime?: string;
        lateCount: number;
        earlyLeaveCount: number;
    };
}
export interface CreateStudentRequest {
    name: string;
    grade: string;
    className: string;
    seatNumber: number;
    status?: 'active' | 'inactive';
}
export interface UpdateStudentRequest {
    name?: string;
    grade?: string;
    className?: string;
    seatNumber?: number;
    status?: 'active' | 'inactive';
}
export interface CreateAttendanceRecordRequest {
    studentId: string;
    date: string;
    status: AttendanceStatus;
    checkInTime?: string;
    checkOutTime?: string;
    location?: string;
    notes?: string;
    updatedBy?: string;
}
export interface UpdateAttendanceRecordRequest {
    status?: AttendanceStatus;
    checkInTime?: string;
    checkOutTime?: string;
    location?: string;
    notes?: string;
    updatedBy?: string;
}
export interface GetAttendanceRecordsRequest {
    search?: AttendanceSearchParams;
    page?: number;
    limit?: number;
    sortBy?: 'date' | 'checkInTime' | 'totalHours';
    sortOrder?: 'asc' | 'desc';
}
export interface GetAttendanceRecordsResponse {
    records: AttendanceRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GetDailySummaryRequest {
    date?: string;
    startDate?: string;
    endDate?: string;
}
export interface GetDailySummaryResponse {
    summaries: any[];
    total: number;
}
export interface GetMonthlyReportRequest {
    year: number;
    month: number;
}
export interface GetMonthlyReportResponse {
    report: any;
}
export interface GetAttendanceStatsRequest {
    startDate?: string;
    endDate?: string;
    grade?: string;
    className?: string;
    studentId?: string;
}
export interface GetAttendanceStatsResponse {
    totalStudents: number;
    totalDays: number;
    averageAttendanceRate: number;
    statusStats: {
        present: number;
        dismissed: number;
        unauthorizedAbsent: number;
        authorizedAbsent: number;
        notEnrolled: number;
    };
    timeStats: {
        averageCheckInTime?: string;
        averageCheckOutTime?: string;
        lateCount: number;
        earlyLeaveCount: number;
    };
    classStats: {
        [className: string]: {
            totalStudents: number;
            averageAttendanceRate: number;
            statusStats: {
                present: number;
                dismissed: number;
                unauthorizedAbsent: number;
                authorizedAbsent: number;
                notEnrolled: number;
            };
        };
    };
}
export interface BulkAttendanceUpdateRequest {
    records: CreateAttendanceRecordRequest[];
}
export interface BulkAttendanceUpdateResponse {
    success: number;
    failed: number;
    errors: Array<{
        studentId: string;
        date: string;
        error: string;
    }>;
}
export interface SearchStudentsRequest {
    query: string;
    filters?: {
        grade?: string;
        className?: string;
        status?: 'active' | 'inactive';
        currentAttendance?: AttendanceStatus;
    };
    page?: number;
    limit?: number;
}
export interface SearchStudentsResponse {
    students: Student[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface SearchAttendanceRecordsRequest {
    query: string;
    filters?: {
        status?: AttendanceStatus;
        dateRange?: {
            start: string;
            end: string;
        };
        timeRange?: {
            start: string;
            end: string;
        };
    };
    page?: number;
    limit?: number;
}
export interface SearchAttendanceRecordsResponse {
    records: AttendanceRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export type ApiSuccessResponse<T> = ApiResponse<T>;
export type ApiErrorResponse = ApiResponse<null>;
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}
