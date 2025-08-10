import type { BaseEntity, DateString, TimeString, UUID, TeacherId, ClassId, TimetableId, TimetableItemId, ClassroomId, TimeSlotId, EnrollmentId, ClassAttendanceId, EntityStatus, ClassStatus, ClassAttendanceStatus, EnrollmentStatus, SemesterStatus, RecurrenceType } from './common.types';
export interface TimetableBlock {
    id: string;
    title: string;
    startTime: TimeString;
    endTime: TimeString;
    dayOfWeek: DayOfWeek;
    color?: string;
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    className?: string;
    notes?: string;
    type?: 'class' | 'break' | 'meal' | 'study' | 'exam' | 'custom';
}
export interface TimetableCell {
    time: TimeString;
    dayOfWeek: DayOfWeek;
    blocks: TimetableBlock[];
    isEmpty: boolean;
}
export interface TimetableGrid {
    timeSlots: TimeString[];
    daysOfWeek: DayOfWeek[];
    cells: TimetableCell[][];
}
export interface TimetableRenderOptions {
    showTimeHeaders: boolean;
    showDayHeaders: boolean;
    cellHeight: number;
    cellWidth: number;
    headerHeight: number;
    headerWidth: number;
    borderColor: string;
    backgroundColor: string;
    emptyCellColor: string;
    hoverEffect: boolean;
    responsive: boolean;
    startTime?: TimeString;
    endTime?: TimeString;
    slotMinutes?: number;
    pixelsPerMinute?: number;
    gutter?: number;
    minBlockHeight?: number;
}
export interface TimetableEventHandlers {
    onBlockClick?: (block: TimetableBlock) => void;
    onCellClick?: (cell: TimetableCell) => void;
    onBlockHover?: (block: TimetableBlock) => void;
    onCellHover?: (cell: TimetableCell) => void;
}
export interface TimetableStyles {
    grid: {
        borderColor: string;
        backgroundColor: string;
        headerBackgroundColor: string;
        headerTextColor: string;
        cellBorderColor: string;
        emptyCellColor: string;
    };
    block: {
        defaultColor: string;
        defaultTextColor: string;
        defaultBorderColor: string;
        hoverEffect: boolean;
        borderRadius: string;
        padding: string;
        fontSize: string;
        fontWeight: string;
    };
    timeHeader: {
        backgroundColor: string;
        textColor: string;
        fontSize: string;
        fontWeight: string;
        padding: string;
    };
    dayHeader: {
        backgroundColor: string;
        textColor: string;
        fontSize: string;
        fontWeight: string;
        padding: string;
    };
}
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type TimeFormat = TimeString;
export type SubjectType = 'korean' | 'math' | 'english' | 'science' | 'social' | 'art' | 'computer' | 'counseling' | 'test_prep' | 'homework' | 'review' | 'custom';
export type ClassType = 'regular' | 'special' | 'makeup' | 'test' | 'counseling' | 'activity';
export interface Teacher extends BaseEntity {
    id: TeacherId;
    name: string;
    email: string;
    phone: string;
    subjects: SubjectType[];
    gradeLevels: string[];
    status: EntityStatus;
    hireDate: DateString;
    resignationDate?: DateString;
    notes?: string;
}
export interface Class extends BaseEntity {
    id: ClassId;
    name: string;
    subject: SubjectType;
    classType: ClassType;
    teacherId: TeacherId;
    grade: string;
    maxStudents: number;
    currentStudents: number;
    description?: string;
    materials?: string[];
    status: ClassStatus;
    isActive: boolean;
}
export interface TimeSlot {
    id: TimeSlotId;
    name: string;
    startTime: TimeFormat;
    endTime: TimeFormat;
    duration: number;
    isBreak: boolean;
    order: number;
}
export interface TimetableItem extends BaseEntity {
    id: TimetableItemId;
    /** 학생별 독립 시간표 스코핑 필수 */
    timetableId?: TimetableId;
    classId: ClassId;
    teacherId: TeacherId;
    dayOfWeek: DayOfWeek;
    timeSlotId: TimeSlotId;
    roomId?: ClassroomId;
    startDate: DateString;
    endDate?: DateString;
    isRecurring: boolean;
    recurrencePattern?: {
        type: RecurrenceType;
        interval: number;
        daysOfWeek?: DayOfWeek[];
        dayOfMonth?: number;
    };
    status: ClassStatus;
    notes?: string;
}
export interface Classroom extends BaseEntity {
    id: ClassroomId;
    name: string;
    capacity: number;
    equipment: string[];
    features: string[];
    isActive: boolean;
    notes?: string;
}
export interface Enrollment extends BaseEntity {
    id: EnrollmentId;
    studentId: UUID;
    classId: ClassId;
    timetableItemId: TimetableItemId;
    enrollmentDate: DateString;
    startDate: DateString;
    endDate?: DateString;
    status: EnrollmentStatus;
    grade?: string;
    attendanceRate?: number;
    notes?: string;
}
export interface ClassAttendance extends BaseEntity {
    id: ClassAttendanceId;
    enrollmentId: EnrollmentId;
    timetableItemId: TimetableItemId;
    date: DateString;
    status: ClassAttendanceStatus;
    checkInTime?: TimeFormat;
    checkOutTime?: TimeFormat;
    notes?: string;
}
export interface Timetable extends BaseEntity {
    id: TimetableId;
    name: string;
    academicYear: string;
    semester: SemesterStatus;
    startDate: DateString;
    endDate: DateString;
    isActive: boolean;
    description?: string;
    /** 학생별 독립 시간표 소유자 (선택) */
    ownerStudentId?: UUID;
}
export interface TimetableSummary {
    id: TimetableId;
    name: string;
    totalClasses: number;
    totalTeachers: number;
    totalStudents: number;
    totalClassrooms: number;
    academicYear: string;
    semester: string;
    isActive: boolean;
}
export interface TimetableSearchParams {
    teacherId?: TeacherId;
    studentId?: UUID;
    classId?: ClassId;
    subject?: SubjectType;
    dayOfWeek?: DayOfWeek;
    date?: DateString;
    status?: ClassStatus;
    isActive?: boolean;
}
export interface ClassSearchParams {
    name?: string;
    subject?: SubjectType;
    teacherId?: TeacherId;
    grade?: string;
    status?: ClassStatus;
    isActive?: boolean;
}
export interface TeacherSearchParams {
    name?: string;
    subject?: SubjectType;
    gradeLevel?: string;
    status?: 'active' | 'inactive';
}
export interface TimetableStats {
    totalClasses: number;
    totalTeachers: number;
    totalStudents: number;
    totalClassrooms: number;
    averageClassSize: number;
    mostPopularSubject: SubjectType;
    busiestDay: DayOfWeek;
    averageAttendanceRate: number;
}
export interface TeacherStats {
    teacherId: TeacherId;
    teacherName: string;
    totalClasses: number;
    totalStudents: number;
    averageClassSize: number;
    subjects: SubjectType[];
    averageAttendanceRate: number;
}
export interface StudentTimetableStats {
    studentId: UUID;
    studentName: string;
    totalEnrollments: number;
    totalSubjects: number;
    averageGrade: number;
    averageAttendanceRate: number;
    subjects: SubjectType[];
}
export interface CreateTimetableRequest {
    name: string;
    academicYear: string;
    semester: 'spring' | 'summer' | 'fall' | 'winter';
    startDate: DateString;
    endDate: DateString;
    description?: string;
    ownerStudentId?: UUID;
}
export interface UpdateTimetableRequest {
    name?: string;
    academicYear?: string;
    semester?: 'spring' | 'summer' | 'fall' | 'winter';
    startDate?: DateString;
    endDate?: DateString;
    description?: string;
    isActive?: boolean;
}
export interface CreateClassRequest {
    name: string;
    subject: SubjectType;
    classType: ClassType;
    teacherId: TeacherId;
    grade: string;
    maxStudents: number;
    description?: string;
    materials?: string[];
}
export interface UpdateClassRequest {
    name?: string;
    subject?: SubjectType;
    classType?: ClassType;
    teacherId?: TeacherId;
    grade?: string;
    maxStudents?: number;
    description?: string;
    materials?: string[];
    status?: ClassStatus;
    isActive?: boolean;
}
export interface CreateTimetableItemRequest {
    /** 선택: 서버에서 활성 시간표로 fallback 가능 */
    timetableId?: TimetableId;
    classId: ClassId;
    teacherId: TeacherId;
    dayOfWeek: DayOfWeek;
    timeSlotId: TimeSlotId;
    roomId?: ClassroomId;
    startDate: DateString;
    endDate?: DateString;
    isRecurring: boolean;
    recurrencePattern?: {
        type: 'weekly' | 'monthly';
        interval: number;
        daysOfWeek?: DayOfWeek[];
        dayOfMonth?: number;
    };
    notes?: string;
}
export interface CreateEnrollmentRequest {
    studentId: UUID;
    classId: ClassId;
    timetableItemId: TimetableItemId;
    startDate: DateString;
    endDate?: DateString;
    notes?: string;
}
export declare const TIMETABLE_COLLECTION_NAMES: {
    readonly TIMETABLES: "timetables";
    readonly CLASSES: "classes";
    readonly TEACHERS: "teachers";
    readonly TIMETABLE_ITEMS: "timetable_items";
    readonly CLASSROOMS: "classrooms";
    readonly ENROLLMENTS: "enrollments";
    readonly CLASS_ATTENDANCE: "class_attendance";
    readonly TIME_SLOTS: "time_slots";
};
export declare const TIMETABLE_REQUIRED_INDEXES: {
    readonly TIMETABLES_BY_ACADEMIC_YEAR: "timetables/academicYear/Ascending";
    readonly TIMETABLES_BY_SEMESTER: "timetables/semester/Ascending";
    readonly TIMETABLES_BY_ACTIVE: "timetables/isActive/Ascending";
    readonly CLASSES_BY_TEACHER: "classes/teacherId/Ascending";
    readonly CLASSES_BY_SUBJECT: "classes/subject/Ascending";
    readonly CLASSES_BY_GRADE: "classes/grade/Ascending";
    readonly CLASSES_BY_STATUS: "classes/status/Ascending";
    readonly TEACHERS_BY_SUBJECT: "teachers/subjects/Array";
    readonly TEACHERS_BY_STATUS: "teachers/status/Ascending";
    readonly TIMETABLE_ITEMS_BY_CLASS: "timetable_items/classId/Ascending";
    readonly TIMETABLE_ITEMS_BY_TEACHER: "timetable_items/teacherId/Ascending";
    readonly TIMETABLE_ITEMS_BY_DAY: "timetable_items/dayOfWeek/Ascending";
    readonly TIMETABLE_ITEMS_BY_TIME_SLOT: "timetable_items/timeSlotId/Ascending";
    readonly TIMETABLE_ITEMS_BY_DATE_RANGE: "timetable_items/startDate/Ascending/endDate/Descending";
    readonly ENROLLMENTS_BY_STUDENT: "enrollments/studentId/Ascending";
    readonly ENROLLMENTS_BY_CLASS: "enrollments/classId/Ascending";
    readonly ENROLLMENTS_BY_STATUS: "enrollments/status/Ascending";
    readonly ENROLLMENTS_BY_DATE_RANGE: "enrollments/startDate/Ascending/endDate/Descending";
    readonly CLASS_ATTENDANCE_BY_ENROLLMENT: "class_attendance/enrollmentId/Ascending";
    readonly CLASS_ATTENDANCE_BY_DATE: "class_attendance/date/Ascending";
    readonly CLASS_ATTENDANCE_BY_STATUS: "class_attendance/status/Ascending";
};
//# sourceMappingURL=timetable.types.d.ts.map