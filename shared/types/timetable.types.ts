import type { 
  BaseEntity, 
  DateString, 
  TimeString,
  UUID,
  TeacherId,
  ClassId,
  TimetableId,
  TimetableItemId,
  ClassroomId,
  TimeSlotId,
  EnrollmentId,
  ClassAttendanceId,
  EntityStatus,
  ClassStatus,
  ClassAttendanceStatus,
  EnrollmentStatus,
  SemesterStatus,
  RecurrenceType
} from './common.types';

// ===== 시간표 UI 관련 타입 =====

// 시간표 블록 타입
export interface TimetableBlock {
  id: string;
  title: string;
  startTime: TimeString; // "09:00"
  endTime: TimeString;   // "10:00"
  dayOfWeek: DayOfWeek;
  color?: string;        // CSS 색상 (예: "#e0f2f1")
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  className?: string;
  notes?: string;
  type?: 'class' | 'break' | 'meal' | 'study' | 'exam' | 'custom';
}

// 시간표 셀 타입
export interface TimetableCell {
  time: TimeString;
  dayOfWeek: DayOfWeek;
  blocks: TimetableBlock[];
  isEmpty: boolean;
}

// 시간표 그리드 타입
export interface TimetableGrid {
  timeSlots: TimeString[];
  daysOfWeek: DayOfWeek[];
  cells: TimetableCell[][];
}

// 시간표 렌더링 옵션
export interface TimetableRenderOptions {
  showTimeHeaders: boolean;
  showDayHeaders: boolean;
  cellHeight: number;
  cellWidth: number;
  headerHeight: number;
  headerWidth: number;
  borderColor: string;
  backgroundColor: string;
  emptyCellColor: string;
  hoverEffect: boolean;
  responsive: boolean;
  // 아래 옵션들은 레이아웃 정밀도 및 절대 배치용 추가 옵션 (모두 선택사항)
  startTime?: TimeString;        // 기본값: '09:00'
  endTime?: TimeString;          // 기본값: '23:00'
  slotMinutes?: number;          // 기본값: 60 (표시용 눈금 간격)
  pixelsPerMinute?: number;      // 기본값: cellHeight / slotMinutes
  gutter?: number;               // 겹치는 블록 가로 간격(px), 기본값: 2
  minBlockHeight?: number;       // 최소 블록 높이(px), 기본값: 8
}

// 시간표 이벤트 핸들러
export interface TimetableEventHandlers {
  onBlockClick?: (block: TimetableBlock) => void;
  onCellClick?: (cell: TimetableCell) => void;
  onBlockHover?: (block: TimetableBlock) => void;
  onCellHover?: (cell: TimetableCell) => void;
}

// 시간표 스타일 타입
export interface TimetableStyles {
  grid: {
    borderColor: string;
    backgroundColor: string;
    headerBackgroundColor: string;
    headerTextColor: string;
    cellBorderColor: string;
    emptyCellColor: string;
  };
  block: {
    defaultColor: string;
    defaultTextColor: string;
    defaultBorderColor: string;
    hoverEffect: boolean;
    borderRadius: string;
    padding: string;
    fontSize: string;
    fontWeight: string;
  };
  timeHeader: {
    backgroundColor: string;
    textColor: string;
    fontSize: string;
    fontWeight: string;
    padding: string;
  };
  dayHeader: {
    backgroundColor: string;
    textColor: string;
    fontSize: string;
    fontWeight: string;
    padding: string;
  };
}

// ===== 시간표 관련 기본 타입 =====

// 요일 타입
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// 시간 형식 (HH:MM)
export type TimeFormat = TimeString; // "09:00", "14:30" 등

// 과목 타입
export type SubjectType = 
  | 'korean'           // 국어
  | 'math'             // 수학
  | 'english'          // 영어
  | 'science'          // 과학
  | 'social'           // 사회
  | 'art'              // 예체능
  | 'computer'         // 컴퓨터
  | 'counseling'       // 상담
  | 'test_prep'        // 시험대비
  | 'homework'         // 과제
  | 'review'           // 복습
  | 'custom';          // 기타

