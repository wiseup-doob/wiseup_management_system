// ===== 컬렉션 이름 =====
// 데이터베이스 컬렉션 이름
export const TIMETABLE_COLLECTION_NAMES = {
    TIMETABLES: 'timetables',
    CLASSES: 'classes',
    TEACHERS: 'teachers',
    TIMETABLE_ITEMS: 'timetable_items',
    CLASSROOMS: 'classrooms',
    ENROLLMENTS: 'enrollments',
    CLASS_ATTENDANCE: 'class_attendance',
    TIME_SLOTS: 'time_slots',
};
// ===== 인덱스 정의 =====
// 인덱스 정의
export const TIMETABLE_REQUIRED_INDEXES = {
    // timetables 컬렉션 인덱스
    TIMETABLES_BY_ACADEMIC_YEAR: 'timetables/academicYear/Ascending',
    TIMETABLES_BY_SEMESTER: 'timetables/semester/Ascending',
    TIMETABLES_BY_ACTIVE: 'timetables/isActive/Ascending',
    // classes 컬렉션 인덱스
    CLASSES_BY_TEACHER: 'classes/teacherId/Ascending',
    CLASSES_BY_SUBJECT: 'classes/subject/Ascending',
    CLASSES_BY_GRADE: 'classes/grade/Ascending',
    CLASSES_BY_STATUS: 'classes/status/Ascending',
    // teachers 컬렉션 인덱스
    TEACHERS_BY_SUBJECT: 'teachers/subjects/Array',
    TEACHERS_BY_STATUS: 'teachers/status/Ascending',
    // timetable_items 컬렉션 인덱스
    TIMETABLE_ITEMS_BY_CLASS: 'timetable_items/classId/Ascending',
    TIMETABLE_ITEMS_BY_TEACHER: 'timetable_items/teacherId/Ascending',
    TIMETABLE_ITEMS_BY_DAY: 'timetable_items/dayOfWeek/Ascending',
    TIMETABLE_ITEMS_BY_TIME_SLOT: 'timetable_items/timeSlotId/Ascending',
    TIMETABLE_ITEMS_BY_DATE_RANGE: 'timetable_items/startDate/Ascending/endDate/Descending',
    // enrollments 컬렉션 인덱스
    ENROLLMENTS_BY_STUDENT: 'enrollments/studentId/Ascending',
    ENROLLMENTS_BY_CLASS: 'enrollments/classId/Ascending',
    ENROLLMENTS_BY_STATUS: 'enrollments/status/Ascending',
    ENROLLMENTS_BY_DATE_RANGE: 'enrollments/startDate/Ascending/endDate/Descending',
    // class_attendance 컬렉션 인덱스
    CLASS_ATTENDANCE_BY_ENROLLMENT: 'class_attendance/enrollmentId/Ascending',
    CLASS_ATTENDANCE_BY_DATE: 'class_attendance/date/Ascending',
    CLASS_ATTENDANCE_BY_STATUS: 'class_attendance/status/Ascending',
};
//# sourceMappingURL=timetable.types.js.map