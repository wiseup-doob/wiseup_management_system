// 새로운 데이터베이스 구조를 위한 유틸리티 함수들
import type { 
  AttendanceRecord, 
  StudentSearchParams,
  AttendanceSearchParams
} from '../types/database.types';
import type { AttendanceStatus } from '../types/common.types';
import { PAGINATION_CONSTANTS } from '../constants/api.constants';

// ===== 출석 기록 유틸리티 =====

/**
 * 출석 기록 생성
 */
export const createAttendanceRecord = (
  studentId: string,
  date: string,
  status: AttendanceStatus,
  options: {
    checkInTime?: string;
    checkOutTime?: string;
    location?: string;
    notes?: string;
    updatedBy?: string;
  } = {}
): AttendanceRecord => {
  const now = new Date().toISOString();
  
  return {
    id: `${studentId}_${date}`,
    studentId,
    date,
    status,
    timestamp: now,
    updatedAt: now,
    createdAt: now,
    ...options,
  };
};

/**
 * 출석 기록에서 시간 계산
 */
export const calculateAttendanceHours = (
  checkInTime: string,
  checkOutTime: string
): number => {
  const parseTime = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  };

  const startTime = parseTime(checkInTime);
  const endTime = parseTime(checkOutTime);
  
  return Math.max(0, endTime - startTime);
};

/**
 * 지각 여부 확인
 */
export const isLate = (checkInTime: string): boolean => {
  const [hours, minutes] = checkInTime.split(':').map(Number);
  const lateThreshold = '09:15'; // 기본 지각 기준 시간
  const [lateHours, lateMinutes] = lateThreshold.split(':').map(Number);
  
  const checkInMinutes = hours * 60 + minutes;
  const lateThresholdMinutes = lateHours * 60 + lateMinutes;
  
  return checkInMinutes > lateThresholdMinutes;
};

/**
 * 조퇴 여부 확인
 */
export const isEarlyLeave = (checkOutTime: string): boolean => {
  const [hours, minutes] = checkOutTime.split(':').map(Number);
  const earlyLeaveThreshold = '16:00'; // 기본 조퇴 기준 시간
  const [earlyHours, earlyMinutes] = earlyLeaveThreshold.split(':').map(Number);
  
  const checkOutMinutes = hours * 60 + minutes;
  const earlyThresholdMinutes = earlyHours * 60 + earlyMinutes;
  
  return checkOutMinutes < earlyThresholdMinutes;
};

// ===== 검색 및 필터링 유틸리티 =====

/**
 * 학생 검색 조건 생성
 */
export const buildStudentSearchQuery = (params: StudentSearchParams) => {
  const query: any = {};
  
  // 학생 검색 조건 처리
  if (params.name) {
    query.name = params.name;
  }
  
  if (params.grade) {
    query.grade = params.grade;
  }
  
  if (params.className) {
    query.className = params.className;
  }
  
  if (params.status) {
    query.status = params.status;
  }
  
  if (params.enrollmentDateRange) {
    query.enrollmentDateRange = params.enrollmentDateRange;
  }
  
  return query;
};

/**
 * 출석 기록 검색 조건 생성
 */
export const buildAttendanceSearchQuery = (params: AttendanceSearchParams) => {
  const query: any = {};
  
  if (params.studentId) {
    query.studentId = params.studentId;
  }
  if (params.date) {
    query.date = params.date;
  }
  if (params.startDate) {
    query.date = { $gte: params.startDate };
  }
  if (params.endDate) {
    query.date = { $lte: params.endDate };
  }
  if (params.status) {
    query.status = params.status;
  }
  
  return query;
};

// ===== 통계 계산 유틸리티 =====

/**
 * 출석률 계산
 */
export const calculateAttendanceRate = (
  presentDays: number,
  totalDays: number
): number => {
  if (totalDays === 0) return 0;
  return Math.round((presentDays / totalDays) * 100) / 100;
};

/**
 * 평균 등원 시간 계산
 */