// 수업 유형
export type ClassType = 
  | 'regular'          // 정규 수업
  | 'special'          // 특별 수업
  | 'makeup'           // 보충 수업
  | 'test'             // 시험
  | 'counseling'       // 상담
  | 'activity';        // 활동

// ===== 교사 관련 타입 =====

// 교사 정보
export interface Teacher extends BaseEntity {
  id: TeacherId;
  name: string;
  email: string;
  phone: string;
  subjects: SubjectType[];        // 담당 과목
  gradeLevels: string[];          // 담당 학년
  status: EntityStatus;
  hireDate: DateString;               // 고용 날짜
  resignationDate?: DateString;       // 사직 날짜
  notes?: string;
}

// ===== 수업 관련 타입 =====

// 수업 정보
export interface Class extends BaseEntity {
  id: ClassId;
  name: string;                   // 수업명
  subject: SubjectType;
  classType: ClassType;
  teacherId: TeacherId;                // 담당 교사
  grade: string;                  // 대상 학년
  maxStudents: number;            // 최대 학생 수
  currentStudents: number;        // 현재 학생 수
  description?: string;
  materials?: string[];           // 교재 목록
  status: ClassStatus;
  isActive: boolean;
}

// ===== 시간표 관련 타입 =====

// 시간대 정보
export interface TimeSlot {
  id: TimeSlotId;
  name: string;                   // "1교시", "점심시간" 등
  startTime: TimeFormat;          // "09:00"
  endTime: TimeFormat;            // "10:30"
  duration: number;               // 분 단위
  isBreak: boolean;               // 쉬는 시간 여부
  order: number;                  // 순서
}

// 시간표 항목
export interface TimetableItem extends BaseEntity {
  id: TimetableItemId;
  /** 학생별 독립 시간표 스코핑 필수 */
  timetableId?: TimetableId;
  classId: ClassId;                  // 수업 ID
  teacherId: TeacherId;                // 교사 ID
  dayOfWeek: DayOfWeek;
  timeSlotId: TimeSlotId;               // 시간대 ID
  roomId?: ClassroomId;                  // 강의실 ID
  startDate: DateString;              // 시작일
  endDate?: DateString;               // 종료일, 없으면 무기한
  isRecurring: boolean;           // 반복 여부
  recurrencePattern?: {            // 반복 패턴
    type: RecurrenceType;
    interval: number;              // 간격 (1주마다, 2주마다 등)
    daysOfWeek?: DayOfWeek[];     // 요일 (월,수,금 등)
    dayOfMonth?: number;          // 월의 몇 번째 날
  };
  status: ClassStatus;
  notes?: string;
}

// ===== 강의실 관련 타입 =====

// 강의실 정보
export interface Classroom extends BaseEntity {
  id: ClassroomId;
  name: string;                   // "A101", "컴퓨터실" 등
  capacity: number;               // 수용 인원
  equipment: string[];            // 장비 목록
  features: string[];             // 특별 기능 (프로젝터, 컴퓨터 등)
  isActive: boolean;
  notes?: string;
}

// ===== 수강신청 관련 타입 =====

// 수강신청 정보
export interface Enrollment extends BaseEntity {
  id: EnrollmentId;
  studentId: UUID; // StudentId 타입 사용
  classId: ClassId;
  timetableItemId: TimetableItemId;
  enrollmentDate: DateString;         // 수강신청 날짜
  startDate: DateString;              // 수강 시작일
  endDate?: DateString;               // 수강 종료일
  status: EnrollmentStatus;
  grade?: string;                 // 성적
  attendanceRate?: number;        // 출석률 (0-100)
  notes?: string;
}

// ===== 수업 출석 관련 타입 =====

