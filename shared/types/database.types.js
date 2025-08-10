"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUIRED_INDEXES = exports.COLLECTION_NAMES = void 0;
// 데이터베이스 컬렉션 이름
exports.COLLECTION_NAMES = {
    STUDENTS: 'students',
    ATTENDANCE_RECORDS: 'attendance_records',
    DAILY_SUMMARIES: 'daily_summaries',
    MONTHLY_REPORTS: 'monthly_reports',
};
// 인덱스 정의
exports.REQUIRED_INDEXES = {
    // students 컬렉션 인덱스
    STUDENTS_BY_NAME: 'students/name/Ascending',
    STUDENTS_BY_GRADE: 'students/grade/Ascending',
    STUDENTS_BY_CLASS: 'students/className/Ascending',
    STUDENTS_BY_SEAT: 'students/seatNumber/Ascending',
    STUDENTS_BY_STATUS: 'students/status/Ascending',
    // attendance_records 컬렉션 인덱스
    ATTENDANCE_BY_STUDENT_DATE: 'attendance_records/studentId/Ascending/date/Descending',
    ATTENDANCE_BY_STUDENT_STATUS: 'attendance_records/studentId/Ascending/status/Ascending',
    ATTENDANCE_BY_DATE_STATUS: 'attendance_records/date/Ascending/status/Ascending',
    ATTENDANCE_BY_STUDENT_DATE_STATUS: 'attendance_records/studentId/Ascending/date/Ascending/status/Ascending',
    ATTENDANCE_BY_CHECKIN_TIME: 'attendance_records/checkInTime/Ascending',
    // daily_summaries 컬렉션 인덱스
    DAILY_SUMMARIES_BY_DATE: 'daily_summaries/date/Descending',
    // monthly_reports 컬렉션 인덱스
    MONTHLY_REPORTS_BY_YEAR_MONTH: 'monthly_reports/year/Descending/month/Descending',
};
//# sourceMappingURL=database.types.js.map