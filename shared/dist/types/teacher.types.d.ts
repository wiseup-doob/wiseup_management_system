import type { BaseEntity, FirestoreTimestamp, SubjectType } from './common.types';
export interface Teacher extends BaseEntity {
    id: string;
    versionId: string;
    name: string;
    email?: string;
    phone?: string;
    subjects?: SubjectType[];
    createdAt: FirestoreTimestamp;
    updatedAt: FirestoreTimestamp;
}
export interface CreateTeacherRequest {
    versionId?: string;
    name: string;
    email?: string;
    phone?: string;
    subjects?: SubjectType[];
}
export interface UpdateTeacherRequest {
    name?: string;
    email?: string;
    phone?: string;
    subjects?: SubjectType[];
}
export interface TeacherSearchParams {
    versionId?: string;
    name?: string;
}
export interface TeacherStatistics {
    totalTeachers: number;
}
export interface TeacherDependencies {
    hasClassSections: boolean;
    classSectionCount: number;
    hasStudentTimetables: boolean;
    affectedStudentCount: number;
    hasAttendanceRecords: boolean;
    attendanceCount: number;
    totalRelatedRecords: number;
}
export interface TeacherHierarchicalDeleteResponse {
    success: boolean;
    deletedRecords: {
        classSections: number;
        studentTimetables: number;
        attendanceRecords: number;
        teacher: boolean;
    };
    message: string;
}
//# sourceMappingURL=teacher.types.d.ts.map