import type { BaseEntity, FirestoreTimestamp } from './common.types'

// ===== 학생 시간표 관련 타입 정의 =====

// 학생 시간표 정보
export interface StudentTimetable extends BaseEntity {
  id: string;                    // 자동 생성 ID
  studentId: string;             // 학생 ID
  versionId: string;             // 시간표 버전 ID (timetable_versions 참조)
  // 이 학생에게 배정된 모든 `class_sections`의 ID 목록
  classSectionIds: string[];
  notes?: string;                // 메모 (특이사항)
  createAt: FirestoreTimestamp;  // 생성일
  updatedAt: FirestoreTimestamp; // 시간표가 마지막으로 수정된 시간
}

// ===== 학생 시간표 생성 요청 타입 =====
export interface CreateStudentTimetableRequest {
  studentId: string;             // 학생 ID
  versionId: string;             // 시간표 버전 ID
  classSectionIds?: string[];    // 수업 ID 목록 (기본값: 빈 배열)
  notes?: string;                // 메모
}

// ===== 학생 시간표 수정 요청 타입 =====
export interface UpdateStudentTimetableRequest {
  versionId?: string;            // 시간표 버전 ID
  classSectionIds?: string[];    // 수업 ID 목록
  notes?: string;                // 메모
}

// ===== 학생 시간표 검색 파라미터 타입 =====
export interface StudentTimetableSearchParams {
  studentId?: string;            // 학생 ID로 검색
  versionId?: string;            // 버전 ID로 검색
}


