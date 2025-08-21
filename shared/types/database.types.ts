// 개선된 데이터베이스 구조를 위한 타입 정의
import type { 
  DateString, 
  TimeString
} from './common.types'

// ===== 공통 통계 및 검색 타입 =====

// 일별 요약 통계 (daily_summaries 컬렉션)
export interface DailySummary {
  id: string;
  date: DateString; // 요약 날짜
  totalStudents: number;
  presentCount: number;
  dismissedCount: number;
  unauthorizedAbsentCount: number;
  authorizedAbsentCount: number;
  notEnrolledCount: number;
  
  // 시간별 통계
  averageCheckInTime?: TimeString;
  averageCheckOutTime?: TimeString;
  lateCount?: number;
  earlyLeaveCount?: number;
  
  // 클래스별 통계
  classStats?: {
    [className: string]: {
      present: number;
      dismissed: number;
      unauthorizedAbsent: number;
      authorizedAbsent: number;
      notEnrolled: number;
    };
  };
  
  // 좌석별 통계
  seatStats?: {
    [seatId: string]: {
      studentId?: string;
      status: string; // AttendanceStatus는 개별 파일에서 정의
      checkInTime?: TimeString;
      checkOutTime?: TimeString;
    };
  };
}

// 월별 리포트 (monthly_reports 컬렉션)
export interface MonthlyReport {
  id: string;
  year: number;
  month: number; // 1-12
  totalStudents: number;
  totalAttendanceDays: number;
  averageAttendanceRate: number; // 0-1
  
  // 출석 상태별 통계
  statusStats: {
    present: number;
    dismissed: number;
    unauthorizedAbsent: number;
    authorizedAbsent: number;
    notEnrolled: number;
  };
  
  // 학생별 상세 통계
  studentStats?: {
    [studentId: string]: {
      totalDays: number;
      presentDays: number;
      attendanceRate: number;
      averageCheckInTime?: TimeString;
      averageCheckOutTime?: TimeString;
      lateCount: number;
      earlyLeaveCount: number;
    };
  };
}

// ===== 컬렉션 이름 =====

// 데이터베이스 컬렉션 이름
export const COLLECTION_NAMES = {
  STUDENTS: 'students',
  PARENTS: 'parents',
  TEACHERS: 'teachers',
  COURSES: 'courses',
  CLASS_SECTIONS: 'class_sections',
  CLASSROOMS: 'classrooms',
  SEATS: 'seats',
  SEAT_ASSIGNMENTS: 'seat_assignments',
  STUDENT_TIMETABLES: 'student_timetables',
  STUDENT_SUMMARIES: 'student_summaries',
  ATTENDANCE_RECORDS: 'attendance_records',
  DAILY_SUMMARIES: 'daily_summaries',
  MONTHLY_REPORTS: 'monthly_reports',
} as const;

// ===== 인덱스 정의 =====

// 인덱스 정의
export const REQUIRED_INDEXES = {
  // students 컬렉션 인덱스
  STUDENTS_BY_NAME: 'students/name/Ascending',
  STUDENTS_BY_GRADE: 'students/grade/Ascending',
  STUDENTS_BY_CLASS: 'students/className/Ascending',
  STUDENTS_BY_STATUS: 'students/status/Ascending',
  STUDENTS_BY_ENROLLMENT_DATE: 'students/enrollmentDate/Descending',
  
  // parents 컬렉션 인덱스
  PARENTS_BY_NAME: 'parents/name/Ascending',
  PARENTS_BY_PHONE: 'parents/phone/Ascending',
  PARENTS_BY_EMAIL: 'parents/email/Ascending',
  
  // teachers 컬렉션 인덱스
  TEACHERS_BY_NAME: 'teachers/name/Ascending',
  TEACHERS_BY_SUBJECT: 'teachers/subjects/Ascending',
  TEACHERS_BY_EMAIL: 'teachers/email/Ascending',
  
  // courses 컬렉션 인덱스
  COURSES_BY_SUBJECT: 'courses/subject/Ascending',
  COURSES_BY_DIFFICULTY: 'courses/difficulty/Ascending',
  
  // class_sections 컬렉션 인덱스
  CLASS_SECTIONS_BY_TEACHER: 'class_sections/teacherId/Ascending',
  CLASS_SECTIONS_BY_CLASSROOM: 'class_sections/classroomId/Ascending',
  CLASS_SECTIONS_BY_SUBJECT: 'class_sections/subject/Ascending',
  
  // seats 컬렉션 인덱스
  SEATS_BY_NUMBER: 'seats/seatNumber/Ascending',
  SEATS_BY_STATUS: 'seats/status/Ascending',
  
  // seat_assignments 컬렉션 인덱스
  SEAT_ASSIGNMENTS_BY_STUDENT: 'seat_assignments/studentId/Ascending',
  SEAT_ASSIGNMENTS_BY_SEAT: 'seat_assignments/seatId/Ascending',
  SEAT_ASSIGNMENTS_BY_DATE: 'seat_assignments/assignedDate/Descending',
  
  // attendance_records 컬렉션 인덱스
  ATTENDANCE_BY_STUDENT_DATE: 'attendance_records/studentId/Ascending/date/Descending',
  ATTENDANCE_BY_STUDENT_STATUS: 'attendance_records/studentId/Ascending/status/Ascending',
  ATTENDANCE_BY_DATE_STATUS: 'attendance_records/date/Ascending/status/Ascending',
  ATTENDANCE_BY_STUDENT_DATE_STATUS: 'attendance_records/studentId/Ascending/date/Ascending/status/Ascending',
  ATTENDANCE_BY_CHECKIN_TIME: 'attendance_records/checkInTime/Ascending',
  ATTENDANCE_BY_SEAT: 'attendance_records/seatId/Ascending',
  
  // daily_summaries 컬렉션 인덱스
  DAILY_SUMMARIES_BY_DATE: 'daily_summaries/date/Descending',
  
  // monthly_reports 컬렉션 인덱스
  MONTHLY_REPORTS_BY_YEAR_MONTH: 'monthly_reports/year/Descending/month/Descending',
} as const; 