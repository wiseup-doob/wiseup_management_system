export declare const ATTENDANCE_CONSTANTS: {
    readonly STATUSES: {
        readonly DISMISSED: "dismissed";
        readonly PRESENT: "present";
        readonly UNAUTHORIZED_ABSENT: "unauthorized_absent";
        readonly AUTHORIZED_ABSENT: "authorized_absent";
    };
    readonly DEFAULT_ROWS: 8;
    readonly DEFAULT_COLS: 6;
    readonly MAX_SEATS: 48;
    readonly ATTENDANCE_DEADLINE: "09:00";
    readonly DISMISSAL_DEADLINE: "18:00";
    readonly STATUS_CYCLE: readonly ["dismissed", "present", "unauthorized_absent", "authorized_absent"];
    readonly STATUS_COLORS: {
        readonly present: "var(--color-present)";
        readonly dismissed: "var(--color-dismissed)";
        readonly unauthorized_absent: "var(--color-unauthorized-absent)";
        readonly authorized_absent: "var(--color-authorized-absent)";
    };
    readonly STATUS_TEXTS: {
        readonly present: "등원";
        readonly dismissed: "하원";
        readonly unauthorized_absent: "무단결석";
        readonly authorized_absent: "사유결석";
    };
    readonly DEFAULT_STATS: {
        readonly total: 0;
        readonly present: 0;
        readonly dismissed: 0;
        readonly unauthorized_absent: 0;
        readonly authorized_absent: 0;
    };
    readonly HISTORY: {
        readonly DEFAULT_DAYS: 7;
        readonly MAX_DAYS: 30;
        readonly DATE_FORMAT: "YYYY-MM-DD";
        readonly TIME_FORMAT: "HH:mm:ss";
    };
};
export declare const ATTENDANCE_MESSAGES: {
    readonly SUCCESS: {
        readonly STATUS_UPDATED: "출석 상태가 업데이트되었습니다.";
        readonly BULK_UPDATED: "출석 상태가 일괄 업데이트되었습니다.";
        readonly HISTORY_RETRIEVED: "출석 기록을 성공적으로 조회했습니다.";
    };
    readonly ERROR: {
        readonly INVALID_STATUS: "유효하지 않은 출석 상태입니다.";
        readonly STUDENT_NOT_FOUND: "학생을 찾을 수 없습니다.";
        readonly UPDATE_FAILED: "출석 상태 업데이트에 실패했습니다.";
        readonly HISTORY_NOT_FOUND: "출석 기록을 찾을 수 없습니다.";
    };
    readonly WARNING: {
        readonly DEADLINE_PASSED: "출석 마감 시간이 지났습니다.";
        readonly DUPLICATE_UPDATE: "이미 출석이 기록되었습니다.";
    };
};
export declare const ATTENDANCE_STATUS_STYLES: {
    readonly present: {
        readonly text: "등원";
        readonly className: "attendance-present";
        readonly backgroundColor: "#e8f5e8";
        readonly color: "#2e7d32";
        readonly borderColor: "#4caf50";
        readonly dotColor: "#4CAF50";
    };
    readonly dismissed: {
        readonly text: "하원";
        readonly className: "attendance-dismissed";
        readonly backgroundColor: "#f5f5f5";
        readonly color: "#666666";
        readonly borderColor: "#9e9e9e";
        readonly dotColor: "#9E9E9E";
    };
    readonly unauthorized_absent: {
        readonly text: "무단결석";
        readonly className: "attendance-unauthorized";
        readonly backgroundColor: "#ffebee";
        readonly color: "#c62828";
        readonly borderColor: "#f44336";
        readonly dotColor: "#F44336";
    };
    readonly authorized_absent: {
        readonly text: "사유결석";
        readonly className: "attendance-authorized";
        readonly backgroundColor: "#fff3e0";
        readonly color: "#ef6c00";
        readonly borderColor: "#ff9800";
        readonly dotColor: "#FF9800";
    };
    readonly not_enrolled: {
        readonly text: "미등록";
        readonly className: "attendance-not-enrolled";
        readonly backgroundColor: "#f5f5f5";
        readonly color: "#9e9e9e";
        readonly borderColor: "#bdbdbd";
        readonly dotColor: "#BDBDBD";
    };
};
export declare const ATTENDANCE_TO_TIMELINE_STATUS: {
    readonly present: "success";
    readonly dismissed: "info";
    readonly unauthorized_absent: "error";
    readonly authorized_absent: "warning";
    readonly not_enrolled: "default";
};
export declare const DEFAULT_ATTENDANCE_ACTIVITIES: readonly [{
    readonly id: "1";
    readonly activity: "수업";
    readonly description: "정규 수업 참여";
}, {
    readonly id: "2";
    readonly activity: "자습";
    readonly description: "자율 학습";
}, {
    readonly id: "3";
    readonly activity: "보충";
    readonly description: "보충 수업";
}, {
    readonly id: "4";
    readonly activity: "특별활동";
    readonly description: "동아리, 봉사활동 등";
}, {
    readonly id: "5";
    readonly activity: "기타";
    readonly description: "기타 활동";
}];
//# sourceMappingURL=attendance.constants.d.ts.map