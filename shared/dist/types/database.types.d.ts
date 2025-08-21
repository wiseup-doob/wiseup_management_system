import type { DateString, TimeString } from './common.types';
export interface DailySummary {
    id: string;
    date: DateString;
    totalStudents: number;
    presentCount: number;
    dismissedCount: number;
    unauthorizedAbsentCount: number;
    authorizedAbsentCount: number;
    notEnrolledCount: number;
    averageCheckInTime?: TimeString;
    averageCheckOutTime?: TimeString;
    lateCount?: number;
    earlyLeaveCount?: number;
    classStats?: {
        [className: string]: {
            present: number;
            dismissed: number;
            unauthorizedAbsent: number;
            authorizedAbsent: number;
            notEnrolled: number;
        };
    };
    seatStats?: {
        [seatId: string]: {
            studentId?: string;
            status: string;
            checkInTime?: TimeString;
            checkOutTime?: TimeString;
        };
    };
}
export interface MonthlyReport {
    id: string;
    year: number;
    month: number;
    totalStudents: number;
    totalAttendanceDays: number;
    averageAttendanceRate: number;
    statusStats: {
        present: number;
        dismissed: number;
        unauthorizedAbsent: number;
        authorizedAbsent: number;
        notEnrolled: number;
    };
    studentStats?: {
        [studentId: string]: {
            totalDays: number;
            presentDays: number;
            attendanceRate: number;
            averageCheckInTime?: TimeString;
            averageCheckOutTime?: TimeString;
            lateCount: number;
            earlyLeaveCount: number;
        };
    };
}
export declare const COLLECTION_NAMES: {
    readonly STUDENTS: "students";
    readonly PARENTS: "parents";
    readonly TEACHERS: "teachers";
    readonly COURSES: "courses";
    readonly CLASS_SECTIONS: "class_sections";
    readonly CLASSROOMS: "classrooms";
    readonly SEATS: "seats";
    readonly SEAT_ASSIGNMENTS: "seat_assignments";
    readonly STUDENT_TIMETABLES: "student_timetables";
    readonly STUDENT_SUMMARIES: "student_summaries";
    readonly ATTENDANCE_RECORDS: "attendance_records";
    readonly DAILY_SUMMARIES: "daily_summaries";
    readonly MONTHLY_REPORTS: "monthly_reports";
};
export declare const REQUIRED_INDEXES: {
    readonly STUDENTS_BY_NAME: "students/name/Ascending";
    readonly STUDENTS_BY_GRADE: "students/grade/Ascending";
    readonly STUDENTS_BY_CLASS: "students/className/Ascending";
    readonly STUDENTS_BY_STATUS: "students/status/Ascending";
    readonly STUDENTS_BY_ENROLLMENT_DATE: "students/enrollmentDate/Descending";
    readonly PARENTS_BY_NAME: "parents/name/Ascending";
    readonly PARENTS_BY_PHONE: "parents/phone/Ascending";
    readonly PARENTS_BY_EMAIL: "parents/email/Ascending";
    readonly TEACHERS_BY_NAME: "teachers/name/Ascending";
    readonly TEACHERS_BY_SUBJECT: "teachers/subjects/Ascending";
    readonly TEACHERS_BY_EMAIL: "teachers/email/Ascending";
    readonly COURSES_BY_SUBJECT: "courses/subject/Ascending";
    readonly COURSES_BY_DIFFICULTY: "courses/difficulty/Ascending";
    readonly CLASS_SECTIONS_BY_TEACHER: "class_sections/teacherId/Ascending";
    readonly CLASS_SECTIONS_BY_CLASSROOM: "class_sections/classroomId/Ascending";
    readonly CLASS_SECTIONS_BY_SUBJECT: "class_sections/subject/Ascending";
    readonly SEATS_BY_NUMBER: "seats/seatNumber/Ascending";
    readonly SEATS_BY_STATUS: "seats/status/Ascending";
    readonly SEAT_ASSIGNMENTS_BY_STUDENT: "seat_assignments/studentId/Ascending";
    readonly SEAT_ASSIGNMENTS_BY_SEAT: "seat_assignments/seatId/Ascending";
    readonly SEAT_ASSIGNMENTS_BY_DATE: "seat_assignments/assignedDate/Descending";
    readonly ATTENDANCE_BY_STUDENT_DATE: "attendance_records/studentId/Ascending/date/Descending";
    readonly ATTENDANCE_BY_STUDENT_STATUS: "attendance_records/studentId/Ascending/status/Ascending";
    readonly ATTENDANCE_BY_DATE_STATUS: "attendance_records/date/Ascending/status/Ascending";
    readonly ATTENDANCE_BY_STUDENT_DATE_STATUS: "attendance_records/studentId/Ascending/date/Ascending/status/Ascending";
    readonly ATTENDANCE_BY_CHECKIN_TIME: "attendance_records/checkInTime/Ascending";
    readonly ATTENDANCE_BY_SEAT: "attendance_records/seatId/Ascending";
    readonly DAILY_SUMMARIES_BY_DATE: "daily_summaries/date/Descending";
    readonly MONTHLY_REPORTS_BY_YEAR_MONTH: "monthly_reports/year/Descending/month/Descending";
};
//# sourceMappingURL=database.types.d.ts.map