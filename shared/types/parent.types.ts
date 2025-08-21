import type { BaseEntity, FirestoreTimestamp } from './common.types'

// ===== 부모 관련 타입 정의 =====

// 부모 정보
export interface Parent extends BaseEntity {
  id: string;                    // 부모 고유 ID
  name: string;                  // 부모 이름
  contactInfo: {                 // 연락처 정보
    phone: string;
    email?: string;
  };
  childStudentIds: string[];     // 자녀(학생)들의 ID 목록
  notes?: string;                // 기타 메모
  createdAt: FirestoreTimestamp;          // 생성일
  updatedAt: FirestoreTimestamp;          // 수정일
}

// ===== 부모 생성 요청 타입 =====
export interface CreateParentRequest {
  name: string;                  // 부모 이름
  contactInfo: {                 // 연락처 정보
    phone: string;
    email?: string;
  };
  childStudentIds?: string[];    // 자녀 학생 ID 목록
  notes?: string;                // 기타 메모
}

// ===== 부모 수정 요청 타입 =====
export interface UpdateParentRequest {
  name?: string;                 // 부모 이름
  contactInfo?: {                // 연락처 정보
    phone?: string;
    email?: string;
  };
  childStudentIds?: string[];    // 자녀 학생 ID 목록
  notes?: string;                // 기타 메모
}

// ===== 부모 검색 파라미터 타입 =====
export interface ParentSearchParams {
  name?: string;                 // 이름 검색
  phone?: string;                // 전화번호 검색
  email?: string;                // 이메일 검색
  childStudentId?: string;       // 특정 자녀 학생 ID로 검색
  hasMultipleChildren?: boolean; // 다자녀 여부로 검색
}

// ===== 부모 통계 타입 =====
export interface ParentStatistics {
  totalParents: number;          // 전체 부모 수
  averageChildrenPerParent: number; // 부모당 평균 자녀 수
  parentsWithMultipleChildren: number; // 다자녀 부모 수
  parentsWithoutChildren: number; // 자녀가 없는 부모 수
}

// Parent 검증 결과
export interface ParentValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Parent 검증 규칙
export interface ParentValidationRule {
  field: keyof Parent
  required: boolean
  validator?: (value: any) => boolean
  errorMessage: string
}
