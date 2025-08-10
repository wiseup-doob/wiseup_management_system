// 출석 관련 타입 정의
import type { AttendanceRecord as NewAttendanceRecord } from './database.types';
import type { DateString, TimeString, DateTimeString, AttendanceStatus } from './common.types';

// ===== 기존 AttendanceRecord 타입 (하위 호환성) =====
// AttendanceStatus는 common.types.ts에서 import됨

export interface AttendanceRecord {
  date: DateString; // 날짜 형식
  status: AttendanceStatus;
  timestamp: DateTimeString; // ISO 8601 형식
  updatedBy?: string; // 업데이트한 사용자 ID
  // 등원 시간 정보 추가
  checkInTime?: TimeString; // 등원 시작 시간
  checkOutTime?: TimeString; // 하원 시간
  totalHours?: number; // 총 등원 시간 (시간 단위)
  notes?: string; // 추가 메모
}

// ===== 새로운 AttendanceRecord 타입 (개선된 구조) =====
export type { AttendanceRecord as AttendanceRecordV2 } from './database.types';

// ===== 기존 타입들 (하위 호환성) =====
export interface AttendanceTimeRecord {
  date: DateString; // 날짜 형식
  studentId: string;
  checkInTime: TimeString; // 등원 시작 시간
  checkOutTime?: TimeString; // 하원 시간, 하원하지 않은 경우 undefined
  totalHours?: number; // 총 등원 시간 (시간 단위)
  status: AttendanceStatus;
  location?: string; // 등원/하원 위치
  notes?: string; // 추가 메모
  createdAt: DateTimeString; // ISO 8601 형식
  updatedAt: DateTimeString; // ISO 8601 형식
  updatedBy?: string; // 업데이트한 사용자 ID
}

// 출석 타임라인 아이템 타입
export interface AttendanceTimelineItem {
  time: string; // HH:MM 형식
  activity: string;
  status: AttendanceStatus;
  location?: string;
  notes?: string;
}

// 출석 상태별 색상 정보
export interface AttendanceStatusInfo {
  text: string;
  className: string;
  backgroundColor: string;
  color: string;
  borderColor?: string;
  dotColor: string;
}

// 출석 상태별 스타일 매핑
export const ATTENDANCE_STATUS_STYLES: Record<AttendanceStatus, AttendanceStatusInfo> = {
  present: {
    text: '등원',
    className: 'attendance-present',
    backgroundColor: '#e8f5e8',
    color: '#2e7d32',
    borderColor: '#4caf50',
    dotColor: '#4CAF50'
  },
  dismissed: {
    text: '하원',
    className: 'attendance-dismissed',
    backgroundColor: '#f5f5f5',
    color: '#666666',
    borderColor: '#9e9e9e',
    dotColor: '#9E9E9E'
  },
  unauthorized_absent: {
    text: '무단결석',
    className: 'attendance-unauthorized',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderColor: '#f44336',
    dotColor: '#F44336'
  },
  authorized_absent: {
    text: '사유결석',
    className: 'attendance-authorized',
    backgroundColor: '#fff3e0',
    color: '#ef6c00',
    borderColor: '#ff9800',
    dotColor: '#FF9800'
  },
  not_enrolled: {
    text: '미등록',
    className: 'attendance-not-enrolled',
    backgroundColor: '#f5f5f5',
    color: '#9e9e9e',
    borderColor: '#bdbdbd',
    dotColor: '#BDBDBD'
  }
};

// 기본 시간대별 출석 활동
export const DEFAULT_ATTENDANCE_ACTIVITIES = [
  { time: '08:30', activity: '등원', location: '정문' },
  { time: '09:00', activity: '출석체크' },
  { time: '12:00', activity: '점심시간' },
  { time: '13:00', activity: '오후수업' },
  { time: '15:00', activity: '휴식시간' },
  { time: '17:30', activity: '하원', location: '정문' }
] as const;

// 출석 상태별 타임라인 상태 매핑
export const ATTENDANCE_TO_TIMELINE_STATUS: Record<AttendanceStatus, 'completed' | 'in-progress' | 'pending' | 'cancelled'> = {
  present: 'completed',
  dismissed: 'completed',
  unauthorized_absent: 'cancelled',
  authorized_absent: 'pending',
  not_enrolled: 'pending'
};

