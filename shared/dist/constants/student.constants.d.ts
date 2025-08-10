export declare const STUDENT_CONSTANTS: {
    readonly STATUSES: {
        readonly ACTIVE: "active";
        readonly INACTIVE: "inactive";
    };
    readonly GRADES: {
        readonly FIRST: "1학년";
        readonly SECOND: "2학년";
        readonly THIRD: "3학년";
    };
    readonly CLASSES: {
        readonly A: "A반";
        readonly B: "B반";
        readonly C: "C반";
        readonly D: "D반";
    };
    readonly SEAT: {
        readonly MIN_NUMBER: 1;
        readonly MAX_NUMBER: 48;
        readonly DEFAULT_COUNT: 48;
    };
    readonly NAMES: {
        readonly PREFIX: readonly ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임"];
        readonly SUFFIX: readonly ["철수", "영희", "민수", "지영", "준호", "수진", "현우", "미영", "동현", "서연"];
    };
    readonly SEARCH: {
        readonly MIN_LENGTH: 1;
        readonly MAX_LENGTH: 50;
        readonly DEFAULT_LIMIT: 20;
    };
    readonly PAGINATION: {
        readonly DEFAULT_PAGE: 1;
        readonly DEFAULT_SIZE: 20;
        readonly MAX_SIZE: 100;
    };
};
export declare const STUDENT_MESSAGES: {
    readonly SUCCESS: {
        readonly CREATED: "학생이 성공적으로 생성되었습니다.";
        readonly UPDATED: "학생 정보가 업데이트되었습니다.";
        readonly DELETED: "학생이 삭제되었습니다.";
        readonly RETRIEVED: "학생 정보를 성공적으로 조회했습니다.";
        readonly INITIALIZED: "학생 데이터가 초기화되었습니다.";
    };
    readonly ERROR: {
        readonly NOT_FOUND: "학생을 찾을 수 없습니다.";
        readonly DUPLICATE_SEAT: "이미 사용 중인 좌석 번호입니다.";
        readonly INVALID_DATA: "유효하지 않은 학생 데이터입니다.";
        readonly CREATE_FAILED: "학생 생성에 실패했습니다.";
        readonly UPDATE_FAILED: "학생 정보 업데이트에 실패했습니다.";
        readonly DELETE_FAILED: "학생 삭제에 실패했습니다.";
    };
    readonly VALIDATION: {
        readonly NAME_REQUIRED: "학생 이름은 필수입니다.";
        readonly SEAT_NUMBER_REQUIRED: "좌석 번호는 필수입니다.";
        readonly GRADE_REQUIRED: "학년은 필수입니다.";
        readonly CLASS_REQUIRED: "반은 필수입니다.";
        readonly INVALID_SEAT_NUMBER: "유효하지 않은 좌석 번호입니다.";
        readonly NAME_TOO_LONG: "학생 이름이 너무 깁니다.";
        readonly DUPLICATE_NAME: "이미 존재하는 학생 이름입니다.";
    };
};
//# sourceMappingURL=student.constants.d.ts.map