"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ATTENDANCE_STATUS_COLORS = exports.ATTENDANCE_STATUS_LABELS = exports.ATTENDANCE_STATUS = exports.isNewAttendanceRecord = exports.isOldAttendanceRecord = void 0;
// ===== 타입 가드 =====
// 기존 AttendanceRecord 타입인지 확인
const isOldAttendanceRecord = (record) => {
    return !('id' in record) || !('studentId' in record);
};
exports.isOldAttendanceRecord = isOldAttendanceRecord;
// 새로운 AttendanceRecord 타입인지 확인
const isNewAttendanceRecord = (record) => {
    return 'id' in record && 'studentId' in record;
};
exports.isNewAttendanceRecord = isNewAttendanceRecord;
// ===== Attendance 관련 상수 =====
exports.ATTENDANCE_STATUS = {
    PRESENT: 'present',
    DISMISSED: 'dismissed',
    UNAUTHORIZED_ABSENT: 'unauthorized_absent',
    AUTHORIZED_ABSENT: 'authorized_absent',
    NOT_ENROLLED: 'not_enrolled'
};
exports.ATTENDANCE_STATUS_LABELS = {
    present: '등원',
    dismissed: '하원',
    unauthorized_absent: '무단결석',
    authorized_absent: '사유결석',
    not_enrolled: '미등원'
};
exports.ATTENDANCE_STATUS_COLORS = {
    present: '#3B82F6',
    dismissed: '#9CA3AF',
    unauthorized_absent: '#EF4444',
    authorized_absent: '#F97316',
    not_enrolled: '#6B7280' // 회색
};
//# sourceMappingURL=attendance.types.js.map