import type { BaseEntity, FirestoreTimestamp } from './common.types'

// ===== 강의실 관련 타입 정의 =====

// 강의실 정보
export interface Classroom extends BaseEntity {
  id: string;                    // 강의실 고유 ID
  name: string;                  // 강의실명 (예: "A101", "컴퓨터실")
  capacity: number;              // 수용 인원
  equipment?: string[];          // 장비 목록 (예: ["프로젝터", "컴퓨터", "화이트보드"])
  createdAt: FirestoreTimestamp;          // 생성일
  updatedAt: FirestoreTimestamp;          // 수정일
}

// ===== 강의실 생성 요청 타입 =====
export interface CreateClassroomRequest {
  name: string;                  // 강의실명
  capacity: number;              // 수용 인원
  equipment?: string[];          // 장비 목록
}

// ===== 강의실 수정 요청 타입 =====
export interface UpdateClassroomRequest {
  name?: string;                 // 강의실명
  capacity?: number;             // 수용 인원
  equipment?: string[];          // 장비 목록
}

// ===== 강의실 검색 파라미터 타입 =====
export interface ClassroomSearchParams {
  name?: string;                 // 강의실명 검색
  minCapacity?: number;          // 최소 수용 인원
  maxCapacity?: number;          // 최대 수용 인원
  equipment?: string[];          // 장비별 검색
}

// ===== 강의실 통계 타입 =====
export interface ClassroomStatistics {
  totalClassrooms: number;       // 전체 강의실 수
  totalCapacity: number;         // 전체 수용 인원
  averageCapacity: number;       // 평균 수용 인원
  classroomsByCapacity: Record<string, number>; // 수용 인원별 교실 수
  mostCommonEquipment: Array<{ equipment: string; count: number }>; // 가장 흔한 장비
}

// ===== 강의실 의존성 확인 타입 =====
export interface ClassroomDependencies {
  hasClassSections: boolean;
  classSectionCount: number;
  hasStudentTimetables: boolean;
  affectedStudentCount: number;
  hasAttendanceRecords: boolean;
  attendanceCount: number;
  totalRelatedRecords: number;
}

// ===== 강의실 계층적 삭제 응답 타입 =====
export interface ClassroomHierarchicalDeleteResponse {
  success: boolean;
  deletedRecords: {
    classSections: number;
    studentTimetables: number;
    attendanceRecords: number;
    classroom: boolean;
  };
  message: string;
}
