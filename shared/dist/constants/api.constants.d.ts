export declare const API_ENDPOINTS: {
    STUDENTS: {
        GET_ALL: string;
        GET_BY_ID: (id: string) => string;
        CREATE: string;
        UPDATE: (id: string) => string;
        DELETE: (id: string) => string;
        SEARCH: string;
        INITIALIZE: string;
        UPDATE_ATTENDANCE: (studentId: string) => string;
    };
    TIMETABLE: {
        TIMETABLES: {
            GET_ALL: string;
            GET_BY_ID: (id: string) => string;
            CREATE: string;
            UPDATE: (id: string) => string;
            DELETE: (id: string) => string;
            SUMMARY: (id: string) => string;
        };
        ITEMS: {
            GET_BY_TIMETABLE: (timetableId: string) => string;
            GET_BY_ID: (id: string) => string;
            CREATE: string;
            UPDATE: (id: string) => string;
            DELETE: (id: string) => string;
        };
        TIME_SLOTS: {
            GET_ALL: string;
            CREATE: string;
        };
        CLASSES: {
            GET_ALL: string;
            CREATE: string;
        };
        TEACHERS: {
            GET_ALL: string;
            CREATE: string;
        };
        CLASSROOMS: {
            GET_ALL: string;
            CREATE: string;
        };
        STUDENTS: {
            GET_ITEMS: (studentId: string) => string;
            ENSURE_TIMETABLE: (studentId: string) => string;
        };
        INIT: {
            INITIALIZE: string;
            CLEAR: string;
        };
    };
    ATTENDANCE: {
        GET_RECORDS: string;
        GET_RECORD_BY_ID: (id: string) => string;
        CREATE_RECORD: string;
        UPDATE_RECORD: (id: string) => string;
        DELETE_RECORD: (id: string) => string;
        GET_BY_STUDENT: (studentId: string) => string;
        GET_BY_DATE: (date: string) => string;
        BULK_UPDATE: string;
        GET_STATS: string;
        INITIALIZE: string;
        INITIALIZE_TODAY: string;
    };
    SEATS: {
        GET_ALL: string;
        GET_BY_ID: (seatId: string) => string;
        GET_BY_STUDENT: (studentId: string) => string;
        GET_STATS: string;
        ASSIGN_STUDENT: string;
        UNASSIGN_STUDENT: string;
        UPDATE_STATUS: string;
        INITIALIZE: string;
    };
    INITIALIZATION: {
        INITIALIZE_ALL: string;
    };
    DAILY_SUMMARIES: {
        GET_ALL: string;
        GET_BY_DATE: (date: string) => string;
        CREATE: string;
        UPDATE: (date: string) => string;
    };
    MONTHLY_REPORTS: {
        GET_ALL: string;
        GET_BY_MONTH: (year: string, month: string) => string;
        CREATE: string;
        UPDATE: (year: string, month: string) => string;
    };
    SYSTEM: {
        HEALTH: string;
        VERSION: string;
        INITIALIZE: string;
    };
};
export declare const HTTP_METHODS: {
    readonly GET: "GET";
    readonly POST: "POST";
    readonly PUT: "PUT";
    readonly DELETE: "DELETE";
    readonly PATCH: "PATCH";
};
export declare const HTTP_STATUS_CODES: {
    readonly OK: 200;
    readonly CREATED: 201;
    readonly NO_CONTENT: 204;
    readonly BAD_REQUEST: 400;
    readonly UNAUTHORIZED: 401;
    readonly FORBIDDEN: 403;
    readonly NOT_FOUND: 404;
    readonly METHOD_NOT_ALLOWED: 405;
    readonly CONFLICT: 409;
    readonly UNPROCESSABLE_ENTITY: 422;
    readonly INTERNAL_SERVER_ERROR: 500;
    readonly NOT_IMPLEMENTED: 501;
    readonly SERVICE_UNAVAILABLE: 503;
};
export declare const API_VERSIONS: {
    readonly CURRENT: "v2";
};
export declare const PAGINATION_CONSTANTS: {
    readonly DEFAULT_PAGE: 1;
    readonly DEFAULT_LIMIT: 20;
    readonly MAX_LIMIT: 100;
    readonly MIN_LIMIT: 1;
};
export declare const TIME_CONSTANTS: {
    readonly DEFAULT_ATTENDANCE_HISTORY_DAYS: 7;
    readonly MAX_ATTENDANCE_HISTORY_DAYS: 365;
    readonly DATE_FORMAT: "YYYY-MM-DD";
    readonly TIME_FORMAT: "HH:mm:ss";
    readonly DATETIME_FORMAT: "YYYY-MM-DDTHH:mm:ss.SSSZ";
};
export declare const SEARCH_CONSTANTS: {
    readonly MIN_SEARCH_LENGTH: 2;
    readonly MAX_SEARCH_LENGTH: 50;
    readonly DEFAULT_SEARCH_LIMIT: 10;
};
//# sourceMappingURL=api.constants.d.ts.map