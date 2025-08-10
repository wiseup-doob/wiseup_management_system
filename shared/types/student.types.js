"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STUDENT_CLASSES = exports.STUDENT_GRADES = exports.STUDENT_STATUS = exports.isNewStudent = exports.isOldStudent = void 0;
// ===== 타입 가드 =====
// 기존 Student 타입인지 확인
const isOldStudent = (student) => {
    return 'attendanceHistory' in student && Array.isArray(student.attendanceHistory);
};
exports.isOldStudent = isOldStudent;
// 새로운 Student 타입인지 확인
const isNewStudent = (student) => {
    return 'currentStatus' in student && typeof student.currentStatus === 'object';
};
exports.isNewStudent = isNewStudent;
// ===== Student 관련 상수 =====
exports.STUDENT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};
exports.STUDENT_GRADES = {
    GRADE_1: '1학년',
    GRADE_2: '2학년',
    GRADE_3: '3학년'
};
exports.STUDENT_CLASSES = {
    CLASS_A: 'A반',
    CLASS_B: 'B반',
    CLASS_C: 'C반',
    CLASS_D: 'D반'
};
//# sourceMappingURL=student.types.js.map