import type { BaseEntity, FirestoreTimestamp } from './common.types';
export interface Classroom extends BaseEntity {
    id: string;
    name: string;
    capacity: number;
    equipment?: string[];
    createdAt: FirestoreTimestamp;
    updatedAt: FirestoreTimestamp;
}
export interface CreateClassroomRequest {
    name: string;
    capacity: number;
    equipment?: string[];
}
export interface UpdateClassroomRequest {
    name?: string;
    capacity?: number;
    equipment?: string[];
}
export interface ClassroomSearchParams {
    name?: string;
    minCapacity?: number;
    maxCapacity?: number;
    equipment?: string[];
}
export interface ClassroomStatistics {
    totalClassrooms: number;
    totalCapacity: number;
    averageCapacity: number;
    classroomsByCapacity: Record<string, number>;
    mostCommonEquipment: Array<{
        equipment: string;
        count: number;
    }>;
}
export interface ClassroomDependencies {
    hasClassSections: boolean;
    classSectionCount: number;
    hasStudentTimetables: boolean;
    affectedStudentCount: number;
    hasAttendanceRecords: boolean;
    attendanceCount: number;
    totalRelatedRecords: number;
}
export interface ClassroomHierarchicalDeleteResponse {
    success: boolean;
    deletedRecords: {
        classSections: number;
        studentTimetables: number;
        attendanceRecords: number;
        classroom: boolean;
    };
    message: string;
}
//# sourceMappingURL=classroom.types.d.ts.map