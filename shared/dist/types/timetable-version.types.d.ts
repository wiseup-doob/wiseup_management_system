import type { BaseEntity, FirestoreTimestamp } from './common.types';
export interface TimetableVersion extends BaseEntity {
    id: string;
    name: string;
    displayName: string;
    startDate?: FirestoreTimestamp;
    endDate?: FirestoreTimestamp;
    isActive: boolean;
    description?: string;
    order: number;
    createdAt: FirestoreTimestamp;
    updatedAt: FirestoreTimestamp;
}
export interface CreateTimetableVersionRequest {
    name: string;
    displayName: string;
    startDate?: FirestoreTimestamp;
    endDate?: FirestoreTimestamp;
    description?: string;
    order?: number;
}
export interface UpdateTimetableVersionRequest {
    name?: string;
    displayName?: string;
    startDate?: FirestoreTimestamp;
    endDate?: FirestoreTimestamp;
    isActive?: boolean;
    description?: string;
    order?: number;
}
export interface TimetableVersionSearchParams {
    isActive?: boolean;
}
export interface CopyTimetableVersionRequest {
    sourceVersionId: string;
    targetVersionId: string;
    targetVersionName: string;
    targetStartDate?: FirestoreTimestamp;
    targetEndDate?: FirestoreTimestamp;
}
//# sourceMappingURL=timetable-version.types.d.ts.map