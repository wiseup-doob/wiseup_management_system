// ===== Firebase Timestamp 타입 =====
// TODO: firebase-admin/firestore 모듈이 설치되면 실제 Timestamp 타입 사용
// import { Timestamp } from 'firebase-admin/firestore';

// Firebase Timestamp 타입 (백엔드 전용)
export type FirestoreTimestamp = any; // 임시로 any 사용

// ===== 기본 엔티티 타입 =====
export interface BaseEntity {
  id: string;
  createdAt?: FirestoreTimestamp;  // DateTimeString → FirestoreTimestamp
  updatedAt?: FirestoreTimestamp;  // DateTimeString → FirestoreTimestamp
}

// ===== 공통 도메인 타입들 =====

// 과목 타입
export type SubjectType = 
  | 'mathematics'      // 수학
  | 'english'          // 영어
  | 'korean'           // 국어
  | 'other';           // 기타

// 난이도 레벨
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// 출석 상태
export type AttendanceStatus = 
  | 'present'              // 등원
  | 'dismissed'            // 하원
  | 'unauthorized_absent'  // 무단결석
  | 'authorized_absent'    // 사유결석
  | 'not_enrolled';        // 미등록

// 요일 타입
export type DayOfWeek = 
  | 'monday'      // 월요일
  | 'tuesday'     // 화요일
  | 'wednesday'   // 수요일
  | 'thursday'    // 목요일
  | 'friday'      // 금요일
  | 'saturday'    // 토요일
  | 'sunday';     // 일요일

// ===== ID 타입 정의 =====

// 기본 UUID 타입 (Firebase 호환)
export type UUID = string;

// 엔티티별 ID 타입들
export type EntityId = UUID;           // 모든 엔티티 ID의 기본 타입
export type StudentId = UUID;          // 학생 ID
export type TeacherId = UUID;          // 교사 ID
export type ClassId = UUID;            // 수업 ID
export type TimetableId = UUID;        // 시간표 ID
export type TimetableItemId = UUID;    // 시간표 항목 ID
export type ClassroomId = UUID;        // 강의실 ID
export type TimeSlotId = UUID;         // 시간대 ID
export type EnrollmentId = UUID;       // 수강신청 ID
export type ClassAttendanceId = UUID;  // 수업 출석 ID
export type AttendanceRecordId = UUID; // 출석 기록 ID

// 특별한 형식의 ID들
export type SeatId = string;           // "seat_001", "seat_002" 형식
export type UserId = string;           // 사용자 ID (시스템별 형식)

// 기본 UUID 생성 함수 타입
export interface UUIDGenerator {
  generate(): UUID;
}

// ID 생성 함수 타입
export interface IdGenerator {
  generateStudentId(): StudentId;
  generateTeacherId(): TeacherId;
  generateClassId(): ClassId;
  generateTimetableId(): TimetableId;
  generateSeatId(seatNumber: number): SeatId;
  generateUserId(): UserId;
}

// ===== 상태 타입 정의 =====

// 기본 엔티티 상태
export type EntityStatus = 'active' | 'inactive';

// 수업 상태
export type ClassStatus = 
  | 'scheduled'        // 예정
  | 'in_progress'      // 진행 중
  | 'completed'        // 완료
  | 'cancelled'        // 취소
  | 'postponed';       // 연기

// 수업 출석 상태
export type ClassAttendanceStatus = 
  | 'present'          // 출석
  | 'absent'           // 결석
  | 'late'             // 지각
  | 'excused';         // 사유결석

// 수강신청 상태
export type EnrollmentStatus = 
  | 'enrolled'         // 수강 중
  | 'dropped'          // 수강 포기
  | 'completed'        // 수강 완료
  | 'suspended';       // 수강 정지

// 학기 상태
export type SemesterStatus = 
  | 'spring'           // 봄학기
  | 'summer'           // 여름학기
  | 'fall'             // 가을학기
  | 'winter';          // 겨울학기

// 반복 패턴 타입
export type RecurrenceType = 'weekly' | 'monthly';

// ===== 날짜 형식 타입 정의 =====

// 날짜 형식 (YYYY-MM-DD)
export type DateString = string; // "2024-01-15"

// 시간 형식 (HH:MM)
export type TimeString = string; // "09:30"

// 날짜시간 형식 (ISO 8601) - 프론트엔드 호환성을 위해 유지
export type DateTimeString = string; // "2024-01-15T09:30:00.000Z"

// Firebase Timestamp를 위한 별칭 (백엔드에서 주로 사용)
export type Timestamp = FirestoreTimestamp;

// 날짜 범위
export interface DateRange {
  start: DateString;
  end: DateString;
}

// 시간 범위
export interface TimeRange {
  start: TimeString;
  end: TimeString;
}

// ===== Timestamp 유틸리티 타입 =====

// Timestamp 변환 유틸리티 인터페이스
export interface TimestampUtils {
  // 현재 시간
  now(): FirestoreTimestamp;
  
  // Date 객체를 Timestamp로 변환
  fromDate(date: Date): FirestoreTimestamp;
  
  // ISO 문자열을 Timestamp로 변환
  fromISOString(isoString: string): FirestoreTimestamp;
  
  // Timestamp를 Date로 변환
  toDate(timestamp: FirestoreTimestamp): Date;
  
  // Timestamp를 ISO 문자열로 변환
  toISOString(timestamp: FirestoreTimestamp): string;
  
  // Unix timestamp (초)를 Timestamp로 변환
  fromSeconds(seconds: number): FirestoreTimestamp;
  
  // Unix timestamp (밀리초)를 Timestamp로 변환
  fromMillis(millis: number): FirestoreTimestamp;
}

// ===== API 응답 타입 =====
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: {
    timestamp?: string;
    version?: string;
    requestId?: string;
    count?: number;
    [key: string]: any;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} 