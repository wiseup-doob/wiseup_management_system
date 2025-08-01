import * as admin from 'firebase-admin';
import { FirestoreSchedule as CommonFirestoreSchedule } from '../../common/firestore.types';

// 일정 타입 정의
export type ScheduleType = 'class' | 'exam' | 'event' | 'meeting';

// 일정 상태 타입
export type ScheduleStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

// 일정 인터페이스
export interface Schedule {
  schedule_id: string;
  user_id: string;
  class_id: string;
  subject_id: string;
  student_id: string;
  start_date: string; // YYYY-MM-DD 형태
  end_date: string; // YYYY-MM-DD 형태
  title: string;
  description?: string;
  created_at: admin.firestore.Timestamp;
  updated_at: admin.firestore.Timestamp;
}

// Firestore 일정 문서 타입 (Common 타입 확장)
export interface FirestoreSchedule extends CommonFirestoreSchedule {
  created_at: admin.firestore.Timestamp;
  updated_at: admin.firestore.Timestamp;
}

// 일정 생성 요청 타입
export interface CreateScheduleRequest {
  user_id: string;
  class_id: string;
  subject_id: string;
  student_id: string;
  start_date: string;
  end_date: string;
  title: string;
  description?: string;
}

// 일정 업데이트 요청 타입
export interface UpdateScheduleRequest {
  start_date?: string;
  end_date?: string;
  title?: string;
  description?: string;
}

// 일정 조회 필터 타입
export interface ScheduleFilter {
  user_id?: string;
  class_id?: string;
  subject_id?: string;
  student_id?: string;
  date_range?: {
    from: string; // YYYY-MM-DD
    to: string; // YYYY-MM-DD
  };
  title?: string;
}

// 일정 상세 정보 타입 (관계 데이터 포함)
export interface ScheduleWithDetails extends Schedule {
  user_name?: string;
  class_name?: string;
  subject_name?: string;
  student_name?: string;
}

// 일정 통계 타입
export interface ScheduleStats {
  total_schedules: number;
  upcoming_schedules: number;
  completed_schedules: number;
  cancelled_schedules: number;
}

// 일별 일정 요약 타입
export interface DailyScheduleSummary {
  date: string;
  total_schedules: number;
  class_schedules: number;
  exam_schedules: number;
  event_schedules: number;
  meeting_schedules: number;
}

// 학생별 일정 요약 타입
export interface StudentScheduleSummary {
  student_id: string;
  student_name: string;
  total_schedules: number;
  upcoming_schedules: number;
  completed_schedules: number;
  next_schedule?: Schedule;
}

// 반별 일정 요약 타입
export interface ClassScheduleSummary {
  class_id: string;
  class_name: string;
  total_schedules: number;
  upcoming_schedules: number;
  completed_schedules: number;
  next_schedule?: Schedule;
} 