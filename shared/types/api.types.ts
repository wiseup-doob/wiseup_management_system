// API 구조를 위한 타입 정의
import type { 
  Student, 
  AttendanceRecord
} from './database.types';
import type { DateString, TimeString, StudentId, SeatId } from './common.types';
import type { 
  Timetable, 
  TimetableItem, 
  Class, 
  Teacher, 
  Classroom, 
  Enrollment, 
  ClassAttendance, 
  TimetableSummary, 
  TimetableStats, 
  TeacherStats, 
  StudentTimetableStats
} from './timetable.types';

// ===== 학생 관련 API 타입 =====

// 학생 목록 조회 요청
export interface GetStudentsRequest {
  page?: number;
  limit?: number;
  search?: string;
  grade?: string;
  className?: string;
  status?: 'active' | 'inactive';
  currentAttendance?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 학생 목록 조회 응답
export interface GetStudentsResponse {
  students: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 개별 학생 조회 응답
export interface GetStudentResponse {
  student: Student;
}

// 학생 생성 요청
export interface CreateStudentRequest {
  name: string;
  grade: string;
  className: string;
  status?: 'active' | 'inactive';
  enrollmentDate?: DateString;
  graduationDate?: DateString;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  parentInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  currentAttendance?: string;
  firstAttendanceDate?: DateString;
}

// 학생 수정 요청
export interface UpdateStudentRequest {
  name?: string;
  grade?: string;
  className?: string;
  status?: 'active' | 'inactive';
  enrollmentDate?: DateString;
  graduationDate?: DateString;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  parentInfo?: {
    name?: string;
    phone?: string;
    email?: string;
  };
  currentAttendance?: string;
  firstAttendanceDate?: DateString;
}

// 학생 검색 요청
export interface SearchStudentsRequest {
  query: string;
  page?: number;
  limit?: number;
  filters?: {
    grade?: string;
    className?: string;
    status?: 'active' | 'inactive';
    currentAttendance?: string;
  };
}

// 학생 검색 응답
export interface SearchStudentsResponse {
  students: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== 출석 관련 API 타입 =====

// 출석 기록 생성 요청
export interface CreateAttendanceRecordRequest {
  studentId: StudentId;
  date: DateString;
  status: string;
  checkInTime?: TimeString;
  checkOutTime?: TimeString;
  totalHours?: number;
  location?: string;
  notes?: string;
  updatedBy?: string;
}

// 출석 기록 수정 요청
export interface UpdateAttendanceRecordRequest {
  status?: string;
  checkInTime?: TimeString;
  checkOutTime?: TimeString;
  totalHours?: number;
  location?: string;
  notes?: string;
  updatedBy?: string;
}

// 출석 기록 조회 요청
export interface GetAttendanceRecordsRequest {
  page?: number;
  limit?: number;
  studentId?: StudentId;
  studentName?: string;
  seatId?: SeatId;
  date?: DateString;
  startDate?: DateString;
  endDate?: DateString;
  status?: string;
  checkInTimeRange?: {
    start: TimeString;
    end: TimeString;
  };
  totalHoursRange?: {
    min: number;
    max: number;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 출석 기록 조회 응답
export interface GetAttendanceRecordsResponse {
  records: AttendanceRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 일괄 출석 업데이트 요청
export interface BulkAttendanceUpdateRequest {
  updates: Array<{
    studentId: StudentId;
    status: string;
    checkInTime?: TimeString;
    checkOutTime?: TimeString;
    notes?: string;
  }>;
  date: DateString;
  updatedBy?: string;
}

// 일괄 출석 업데이트 응답
export interface BulkAttendanceUpdateResponse {
  success: boolean;
  updatedCount: number;
  errors: Array<{
    studentId: StudentId;
    error: string;
  }>;
}

// 출석 통계 조회 요청
export interface GetAttendanceStatsRequest {
  startDate?: DateString;
  endDate?: DateString;
  studentId?: StudentId;
  className?: string;
  grade?: string;
}

// 출석 통계 조회 응답
export interface GetAttendanceStatsResponse {
  totalRecords: number;
  statusCounts: Record<string, number>;
  averageCheckInTime?: TimeString;
  averageCheckOutTime?: TimeString;
  lateCount: number;
  earlyLeaveCount: number;
  averageAttendanceRate: number;
  dailyStats?: Array<{
    date: DateString;
    total: number;
    present: number;
    dismissed: number;
    unauthorizedAbsent: number;
    authorizedAbsent: number;
  }>;
}

// 출석 기록 검색 요청
export interface SearchAttendanceRecordsRequest {
  query: string;
  page?: number;
  limit?: number;
  filters?: {
    date?: DateString;
    status?: string;
    studentId?: StudentId;
  };
}

// 출석 기록 검색 응답
export interface SearchAttendanceRecordsResponse {
  records: AttendanceRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== 시간표 관련 API 타입 =====

// 시간표 목록 조회 요청
export interface GetTimetablesRequest {
  page?: number;
  limit?: number;
  academicYear?: string;
  semester?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 시간표 목록 조회 응답
export interface GetTimetablesResponse {
  timetables: Timetable[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 개별 시간표 조회 응답
export interface GetTimetableResponse {
  timetable: Timetable;
  items: TimetableItem[];
  summary: TimetableSummary;
}

// 시간표 생성 응답
export interface CreateTimetableResponse {
  timetable: Timetable;
  message: string;
}

// 시간표 수정 응답
export interface UpdateTimetableResponse {
  timetable: Timetable;
  message: string;
}

// 수업 목록 조회 요청
export interface GetClassesRequest {
  page?: number;
  limit?: number;
  subject?: string;
  teacherId?: string;
  grade?: string;
  status?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 수업 목록 조회 응답
export interface GetClassesResponse {
  classes: Class[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 개별 수업 조회 응답
export interface GetClassResponse {
  class: Class;
  enrollments: Enrollment[];
  attendanceStats: {
    totalStudents: number;
    averageAttendanceRate: number;
  };
}

// 수업 생성 응답
export interface CreateClassResponse {
  class: Class;
  message: string;
}

// 수업 수정 응답
export interface UpdateClassResponse {
  class: Class;
  message: string;
}

// 교사 목록 조회 요청
export interface GetTeachersRequest {
  page?: number;
  limit?: number;
  name?: string;
  subject?: string;
  gradeLevel?: string;
  status?: 'active' | 'inactive';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 교사 목록 조회 응답
export interface GetTeachersResponse {
  teachers: Teacher[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 개별 교사 조회 응답
export interface GetTeacherResponse {
  teacher: Teacher;
  classes: Class[];
  stats: TeacherStats;
}

// 교사 생성 요청
export interface CreateTeacherRequest {
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  gradeLevels: string[];
  status?: 'active' | 'inactive';
  hireDate: DateString;
  notes?: string;
}

// 교사 수정 요청
export interface UpdateTeacherRequest {
  name?: string;
  email?: string;
  phone?: string;
  subjects?: string[];
  gradeLevels?: string[];
  status?: 'active' | 'inactive';
  hireDate?: DateString;
  resignationDate?: DateString;
  notes?: string;
}

// 교사 생성 응답
export interface CreateTeacherResponse {
  teacher: Teacher;
  message: string;
}

// 교사 수정 응답
export interface UpdateTeacherResponse {
  teacher: Teacher;
  message: string;
}

// 강의실 목록 조회 요청
export interface GetClassroomsRequest {
  page?: number;
  limit?: number;
  name?: string;
  capacity?: number;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 강의실 목록 조회 응답
export interface GetClassroomsResponse {
  classrooms: Classroom[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 개별 강의실 조회 응답
export interface GetClassroomResponse {
  classroom: Classroom;
  scheduledClasses: TimetableItem[];
}

// 강의실 생성 요청
export interface CreateClassroomRequest {
  name: string;
  capacity: number;
  equipment?: string[];
  features?: string[];
  isActive?: boolean;
  notes?: string;
}

// 강의실 수정 요청
export interface UpdateClassroomRequest {
  name?: string;
  capacity?: number;
  equipment?: string[];
  features?: string[];
  isActive?: boolean;
  notes?: string;
}

// 강의실 생성 응답
export interface CreateClassroomResponse {
  classroom: Classroom;
  message: string;
}

// 강의실 수정 응답
export interface UpdateClassroomResponse {
  classroom: Classroom;
  message: string;
}

// 수강신청 목록 조회 요청
export interface GetEnrollmentsRequest {
  page?: number;
  limit?: number;
  studentId?: string;
  classId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 수강신청 목록 조회 응답
export interface GetEnrollmentsResponse {
  enrollments: Enrollment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 개별 수강신청 조회 응답
export interface GetEnrollmentResponse {
  enrollment: Enrollment;
  attendanceRecords: ClassAttendance[];
}

// 수강신청 생성 응답
export interface CreateEnrollmentResponse {
  enrollment: Enrollment;
  message: string;
}

// 수강신청 수정 요청
export interface UpdateEnrollmentRequest {
  status?: string;
  grade?: string;
  attendanceRate?: number;
  notes?: string;
}

// 수강신청 수정 응답
export interface UpdateEnrollmentResponse {
  enrollment: Enrollment;
  message: string;
}

// 수업 출석 생성 요청
export interface CreateClassAttendanceRequest {
  enrollmentId: string;
  timetableItemId: string;
  date: DateString;
  status: string;
  checkInTime?: TimeString;
  checkOutTime?: TimeString;
  notes?: string;
}

// 수업 출석 수정 요청
export interface UpdateClassAttendanceRequest {
  status?: string;
  checkInTime?: TimeString;
  checkOutTime?: TimeString;
  notes?: string;
}

// 수업 출석 생성 응답
export interface CreateClassAttendanceResponse {
  attendance: ClassAttendance;
  message: string;
}

// 수업 출석 수정 응답
export interface UpdateClassAttendanceResponse {
  attendance: ClassAttendance;
  message: string;
}

// 수업 출석 조회 요청
export interface GetClassAttendanceRequest {
  enrollmentId?: string;
  timetableItemId?: string;
  date?: DateString;
  startDate?: DateString;
  endDate?: DateString;
  status?: string;
}

// 수업 출석 조회 응답
export interface GetClassAttendanceResponse {
  attendanceRecords: ClassAttendance[];
  total: number;
  stats: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    averageAttendanceRate: number;
  };
}

// 시간표 통계 조회 요청
export interface GetTimetableStatsRequest {
  timetableId?: string;
  startDate?: DateString;
  endDate?: DateString;
}

// 시간표 통계 조회 응답
export interface GetTimetableStatsResponse {
  stats: TimetableStats;
  dailyStats?: Array<{
    date: DateString;
    totalClasses: number;
    totalStudents: number;
    averageAttendanceRate: number;
  }>;
}

// 교사 통계 조회 요청
export interface GetTeacherStatsRequest {
  teacherId?: string;
  startDate?: DateString;
  endDate?: DateString;
}

// 교사 통계 조회 응답
export interface GetTeacherStatsResponse {
  stats: TeacherStats[];
  totalTeachers: number;
  averageClassSize: number;
  averageAttendanceRate: number;
}

// 학생 시간표 통계 조회 요청
export interface GetStudentTimetableStatsRequest {
  studentId?: string;
  startDate?: DateString;
  endDate?: DateString;
}

// 학생 시간표 통계 조회 응답
export interface GetStudentTimetableStatsResponse {
  stats: StudentTimetableStats[];
  totalStudents: number;
  averageEnrollments: number;
  averageAttendanceRate: number;
} 