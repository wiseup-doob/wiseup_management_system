"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDateRange = exports.getTodayString = exports.isValidTime = exports.isValidDate = exports.validateAttendanceRecord = exports.validateStudentData = exports.validatePaginationParams = exports.createPaginationMeta = exports.calculateAverageCheckOutTime = exports.calculateAverageCheckInTime = exports.calculateAttendanceRate = exports.buildAttendanceSearchQuery = exports.buildStudentSearchQuery = exports.isEarlyLeave = exports.isLate = exports.calculateAttendanceHours = exports.createAttendanceRecord = void 0;
const api_constants_1 = require("../constants/api.constants");
// ===== 출석 기록 유틸리티 =====
/**
 * 출석 기록 생성
 */
const createAttendanceRecord = (studentId, date, status, options = {}) => {
    const now = new Date().toISOString();
    return Object.assign({ id: `${studentId}_${date}`, studentId,
        date,
        status, timestamp: now, updatedAt: now, createdAt: now }, options);
};
exports.createAttendanceRecord = createAttendanceRecord;
/**
 * 출석 기록에서 시간 계산
 */
const calculateAttendanceHours = (checkInTime, checkOutTime) => {
    const parseTime = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours + minutes / 60;
    };
    const startTime = parseTime(checkInTime);
    const endTime = parseTime(checkOutTime);
    return Math.max(0, endTime - startTime);
};
exports.calculateAttendanceHours = calculateAttendanceHours;
/**
 * 지각 여부 확인
 */
const isLate = (checkInTime) => {
    const [hours, minutes] = checkInTime.split(':').map(Number);
    const lateThreshold = '09:15'; // 기본 지각 기준 시간
    const [lateHours, lateMinutes] = lateThreshold.split(':').map(Number);
    const checkInMinutes = hours * 60 + minutes;
    const lateThresholdMinutes = lateHours * 60 + lateMinutes;
    return checkInMinutes > lateThresholdMinutes;
};
exports.isLate = isLate;
/**
 * 조퇴 여부 확인
 */
const isEarlyLeave = (checkOutTime) => {
    const [hours, minutes] = checkOutTime.split(':').map(Number);
    const earlyLeaveThreshold = '16:00'; // 기본 조퇴 기준 시간
    const [earlyHours, earlyMinutes] = earlyLeaveThreshold.split(':').map(Number);
    const checkOutMinutes = hours * 60 + minutes;
    const earlyThresholdMinutes = earlyHours * 60 + earlyMinutes;
    return checkOutMinutes < earlyThresholdMinutes;
};
exports.isEarlyLeave = isEarlyLeave;
// ===== 검색 및 필터링 유틸리티 =====
/**
 * 학생 검색 조건 생성
 */
const buildStudentSearchQuery = (params) => {
    const query = {};
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
    if (params.seatNumber) {
        query.seatNumber = params.seatNumber;
    }
    return query;
};
exports.buildStudentSearchQuery = buildStudentSearchQuery;
/**
 * 출석 기록 검색 조건 생성
 */
const buildAttendanceSearchQuery = (params) => {
    const query = {};
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
exports.buildAttendanceSearchQuery = buildAttendanceSearchQuery;
// ===== 통계 계산 유틸리티 =====
/**
 * 출석률 계산
 */
const calculateAttendanceRate = (presentDays, totalDays) => {
    if (totalDays === 0)
        return 0;
    return Math.round((presentDays / totalDays) * 100) / 100;
};
exports.calculateAttendanceRate = calculateAttendanceRate;
/**
 * 평균 등원 시간 계산
 */
const calculateAverageCheckInTime = (records) => {
    const validRecords = records.filter(r => r.checkInTime);
    if (validRecords.length === 0)
        return '09:00'; // 기본 등원 시간
    const totalMinutes = validRecords.reduce((sum, record) => {
        const [hours, minutes] = record.checkInTime.split(':').map(Number);
        return sum + hours * 60 + minutes;
    }, 0);
    const averageMinutes = Math.round(totalMinutes / validRecords.length);
    const hours = Math.floor(averageMinutes / 60);
    const minutes = averageMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
exports.calculateAverageCheckInTime = calculateAverageCheckInTime;
/**
 * 평균 하원 시간 계산
 */
const calculateAverageCheckOutTime = (records) => {
    const validRecords = records.filter(r => r.checkOutTime);
    if (validRecords.length === 0)
        return '17:00'; // 기본 하원 시간
    const totalMinutes = validRecords.reduce((sum, record) => {
        const [hours, minutes] = record.checkOutTime.split(':').map(Number);
        return sum + hours * 60 + minutes;
    }, 0);
    const averageMinutes = Math.round(totalMinutes / validRecords.length);
    const hours = Math.floor(averageMinutes / 60);
    const minutes = averageMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
exports.calculateAverageCheckOutTime = calculateAverageCheckOutTime;
// ===== 페이지네이션 유틸리티 =====
/**
 * 페이지네이션 메타데이터 생성
 */
const createPaginationMeta = (total, page = api_constants_1.PAGINATION_CONSTANTS.DEFAULT_PAGE, limit = api_constants_1.PAGINATION_CONSTANTS.DEFAULT_LIMIT) => {
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
exports.createPaginationMeta = createPaginationMeta;
/**
 * 페이지네이션 파라미터 검증
 */
const validatePaginationParams = (page, limit) => {
    const validatedPage = Math.max(1, page || api_constants_1.PAGINATION_CONSTANTS.DEFAULT_PAGE);
    const validatedLimit = Math.min(Math.max(api_constants_1.PAGINATION_CONSTANTS.MIN_LIMIT, limit || api_constants_1.PAGINATION_CONSTANTS.DEFAULT_LIMIT), api_constants_1.PAGINATION_CONSTANTS.MAX_LIMIT);
    return { page: validatedPage, limit: validatedLimit };
};
exports.validatePaginationParams = validatePaginationParams;
// ===== 데이터 검증 유틸리티 =====
/**
 * 학생 데이터 검증
 */
const validateStudentData = (data) => {
    const errors = [];
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
exports.validateStudentData = validateStudentData;
/**
 * 출석 기록 데이터 검증
 */
const validateAttendanceRecord = (data) => {
    const errors = [];
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
exports.validateAttendanceRecord = validateAttendanceRecord;
// ===== 날짜 유틸리티 =====
/**
 * 날짜 형식 검증
 */
const isValidDate = (date) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date))
        return false;
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
};
exports.isValidDate = isValidDate;
/**
 * 시간 형식 검증
 */
const isValidTime = (time) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
};
exports.isValidTime = isValidTime;
/**
 * 오늘 날짜 문자열 반환
 */
const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
};
exports.getTodayString = getTodayString;
/**
 * 날짜 범위 생성
 */
const createDateRange = (startDate, endDate) => {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }
    return dates;
};
exports.createDateRange = createDateRange;
//# sourceMappingURL=database.utils.js.map