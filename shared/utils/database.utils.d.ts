import type { AttendanceRecord, StudentSearchParams, AttendanceSearchParams } from '../types/database.types';
import type { AttendanceStatus } from '../types/attendance.types';
/**
 * 출석 기록 생성
 */
export declare const createAttendanceRecord: (studentId: string, date: string, status: AttendanceStatus, options?: {
    checkInTime?: string;
    checkOutTime?: string;
    location?: string;
    notes?: string;
    updatedBy?: string;
}) => AttendanceRecord;
/**
 * 출석 기록에서 시간 계산
 */
export declare const calculateAttendanceHours: (checkInTime: string, checkOutTime: string) => number;
/**
 * 지각 여부 확인
 */
export declare const isLate: (checkInTime: string) => boolean;
/**
 * 조퇴 여부 확인
 */
export declare const isEarlyLeave: (checkOutTime: string) => boolean;
/**
 * 학생 검색 조건 생성
 */
export declare const buildStudentSearchQuery: (params: StudentSearchParams) => any;
/**
 * 출석 기록 검색 조건 생성
 */
export declare const buildAttendanceSearchQuery: (params: AttendanceSearchParams) => any;
/**
 * 출석률 계산
 */
export declare const calculateAttendanceRate: (presentDays: number, totalDays: number) => number;
/**
 * 평균 등원 시간 계산
 */
export declare const calculateAverageCheckInTime: (records: AttendanceRecord[]) => string;
/**
 * 평균 하원 시간 계산
 */
export declare const calculateAverageCheckOutTime: (records: AttendanceRecord[]) => string;
/**
 * 페이지네이션 메타데이터 생성
 */
export declare const createPaginationMeta: (total: number, page?: number, limit?: number) => {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};
/**
 * 페이지네이션 파라미터 검증
 */
export declare const validatePaginationParams: (page?: number, limit?: number) => {
    page: number;
    limit: number;
};
/**
 * 학생 데이터 검증
 */
export declare const validateStudentData: (data: Partial<any>) => string[];
/**
 * 출석 기록 데이터 검증
 */
export declare const validateAttendanceRecord: (data: Partial<AttendanceRecord>) => string[];
/**
 * 날짜 형식 검증
 */
export declare const isValidDate: (date: string) => boolean;
/**
 * 시간 형식 검증
 */
export declare const isValidTime: (time: string) => boolean;
/**
 * 오늘 날짜 문자열 반환
 */
export declare const getTodayString: () => string;
/**
 * 날짜 범위 생성
 */
export declare const createDateRange: (startDate: string, endDate: string) => string[];