export const calculateAverageCheckInTime = (records: AttendanceRecord[]): string => {
  const validRecords = records.filter(r => r.checkInTime);
  
  if (validRecords.length === 0) return '09:00'; // 기본 등원 시간
  
  const totalMinutes = validRecords.reduce((sum, record) => {
    const [hours, minutes] = record.checkInTime!.split(':').map(Number);
    return sum + hours * 60 + minutes;
  }, 0);
  
  const averageMinutes = Math.round(totalMinutes / validRecords.length);
  const hours = Math.floor(averageMinutes / 60);
  const minutes = averageMinutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * 평균 하원 시간 계산
 */
export const calculateAverageCheckOutTime = (records: AttendanceRecord[]): string => {
  const validRecords = records.filter(r => r.checkOutTime);
  
  if (validRecords.length === 0) return '17:00'; // 기본 하원 시간
  
  const totalMinutes = validRecords.reduce((sum, record) => {
    const [hours, minutes] = record.checkOutTime!.split(':').map(Number);
    return sum + hours * 60 + minutes;
  }, 0);
  
  const averageMinutes = Math.round(totalMinutes / validRecords.length);
  const hours = Math.floor(averageMinutes / 60);
  const minutes = averageMinutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// ===== 페이지네이션 유틸리티 =====

/**
 * 페이지네이션 메타데이터 생성
 */
export const createPaginationMeta = (
  total: number,
  page: number = PAGINATION_CONSTANTS.DEFAULT_PAGE,
  limit: number = PAGINATION_CONSTANTS.DEFAULT_LIMIT
) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * 페이지네이션 파라미터 검증
 */
export const validatePaginationParams = (
  page?: number,
  limit?: number
): { page: number; limit: number } => {
  const validatedPage = Math.max(1, page || PAGINATION_CONSTANTS.DEFAULT_PAGE);
  const validatedLimit = Math.min(
    Math.max(PAGINATION_CONSTANTS.MIN_LIMIT, limit || PAGINATION_CONSTANTS.DEFAULT_LIMIT),
    PAGINATION_CONSTANTS.MAX_LIMIT
  );
  
  return { page: validatedPage, limit: validatedLimit };
};

// ===== 데이터 검증 유틸리티 =====

/**
 * 학생 데이터 검증
 */
export const validateStudentData = (data: Partial<any>): string[] => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push('학생 이름은 필수입니다.');
  }
  
  if (!data.grade || data.grade.trim().length === 0) {
    errors.push('학년은 필수입니다.');
  }
  
  if (!data.className || data.className.trim().length === 0) {
    errors.push('반은 필수입니다.');
  }
  
  if (data.seatNumber === undefined || data.seatNumber < 1) {
    errors.push('좌석 번호는 1 이상이어야 합니다.');
  }
  
  return errors;
};

/**
 * 출석 기록 데이터 검증
 */
export const validateAttendanceRecord = (data: Partial<AttendanceRecord>): string[] => {
  const errors: string[] = [];
  
  if (!data.studentId) {
    errors.push('학생 ID는 필수입니다.');
  }
  
  if (!data.date) {
    errors.push('날짜는 필수입니다.');
  }
  
  if (!data.status) {
    errors.push('출석 상태는 필수입니다.');
  }
  
  // 시간 형식 검증
  if (data.checkInTime && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.checkInTime)) {
    errors.push('등원 시간 형식이 올바르지 않습니다. (HH:MM)');
  }
  
  if (data.checkOutTime && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(data.checkOutTime)) {
    errors.push('하원 시간 형식이 올바르지 않습니다. (HH:MM)');
  }
  
  return errors;
};

// ===== 날짜 유틸리티 =====

/**
 * 날짜 형식 검증
 */
export const isValidDate = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
};

/**
 * 시간 형식 검증
 */
export const isValidTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

/**
 * 오늘 날짜 문자열 반환
 */
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * 날짜 범위 생성
 */
export const createDateRange = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}; 