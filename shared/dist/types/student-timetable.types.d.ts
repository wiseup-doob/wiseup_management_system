import type { BaseEntity, FirestoreTimestamp } from './common.types';
export interface StudentTimetable extends BaseEntity {
    studentId: string;
    classSectionIds: string[];
    createAt: FirestoreTimestamp;
    updatedAt: FirestoreTimestamp;
}
export interface CreateStudentTimetableRequest {
    studentId: string;
    classSectionIds?: string[];
}
export interface UpdateStudentTimetableRequest {
    classSectionIds?: string[];
}
export interface StudentTimetableSearchParams {
    studentId?: string;
}
//# sourceMappingURL=student-timetable.types.d.ts.map