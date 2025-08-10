// API 엔드포인트 상수 - RESTful 설계 원칙 적용
export const API_ENDPOINTS = {
    // 학생 관리 API
    STUDENTS: {
        // GET /api/students - 학생 목록 조회
        GET_ALL: '/api/students',
        // GET /api/students/:id - 개별 학생 조회
        GET_BY_ID: (id) => `/api/students/${id}`,
        // POST /api/students - 학생 생성
        CREATE: '/api/students',
        // PUT /api/students/:id - 학생 정보 수정
        UPDATE: (id) => `/api/students/${id}`,
        // DELETE /api/students/:id - 학생 삭제
        DELETE: (id) => `/api/students/${id}`,
        // GET /api/students/search - 학생 검색
        SEARCH: '/api/students/search',
        // POST /api/students/initialize - 학생 데이터 초기화
        INITIALIZE: '/api/students/initialize',
        // PUT /api/students/:studentId/attendance - 학생 출석 상태 업데이트
        UPDATE_ATTENDANCE: (studentId) => `/api/students/${studentId}/attendance`
    },
    // 시간표 관리 API
    TIMETABLE: {
        TIMETABLES: {
            GET_ALL: '/api/timetable/timetables',
            GET_BY_ID: (id) => `/api/timetable/timetables/${id}`,
            CREATE: '/api/timetable/timetables',
            UPDATE: (id) => `/api/timetable/timetables/${id}`,
            DELETE: (id) => `/api/timetable/timetables/${id}`,
            SUMMARY: (id) => `/api/timetable/timetables/${id}/summary`,
        },
        ITEMS: {
            GET_BY_TIMETABLE: (timetableId) => `/api/timetable/timetables/${timetableId}/items`,
            GET_BY_ID: (id) => `/api/timetable/timetable-items/${id}`,
            CREATE: '/api/timetable/timetable-items',
            UPDATE: (id) => `/api/timetable/timetable-items/${id}`,
            DELETE: (id) => `/api/timetable/timetable-items/${id}`,
        },
        TIME_SLOTS: {
            GET_ALL: '/api/timetable/time-slots',
            CREATE: '/api/timetable/time-slots',
        },
        CLASSES: {
            GET_ALL: '/api/timetable/classes',
            CREATE: '/api/timetable/classes',
        },
        TEACHERS: {
            GET_ALL: '/api/timetable/teachers',
            CREATE: '/api/timetable/teachers',
        },
        CLASSROOMS: {
            GET_ALL: '/api/timetable/classrooms',
            CREATE: '/api/timetable/classrooms',
        },
        STUDENTS: {
            GET_ITEMS: (studentId) => `/api/timetable/students/${studentId}/items`,
            ENSURE_TIMETABLE: (studentId) => `/api/timetable/students/${studentId}/timetable`,
        },
        INIT: {
            INITIALIZE: '/api/timetable/initialize',
            CLEAR: '/api/timetable/clear',
        },
    },
    // 출석 관리 API
    ATTENDANCE: {
        // GET /api/attendance/records - 출석 기록 조회
        GET_RECORDS: '/api/attendance/records',
        // GET /api/attendance/records/:id - 개별 출석 기록 조회
        GET_RECORD_BY_ID: (id) => `/api/attendance/records/${id}`,
        // POST /api/attendance/records - 출석 기록 생성
        CREATE_RECORD: '/api/attendance/records',
        // PUT /api/attendance/records/:id - 출석 기록 수정
        UPDATE_RECORD: (id) => `/api/attendance/records/${id}`,
        // DELETE /api/attendance/records/:id - 출석 기록 삭제
        DELETE_RECORD: (id) => `/api/attendance/records/${id}`,
        // GET /api/attendance/students/:studentId/records - 학생별 출석 기록
        GET_BY_STUDENT: (studentId) => `/api/attendance/students/${studentId}/records`,
        // GET /api/attendance/date/:date - 날짜별 출석 기록
        GET_BY_DATE: (date) => `/api/attendance/date/${date}`,
        // POST /api/attendance/bulk-update - 일괄 출석 업데이트
        BULK_UPDATE: '/api/attendance/bulk-update',
        // GET /api/attendance/stats - 출석 통계
        GET_STATS: '/api/attendance/stats',
        // POST /api/attendance/initialize - 출석 데이터 초기화
        INITIALIZE: '/api/attendance/initialize',
        // POST /api/attendance/initialize-today - 오늘 출석 데이터 초기화
        INITIALIZE_TODAY: '/api/attendance/initialize-today'
    },
    // 좌석 관리 API
    SEATS: {
        // GET /api/seats - 좌석 목록 조회
        GET_ALL: '/api/seats',
        // GET /api/seats/:seatId - 특정 좌석 조회
        GET_BY_ID: (seatId) => `/api/seats/${seatId}`,
        // GET /api/seats/student/:studentId - 학생 ID로 좌석 조회
        GET_BY_STUDENT: (studentId) => `/api/seats/student/${studentId}`,
        // GET /api/seats/stats - 좌석 통계
        GET_STATS: '/api/seats/stats',
        // POST /api/seats/assign - 학생 좌석 배정
        ASSIGN_STUDENT: '/api/seats/assign',
        // POST /api/seats/unassign - 학생 좌석 배정 해제
        UNASSIGN_STUDENT: '/api/seats/unassign',
        // PUT /api/seats/status - 좌석 상태 업데이트
        UPDATE_STATUS: '/api/seats/status',
        // POST /api/seats/initialize - 좌석 데이터 초기화
        INITIALIZE: '/api/seats/initialize'
    },
    // 초기화 API
    INITIALIZATION: {
        // POST /api/initialization/all - 모든 데이터 통합 초기화
        INITIALIZE_ALL: '/api/initialization/all'
    },
    // 일일 요약 API
    DAILY_SUMMARIES: {
        // GET /api/daily-summaries - 일일 요약 목록
        GET_ALL: '/api/daily-summaries',
        // GET /api/daily-summaries/:date - 특정 날짜 요약
        GET_BY_DATE: (date) => `/api/daily-summaries/${date}`,
        // POST /api/daily-summaries - 일일 요약 생성
        CREATE: '/api/daily-summaries',
        // PUT /api/daily-summaries/:date - 일일 요약 수정
        UPDATE: (date) => `/api/daily-summaries/${date}`
    },
    // 월간 보고서 API
    MONTHLY_REPORTS: {
        // GET /api/monthly-reports - 월간 보고서 목록
        GET_ALL: '/api/monthly-reports',
        // GET /api/monthly-reports/:year/:month - 특정 월 보고서
        GET_BY_MONTH: (year, month) => `/api/monthly-reports/${year}/${month}`,
        // POST /api/monthly-reports - 월간 보고서 생성
        CREATE: '/api/monthly-reports',
        // PUT /api/monthly-reports/:year/:month - 월간 보고서 수정
        UPDATE: (year, month) => `/api/monthly-reports/${year}/${month}`
    },
    // 시스템 관리 API
    SYSTEM: {
        // GET /api/health - 시스템 상태 확인
        HEALTH: '/api/health',
        // GET /api/version - API 버전 정보
        VERSION: '/api/version',
        // POST /api/initialize - 시스템 초기화
        INITIALIZE: '/api/initialize'
    }
};
// HTTP 메서드 상수
export const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH'
};
// HTTP 상태 코드 상수
export const HTTP_STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    SERVICE_UNAVAILABLE: 503
};
// API 버전 관리
export const API_VERSIONS = {
    CURRENT: 'v2'
};
// 페이지네이션 상수
export const PAGINATION_CONSTANTS = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1
};
// 시간 관련 상수
export const TIME_CONSTANTS = {
    DEFAULT_ATTENDANCE_HISTORY_DAYS: 7,
    MAX_ATTENDANCE_HISTORY_DAYS: 365,
    DATE_FORMAT: 'YYYY-MM-DD',
    TIME_FORMAT: 'HH:mm:ss',
    DATETIME_FORMAT: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
};
// 검색 관련 상수
export const SEARCH_CONSTANTS = {
    MIN_SEARCH_LENGTH: 2,
    MAX_SEARCH_LENGTH: 50,
    DEFAULT_SEARCH_LIMIT: 10
};
//# sourceMappingURL=api.constants.js.map