// 수업별 출석 기록
export interface ClassAttendance extends BaseEntity {
  id: ClassAttendanceId;
  enrollmentId: EnrollmentId;
  timetableItemId: TimetableItemId;
  date: DateString;                   // 출석 날짜
  status: ClassAttendanceStatus;
  checkInTime?: TimeFormat;
  checkOutTime?: TimeFormat;
  notes?: string;
}

// ===== 시간표 관련 타입 =====

// 시간표 정보
export interface Timetable extends BaseEntity {
  id: TimetableId;
  name: string;                   // "2024년 1학기 시간표"
  academicYear: string;           // "2024"
  semester: SemesterStatus;
  startDate: DateString;              // 시작일
  endDate: DateString;                // 종료일
  isActive: boolean;
  description?: string;
  /** 학생별 독립 시간표 소유자 (선택) */
  ownerStudentId?: UUID;
}

// ===== 통계 및 요약 타입 =====

// 시간표 요약 정보
export interface TimetableSummary {
  id: TimetableId;
  name: string;
  totalClasses: number;
  totalTeachers: number;
  totalStudents: number;
  totalClassrooms: number;
  academicYear: string;
  semester: string;
  isActive: boolean;
}

// ===== 검색 파라미터 타입 =====

// 시간표 검색 파라미터
export interface TimetableSearchParams {
  teacherId?: TeacherId;
  studentId?: UUID; // StudentId 타입 사용
  classId?: ClassId;
  subject?: SubjectType;
  dayOfWeek?: DayOfWeek;
  date?: DateString;                  // 특정 날짜
  status?: ClassStatus;
  isActive?: boolean;
}

// 수업 검색 파라미터
export interface ClassSearchParams {
  name?: string;
  subject?: SubjectType;
  teacherId?: TeacherId;
  grade?: string;
  status?: ClassStatus;
  isActive?: boolean;
}

// 교사 검색 파라미터
export interface TeacherSearchParams {
  name?: string;
  subject?: SubjectType;
  gradeLevel?: string;
  status?: 'active' | 'inactive';
}

// ===== 통계 타입 =====

// 시간표 통계
export interface TimetableStats {
  totalClasses: number;
  totalTeachers: number;
  totalStudents: number;
  totalClassrooms: number;
  averageClassSize: number;
  mostPopularSubject: SubjectType;
  busiestDay: DayOfWeek;
  averageAttendanceRate: number;
}

// 교사 통계
export interface TeacherStats {
  teacherId: TeacherId;
  teacherName: string;
  totalClasses: number;
  totalStudents: number;
  averageClassSize: number;
  subjects: SubjectType[];
  averageAttendanceRate: number;
}

// 학생 시간표 통계
export interface StudentTimetableStats {
  studentId: UUID; // StudentId 타입 사용
  studentName: string;
  totalEnrollments: number;
  totalSubjects: number;
  averageGrade: number;
  averageAttendanceRate: number;
  subjects: SubjectType[];
}

// ===== API 요청/응답 타입 =====

// 시간표 생성 요청
export interface CreateTimetableRequest {
  name: string;
  academicYear: string;
  semester: 'spring' | 'summer' | 'fall' | 'winter';
  startDate: DateString;
  endDate: DateString;
  description?: string;
  ownerStudentId?: UUID;
}

// 시간표 수정 요청
export interface UpdateTimetableRequest {
  name?: string;
  academicYear?: string;
  semester?: 'spring' | 'summer' | 'fall' | 'winter';
  startDate?: DateString;
  endDate?: DateString;
  description?: string;
  isActive?: boolean;
}

// 수업 생성 요청
export interface CreateClassRequest {
  name: string;
  subject: SubjectType;
  classType: ClassType;
  teacherId: TeacherId;
  grade: string;
  maxStudents: number;
  description?: string;
  materials?: string[];
}

// 수업 수정 요청
export interface UpdateClassRequest {
  name?: string;
  subject?: SubjectType;
  classType?: ClassType;
  teacherId?: TeacherId;
  grade?: string;
  maxStudents?: number;
  description?: string;
  materials?: string[];
  status?: ClassStatus;
  isActive?: boolean;
}

