import type { BaseEntity, FirestoreTimestamp, SubjectType } from './common.types'

// ===== 강의 관련 타입 정의 =====

// 강의 정보
export interface Course extends BaseEntity {
  id: string;                    // 강의 고유 ID
  name: string;                  // 강의명 (예: "고등 수학 I")
  subject: SubjectType;          // 과목
  description?: string;          // 강의 설명
  difficulty?: 'beginner' | 'intermediate' | 'advanced'; // 난이도
  isActive: boolean;             // 활성화 여부
  createdAt: FirestoreTimestamp; // 생성일
  updatedAt: FirestoreTimestamp; // 수정일
}

// ===== 강의 생성 요청 타입 =====
export interface CreateCourseRequest {
  name: string;                  // 강의명
  subject: SubjectType;          // 과목
  description?: string;          // 강의 설명
  difficulty?: 'beginner' | 'intermediate' | 'advanced'; // 난이도
  isActive?: boolean;            // 활성화 여부 (기본값: true)
}

// ===== 강의 수정 요청 타입 =====
export interface UpdateCourseRequest {
  name?: string;                 // 강의명
  subject?: SubjectType;         // 과목
  description?: string;          // 강의 설명
  difficulty?: 'beginner' | 'intermediate' | 'advanced'; // 난이도
  isActive?: boolean;            // 활성화 여부
}

// ===== 강의 검색 파라미터 타입 =====
export interface CourseSearchParams {
  name?: string;                 // 강의명 검색
  subject?: SubjectType;         // 과목별 검색
  difficulty?: 'beginner' | 'intermediate' | 'advanced'; // 난이도별 검색
  isActive?: boolean;            // 활성화 상태별 검색
}

// ===== 강의 통계 타입 =====
export interface CourseStatistics {
  totalCourses: number;          // 전체 강의 수
}
