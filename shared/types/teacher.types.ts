import type { BaseEntity, FirestoreTimestamp, SubjectType } from './common.types'

// ===== 교사 관련 타입 정의 =====

// 교사 정보
export interface Teacher extends BaseEntity {
  id: string;                    // 교사 고유 ID
  name: string;                  // 교사 이름
  email?: string;                // 이메일 (선택사항)
  phone?: string;                // 전화번호 (선택사항)
  subjects?: SubjectType[];      // 담당 과목 목록 (선택사항)
  createdAt: FirestoreTimestamp;          // 생성일
  updatedAt: FirestoreTimestamp;          // 수정일
}

// ===== 교사 생성 요청 타입 =====
export interface CreateTeacherRequest {
  name: string;                  // 교사 이름
  email?: string;                // 이메일 (선택사항)
  phone?: string;                // 전화번호 (선택사항)
  subjects?: SubjectType[];      // 담당 과목 목록 (선택사항)
}

// ===== 교사 수정 요청 타입 =====
export interface UpdateTeacherRequest {
  name?: string;                 // 교사 이름
  email?: string;                // 이메일 (선택사항)
  phone?: string;                // 전화번호 (선택사항)
  subjects?: SubjectType[];      // 담당 과목 목록 (선택사항)
}

// ===== 교사 검색 파라미터 타입 =====
export interface TeacherSearchParams {
  name?: string;                 // 이름 검색
}

// ===== 교사 통계 타입 =====
export interface TeacherStatistics {
  totalTeachers: number;         // 전체 교사 수
}

// ===== 교사 의존성 확인 타입 =====
export interface TeacherDependencies {
  hasClassSections: boolean;
  classSectionCount: number;
  hasStudentTimetables: boolean;
  affectedStudentCount: number;
  hasAttendanceRecords: boolean;
  attendanceCount: number;
  totalRelatedRecords: number;
}

// ===== 교사 계층적 삭제 응답 타입 =====
export interface TeacherHierarchicalDeleteResponse {
  success: boolean;
  deletedRecords: {
    classSections: number;
    studentTimetables: number;
    attendanceRecords: number;
    teacher: boolean;
  };
  message: string;
}
