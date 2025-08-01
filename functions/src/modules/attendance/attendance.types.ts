// 출석 상태 타입
export type AttendanceStatus = "present" | "late" | "absent_excused" | "absent_unexcused"

// 출석 인터페이스
export interface Attendance {
  attendance_id: string;
  student_id: string;
  att_date: string; // YYYY-MM-DD 형태
  status: AttendanceStatus;
  reason?: string; // 결석 사유
  checkin_time?: string; // HH:MM 형태
  checkout_time?: string; // HH:MM 형태
  created_at: FirebaseFirestore.Timestamp;
  updated_at: FirebaseFirestore.Timestamp;
}

// 출석 생성 요청 타입
export interface CreateAttendanceRequest {
  student_id: string;
  att_date: string;
  status: AttendanceStatus;
  reason?: string;
  checkin_time?: string;
  checkout_time?: string;
}

// 출석 업데이트 요청 타입
export interface UpdateAttendanceRequest {
  status?: AttendanceStatus;
  reason?: string;
  checkin_time?: string;
  checkout_time?: string;
}

// 출석 조회 필터 타입
export interface AttendanceFilter {
  student_id?: string;
  att_date?: string;
  date_range?: {
    from: string; // YYYY-MM-DD
    to: string; // YYYY-MM-DD
  };
  status?: AttendanceStatus;
}

// 출석 통계 타입
export interface AttendanceStats {
  total_days: number;
  present_days: number;
  late_days: number;
  absent_excused_days: number;
  absent_unexcused_days: number;
  attendance_rate: number; // 출석률 (0-100)
}

// 일별 출석 요약 타입
export interface DailyAttendanceSummary {
  date: string;
  total_students: number;
  present_count: number;
  late_count: number;
  absent_excused_count: number;
  absent_unexcused_count: number;
  attendance_rate: number;
}

// 학생별 출석 요약 타입
export interface StudentAttendanceSummary {
  student_id: string;
  student_name: string;
  total_days: number;
  present_days: number;
  late_days: number;
  absent_excused_days: number;
  absent_unexcused_days: number;
  attendance_rate: number;
  last_attendance_date?: string;
  last_attendance_status?: AttendanceStatus;
}

// 출석 체크인/체크아웃 요청 타입
export interface CheckInOutRequest {
  student_id: string;
  action: "checkin" | "checkout";
  time?: string; // HH:MM 형태, 없으면 현재 시간
}
