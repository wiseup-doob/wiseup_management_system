import type { Student, StudentStatus, CreateStudentRequest as StudentCreateRequest, UpdateStudentRequest as StudentUpdateRequest } from './student.types';
import type { Parent, CreateParentRequest as ParentCreateRequest, UpdateParentRequest as ParentUpdateRequest } from './parent.types';
import type { StudentSummary, CreateStudentSummaryRequest as StudentSummaryCreateRequest, UpdateStudentSummaryRequest as StudentSummaryUpdateRequest, StudentSummaryStatistics } from './student-summary.types';
import type { AttendanceRecord } from './attendance.types';
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface GetStudentsRequest {
    page?: number;
    limit?: number;
    search?: string;
    grade?: string;
    status?: StudentStatus;
    sortBy?: string;
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
}
export interface CreateStudentRequest extends StudentCreateRequest {
}
export interface UpdateStudentRequest extends StudentUpdateRequest {
}
export interface SearchStudentsRequest {
    query: string;
    page?: number;
    limit?: number;
    filters?: {
        grade?: string;
        status?: StudentStatus;
    };
}
export interface SearchStudentsResponse {
    students: Student[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GetParentsRequest {
    page?: number;
    limit?: number;
    search?: string;
    hasMultipleChildren?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface GetParentsResponse {
    parents: Parent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GetParentResponse {
    parent: Parent;
}
export interface CreateParentRequest extends ParentCreateRequest {
}
export interface UpdateParentRequest extends ParentUpdateRequest {
}
export interface SearchParentsRequest {
    query: string;
    page?: number;
    limit?: number;
    filters?: {
        hasMultipleChildren?: boolean;
        childStudentId?: string;
    };
}
export interface SearchParentsResponse {
    parents: Parent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GetStudentSummariesRequest {
    page?: number;
    limit?: number;
    search?: string;
    currentAttendance?: string;
    minAttendanceRate?: number;
    maxAttendanceRate?: number;
    hasIssues?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface GetStudentSummariesResponse {
    summaries: StudentSummary[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GetStudentSummaryResponse {
    summary: StudentSummary;
}
export interface CreateStudentSummaryRequest extends StudentSummaryCreateRequest {
}
export interface UpdateStudentSummaryRequest extends StudentSummaryUpdateRequest {
}
export interface SearchStudentSummariesRequest {
    query: string;
    page?: number;
    limit?: number;
    filters?: {
        currentAttendance?: string;
        minAttendanceRate?: number;
        maxAttendanceRate?: number;
        hasIssues?: boolean;
    };
}
export interface SearchStudentSummariesResponse {
    summaries: StudentSummary[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GetStudentSummaryStatsRequest {
    startDate?: string;
    endDate?: string;
    grade?: string;
}
export interface GetStudentSummaryStatsResponse {
    stats: StudentSummaryStatistics;
}
export interface CreateAttendanceRecordRequest {
    studentId: string;
    date: string;
    status: string;
    checkInTime?: string;
    checkOutTime?: string;
    totalHours?: number;
    location?: string;
    notes?: string;
    updatedBy?: string;
}
export interface UpdateAttendanceRecordRequest {
    status?: string;
    checkInTime?: string;
    checkOutTime?: string;
    totalHours?: number;
    location?: string;
    notes?: string;
    updatedBy?: string;
}
export interface GetAttendanceRecordsRequest {
    page?: number;
    limit?: number;
    studentId?: string;
    studentName?: string;
    seatId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    checkInTimeRange?: {
        start: string;
        end: string;
    };
    totalHoursRange?: {
        min: number;
        max: number;
    };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface GetAttendanceRecordsResponse {
    records: AttendanceRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface BulkAttendanceUpdateRequest {
    updates: Array<{
        studentId: string;
        status: string;
        checkInTime?: string;
        checkOutTime?: string;
        notes?: string;
    }>;
    date: string;
    updatedBy?: string;
}
export interface BulkAttendanceUpdateResponse {
    success: boolean;
    updatedCount: number;
    errors: Array<{
        studentId: string;
        error: string;
    }>;
}
export interface GetAttendanceStatsRequest {
    startDate?: string;
    endDate?: string;
    studentId?: string;
    className?: string;
    grade?: string;
}
export interface GetAttendanceStatsResponse {
    totalRecords: number;
    statusCounts: Record<string, number>;
    averageCheckInTime?: string;
    averageCheckOutTime?: string;
    lateCount: number;
    earlyLeaveCount: number;
    averageAttendanceRate: number;
    dailyStats?: Array<{
        date: string;
        total: number;
        present: number;
        dismissed: number;
        unauthorizedAbsent: number;
        authorizedAbsent: number;
    }>;
}
export interface SearchAttendanceRecordsRequest {
    query: string;
    page?: number;
    limit?: number;
    filters?: {
        date?: string;
        status?: string;
        studentId?: string;
    };
}
export interface SearchAttendanceRecordsResponse {
    records: AttendanceRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GetTimetablesRequest {
    page?: number;
    limit?: number;
    academicYear?: string;
    semester?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface GetTimetablesResponse {
    timetables: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GetTimetableResponse {
    timetable: any;
    items: any[];
    summary: any;
}
export interface CreateTimetableResponse {
    timetable: any;
    message: string;
}
export interface UpdateTimetableResponse {
    timetable: any;
    message: string;
}
export interface GetClassesRequest {
    page?: number;
    limit?: number;
    subject?: string;
    teacherId?: string;
    grade?: string;
    status?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface GetClassesResponse {
    classes: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GetClassResponse {
    class: any;
    enrollments: any[];
    attendanceStats: {
        totalStudents: number;
        averageAttendanceRate: number;
    };
}
export interface CreateClassResponse {
    class: any;
    message: string;
}
export interface UpdateClassResponse {
    class: any;
    message: string;
}
export interface GetTeachersRequest {
    page?: number;
    limit?: number;
    name?: string;
    subject?: string;
    gradeLevel?: string;
    status?: 'active' | 'inactive';
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface GetTeachersResponse {
    teachers: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GetTeacherResponse {
    teacher: any;
    classes: any[];
    stats: any;
}
export interface CreateTeacherRequest {
    name: string;
    email: string;
    phone: string;
    subjects: string[];
    gradeLevels: string[];
    status?: 'active' | 'inactive';
    hireDate: string;
    notes?: string;
}
export interface UpdateTeacherRequest {
    name?: string;
    email?: string;
    phone?: string;
    subjects?: string[];
    gradeLevels?: string[];
    status?: 'active' | 'inactive';
    hireDate?: string;
    resignationDate?: string;
    notes?: string;
}
export interface CreateTeacherResponse {
    teacher: any;
    message: string;
}
export interface UpdateTeacherResponse {
    teacher: any;
    message: string;
}
export interface GetClassroomsRequest {
    page?: number;
    limit?: number;
    name?: string;
    capacity?: number;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface GetClassroomsResponse {
    classrooms: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GetClassroomResponse {
    classroom: any;
    scheduledClasses: any[];
}
export interface CreateClassroomRequest {
    name: string;
    capacity: number;
    equipment?: string[];
    features?: string[];
    isActive?: boolean;
    notes?: string;
}
export interface UpdateClassroomRequest {
    name?: string;
    capacity?: number;
    equipment?: string[];
    features?: string[];
    isActive?: boolean;
    notes?: string;
}
export interface CreateClassroomResponse {
    classroom: any;
    message: string;
}
export interface UpdateClassroomResponse {
    classroom: any;
    message: string;
}
export interface GetEnrollmentsRequest {
    page?: number;
    limit?: number;
    studentId?: string;
    classId?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface GetEnrollmentsResponse {
    enrollments: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GetEnrollmentResponse {
    enrollment: any;
    attendanceRecords: any[];
}
export interface CreateEnrollmentResponse {
    enrollment: any;
    message: string;
}
export interface UpdateEnrollmentRequest {
    status?: string;
    grade?: string;
    attendanceRate?: number;
    notes?: string;
}
export interface UpdateEnrollmentResponse {
    enrollment: any;
    message: string;
}
export interface CreateClassAttendanceRequest {
    enrollmentId: string;
    timetableItemId: string;
    date: string;
    status: string;
    checkInTime?: string;
    checkOutTime?: string;
    notes?: string;
}
export interface UpdateClassAttendanceRequest {
    status?: string;
    checkInTime?: string;
    checkOutTime?: string;
    notes?: string;
}
export interface CreateClassAttendanceResponse {
    attendance: any;
    message: string;
}
export interface UpdateClassAttendanceResponse {
    attendance: any;
    message: string;
}
export interface GetClassAttendanceRequest {
    enrollmentId?: string;
    timetableItemId?: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
}
export interface GetClassAttendanceResponse {
    attendanceRecords: any[];
    total: number;
    stats: {
        present: number;
        absent: number;
        late: number;
        excused: number;
        averageAttendanceRate: number;
    };
}
export interface GetTimetableStatsRequest {
    timetableId?: string;
    startDate?: string;
    endDate?: string;
}
export interface GetTimetableStatsResponse {
    stats: any;
    dailyStats?: Array<{
        date: string;
        totalClasses: number;
        totalStudents: number;
        averageAttendanceRate: number;
    }>;
}
export interface GetTeacherStatsRequest {
    teacherId?: string;
    startDate?: string;
    endDate?: string;
}
export interface GetTeacherStatsResponse {
    stats: any[];
    totalTeachers: number;
    averageClassSize: number;
    averageAttendanceRate: number;
}
export interface GetStudentTimetableStatsRequest {
    studentId?: string;
    startDate?: string;
    endDate?: string;
}
export interface GetStudentTimetableStatsResponse {
    stats: any[];
    totalStudents: number;
    averageEnrollments: number;
    averageAttendanceRate: number;
}
//# sourceMappingURL=api.types.d.ts.map