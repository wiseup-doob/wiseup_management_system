import type { Student, StudentSearchParams } from '../types/student.types';
import type { AttendanceRecord, AttendanceSearchParams } from '../types/attendance.types';
export declare function filterStudents(students: Student[], criteria: StudentSearchParams): Student[];
export declare function filterAttendanceRecords(records: AttendanceRecord[], criteria: AttendanceSearchParams): AttendanceRecord[];
export declare function validateStudentData(student: Partial<Student>): boolean;
export declare function validateAttendanceData(attendance: Partial<AttendanceRecord>): boolean;
//# sourceMappingURL=database.utils.d.ts.map