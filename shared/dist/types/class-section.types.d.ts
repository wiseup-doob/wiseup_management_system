import type { BaseEntity, FirestoreTimestamp, DayOfWeek } from './common.types';
export interface ClassSchedule {
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
}
export interface ClassSection extends BaseEntity {
    id: string;
    name: string;
    courseId: string;
    teacherId: string;
    classroomId: string;
    schedule: ClassSchedule[];
    color?: string;
    displayOrder?: number;
    maxStudents: number;
    currentStudents?: number;
    status: 'active' | 'inactive' | 'completed';
    description?: string;
    notes?: string;
    createdAt: FirestoreTimestamp;
    updatedAt: FirestoreTimestamp;
}
export interface CreateClassSectionRequest {
    name: string;
    courseId: string;
    teacherId: string;
    classroomId: string;
    schedule: ClassSchedule[];
    maxStudents: number;
    currentStudents?: number;
    status?: 'active' | 'inactive' | 'completed';
    description?: string;
    notes?: string;
    color?: string;
}
export interface UpdateClassSectionRequest {
    name?: string;
    courseId?: string;
    teacherId?: string;
    classroomId?: string;
    schedule?: ClassSchedule[];
    maxStudents?: number;
    currentStudents?: number;
    status?: 'active' | 'inactive' | 'completed';
    description?: string;
    notes?: string;
    color?: string;
}
export interface ClassSectionSearchParams {
    name?: string;
    courseId?: string;
    teacherId?: string;
    classroomId?: string;
    status?: 'active' | 'inactive' | 'completed';
}
export interface ClassSectionStatistics {
    totalClassSections: number;
}
export interface ClassScheduleBlock {
    id: string;
    title: string;
    subtitle?: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    color?: string;
    order?: number;
}
export interface ClassScheduleGrid {
    timeSlots: string[];
    daysOfWeek: DayOfWeek[];
    blocks: ClassScheduleBlock[];
}
export interface ClassScheduleSearchParams {
    dayOfWeek?: DayOfWeek;
    timeRange?: {
        start: string;
        end: string;
    };
    teacherId?: string;
    classroomId?: string;
    courseId?: string;
    status?: 'active' | 'inactive' | 'completed';
}
export interface ClassSectionDependencies {
    hasStudentTimetables: boolean;
    affectedStudentCount: number;
    hasAttendanceRecords: boolean;
    attendanceCount: number;
    totalRelatedRecords: number;
}
export interface ClassSectionHierarchicalDeleteResponse {
    success: boolean;
    deletedRecords: {
        studentTimetables: number;
        attendanceRecords: number;
        classSection: boolean;
    };
    message: string;
}
//# sourceMappingURL=class-section.types.d.ts.map