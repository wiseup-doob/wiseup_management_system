import { z } from 'zod';

// 일정 생성 요청 검증 스키마
export const CreateScheduleSchema = z.object({
  user_id: z.string().min(1, '사용자 ID는 필수입니다'),
  class_id: z.string().min(1, '반 ID는 필수입니다'),
  subject_id: z.string().min(1, '과목 ID는 필수입니다'),
  student_id: z.string().min(1, '학생 ID는 필수입니다'),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '시작 날짜는 YYYY-MM-DD 형식이어야 합니다'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '종료 날짜는 YYYY-MM-DD 형식이어야 합니다'),
  title: z.string().min(1, '제목은 필수입니다').max(100, '제목은 100자 이하여야 합니다'),
  description: z.string().optional(),
}).refine((data) => {
  const startDate = new Date(data.start_date);
  const endDate = new Date(data.end_date);
  return endDate >= startDate;
}, {
  message: '종료 날짜는 시작 날짜보다 같거나 늦어야 합니다',
  path: ['end_date'],
});

// 일정 업데이트 요청 검증 스키마
export const UpdateScheduleSchema = z.object({
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '시작 날짜는 YYYY-MM-DD 형식이어야 합니다').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '종료 날짜는 YYYY-MM-DD 형식이어야 합니다').optional(),
  title: z.string().min(1, '제목은 필수입니다').max(100, '제목은 100자 이하여야 합니다').optional(),
  description: z.string().optional(),
}).refine((data) => {
  if (data.start_date && data.end_date) {
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    return endDate >= startDate;
  }
  return true;
}, {
  message: '종료 날짜는 시작 날짜보다 같거나 늦어야 합니다',
  path: ['end_date'],
});

// 일정 조회 필터 검증 스키마
export const ScheduleFilterSchema = z.object({
  user_id: z.string().optional(),
  class_id: z.string().optional(),
  subject_id: z.string().optional(),
  student_id: z.string().optional(),
  date_range: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '시작 날짜는 YYYY-MM-DD 형식이어야 합니다'),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '종료 날짜는 YYYY-MM-DD 형식이어야 합니다'),
  }).optional(),
  title: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
}).refine((data) => {
  if (data.date_range) {
    const fromDate = new Date(data.date_range.from);
    const toDate = new Date(data.date_range.to);
    return toDate >= fromDate;
  }
  return true;
}, {
  message: '종료 날짜는 시작 날짜보다 같거나 늦어야 합니다',
  path: ['date_range'],
});

// 일정 ID 검증 스키마
export const ScheduleIdSchema = z.object({
  id: z.string().min(1, '일정 ID는 필수입니다'),
});

// 일정 통계 조회 검증 스키마
export const ScheduleStatsFilterSchema = z.object({
  user_id: z.string().optional(),
  class_id: z.string().optional(),
  student_id: z.string().optional(),
  date_range: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '시작 날짜는 YYYY-MM-DD 형식이어야 합니다'),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '종료 날짜는 YYYY-MM-DD 형식이어야 합니다'),
  }).optional(),
});

// 일별 일정 요약 조회 검증 스키마
export const DailyScheduleSummarySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜는 YYYY-MM-DD 형식이어야 합니다'),
  class_id: z.string().optional(),
  student_id: z.string().optional(),
});

// 학생별 일정 요약 조회 검증 스키마
export const StudentScheduleSummarySchema = z.object({
  student_id: z.string().min(1, '학생 ID는 필수입니다'),
  date_range: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '시작 날짜는 YYYY-MM-DD 형식이어야 합니다'),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '종료 날짜는 YYYY-MM-DD 형식이어야 합니다'),
  }).optional(),
});

// 반별 일정 요약 조회 검증 스키마
export const ClassScheduleSummarySchema = z.object({
  class_id: z.string().min(1, '반 ID는 필수입니다'),
  date_range: z.object({
    from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '시작 날짜는 YYYY-MM-DD 형식이어야 합니다'),
    to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '종료 날짜는 YYYY-MM-DD 형식이어야 합니다'),
  }).optional(),
}); 