export interface Seat {
  id: string;
  studentName: string;
  status: AttendanceStatus;
  row: number;
  col: number;
}

export interface AttendanceStats {
  total: number;
  present: number;
  dismissed: number;
  unauthorized_absent: number;
  authorized_absent: number;
}

export interface AttendanceAction {
  type: 'update' | 'reset' | 'mark_all_present';
  seatId?: string;
  status?: AttendanceStatus;
}

export interface AttendanceUpdateRequest {
  studentId: string;
  attendanceStatus: AttendanceStatus;
  updatedBy?: string;
  // 시간 정보 추가
  checkInTime?: TimeString; // 등원 시작 시간
  checkOutTime?: TimeString; // 하원 시간
  location?: string; // 등원/하원 위치
  notes?: string; // 추가 메모
}

// ===== 새로운 타입들 (개선된 구조) =====
export type { 
  DailySummary,
  MonthlyReport,
  AttendanceSearchParams
} from './database.types';

export type {
  CreateAttendanceRecordRequest,
  UpdateAttendanceRecordRequest,
  GetAttendanceRecordsRequest,
  GetAttendanceRecordsResponse,
  BulkAttendanceUpdateRequest,
  BulkAttendanceUpdateResponse,
  GetAttendanceStatsRequest,
  GetAttendanceStatsResponse
} from './api.types';

// ===== 타입 변환 유틸리티 타입 =====

// 기존 AttendanceRecord를 새로운 AttendanceRecord로 변환
export type TransformToNewAttendanceRecord = (oldRecord: AttendanceRecord) => NewAttendanceRecord;

// 새로운 AttendanceRecord를 기존 AttendanceRecord로 변환 (하위 호환성)
export type TransformToOldAttendanceRecord = (newRecord: NewAttendanceRecord) => AttendanceRecord;

// AttendanceRecord 버전 타입
export type AttendanceRecordVersion = 'v1' | 'v2';

// AttendanceRecord 타입 유니온
export type AttendanceRecordUnion = AttendanceRecord | NewAttendanceRecord;

// ===== 타입 가드 =====

// 기존 AttendanceRecord 타입인지 확인
export const isOldAttendanceRecord = (record: AttendanceRecordUnion): record is AttendanceRecord => {
  return 'timestamp' in record && typeof (record as AttendanceRecord).timestamp === 'string';
};

// 새로운 AttendanceRecord 타입인지 확인
export const isNewAttendanceRecord = (record: AttendanceRecordUnion): record is NewAttendanceRecord => {
  return 'studentId' in record && typeof (record as NewAttendanceRecord).studentId === 'string';
};

// ===== 타입 변환 함수 타입 =====

export interface AttendanceTransformers {
  toNew: TransformToNewAttendanceRecord;
  toOld: TransformToOldAttendanceRecord;
  validate: (record: AttendanceRecordUnion) => boolean;
}

// ===== Attendance 관련 상수 =====

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  DISMISSED: 'dismissed',
  UNAUTHORIZED_ABSENT: 'unauthorized_absent',
  AUTHORIZED_ABSENT: 'authorized_absent'
} as const;

export const ATTENDANCE_ACTION_TYPES = {
  UPDATE: 'update',
  RESET: 'reset',
  MARK_ALL_PRESENT: 'mark_all_present'
} as const;

// ===== 검증 관련 타입 =====

export interface AttendanceValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface AttendanceValidationRule {
  field: keyof AttendanceRecord | keyof NewAttendanceRecord;
  required: boolean;
  validator?: (value: any) => boolean;
  errorMessage: string;
}

// ===== 통계 관련 타입 =====

export interface AttendanceStatistics {
  totalRecords: number;
  statusCounts: Record<AttendanceStatus, number>;
  averageCheckInTime?: TimeString;
  averageCheckOutTime?: TimeString;
  lateCount: number;
  earlyLeaveCount: number;
  averageAttendanceRate: number;
}

// ===== 필터링 관련 타입 =====

export interface AttendanceFilter {
  studentId?: string;
  dateRange?: {
    start: DateString;
    end: DateString;
  };
  status?: AttendanceStatus[];
  checkInTimeRange?: {
    start: TimeString;
    end: TimeString;
  };
  checkOutTimeRange?: {
    start: TimeString;
    end: TimeString;
  };
  location?: string;
  updatedBy?: string;
} 