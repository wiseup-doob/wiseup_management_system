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
//# sourceMappingURL=attendance.constants.d.ts.map