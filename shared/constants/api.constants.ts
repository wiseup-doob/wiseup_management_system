// API 엔드포인트 상수 - 백엔드 실제 라우트와 일치
export const API_ENDPOINTS = {
  // 학생 관리 API
  STUDENTS: {
    // GET /api/students - 학생 목록 조회
    GET_ALL: '/api/students',
    // GET /api/students/:id - 개별 학생 조회
    GET_BY_ID: (id: string) => `/api/students/${id}`,
    // POST /api/students - 학생 생성
    CREATE: '/api/students',
    // PUT /api/students/:id - 학생 정보 수정
    UPDATE: (id: string) => `/api/students/${id}`,
    // DELETE /api/students/:id - 학생 삭제
    DELETE: (id: string) => `/api/students/${id}`,
    // GET /api/students/search - 학생 검색
    SEARCH: '/api/students/search',
    // GET /api/students/count/grade - 학년별 학생 수
    COUNT_BY_GRADE: '/api/students/count/grade',
    // GET /api/students/count/active - 활성 학생 수
    COUNT_ACTIVE: '/api/students/count/active',
    
    // api.ts에서 사용하는 추가 속성
    UPDATE_ATTENDANCE: (studentId: string) => `/api/attendance/student/${studentId}`,  // ATTENDANCE 경로 사용
    
    // 학생 계층적 삭제 API
    // GET /api/students/:id/dependencies - 학생 의존성 확인
    GET_DEPENDENCIES: (id: string) => `/api/students/${id}/dependencies`,
    // DELETE /api/students/:id/hierarchical - 학생 계층적 삭제
    DELETE_HIERARCHICALLY: (id: string) => `/api/students/${id}/hierarchical`
  },

  // 부모 관리 API
  PARENTS: {
    // GET /api/parents - 부모 목록 조회
    GET_ALL: '/api/parents',
    // GET /api/parents/:id - 개별 부모 조회
    GET_BY_ID: (id: string) => `/api/parents/${id}`,
    // POST /api/parents - 부모 생성
    CREATE: '/api/parents',
    // PUT /api/parents/:id - 부모 정보 수정
    UPDATE: (id: string) => `/api/parents/${id}`,
    // DELETE /api/parents/:id - 부모 삭제
    DELETE: (id: string) => `/api/parents/${id}`,
    // GET /api/parents/search - 부모 검색
    SEARCH: '/api/parents/search',
    // GET /api/parents/stats - 부모 통계
    GET_STATS: '/api/parents/stats'
  },

  // 학생 요약 정보 API
  STUDENT_SUMMARIES: {
    // GET /api/student-summaries - 학생 요약 정보 목록
    GET_ALL: '/api/student-summaries',
    // GET /api/student-summaries/:id - 개별 학생 요약 정보
    GET_BY_ID: (id: string) => `/api/student-summaries/${id}`,
    // POST /api/student-summaries - 학생 요약 정보 생성
    CREATE: '/api/student-summaries',
    // PUT /api/student-summaries/:id - 학생 요약 정보 수정
    UPDATE: (id: string) => `/api/student-summaries/${id}`,
    // DELETE /api/student-summaries/:id - 학생 요약 정보 삭제
    DELETE: (id: string) => `/api/student-summaries/${id}`,
    // GET /api/student-summaries/search - 학생 요약 정보 검색
    SEARCH: '/api/student-summaries/search',
    // GET /api/student-summaries/stats - 학생 요약 정보 통계
    GET_STATS: '/api/student-summaries/stats'
  },

  // 출석 관리 API
  ATTENDANCE: {
    // GET /api/attendance - 출석 기록 목록
    GET_ALL: '/api/attendance',
    // GET /api/attendance/:id - 개별 출석 기록 조회
    GET_BY_ID: (id: string) => `/api/attendance/${id}`,
    // POST /api/attendance - 출석 기록 생성
    CREATE: '/api/attendance',
    // PUT /api/attendance/:id - 출석 기록 수정
    UPDATE: (id: string) => `/api/attendance/${id}`,
    // DELETE /api/attendance/:id - 출석 기록 삭제
    DELETE: (id: string) => `/api/attendance/${id}`,
    // GET /api/attendance/search - 출석 기록 검색
    SEARCH: '/api/attendance/search',
    // GET /api/attendance/student/:studentId - 학생별 출석 기록
    GET_BY_STUDENT: (studentId: string) => `/api/attendance/student/${studentId}`,
    // GET /api/attendance/date/:date - 날짜별 출석 기록
    GET_BY_DATE: (date: string) => `/api/attendance/date/${date}`,
    // GET /api/attendance/date-range - 날짜 범위별 출석 기록
    GET_BY_DATE_RANGE: '/api/attendance/date-range',
    // GET /api/attendance/statistics/student/:studentId - 학생별 출석 통계
    GET_STUDENT_STATISTICS: (studentId: string) => `/api/attendance/statistics/student/${studentId}`,
    // GET /api/attendance/summary/daily/:date - 일별 출석 현황 요약
    GET_DAILY_SUMMARY: (date: string) => `/api/attendance/summary/daily/${date}`,
    // GET /api/attendance/statistics/monthly/:year/:month - 월별 출석 통계
    GET_MONTHLY_STATISTICS: (year: string, month: string) => `/api/attendance/statistics/monthly/${year}/${month}`,
    // GET /api/attendance/statistics/by-status - 출석 상태별 통계
    GET_STATUS_STATISTICS: '/api/attendance/statistics/by-status',
    // GET /api/attendance/issues - 지각/조퇴 학생 목록
    GET_ISSUES: '/api/attendance/issues',
    // POST /api/attendance/bulk - 일괄 출석 기록 생성
    CREATE_BULK: '/api/attendance/bulk',
    // POST /api/attendance/copy - 출석 기록 복사
    COPY: '/api/attendance/copy',
    
    // api.ts에서 사용하는 추가 속성들 (기존 속성과 동일한 경로)
    GET_RECORDS: '/api/attendance',                                    // GET_ALL과 동일
    GET_RECORD_BY_ID: (id: string) => `/api/attendance/${id}`,         // GET_BY_ID와 동일
    CREATE_RECORD: '/api/attendance',                                  // CREATE와 동일
    UPDATE_RECORD: (id: string) => `/api/attendance/${id}`,            // UPDATE와 동일
    DELETE_RECORD: (id: string) => `/api/attendance/${id}`,            // DELETE와 동일
    GET_STATS: '/api/attendance/statistics/by-status',                 // GET_STATUS_STATISTICS와 동일
    BULK_UPDATE: '/api/attendance/bulk'                                // CREATE_BULK와 동일
  },

  // 강의 관리 API
  COURSES: {
    // GET /api/courses - 강의 목록 조회
    GET_ALL: '/api/courses',
    // GET /api/courses/:id - 개별 강의 조회
    GET_BY_ID: (id: string) => `/api/courses/${id}`,
    // POST /api/courses - 강의 생성
    CREATE: '/api/courses',
    // PUT /api/courses/:id - 강의 수정
    UPDATE: (id: string) => `/api/courses/${id}`,
    // DELETE /api/courses/:id - 강의 삭제
    DELETE: (id: string) => `/api/courses/${id}`,
    // GET /api/courses/search - 강의 검색
    SEARCH: '/api/courses/search',
    // GET /api/courses/stats - 강의 통계
    GET_STATS: '/api/courses/stats'
  },

  // 수업 관리 API
  CLASS_SECTIONS: {
    // GET /api/class-sections - 수업 목록 조회
    GET_ALL: '/api/class-sections',
    // GET /api/class-sections/:id - 개별 수업 조회
    GET_BY_ID: (id: string) => `/api/class-sections/${id}`,
    // POST /api/class-sections - 수업 생성
    CREATE: '/api/class-sections',
    // POST /api/class-sections/create-with-course - Course와 수업을 한번에 생성
    CREATE_WITH_COURSE: '/api/class-sections/create-with-course',
    // PUT /api/class-sections/:id - 수업 수정
    UPDATE: (id: string) => `/api/class-sections/${id}`,
    // DELETE /api/class-sections/:id - 수업 삭제
    DELETE: (id: string) => `/api/class-sections/${id}`,
    // GET /api/class-sections/search - 수업 검색
    SEARCH: '/api/class-sections/search',
    // GET /api/class-sections/teacher/:teacherId - 교사별 수업
    GET_BY_TEACHER: (teacherId: string) => `/api/class-sections/teacher/${teacherId}`,
    // GET /api/class-sections/course/:courseId - 강의별 수업
    GET_BY_COURSE: (courseId: string) => `/api/class-sections/course/${courseId}`,
    // GET /api/class-sections/classroom/:classroomId - 교실별 수업
    GET_BY_CLASSROOM: (classroomId: string) => `/api/class-sections/classroom/${classroomId}`,
    // GET /api/class-sections/stats - 수업 통계
    GET_STATS: '/api/class-sections/stats',
    // GET /api/class-sections/:id/dependencies - 수업 의존성 확인
    GET_DEPENDENCIES: (id: string) => `/api/class-sections/${id}/dependencies`,
    // DELETE /api/class-sections/:id/hierarchical - 수업 계층적 삭제
    DELETE_HIERARCHICALLY: (id: string) => `/api/class-sections/${id}/hierarchical`,
    // POST /api/class-sections/:id/students - 수업에 학생 추가
    ADD_STUDENT: (classSectionId: string, studentId: string) => `/api/class-sections/${classSectionId}/students/${studentId}`,
    // DELETE /api/class-sections/:id/students/:studentId - 수업에서 학생 제거
    REMOVE_STUDENT: (classSectionId: string, studentId: string) => `/api/class-sections/${classSectionId}/students/${studentId}`,
    // GET /api/class-sections/:id/students - 수업에 등록된 학생 목록 조회
    GET_ENROLLED_STUDENTS: (classSectionId: string) => `/api/class-sections/${classSectionId}/students`
  },

  // 학생 시간표 관리 API
  STUDENT_TIMETABLES: {
    // GET /api/student-timetables - 학생 시간표 목록
    GET_ALL: '/api/student-timetables',
    // GET /api/student-timetables/:id - 개별 학생 시간표
    GET_BY_ID: (id: string) => `/api/student-timetables/${id}`,
    // POST /api/student-timetables - 학생 시간표 생성
    CREATE: '/api/student-timetables',
    // PUT /api/student-timetables/:id - 학생 시간표 수정
    UPDATE: (id: string) => `/api/student-timetables/${id}`,
    // DELETE /api/student-timetables/:id - 학생 시간표 삭제
    DELETE: (id: string) => `/api/student-timetables/${id}`,
    // GET /api/student-timetables/student/:studentId - 학생별 시간표
    GET_BY_STUDENT: (studentId: string) => `/api/student-timetables/student/${studentId}`,
    // POST /api/student-timetables/student/:studentId/add-class - 수업 추가
    ADD_CLASS: (studentId: string) => `/api/student-timetables/student/${studentId}/add-class`,
    // POST /api/student-timetables/student/:studentId/remove-class - 수업 제거
    REMOVE_CLASS: (studentId: string) => `/api/student-timetables/student/${studentId}/remove-class`
  },

  // 시간표 관리 API
  TIMETABLES: {
    // GET /api/timetables - 시간표 목록 조회
    GET_ALL: '/api/timetables',
    // GET /api/timetables/:id - 개별 시간표 조회
    GET_BY_ID: (id: string) => `/api/timetables/${id}`,
    // POST /api/timetables - 시간표 생성
    CREATE: '/api/timetables',
    // PUT /api/timetables/:id - 시간표 수정
    UPDATE: (id: string) => `/api/timetables/${id}`,
    // DELETE /api/timetables/:id - 시간표 삭제
    DELETE: (id: string) => `/api/timetables/${id}`,
    // GET /api/timetables/search - 시간표 검색
    SEARCH: '/api/timetables/search',
    // GET /api/timetables/stats - 시간표 통계
    GET_STATS: '/api/timetables/stats'
  },

  // 시간표 항목 관리 API
  TIMETABLE_ITEMS: {
    // GET /api/timetable-items - 시간표 항목 목록 조회
    GET_ALL: '/api/timetable-items',
    // GET /api/timetable-items/:id - 개별 시간표 항목 조회
    GET_BY_ID: (id: string) => `/api/timetable-items/${id}`,
    // POST /api/timetable-items - 시간표 항목 생성
    CREATE: '/api/timetable-items',
    // PUT /api/timetable-items/:id - 시간표 항목 수정
    UPDATE: (id: string) => `/api/timetable-items/${id}`,
    // DELETE /api/timetable-items/:id - 시간표 항목 삭제
    DELETE: (id: string) => `/api/timetable-items/${id}`,
    // GET /api/timetable-items/timetable/:timetableId - 시간표별 항목 조회
    GET_BY_TIMETABLE: (timetableId: string) => `/api/timetable-items/timetable/${timetableId}`,
    // GET /api/timetable-items/search - 시간표 항목 검색
    SEARCH: '/api/timetable-items/search',
    // GET /api/timetable-items/stats - 시간표 항목 통계
    GET_STATS: '/api/timetable-items/stats'
  },

  // 교사 관리 API
  TEACHERS: {
    // GET /api/teachers - 교사 목록 조회
    GET_ALL: '/api/teachers',
    // GET /api/teachers/:id - 개별 교사 조회
    GET_BY_ID: (id: string) => `/api/teachers/${id}`,
    // POST /api/teachers - 교사 생성
    CREATE: '/api/teachers',
    // PUT /api/teachers/:id - 교사 수정
    UPDATE: (id: string) => `/api/teachers/${id}`,
    // DELETE /api/teachers/:id - 교사 삭제
    DELETE: (id: string) => `/api/teachers/${id}`,
    // GET /api/teachers/search - 교사 검색
    SEARCH: '/api/teachers/search',
    // GET /api/teachers/stats - 교사 통계
    GET_STATS: '/api/teachers/stats',
    // GET /api/teachers/:id/dependencies - 교사 의존성 확인
    GET_DEPENDENCIES: (id: string) => `/api/teachers/${id}/dependencies`,
    // DELETE /api/teachers/:id/hierarchical - 교사 계층적 삭제
    DELETE_HIERARCHICALLY: (id: string) => `/api/teachers/${id}/hierarchical`
  },

  // 교실 관리 API
  CLASSROOMS: {
    // GET /api/classrooms - 교실 목록 조회
    GET_ALL: '/api/classrooms',
    // GET /api/classrooms/:id - 개별 교실 조회
    GET_BY_ID: (id: string) => `/api/classrooms/${id}`,
    // POST /api/classrooms - 교실 생성
    CREATE: '/api/classrooms',
    // PUT /api/classrooms/:id - 교실 수정
    UPDATE: (id: string) => `/api/classrooms/${id}`,
    // DELETE /api/classrooms/:id - 교실 삭제
    DELETE: (id: string) => `/api/classrooms/${id}`,
    // GET /api/classrooms/search - 교실 검색
    SEARCH: '/api/classrooms/search',
    // GET /api/classrooms/stats - 교실 통계
    GET_STATS: '/api/classrooms/stats',
    // GET /api/classrooms/:id/dependencies - 강의실 의존성 확인
    GET_DEPENDENCIES: (id: string) => `/api/classrooms/${id}/dependencies`,
    // DELETE /api/classrooms/:id/hierarchical - 강의실 계층적 삭제
    DELETE_HIERARCHICALLY: (id: string) => `/api/classrooms/${id}/hierarchical`
  },

  // 시간대 관리 API
  TIME_SLOTS: {
    // GET /api/time-slots - 시간대 목록 조회
    GET_ALL: '/api/time-slots',
    // GET /api/time-slots/:id - 개별 시간대 조회
    GET_BY_ID: (id: string) => `/api/time-slots/${id}`,
    // POST /api/time-slots - 시간대 생성
    CREATE: '/api/time-slots',
    // PUT /api/time-slots/:id - 시간대 수정
    UPDATE: (id: string) => `/api/time-slots/${id}`,
    // DELETE /api/time-slots/:id - 시간대 삭제
    DELETE: (id: string) => `/api/time-slots/${id}`,
    // GET /api/time-slots/order/sorted - 순서별 정렬된 시간대
    GET_BY_ORDER: '/api/time-slots/order/sorted',
    // GET /api/time-slots/type/class - 수업 시간대
    GET_CLASS_TIME_SLOTS: '/api/time-slots/type/class',
    // GET /api/time-slots/type/break - 쉬는 시간대
    GET_BREAK_TIME_SLOTS: '/api/time-slots/type/break',
    // GET /api/time-slots/search/query - 시간대 검색
    SEARCH: '/api/time-slots/search/query',
    // GET /api/time-slots/stats/overview - 시간대 통계
    GET_STATS: '/api/time-slots/stats/overview',
    // POST /api/time-slots/order/reorder - 시간대 순서 재정렬
    REORDER: '/api/time-slots/order/reorder'
  },

  // 좌석 관리 API
  SEATS: {
    // GET /api/seats - 좌석 목록 조회
    GET_ALL: '/api/seats',
    // GET /api/seats/:id - 개별 좌석 조회
    GET_BY_ID: (id: string) => `/api/seats/${id}`,
    // POST /api/seats - 좌석 생성
    CREATE: '/api/seats',
    // PUT /api/seats/:id - 좌석 수정
    UPDATE: (id: string) => `/api/seats/${id}`,
    // DELETE /api/seats/:id - 좌석 삭제
    DELETE: (id: string) => `/api/seats/${id}`,
    // GET /api/seats/status/active - 활성 좌석만 조회
    GET_ACTIVE: '/api/seats/status/active',
    // GET /api/seats/status/available - 사용 가능한 좌석만 조회
    GET_AVAILABLE: '/api/seats/status/available',
    // GET /api/seats/order/by-number - 번호순 정렬된 좌석
    GET_BY_NUMBER: '/api/seats/order/by-number',
    // GET /api/seats/status/:status - 특정 상태의 좌석
    GET_BY_STATUS: (status: string) => `/api/seats/status/${status}`,
    // GET /api/seats/search/query - 좌석 검색
    SEARCH: '/api/seats/search/query',
    // GET /api/seats/stats/overview - 좌석 통계
    GET_STATS: '/api/seats/stats/overview',
    // PATCH /api/seats/:id/status - 좌석 상태 변경
    UPDATE_STATUS: (id: string) => `/api/seats/${id}/status`,
    // PATCH /api/seats/:id/active - 좌석 활성화/비활성화
    TOGGLE_ACTIVE: (id: string) => `/api/seats/${id}/active`,
    // GET /api/seats/next/available-number - 다음 사용 가능한 좌석 번호
    GET_NEXT_AVAILABLE_NUMBER: '/api/seats/next/available-number',
    // POST /api/seats/batch/create - 여러 좌석 일괄 생성
    CREATE_BATCH: '/api/seats/batch/create',
    // POST /api/seats/batch/deactivate - 여러 좌석 일괄 비활성화
    DEACTIVATE_BATCH: '/api/seats/batch/deactivate',
    
    // api.ts에서 사용하는 추가 속성
    GET_BY_STUDENT: (studentId: string) => `/api/seat-assignments/student/${studentId}`  // SEAT_ASSIGNMENTS 경로 사용
  },

  // 좌석 배정 관리 API
  SEAT_ASSIGNMENTS: {
    // GET /api/seat-assignments - 좌석 배정 목록
    GET_ALL: '/api/seat-assignments',
    // GET /api/seat-assignments/:id - 개별 좌석 배정 조회
    GET_BY_ID: (id: string) => `/api/seat-assignments/${id}`,
    // POST /api/seat-assignments - 좌석 배정 생성
    CREATE: '/api/seat-assignments',
    // PUT /api/seat-assignments/:id - 좌석 배정 수정
    UPDATE: (id: string) => `/api/seat-assignments/${id}`,
    // DELETE /api/seat-assignments/:id - 좌석 배정 삭제
    DELETE: (id: string) => `/api/seat-assignments/${id}`,
    // GET /api/seat-assignments/status/active - 활성 좌석 배정만 조회
    GET_ACTIVE: '/api/seat-assignments/status/active',
    // GET /api/seat-assignments/seat/:seatId - 특정 좌석의 배정 조회
    GET_BY_SEAT: (seatId: string) => `/api/seat-assignments/seat/${seatId}`,
    // GET /api/seat-assignments/student/:studentId - 특정 학생의 좌석 배정 조회
    GET_BY_STUDENT: (studentId: string) => `/api/seat-assignments/student/${studentId}`,
    // GET /api/seat-assignments/date/:date - 특정 날짜의 좌석 배정 조회
    GET_BY_DATE: (date: string) => `/api/seat-assignments/date/${date}`,
    // GET /api/seat-assignments/search/query - 좌석 배정 검색
    SEARCH: '/api/seat-assignments/search/query',
    // GET /api/seat-assignments/stats/overview - 좌석 배정 통계
    GET_STATS: '/api/seat-assignments/stats/overview',
    // PATCH /api/seat-assignments/:id/status - 좌석 배정 상태 변경
    UPDATE_STATUS: (id: string) => `/api/seat-assignments/${id}/status`,
    // POST /api/seat-assignments/:id/release - 좌석 배정 해제
    RELEASE: (id: string) => `/api/seat-assignments/${id}/release`,
    // GET /api/seat-assignments/student/:studentId/current - 학생의 현재 활성 좌석 배정 조회
    GET_CURRENT_BY_STUDENT: (studentId: string) => `/api/seat-assignments/student/${studentId}/current`,
    // GET /api/seat-assignments/seat/:seatId/current - 좌석의 현재 활성 배정 조회
    GET_CURRENT_BY_SEAT: (seatId: string) => `/api/seat-assignments/seat/${seatId}/current`,
    // GET /api/seat-assignments/student/:studentId/history - 학생의 좌석 배정 기록 조회
    GET_HISTORY_BY_STUDENT: (studentId: string) => `/api/seat-assignments/student/${studentId}/history`,
    // GET /api/seat-assignments/seat/:seatId/history - 좌석의 배정 기록 조회
    GET_HISTORY_BY_SEAT: (seatId: string) => `/api/seat-assignments/seat/${seatId}/history`
  },

  // 테스트 데이터 초기화 API
  TEST_DATA: {
    // POST /api/test-data/initialize - 전체 테스트 데이터 초기화
    INITIALIZE_ALL: '/api/test-data/initialize',
    // POST /api/test-data/students - 학생 테스트 데이터 초기화
    INITIALIZE_STUDENTS: '/api/test-data/students',
    // POST /api/test-data/teachers - 교사 테스트 데이터 초기화
    INITIALIZE_TEACHERS: '/api/test-data/teachers',
    // DELETE /api/test-data/students - 학생 테스트 데이터 삭제
    CLEAR_STUDENTS: '/api/test-data/students',
    // DELETE /api/test-data/teachers - 교사 테스트 데이터 삭제
    CLEAR_TEACHERS: '/api/test-data/teachers',
    // DELETE /api/test-data/all - 전체 테스트 데이터 삭제
    CLEAR_ALL: '/api/test-data/all',
    // GET /api/test-data/status - 테스트 데이터 상태 확인
    GET_STATUS: '/api/test-data/status'
  },

  // 시스템 관리 API
  SYSTEM: {
    // GET / - 시스템 기본 정보
    ROOT: '/',
    // GET /api/health - 시스템 상태 확인
    HEALTH: '/api/health',
    // GET /api/version - API 버전 정보
    VERSION: '/api/version'
  }
};

// HTTP 메서드 상수
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
} as const;

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
} as const;

// API 버전 관리
export const API_VERSIONS = {
  CURRENT: 'v2'
} as const;

// 페이지네이션 상수
export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
} as const;

// 시간 관련 상수
export const TIME_CONSTANTS = {
  DEFAULT_ATTENDANCE_HISTORY_DAYS: 7,
  MAX_ATTENDANCE_HISTORY_DAYS: 365,
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm:ss',
  DATETIME_FORMAT: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
} as const;

// 검색 관련 상수
export const SEARCH_CONSTANTS = {
  MIN_SEARCH_LENGTH: 2,
  MAX_SEARCH_LENGTH: 50,
  DEFAULT_SEARCH_LIMIT: 10
} as const; 