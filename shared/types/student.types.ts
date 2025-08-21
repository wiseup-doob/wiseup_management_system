import type { BaseEntity, FirestoreTimestamp } from './common.types'

// ===== 학생 관련 타입 정의 =====

// 학년 타입
export type Grade = '초1' | '초2' | '초3' | '초4' | '초5' | '초6' | '중1' | '중2' | '중3' | '고1' | '고2' | '고3' | 'N수';

// 학생 상태
export type StudentStatus = 'active' | 'inactive';

// 학생 연락처 정보
export interface StudentContactInfo {
  phone?: string;      // 전화번호
  email?: string;      // 이메일
  address?: string;    // 주소
}

// 학생 부모 정보
export interface StudentParentInfo {
  parentId: string;    // 부모 ID
  name: string;        // 부모 이름
  relationship: string; // 관계 (예: "아버지", "어머니")
  phone: string;       // 연락처
}

// 학생 정보
export interface Student extends BaseEntity {
  id: string;                    // 학생 고유 ID
  name: string;                  // 학생 이름
  grade: Grade;                  // 학생 학년
  firstAttendanceDate?: FirestoreTimestamp;  // 첫 등원 날짜
  lastAttendanceDate?: FirestoreTimestamp;   // 마지막 등원 날짜
  parentsId?: string;             // `parents` 컬렉션의 ID
  status: StudentStatus;         // 학생 상태 (재원, 퇴원)
  contactInfo?: {                // 연락처 정보
    phone?: string;
    email?: string;
    address?: string;
  };
  createdAt: FirestoreTimestamp; // 생성일
  updatedAt: FirestoreTimestamp; // 수정일
}

// ===== 학생 생성 요청 타입 =====
export interface CreateStudentRequest {
  name: string;                  // 학생 이름
  grade: Grade;                  // 학년
  firstAttendanceDate?: FirestoreTimestamp;  // 첫 등원 날짜
  lastAttendanceDate?: FirestoreTimestamp;   // 마지막 등원 날짜
  parentsId?: string;             // 부모 ID
  status?: StudentStatus;        // 학생 상태 (기본값: 'active')
  contactInfo?: {                // 연락처 정보
    phone?: string;
    email?: string;
    address?: string;
  };
}

// ===== 학생 수정 요청 타입 =====
export interface UpdateStudentRequest {
  name?: string;                 // 학생 이름
  grade?: Grade;                 // 학년
  firstAttendanceDate?: FirestoreTimestamp;  // 첫 등원 날짜
  lastAttendanceDate?: FirestoreTimestamp;   // 마지막 등원 날짜
  parentsId?: string;             // 부모 ID
  status?: StudentStatus;        // 학생 상태
  contactInfo?: {                // 연락처 정보
    phone?: string;
    email?: string;
    address?: string;
  };
}

// ===== 학생 검색 파라미터 타입 =====
export interface StudentSearchParams {
  name?: string;                 // 이름 검색
  grade?: Grade;                 // 학년별 검색
  status?: StudentStatus;        // 상태별 검색
  parentsId?: string;            // 부모 ID로 검색
  firstAttendanceDateRange?: {   // 첫 등원일 범위 검색
    start: FirestoreTimestamp;
    end: FirestoreTimestamp;
  };
  lastAttendanceDateRange?: {    // 마지막 등원일 범위 검색
    start: FirestoreTimestamp;
    end: FirestoreTimestamp;
  };
}

// ===== 학생 통계 타입 =====
export interface StudentStatistics {
  totalStudents: number;         // 전체 학생 수
  activeStudents: number;        // 재원 학생 수
  inactiveStudents: number;      // 퇴원 학생 수
  studentsByGrade: Record<Grade, number>; // 학년별 학생 수
  studentsWithAttendance: number; // 출석 기록이 있는 학생 수
  averageAttendanceRate: number; // 평균 출석률
}

// ===== 학생 의존성 확인 타입 =====
export interface StudentDependencies {
  hasAttendanceRecords: boolean;
  attendanceCount: number;
  hasTimetable: boolean;
  hasClassEnrollments: boolean;
  classEnrollmentCount: number;
  hasSeatAssignments: boolean;
  seatAssignmentCount: number;
  hasStudentSummary: boolean;
  totalRelatedRecords: number;
}

// ===== 학생 계층적 삭제 응답 타입 =====
export interface HierarchicalDeleteResponse {
  success: boolean;
  deletedRecords: {
    attendanceRecords: number;
    seatAssignments: number;
    studentSummary: boolean;
    timetable: boolean;
    student: boolean;
  };
  message: string;
}
