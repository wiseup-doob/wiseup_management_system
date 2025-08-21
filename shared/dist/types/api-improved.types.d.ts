import type { Student, StudentSearchParams } from './student.types';
import type { AttendanceRecord, AttendanceSearchParams } from './attendance.types';
import type { AttendanceStatus } from './common.types';
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    meta?: {
        timestamp?: string;
        version?: string;
        requestId?: string;
        count?: number;
        [key: string]: any;
    };
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface SearchParams extends PaginationParams {
    query?: string;
    filters?: Record<string, any>;
}
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
//# sourceMappingURL=api-improved.types.d.ts.map