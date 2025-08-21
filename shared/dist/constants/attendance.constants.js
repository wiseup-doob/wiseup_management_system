// 출석 관련 상수 정의
export const ATTENDANCE_CONSTANTS = {
    // 출석 상태
    STATUSES: {
        DISMISSED: 'dismissed',
        PRESENT: 'present',
        UNAUTHORIZED_ABSENT: 'unauthorized_absent',
        AUTHORIZED_ABSENT: 'authorized_absent'
    },
    // 좌석 설정
    DEFAULT_ROWS: 8,
    DEFAULT_COLS: 6,
    MAX_SEATS: 48,
    // 시간 설정
    ATTENDANCE_DEADLINE: '09:00', // 등원 마감 시간
    DISMISSAL_DEADLINE: '18:00', // 하원 마감 시간
    // 출석 상태 순서 (클릭 시 다음 상태로 변경)
    STATUS_CYCLE: [
        'dismissed',
        'present',
        'unauthorized_absent',
        'authorized_absent'
    ],
    // 출석 상태 색상 (CSS 변수명)
    STATUS_COLORS: {
        present: 'var(--color-present)',
        dismissed: 'var(--color-dismissed)',
        unauthorized_absent: 'var(--color-unauthorized-absent)',
        authorized_absent: 'var(--color-authorized-absent)'
    },
    // 출석 상태 텍스트
    STATUS_TEXTS: {
        present: '등원',
        dismissed: '하원',
        unauthorized_absent: '무단결석',
        authorized_absent: '사유결석'
    },
    // 출석 통계 기본값
    DEFAULT_STATS: {
        total: 0,
        present: 0,
        dismissed: 0,
        unauthorized_absent: 0,
        authorized_absent: 0
    },
    // 출석 기록 관련
    HISTORY: {
        DEFAULT_DAYS: 7,
        MAX_DAYS: 30,
        DATE_FORMAT: 'YYYY-MM-DD',
        TIME_FORMAT: 'HH:mm:ss'
    }
};
// 출석 관련 메시지
export const ATTENDANCE_MESSAGES = {
    SUCCESS: {
        STATUS_UPDATED: '출석 상태가 업데이트되었습니다.',
        BULK_UPDATED: '출석 상태가 일괄 업데이트되었습니다.',
        HISTORY_RETRIEVED: '출석 기록을 성공적으로 조회했습니다.'
    },
    ERROR: {
        INVALID_STATUS: '유효하지 않은 출석 상태입니다.',
        STUDENT_NOT_FOUND: '학생을 찾을 수 없습니다.',
        UPDATE_FAILED: '출석 상태 업데이트에 실패했습니다.',
        HISTORY_NOT_FOUND: '출석 기록을 찾을 수 없습니다.'
    },
    WARNING: {
        DEADLINE_PASSED: '출석 마감 시간이 지났습니다.',
        DUPLICATE_UPDATE: '이미 출석이 기록되었습니다.'
    }
};
// 출석 상태별 스타일 정의
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
// 출석 상태를 타임라인 상태로 변환하는 매핑
export const ATTENDANCE_TO_TIMELINE_STATUS = {
    present: 'success',
    dismissed: 'info',
    unauthorized_absent: 'error',
    authorized_absent: 'warning',
    not_enrolled: 'default'
};
// 기본 출석 활동 목록
export const DEFAULT_ATTENDANCE_ACTIVITIES = [
    { id: '1', activity: '수업', description: '정규 수업 참여' },
    { id: '2', activity: '자습', description: '자율 학습' },
    { id: '3', activity: '보충', description: '보충 수업' },
    { id: '4', activity: '특별활동', description: '동아리, 봉사활동 등' },
    { id: '5', activity: '기타', description: '기타 활동' }
];
//# sourceMappingURL=attendance.constants.js.map