import {z} from "zod";

/** 학생 ID 검증 (student_로 시작하는 문자열) */
const studentIdRegex = /^student_\d+_[a-zA-Z0-9]+$/;

/** 출석 ID 검증 (att_로 시작하는 문자열) */
const attendanceIdRegex = /^att_\d+_[a-zA-Z0-9]+$/;

/** 날짜 형식 검증 (YYYY-MM-DD) */
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

/** 시간 형식 검증 (HH:MM) */
const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

/** 출석 상태 검증 */
const attendanceStatusRegex = /^(present|late|absent_excused|absent_unexcused)$/;

/** 체크인/체크아웃 액션 검증 */
const checkInOutActionRegex = /^(checkin|checkout)$/;

// 출석 스키마
export const AttendanceSchema = z.object({
  attendance_id: z.string().regex(attendanceIdRegex, {message: "Attendance ID must start with att_"}),
  student_id: z.string().regex(studentIdRegex, {message: "Student ID must start with student_"}),
  att_date: z.string().regex(dateRegex, {message: "Date must be in YYYY-MM-DD format"}),
  status: z.string().regex(attendanceStatusRegex, {message: "Status must be one of: present, late, absent_excused, absent_unexcused"}),
  reason: z.string().max(500, {message: "Reason must be at most 500 characters"}).optional(),
  checkin_time: z.string().regex(timeRegex, {message: "Check-in time must be in HH:MM format"}).optional(),
  checkout_time: z.string().regex(timeRegex, {message: "Check-out time must be in HH:MM format"}).optional(),
});

// 출석 생성 요청 스키마
export const CreateAttendanceSchema = z.object({
  student_id: z.string().regex(studentIdRegex, {message: "Student ID must start with student_"}),
  att_date: z.string().regex(dateRegex, {message: "Date must be in YYYY-MM-DD format"}),
  status: z.string().regex(attendanceStatusRegex, {message: "Status must be one of: present, late, absent_excused, absent_unexcused"}),
  reason: z.string().max(500, {message: "Reason must be at most 500 characters"}).optional(),
  checkin_time: z.string().regex(timeRegex, {message: "Check-in time must be in HH:MM format"}).optional(),
  checkout_time: z.string().regex(timeRegex, {message: "Check-out time must be in HH:MM format"}).optional(),
});

// 출석 업데이트 요청 스키마
export const UpdateAttendanceSchema = z.object({
  status: z.string().regex(attendanceStatusRegex, {message: "Status must be one of: present, late, absent_excused, absent_unexcused"}).optional(),
  reason: z.string().max(500, {message: "Reason must be at most 500 characters"}).optional(),
  checkin_time: z.string().regex(timeRegex, {message: "Check-in time must be in HH:MM format"}).optional(),
  checkout_time: z.string().regex(timeRegex, {message: "Check-out time must be in HH:MM format"}).optional(),
});

// 출석 조회 필터 스키마
export const AttendanceFilterSchema = z.object({
  student_id: z.string().regex(studentIdRegex, {message: "Student ID must start with student_"}).optional(),
  att_date: z.string().regex(dateRegex, {message: "Date must be in YYYY-MM-DD format"}).optional(),
  status: z.string().regex(attendanceStatusRegex, {message: "Status must be one of: present, late, absent_excused, absent_unexcused"}).optional(),
  date_range: z.object({
    from: z.string().regex(dateRegex, {message: "From date must be in YYYY-MM-DD format"}),
    to: z.string().regex(dateRegex, {message: "To date must be in YYYY-MM-DD format"}),
  }).optional(),
});

// 체크인/체크아웃 요청 스키마
export const CheckInOutSchema = z.object({
  student_id: z.string().regex(studentIdRegex, {message: "Student ID must start with student_"}),
  action: z.string().regex(checkInOutActionRegex, {message: "Action must be either checkin or checkout"}),
  time: z.string().regex(timeRegex, {message: "Time must be in HH:MM format"}).optional(),
});

// 출석 ID 파라미터 검증 스키마
export const AttendanceIdParamSchema = z.object({
  attendanceId: z.string().regex(attendanceIdRegex, {message: "Attendance ID must start with att_"}),
});

// 학생 ID 파라미터 검증 스키마
export const StudentIdParamSchema = z.object({
  studentId: z.string().regex(studentIdRegex, {message: "Student ID must start with student_"}),
});

// 날짜 파라미터 검증 스키마
export const DateParamSchema = z.object({
  date: z.string().regex(dateRegex, {message: "Date must be in YYYY-MM-DD format"}),
});

// 학생 날짜 파라미터 검증 스키마
export const StudentDateParamSchema = z.object({
  studentId: z.string().regex(studentIdRegex, {message: "Student ID must start with student_"}),
  date: z.string().regex(dateRegex, {message: "Date must be in YYYY-MM-DD format"}),
});

// 날짜 범위 쿼리 파라미터 검증 스키마
export const DateRangeQuerySchema = z.object({
  from: z.string().regex(dateRegex, {message: "From date must be in YYYY-MM-DD format"}).optional(),
  to: z.string().regex(dateRegex, {message: "To date must be in YYYY-MM-DD format"}).optional(),
});
