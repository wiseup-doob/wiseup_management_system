import type { BaseEntity, FirestoreTimestamp } from './common.types';
export interface StudentTimetable extends BaseEntity {
    id: string;
    studentId: string;
    versionId: string;
    classSectionIds: string[];
    notes?: string;
    createAt: FirestoreTimestamp;
    updatedAt: FirestoreTimestamp;
}
export interface CreateStudentTimetableRequest {
    studentId: string;
    versionId: string;
    classSectionIds?: string[];
    notes?: string;
}
export interface UpdateStudentTimetableRequest {
    versionId?: string;
    classSectionIds?: string[];
    notes?: string;
}
export interface StudentTimetableSearchParams {
    studentId?: string;
    versionId?: string;
}
//# sourceMappingURL=student-timetable.types.d.ts.map