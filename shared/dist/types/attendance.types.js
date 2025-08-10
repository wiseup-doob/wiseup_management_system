// 출석 상태별 스타일 매핑
export const ATTENDANCE_STATUS_STYLES = {
    present: {
        text: '등원',
        className: 'attendance-present',
        backgroundColor: '#e8f5e8',
        color: '#2e7d32',
        borderColor: '#4caf50',
        dotColor: '#4CAF50'
    },
    dismissed: {
        text: '하원',
        className: 'attendance-dismissed',
        backgroundColor: '#f5f5f5',
        color: '#666666',
        borderColor: '#9e9e9e',
        dotColor: '#9E9E9E'
    },
    unauthorized_absent: {
        text: '무단결석',
        className: 'attendance-unauthorized',
        backgroundColor: '#ffebee',
        color: '#c62828',
        borderColor: '#f44336',
        dotColor: '#F44336'
    },
    authorized_absent: {
        text: '사유결석',
        className: 'attendance-authorized',
        backgroundColor: '#fff3e0',
        color: '#ef6c00',
        borderColor: '#ff9800',
        dotColor: '#FF9800'
    },
    not_enrolled: {
        text: '미등록',
        className: 'attendance-not-enrolled',
        backgroundColor: '#f5f5f5',
        color: '#9e9e9e',
        borderColor: '#bdbdbd',
        dotColor: '#BDBDBD'
    }
};
// 기본 시간대별 출석 활동
export const DEFAULT_ATTENDANCE_ACTIVITIES = [
    { time: '08:30', activity: '등원', location: '정문' },
    { time: '09:00', activity: '출석체크' },
    { time: '12:00', activity: '점심시간' },
    { time: '13:00', activity: '오후수업' },
    { time: '15:00', activity: '휴식시간' },
    { time: '17:30', activity: '하원', location: '정문' }
];
// 출석 상태별 타임라인 상태 매핑
export const ATTENDANCE_TO_TIMELINE_STATUS = {
    present: 'completed',
    dismissed: 'completed',
    unauthorized_absent: 'cancelled',
    authorized_absent: 'pending',
    not_enrolled: 'pending'
};
// ===== 타입 가드 =====
// 기존 AttendanceRecord 타입인지 확인
export const isOldAttendanceRecord = (record) => {
    return 'timestamp' in record && typeof record.timestamp === 'string';
};
// 새로운 AttendanceRecord 타입인지 확인
export const isNewAttendanceRecord = (record) => {
    return 'studentId' in record && typeof record.studentId === 'string';
};
// ===== Attendance 관련 상수 =====
export const ATTENDANCE_STATUS = {
    PRESENT: 'present',
    DISMISSED: 'dismissed',
    UNAUTHORIZED_ABSENT: 'unauthorized_absent',
    AUTHORIZED_ABSENT: 'authorized_absent'
};
export const ATTENDANCE_ACTION_TYPES = {
    UPDATE: 'update',
    RESET: 'reset',
    MARK_ALL_PRESENT: 'mark_all_present'
};
//# sourceMappingURL=attendance.types.js.map