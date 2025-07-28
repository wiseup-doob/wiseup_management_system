export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'

// 더 정확한 TimeSlot 타입 (30분 단위)
export type TimeSlot = 
  | `${0 | 1}${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}:${0 | 3}0`  // 00:00 ~ 19:30
  | `2${0 | 1 | 2 | 3}:${0 | 3}0`                                  // 20:00 ~ 23:30

// 시간표 타입 구분
export type TimetableType = 'weekly' | 'specific'

export interface TimetableEntry {
  id?: string; // 개별 엔트리 식별용
  weekday: Weekday;
  startTime: TimeSlot;
  endTime: TimeSlot;
  subject: string;
  teacher?: string;
  room?: string;
  
  // 날짜 관련 필드 추가
  type: TimetableType; // 'weekly': 주간 반복, 'specific': 특정 날짜
  date?: string; // YYYY-MM-DD 형태 (specific 타입일 때 필수)
  
  // 기간 관리용 (weekly 타입일 때 사용)
  effectiveFrom?: string; // YYYY-MM-DD 시작일
  effectiveTo?: string;   // YYYY-MM-DD 종료일
  
  // 메타 정보
  isActive?: boolean; // 활성/비활성 상태
  notes?: string;     // 추가 메모
}

export interface StudentTimetable {
  studentId: string;
  entries: TimetableEntry[];
  
  // 시간표 메타 정보 추가
  semester?: string;    // 학기 정보 (e.g., "2024-1", "2024-2")
  academicYear?: number; // 학년도 (e.g., 2024)
  
  updatedAt: FirebaseFirestore.Timestamp;
  createdAt?: FirebaseFirestore.Timestamp;
}

// API 요청/응답 타입
export type CreateTimetableRequest = Omit<StudentTimetable, 'updatedAt' | 'createdAt'>
export type UpdateTimetableRequest = Partial<CreateTimetableRequest>

// 시간표 조회용 필터 타입
export interface TimetableFilter {
  studentId: string;
  date?: string;        // 특정 날짜 조회 (YYYY-MM-DD)
  dateRange?: {         // 기간 조회
    from: string;       // YYYY-MM-DD
    to: string;         // YYYY-MM-DD
  };
  weekday?: Weekday;    // 특정 요일 조회
  semester?: string;    // 학기별 조회
  isActive?: boolean;   // 활성 상태별 조회
}