"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.STUDENT_MESSAGES = exports.STUDENT_CONSTANTS = void 0;
// 학생 관련 상수 정의
exports.STUDENT_CONSTANTS = {
    // 학생 상태
    STATUSES: {
        ACTIVE: 'active',
        INACTIVE: 'inactive'
    },
    // 학년 설정
    GRADES: {
        FIRST: '1학년',
        SECOND: '2학년',
        THIRD: '3학년'
    },
    // 반 설정
    CLASSES: {
        A: 'A반',
        B: 'B반',
        C: 'C반',
        D: 'D반'
    },
    // 좌석 번호
    SEAT: {
        MIN_NUMBER: 1,
        MAX_NUMBER: 48,
        DEFAULT_COUNT: 48
    },
    // 학생 이름 생성
    NAMES: {
        PREFIX: ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'],
        SUFFIX: ['철수', '영희', '민수', '지영', '준호', '수진', '현우', '미영', '동현', '서연']
    },
    // 검색 관련
    SEARCH: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 50,
        DEFAULT_LIMIT: 20
    },
    // 페이지네이션
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_SIZE: 20,
        MAX_SIZE: 100
    }
};
// 학생 관련 메시지
exports.STUDENT_MESSAGES = {
    SUCCESS: {
        CREATED: '학생이 성공적으로 생성되었습니다.',
        UPDATED: '학생 정보가 업데이트되었습니다.',
        DELETED: '학생이 삭제되었습니다.',
        RETRIEVED: '학생 정보를 성공적으로 조회했습니다.',
        INITIALIZED: '학생 데이터가 초기화되었습니다.'
    },
    ERROR: {
        NOT_FOUND: '학생을 찾을 수 없습니다.',
        DUPLICATE_SEAT: '이미 사용 중인 좌석 번호입니다.',
        INVALID_DATA: '유효하지 않은 학생 데이터입니다.',
        CREATE_FAILED: '학생 생성에 실패했습니다.',
        UPDATE_FAILED: '학생 정보 업데이트에 실패했습니다.',
        DELETE_FAILED: '학생 삭제에 실패했습니다.'
    },
    VALIDATION: {
        NAME_REQUIRED: '학생 이름은 필수입니다.',
        SEAT_NUMBER_REQUIRED: '좌석 번호는 필수입니다.',
        GRADE_REQUIRED: '학년은 필수입니다.',
        CLASS_REQUIRED: '반은 필수입니다.',
        INVALID_SEAT_NUMBER: '유효하지 않은 좌석 번호입니다.',
        NAME_TOO_LONG: '학생 이름이 너무 깁니다.',
        DUPLICATE_NAME: '이미 존재하는 학생 이름입니다.'
    }
};
//# sourceMappingURL=student.constants.js.map