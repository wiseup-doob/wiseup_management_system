// ===== 타입 가드 =====
// 기존 Student 타입인지 확인
export const isOldStudent = (student) => {
    return 'attendanceHistory' in student && Array.isArray(student.attendanceHistory);
};
// 새로운 Student 타입인지 확인
export const isNewStudent = (student) => {
    return 'currentStatus' in student && typeof student.currentStatus === 'object';
};
// ===== Student 관련 상수 =====
export const STUDENT_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive'
};
export const STUDENT_GRADES = {
    GRADE_1: '1학년',
    GRADE_2: '2학년',
    GRADE_3: '3학년'
};
export const STUDENT_CLASSES = {
    CLASS_A: 'A반',
    CLASS_B: 'B반',
    CLASS_C: 'C반',
    CLASS_D: 'D반'
};
//# sourceMappingURL=student.types.js.map