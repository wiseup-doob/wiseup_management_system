// 수업 섹션 관련 타입 정의
import type { BaseEntity, FirestoreTimestamp, DayOfWeek } from './common.types'

// ===== 수업 관련 타입 정의 =====

// 수업 시간 정보
export interface ClassSchedule {
  dayOfWeek: DayOfWeek;          // 요일 (예: 'monday')
  startTime: string;             // 시작 시간 (예: "09:00")
  endTime: string;               // 종료 시간 (예: "10:30")
}

// 수업 정보
export interface ClassSection extends BaseEntity {
  id: string;                    // 수업 고유 ID
  versionId: string;             // 시간표 버전 ID (학기별 관리)
  name: string;                  // 수업명 (예: "고등 수학 I - A반")
  courseId: string;              // `courses` 컬렉션의 ID
  teacherId: string;             // `teachers` 컬렉션의 ID
  classroomId: string;           // `classrooms` 컬렉션의 ID
  
  // 수업 시간 정보
  schedule: ClassSchedule[];     // 수업 스케줄
  
  // 시간표 표시를 위한 추가 필드
  color?: string;                // 시간표에서 표시할 색상 (CSS 색상 코드)
  displayOrder?: number;         // 시간표에서 표시할 순서
  
  maxStudents: number;           // 최대 수강 인원
  currentStudents?: number;      // 현재 수강 인원 (선택사항)
  status: 'active' | 'inactive' | 'completed'; // 수업 상태
  description?: string;          // 수업 설명
  notes?: string;                // 참고사항
  createdAt: FirestoreTimestamp; // 생성일
  updatedAt: FirestoreTimestamp; // 수정일
}

// ===== 수업 생성 요청 타입 =====
export interface CreateClassSectionRequest {
  versionId?: string;            // 시간표 버전 ID (선택사항 - 없으면 활성 버전 사용)
  name: string;                  // 수업명
  courseId: string;              // 강의 ID
  teacherId: string;             // 교사 ID
  classroomId: string;           // 강의실 ID
  schedule: ClassSchedule[];     // 수업 스케줄
  maxStudents: number;           // 최대 수강 인원
  currentStudents?: number;      // 현재 수강 인원 (기본값: 0)
  status?: 'active' | 'inactive' | 'completed'; // 수업 상태 (기본값: 'active')
  description?: string;          // 수업 설명
  notes?: string;                // 참고사항
  color?: string;                // 시간표 표시 색상
}

// ===== 수업 수정 요청 타입 =====
export interface UpdateClassSectionRequest {
  name?: string;                 // 수업명
  courseId?: string;             // 강의 ID
  teacherId?: string;            // 교사 ID
  classroomId?: string;          // 강의실 ID
  schedule?: ClassSchedule[];    // 수업 스케줄
  maxStudents?: number;          // 최대 수강 인원
  currentStudents?: number;      // 현재 수강 인원
  status?: 'active' | 'inactive' | 'completed'; // 수업 상태
  description?: string;          // 수업 설명
  notes?: string;                // 참고사항
  color?: string;                // 시간표 표시 색상
}

// ===== 수업 검색 파라미터 타입 =====
export interface ClassSectionSearchParams {
  versionId?: string;            // 버전별 검색 (선택사항 - 없으면 활성 버전 사용)
  name?: string;                 // 수업명 검색
  courseId?: string;             // 강의별 검색
  teacherId?: string;            // 교사별 검색
  classroomId?: string;          // 강의실별 검색
  status?: 'active' | 'inactive' | 'completed'; // 상태별 검색
}

// ===== 수업 통계 타입 =====
export interface ClassSectionStatistics {
  totalClassSections: number;    // 전체 수업 수
}

// ===== 시간표 표시 관련 타입 =====

// 시간표 블록 (UI 표시용)
export interface ClassScheduleBlock {
  id: string;                    // 고유 ID (classSection.id와 동일)
  title: string;                 // 표시할 제목 (수업명)
  subtitle?: string;             // 부제목 (교사명, 강의실 등)
  dayOfWeek: DayOfWeek;         // 요일
  startTime: string;             // 시작 시간
  endTime: string;               // 종료 시간
  color?: string;                // 표시 색상
  order?: number;                // 표시 순서
}

// 시간표 그리드 (UI 렌더링용)
export interface ClassScheduleGrid {
  timeSlots: string[];           // 시간대 목록 (예: ["09:00", "10:30", "12:00"])
  daysOfWeek: DayOfWeek[];      // 요일 목록
  blocks: ClassScheduleBlock[];  // 시간표 블록들
}

// 시간표 검색 파라미터
export interface ClassScheduleSearchParams {
  dayOfWeek?: DayOfWeek;         // 특정 요일 검색
  timeRange?: {                   // 시간 범위 검색
    start: string;
    end: string;
  };
  teacherId?: string;             // 교사별 검색
  classroomId?: string;           // 강의실별 검색
  courseId?: string;              // 강의별 검색
  status?: 'active' | 'inactive' | 'completed'; // 수업 상태별 검색
}

// ===== 수업 의존성 확인 타입 =====
export interface ClassSectionDependencies {
  hasStudentTimetables: boolean;
  affectedStudentCount: number;
  hasAttendanceRecords: boolean;
  attendanceCount: number;
  totalRelatedRecords: number;
}

// ===== 수업 계층적 삭제 응답 타입 =====
export interface ClassSectionHierarchicalDeleteResponse {
  success: boolean;
  deletedRecords: {
    studentTimetables: number;
    attendanceRecords: number;
    classSection: boolean;
  };
  message: string;
}
