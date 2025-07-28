import { z } from 'zod'

/** 24시간 HH:MM 포맷 + 분(minute) % 30 === 0 검증용 정규표현 */
const timeRegex = /^([01]\d|2[0-3]):(00|30)$/;

/** YYYY-MM-DD 날짜 형식 검증 */
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

/** 학기 형식 검증 (예: 2024-1, 2024-2) */
const semesterRegex = /^\d{4}-[12]$/;

export const TimetableEntrySchema = z.object({
  id: z.string().optional(),
  weekday: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']),
  startTime: z
    .string()
    .regex(timeRegex, { message: 'startTime must be HH:MM at 30-min steps' }),
  endTime: z
    .string()
    .regex(timeRegex, { message: 'endTime must be HH:MM at 30-min steps' }),
    
  subject: z.string().min(1, { message: 'Subject is required' }),
  teacher: z.string().optional(),
  room: z.string().optional(),
  
  // 새로운 필드들
  type: z.enum(['weekly', 'specific']),
  date: z.string().regex(dateRegex, { message: 'Date must be YYYY-MM-DD format' }).optional(),
  effectiveFrom: z.string().regex(dateRegex, { message: 'effectiveFrom must be YYYY-MM-DD format' }).optional(),
  effectiveTo: z.string().regex(dateRegex, { message: 'effectiveTo must be YYYY-MM-DD format' }).optional(),
  isActive: z.boolean().optional().default(true),
  notes: z.string().optional()
}).refine(({ startTime, endTime }) => startTime < endTime, {
  message: 'endTime must be later than startTime',
  path: ['endTime']
}).refine(({ type, date }) => {
  // specific 타입일 때는 date가 필수
  if (type === 'specific') {
    return !!date;
  }
  return true;
}, {
  message: 'date is required when type is specific',
  path: ['date']
}).refine(({ effectiveFrom, effectiveTo }) => {
  // 둘 다 있을 때는 effectiveFrom <= effectiveTo
  if (effectiveFrom && effectiveTo) {
    return effectiveFrom <= effectiveTo;
  }
  return true;
}, {
  message: 'effectiveTo must be later than or equal to effectiveFrom',
  path: ['effectiveTo']
});

export const StudentTimetableSchema = z.object({
  studentId: z.string().min(1, { message: 'Student ID is required' }),
  entries: z.array(TimetableEntrySchema).min(1, { message: 'At least one entry is required' }),
  semester: z.string().regex(semesterRegex, { message: 'Semester must be YYYY-1 or YYYY-2 format' }).optional(),
  academicYear: z.number().int().min(2020).max(2050).optional()
}).refine((data) => {
  // 시간표 중복 체크 (완전한 충돌 검사)
  const timeSlots = data.entries.map(entry => ({
    weekday: entry.weekday,
    startTime: entry.startTime,
    endTime: entry.endTime,
    date: entry.date,
    type: entry.type,
    effectiveFrom: entry.effectiveFrom,
    effectiveTo: entry.effectiveTo
  }));

  for (let i = 0; i < timeSlots.length; i++) {
    for (let j = i + 1; j < timeSlots.length; j++) {
      const slot1 = timeSlots[i];
      const slot2 = timeSlots[j];
      
      let isConflict = false;
      
      if (slot1.type === 'specific' && slot2.type === 'specific') {
        // 둘 다 특정 날짜면 같은 날짜인지 확인
        if (slot1.date === slot2.date) {
          isConflict = !(slot1.endTime <= slot2.startTime || slot2.endTime <= slot1.startTime);
        }
      } else if (slot1.type === 'weekly' && slot2.type === 'weekly') {
        // 둘 다 주간 반복이면 같은 요일인지 확인
        if (slot1.weekday === slot2.weekday) {
          isConflict = !(slot1.endTime <= slot2.startTime || slot2.endTime <= slot1.startTime);
        }
      } else {
        // specific과 weekly가 섞인 경우
        const specificSlot = slot1.type === 'specific' ? slot1 : slot2;
        const weeklySlot = slot1.type === 'weekly' ? slot1 : slot2;
        
        if (specificSlot.date && weeklySlot.weekday) {
          // 특정 날짜가 주간 반복 일정의 요일과 일치하는지 확인
          const specificDate = new Date(specificSlot.date);
          const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const dayOfWeek = weekdays[specificDate.getDay()];
          
          if (dayOfWeek === weeklySlot.weekday) {
            // 요일이 같으면 유효 기간 체크
            const startDate = weeklySlot.effectiveFrom || '1900-01-01';
            const endDate = weeklySlot.effectiveTo || '2100-12-31';
            
            if (specificSlot.date >= startDate && specificSlot.date <= endDate) {
              // 시간이 겹치는지 체크
              isConflict = !(specificSlot.endTime <= weeklySlot.startTime || weeklySlot.endTime <= specificSlot.startTime);
            }
          }
        }
      }
      
      if (isConflict) {
        return false;
      }
    }
  }
  return true;
}, {
  message: 'Time slots cannot overlap',
  path: ['entries']
});

export const PartialTimetableSchema = StudentTimetableSchema.partial().extend({
  entries: z.array(TimetableEntrySchema).optional()
});

// 시간표 조회용 필터 스키마
export const TimetableFilterSchema = z.object({
  studentId: z.string().min(1),
  date: z.string().regex(dateRegex).optional(),
  dateRange: z.object({
    from: z.string().regex(dateRegex),
    to: z.string().regex(dateRegex)
  }).optional(),
  weekday: z.enum(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']).optional(),
  semester: z.string().regex(semesterRegex).optional(),
  isActive: z.boolean().optional()
}).refine(({ dateRange }) => {
  if (dateRange) {
    return dateRange.from <= dateRange.to;
  }
  return true;
}, {
  message: 'dateRange.to must be later than or equal to dateRange.from',
  path: ['dateRange', 'to']
});