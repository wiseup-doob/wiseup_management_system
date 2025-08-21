import type { BaseEntity, FirestoreTimestamp, SubjectType } from './common.types';
export interface Course extends BaseEntity {
    id: string;
    name: string;
    subject: SubjectType;
    description?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    isActive: boolean;
    createdAt: FirestoreTimestamp;
    updatedAt: FirestoreTimestamp;
}
export interface CreateCourseRequest {
    name: string;
    subject: SubjectType;
    description?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    isActive?: boolean;
}
export interface UpdateCourseRequest {
    name?: string;
    subject?: SubjectType;
    description?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    isActive?: boolean;
}
export interface CourseSearchParams {
    name?: string;
    subject?: SubjectType;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    isActive?: boolean;
}
export interface CourseStatistics {
    totalCourses: number;
}
//# sourceMappingURL=course.types.d.ts.map