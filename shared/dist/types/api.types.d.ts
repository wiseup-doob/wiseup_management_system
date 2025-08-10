import type { Student, AttendanceRecord } from './database.types';
import type { DateString, TimeString, StudentId, SeatId } from './common.types';
import type { Timetable, TimetableItem, Class, Teacher, Classroom, Enrollment, ClassAttendance, TimetableSummary, TimetableStats, TeacherStats, StudentTimetableStats } from './timetable.types';
export interface GetStudentsRequest {
    page?: number;
    limit?: number;
    search?: string;
    grade?: string;
    className?: string;
    status?: 'active' | 'inactive';
    currentAttendance?: string;
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
export interface CreateStudentRequest {
    name: string;
    grade: string;
    className: string;
    status?: 'active' | 'inactive';
    enrollmentDate?: DateString;
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
    currentAttendance?: string;
    firstAttendanceDate?: DateString;
}
export interface UpdateStudentRequest {
    name?: string;
    grade?: string;
    className?: string;
    status?: 'active' | 'inactive';
    enrollmentDate?: DateString;
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
    currentAttendance?: string;
    firstAttendanceDate?: DateString;
}
export interface SearchStudentsRequest {
    query: string;
    page?: number;
    limit?: number;
    filters?: {
        grade?: string;
        className?: string;
        status?: 'active' | 'inactive';
        currentAttendance?: string;
    };
}
export interface SearchStudentsResponse {
    students: Student[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface CreateAttendanceRecordRequest {
    studentId: StudentId;
    date: DateString;
    status: string;
    checkInTime?: TimeString;
    checkOutTime?: TimeString;
    totalHours?: number;
    location?: string;
    notes?: string;
    updatedBy?: string;
}
export interface UpdateAttendanceRecordRequest {
    status?: string;
    checkInTime?: TimeString;
    checkOutTime?: TimeString;
    totalHours?: number;
    location?: string;
    notes?: string;
    updatedBy?: string;
}
export interface GetAttendanceRecordsRequest {
    page?: number;
    limit?: number;
    studentId?: StudentId;
    studentName?: string;
    seatId?: SeatId;
    date?: DateString;
    startDate?: DateString;
    endDate?: DateString;
    status?: string;
    checkInTimeRange?: {
        start: TimeString;
        end: TimeString;
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
        studentId: StudentId;
        status: string;
        checkInTime?: TimeString;
        checkOutTime?: TimeString;
        notes?: string;
    }>;
    date: DateString;
    updatedBy?: string;
}
export interface BulkAttendanceUpdateResponse {
    success: boolean;
    updatedCount: number;
    errors: Array<{
        studentId: StudentId;
        error: string;
    }>;
}
export interface GetAttendanceStatsRequest {
    startDate?: DateString;
    endDate?: DateString;
    studentId?: StudentId;
    className?: string;
    grade?: string;
}
export interface GetAttendanceStatsResponse {
    totalRecords: number;
    statusCounts: Record<string, number>;
    averageCheckInTime?: TimeString;
    averageCheckOutTime?: TimeString;
    lateCount: number;
    earlyLeaveCount: number;
    averageAttendanceRate: number;
    dailyStats?: Array<{
        date: DateString;
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
        date?: DateString;
        status?: string;
        studentId?: StudentId;
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
    timetables: Timetable[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GetTimetableResponse {
    timetable: Timetable;
    items: TimetableItem[];
    summary: TimetableSummary;
}
export interface CreateTimetableResponse {
    timetable: Timetable;
    message: string;
}
export interface UpdateTimetableResponse {
    timetable: Timetable;
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
    classes: Class[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GetClassResponse {
    class: Class;
    enrollments: Enrollment[];
    attendanceStats: {
        totalStudents: number;
        averageAttendanceRate: number;
    };
}
export interface CreateClassResponse {
    class: Class;
    message: string;
}
export interface UpdateClassResponse {
    class: Class;
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
    teachers: Teacher[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GetTeacherResponse {
    teacher: Teacher;
    classes: Class[];
    stats: TeacherStats;
}
export interface CreateTeacherRequest {
    name: string;
    email: string;
    phone: string;
    subjects: string[];
    gradeLevels: string[];
    status?: 'active' | 'inactive';
    hireDate: DateString;
    notes?: string;
}
export interface UpdateTeacherRequest {
    name?: string;
    email?: string;
    phone?: string;
    subjects?: string[];
    gradeLevels?: string[];
    status?: 'active' | 'inactive';
    hireDate?: DateString;
    resignationDate?: DateString;
    notes?: string;
}
export interface CreateTeacherResponse {
    teacher: Teacher;
    message: string;
}
export interface UpdateTeacherResponse {
    teacher: Teacher;
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
    classrooms: Classroom[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GetClassroomResponse {
    classroom: Classroom;
    scheduledClasses: TimetableItem[];
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
    classroom: Classroom;
    message: string;
}
export interface UpdateClassroomResponse {
    classroom: Classroom;
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
    enrollments: Enrollment[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface GetEnrollmentResponse {
    enrollment: Enrollment;
    attendanceRecords: ClassAttendance[];
}
export interface CreateEnrollmentResponse {
    enrollment: Enrollment;
    message: string;
}
export interface UpdateEnrollmentRequest {
    status?: string;
    grade?: string;
    attendanceRate?: number;
    notes?: string;
}
export interface UpdateEnrollmentResponse {
    enrollment: Enrollment;
    message: string;
}
export interface CreateClassAttendanceRequest {
    enrollmentId: string;
    timetableItemId: string;
    date: DateString;
    status: string;
    checkInTime?: TimeString;
    checkOutTime?: TimeString;
    notes?: string;
}
export interface UpdateClassAttendanceRequest {
    status?: string;
    checkInTime?: TimeString;
    checkOutTime?: TimeString;
    notes?: string;
}
export interface CreateClassAttendanceResponse {
    attendance: ClassAttendance;
    message: string;
}
export interface UpdateClassAttendanceResponse {
    attendance: ClassAttendance;
    message: string;
}
export interface GetClassAttendanceRequest {
    enrollmentId?: string;
    timetableItemId?: string;
    date?: DateString;
    startDate?: DateString;
    endDate?: DateString;
    status?: string;
}
export interface GetClassAttendanceResponse {
    attendanceRecords: ClassAttendance[];
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
    startDate?: DateString;
    endDate?: DateString;
}
export interface GetTimetableStatsResponse {
    stats: TimetableStats;
    dailyStats?: Array<{
        date: DateString;
        totalClasses: number;
        totalStudents: number;
        averageAttendanceRate: number;
    }>;
}
export interface GetTeacherStatsRequest {
    teacherId?: string;
    startDate?: DateString;
    endDate?: DateString;
}
export interface GetTeacherStatsResponse {
    stats: TeacherStats[];
    totalTeachers: number;
    averageClassSize: number;
    averageAttendanceRate: number;
}
export interface GetStudentTimetableStatsRequest {
    studentId?: string;
    startDate?: DateString;
    endDate?: DateString;
}
export interface GetStudentTimetableStatsResponse {
    stats: StudentTimetableStats[];
    totalStudents: number;
    averageEnrollments: number;
    averageAttendanceRate: number;
}
//# sourceMappingURL=api.types.d.ts.map