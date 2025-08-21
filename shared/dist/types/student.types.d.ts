import type { BaseEntity, FirestoreTimestamp } from './common.types';
export type Grade = '초1' | '초2' | '초3' | '초4' | '초5' | '초6' | '중1' | '중2' | '중3' | '고1' | '고2' | '고3' | 'N수';
export type StudentStatus = 'active' | 'inactive';
export interface StudentContactInfo {
    phone?: string;
    email?: string;
    address?: string;
}
export interface StudentParentInfo {
    parentId: string;
    name: string;
    relationship: string;
    phone: string;
}
export interface Student extends BaseEntity {
    id: string;
    name: string;
    grade: Grade;
    firstAttendanceDate?: FirestoreTimestamp;
    lastAttendanceDate?: FirestoreTimestamp;
    parentsId?: string;
    status: StudentStatus;
    contactInfo?: {
        phone?: string;
        email?: string;
        address?: string;
    };
    createdAt: FirestoreTimestamp;
    updatedAt: FirestoreTimestamp;
}
export interface CreateStudentRequest {
    name: string;
    grade: Grade;
    firstAttendanceDate?: FirestoreTimestamp;
    lastAttendanceDate?: FirestoreTimestamp;
    parentsId?: string;
    status?: StudentStatus;
    contactInfo?: {
        phone?: string;
        email?: string;
        address?: string;
    };
}
export interface UpdateStudentRequest {
    name?: string;
    grade?: Grade;
    firstAttendanceDate?: FirestoreTimestamp;
    lastAttendanceDate?: FirestoreTimestamp;
    parentsId?: string;
    status?: StudentStatus;
    contactInfo?: {
        phone?: string;
        email?: string;
        address?: string;
    };
}
export interface StudentSearchParams {
    name?: string;
    grade?: Grade;
    status?: StudentStatus;
    parentsId?: string;
    firstAttendanceDateRange?: {
        start: FirestoreTimestamp;
        end: FirestoreTimestamp;
    };
    lastAttendanceDateRange?: {
        start: FirestoreTimestamp;
        end: FirestoreTimestamp;
    };
}
export interface StudentStatistics {
    totalStudents: number;
    activeStudents: number;
    inactiveStudents: number;
    studentsByGrade: Record<Grade, number>;
    studentsWithAttendance: number;
    averageAttendanceRate: number;
}
export interface StudentDependencies {
    hasAttendanceRecords: boolean;
    attendanceCount: number;
    hasTimetable: boolean;
    hasClassEnrollments: boolean;
    classEnrollmentCount: number;
    hasSeatAssignments: boolean;
    seatAssignmentCount: number;
    hasStudentSummary: boolean;
    totalRelatedRecords: number;
}
export interface HierarchicalDeleteResponse {
    success: boolean;
    deletedRecords: {
        attendanceRecords: number;
        seatAssignments: number;
        studentSummary: boolean;
        timetable: boolean;
        student: boolean;
    };
    message: string;
}
//# sourceMappingURL=student.types.d.ts.map