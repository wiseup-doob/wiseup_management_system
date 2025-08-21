export type FirestoreTimestamp = any;
export interface BaseEntity {
    id: string;
    createdAt?: FirestoreTimestamp;
    updatedAt?: FirestoreTimestamp;
}
export type SubjectType = 'mathematics' | 'english' | 'korean' | 'other';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type AttendanceStatus = 'present' | 'dismissed' | 'unauthorized_absent' | 'authorized_absent' | 'not_enrolled';
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type UUID = string;
export type EntityId = UUID;
export type StudentId = UUID;
export type TeacherId = UUID;
export type ClassId = UUID;
export type TimetableId = UUID;
export type TimetableItemId = UUID;
export type ClassroomId = UUID;
export type TimeSlotId = UUID;
export type EnrollmentId = UUID;
export type ClassAttendanceId = UUID;
export type AttendanceRecordId = UUID;
export type SeatId = string;
export type UserId = string;
export interface UUIDGenerator {
    generate(): UUID;
}
export interface IdGenerator {
    generateStudentId(): StudentId;
    generateTeacherId(): TeacherId;
    generateClassId(): ClassId;
    generateTimetableId(): TimetableId;
    generateSeatId(seatNumber: number): SeatId;
    generateUserId(): UserId;
}
export type EntityStatus = 'active' | 'inactive';
export type ClassStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
export type ClassAttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type EnrollmentStatus = 'enrolled' | 'dropped' | 'completed' | 'suspended';
export type SemesterStatus = 'spring' | 'summer' | 'fall' | 'winter';
export type RecurrenceType = 'weekly' | 'monthly';
export type DateString = string;
export type TimeString = string;
export type DateTimeString = string;
export type Timestamp = FirestoreTimestamp;
export interface DateRange {
    start: DateString;
    end: DateString;
}
export interface TimeRange {
    start: TimeString;
    end: TimeString;
}
export interface TimestampUtils {
    now(): FirestoreTimestamp;
    fromDate(date: Date): FirestoreTimestamp;
    fromISOString(isoString: string): FirestoreTimestamp;
    toDate(timestamp: FirestoreTimestamp): Date;
    toISOString(timestamp: FirestoreTimestamp): string;
    fromSeconds(seconds: number): FirestoreTimestamp;
    fromMillis(millis: number): FirestoreTimestamp;
}
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    meta?: {
        timestamp?: string;
        version?: string;
        requestId?: string;
        count?: number;
        [key: string]: any;
    };
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
//# sourceMappingURL=common.types.d.ts.map