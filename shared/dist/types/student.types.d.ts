import type { BaseEntity } from './common.types';
import type { AttendanceStatus, AttendanceRecord } from './attendance.types';
import type { Student as NewStudent } from './database.types';
export interface Student extends BaseEntity {
    name: string;
    seatNumber: number;
    grade: string;
    className: string;
    status: 'active' | 'inactive';
    attendanceHistory: AttendanceRecord[];
    currentAttendance?: AttendanceStatus;
    lastAttendanceUpdate?: string;
    firstAttendanceDate?: string;
}
export type { Student as StudentV2, StudentBasicInfo, StudentCurrentStatus } from './database.types';
export interface CreateStudentRequest {
    name: string;
    seatNumber: number;
    grade: string;
    className: string;
    status?: 'active' | 'inactive';
    attendanceHistory?: AttendanceRecord[];
    currentAttendance?: AttendanceStatus;
}
export interface UpdateStudentRequest {
    name?: string;
    seatNumber?: number;
    grade?: string;
    className?: string;
    status?: 'active' | 'inactive';
    attendanceHistory?: AttendanceRecord[];
    currentAttendance?: AttendanceStatus;
    lastAttendanceUpdate?: string;
}
export interface StudentSearchParams {
    name?: string;
    grade?: string;
    className?: string;
    status?: 'active' | 'inactive';
    currentAttendance?: AttendanceStatus;
}
export type { CreateStudentRequest as CreateStudentRequestV2, UpdateStudentRequest as UpdateStudentRequestV2 } from './api.types';
export type TransformToNewStudent = (oldStudent: Student) => NewStudent;
export type TransformToOldStudent = (newStudent: NewStudent) => Student;
export type StudentVersion = 'v1' | 'v2';
export type StudentUnion = Student | NewStudent;
export declare const isOldStudent: (student: StudentUnion) => student is Student;
export declare const isNewStudent: (student: StudentUnion) => student is NewStudent;
export interface StudentTransformers {
    toNew: TransformToNewStudent;
    toOld: TransformToOldStudent;
    validate: (student: StudentUnion) => boolean;
}
export declare const STUDENT_STATUS: {
    readonly ACTIVE: "active";
    readonly INACTIVE: "inactive";
};
export declare const STUDENT_GRADES: {
    readonly GRADE_1: "1학년";
    readonly GRADE_2: "2학년";
    readonly GRADE_3: "3학년";
};
export declare const STUDENT_CLASSES: {
    readonly CLASS_A: "A반";
    readonly CLASS_B: "B반";
    readonly CLASS_C: "C반";
    readonly CLASS_D: "D반";
};
export interface StudentValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export interface StudentValidationRule {
    field: keyof Student | keyof NewStudent;
    required: boolean;
    validator?: (value: any) => boolean;
    errorMessage: string;
}
//# sourceMappingURL=student.types.d.ts.map