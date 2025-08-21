import type { BaseEntity, FirestoreTimestamp } from './common.types'

// ===== 학생 시간표 관련 타입 정의 =====

// 학생 시간표 정보
// 문서 ID는 학생 ID(studentId)와 동일하게 사용하면 편리함
export interface StudentTimetable extends BaseEntity {
  studentId: string;             // 학생 ID
  // 이 학생에게 배정된 모든 `class_sections`의 ID 목록
  classSectionIds: string[];
  createAt: FirestoreTimestamp;  // 생성일
  updatedAt: FirestoreTimestamp; // 시간표가 마지막으로 수정된 시간
}

// ===== 학생 시간표 생성 요청 타입 =====
export interface CreateStudentTimetableRequest {
  studentId: string;             // 학생 ID
  classSectionIds?: string[];    // 수업 ID 목록 (기본값: 빈 배열)
}

// ===== 학생 시간표 수정 요청 타입 =====
export interface UpdateStudentTimetableRequest {
  classSectionIds?: string[];    // 수업 ID 목록
}

// ===== 학생 시간표 검색 파라미터 타입 =====
export interface StudentTimetableSearchParams {
  studentId?: string;            // 학생 ID로 검색
}