// 시간표 항목 생성 요청
export interface CreateTimetableItemRequest {
  /** 선택: 서버에서 활성 시간표로 fallback 가능 */
  timetableId?: TimetableId;
  classId: ClassId;
  teacherId: TeacherId;
  dayOfWeek: DayOfWeek;
  timeSlotId: TimeSlotId;
  roomId?: ClassroomId;
  startDate: DateString;
  endDate?: DateString;
  isRecurring: boolean;
  recurrencePattern?: {
    type: 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: DayOfWeek[];
    dayOfMonth?: number;
  };
  notes?: string;
}

// 수강신청 생성 요청
export interface CreateEnrollmentRequest {
  studentId: UUID; // StudentId 타입 사용
  classId: ClassId;
  timetableItemId: TimetableItemId;
  startDate: DateString;
  endDate?: DateString;
  notes?: string;
}

// ===== 컬렉션 이름 =====

// 데이터베이스 컬렉션 이름
export const TIMETABLE_COLLECTION_NAMES = {
  TIMETABLES: 'timetables',
  CLASSES: 'classes',
  TEACHERS: 'teachers',
  TIMETABLE_ITEMS: 'timetable_items',
  CLASSROOMS: 'classrooms',
  ENROLLMENTS: 'enrollments',
  CLASS_ATTENDANCE: 'class_attendance',
  TIME_SLOTS: 'time_slots',
} as const;

// ===== 인덱스 정의 =====

// 인덱스 정의
export const TIMETABLE_REQUIRED_INDEXES = {
  // timetables 컬렉션 인덱스
  TIMETABLES_BY_ACADEMIC_YEAR: 'timetables/academicYear/Ascending',
  TIMETABLES_BY_SEMESTER: 'timetables/semester/Ascending',
  TIMETABLES_BY_ACTIVE: 'timetables/isActive/Ascending',
  
  // classes 컬렉션 인덱스
  CLASSES_BY_TEACHER: 'classes/teacherId/Ascending',
  CLASSES_BY_SUBJECT: 'classes/subject/Ascending',
  CLASSES_BY_GRADE: 'classes/grade/Ascending',
  CLASSES_BY_STATUS: 'classes/status/Ascending',
  
  // teachers 컬렉션 인덱스
  TEACHERS_BY_SUBJECT: 'teachers/subjects/Array',
  TEACHERS_BY_STATUS: 'teachers/status/Ascending',
  
  // timetable_items 컬렉션 인덱스
  TIMETABLE_ITEMS_BY_CLASS: 'timetable_items/classId/Ascending',
  TIMETABLE_ITEMS_BY_TEACHER: 'timetable_items/teacherId/Ascending',
  TIMETABLE_ITEMS_BY_DAY: 'timetable_items/dayOfWeek/Ascending',
  TIMETABLE_ITEMS_BY_TIME_SLOT: 'timetable_items/timeSlotId/Ascending',
  TIMETABLE_ITEMS_BY_DATE_RANGE: 'timetable_items/startDate/Ascending/endDate/Descending',
  
  // enrollments 컬렉션 인덱스
  ENROLLMENTS_BY_STUDENT: 'enrollments/studentId/Ascending',
  ENROLLMENTS_BY_CLASS: 'enrollments/classId/Ascending',
  ENROLLMENTS_BY_STATUS: 'enrollments/status/Ascending',
  ENROLLMENTS_BY_DATE_RANGE: 'enrollments/startDate/Ascending/endDate/Descending',
  
  // class_attendance 컬렉션 인덱스
  CLASS_ATTENDANCE_BY_ENROLLMENT: 'class_attendance/enrollmentId/Ascending',
  CLASS_ATTENDANCE_BY_DATE: 'class_attendance/date/Ascending',
  CLASS_ATTENDANCE_BY_STATUS: 'class_attendance/status/Ascending',
} as const;
