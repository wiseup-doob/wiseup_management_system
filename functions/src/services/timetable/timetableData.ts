import type { 
  TimeSlot, 
  Class, 
  Teacher, 
  Classroom, 
  TimetableItem,
  CreateTimetableRequest
} from '@shared/types'

// ===== 시간대 샘플 데이터 =====
export const sampleTimeSlots: Omit<TimeSlot, 'id'>[] = [
  { name: '1교시', startTime: '09:00', endTime: '10:00', duration: 60, isBreak: false, order: 1 },
  { name: '2교시', startTime: '10:00', endTime: '11:00', duration: 60, isBreak: false, order: 2 },
  { name: '3교시', startTime: '11:00', endTime: '12:00', duration: 60, isBreak: false, order: 3 },
  { name: '점심시간', startTime: '12:00', endTime: '13:00', duration: 60, isBreak: true, order: 4 },
  { name: '4교시', startTime: '13:00', endTime: '14:00', duration: 60, isBreak: false, order: 5 },
  { name: '5교시', startTime: '14:00', endTime: '15:00', duration: 60, isBreak: false, order: 6 },
  { name: '6교시', startTime: '15:00', endTime: '16:00', duration: 60, isBreak: false, order: 7 },
  { name: '7교시', startTime: '16:00', endTime: '17:00', duration: 60, isBreak: false, order: 8 },
  { name: '8교시', startTime: '17:00', endTime: '18:00', duration: 60, isBreak: false, order: 9 },
  { name: '저녁시간', startTime: '18:00', endTime: '19:00', duration: 60, isBreak: true, order: 10 },
  { name: '9교시', startTime: '19:00', endTime: '20:00', duration: 60, isBreak: false, order: 11 },
  { name: '10교시', startTime: '20:00', endTime: '21:00', duration: 60, isBreak: false, order: 12 },
  { name: '11교시', startTime: '21:00', endTime: '22:00', duration: 60, isBreak: false, order: 13 },
  { name: '12교시', startTime: '22:00', endTime: '23:00', duration: 60, isBreak: false, order: 14 },
  { name: '13교시', startTime: '23:00', endTime: '24:00', duration: 60, isBreak: false, order: 15 },
]

// ===== 교사 샘플 데이터 =====
export const sampleTeachers: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '김국어',
    email: 'korean@wiseup.com',
    phone: '010-1234-5678',
    subjects: ['korean'],
    gradeLevels: ['중3', '고1', '고2', '고3'],
    status: 'active',
    hireDate: '2023-01-01',
    notes: '국어 전문 교사'
  },
  {
    name: '이수학',
    email: 'math@wiseup.com',
    phone: '010-2345-6789',
    subjects: ['math'],
    gradeLevels: ['중3', '고1', '고2', '고3'],
    status: 'active',
    hireDate: '2023-01-01',
    notes: '수학 전문 교사'
  },
  {
    name: '박영어',
    email: 'english@wiseup.com',
    phone: '010-3456-7890',
    subjects: ['english'],
    gradeLevels: ['중3', '고1', '고2', '고3'],
    status: 'active',
    hireDate: '2023-01-01',
    notes: '영어 전문 교사'
  },
  {
    name: '최과학',
    email: 'science@wiseup.com',
    phone: '010-4567-8901',
    subjects: ['science'],
    gradeLevels: ['중3', '고1', '고2', '고3'],
    status: 'active',
    hireDate: '2023-01-01',
    notes: '과학 전문 교사'
  },
  {
    name: '정사회',
    email: 'social@wiseup.com',
    phone: '010-5678-9012',
    subjects: ['social'],
    gradeLevels: ['중3', '고1', '고2', '고3'],
    status: 'active',
    hireDate: '2023-01-01',
    notes: '사회 전문 교사'
  }
]

// ===== 강의실 샘플 데이터 =====
export const sampleClassrooms: Omit<Classroom, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'A101',
    capacity: 30,
    equipment: ['프로젝터', '화이트보드', '컴퓨터'],
    features: ['에어컨', '조명'],
    isActive: true,
    notes: '메인 강의실'
  },
  {
    name: 'A102',
    capacity: 25,
    equipment: ['프로젝터', '화이트보드'],
    features: ['에어컨'],
    isActive: true,
    notes: '소규모 강의실'
  },
  {
    name: '컴퓨터실',
    capacity: 20,
    equipment: ['컴퓨터', '프로젝터', '화이트보드'],
    features: ['에어컨', '네트워크'],
    isActive: true,
    notes: '컴퓨터 수업용'
  },
  {
    name: 'B101',
    capacity: 35,
    equipment: ['프로젝터', '화이트보드', '스피커'],
    features: ['에어컨', '조명', '음향시스템'],
    isActive: true,
    notes: '대형 강의실'
  }
]

// ===== 수업 샘플 데이터 =====
export const sampleClasses: Omit<Class, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '국어 모의고사',
    subject: 'korean',
    classType: 'test',
    teacherId: 'teacher_1',
    grade: '고3',
    maxStudents: 20,
    currentStudents: 15,
    description: '수능 대비 국어 모의고사',
    materials: ['EBS 수능완성', '수능특강'],
    status: 'scheduled',
    isActive: true
  },
  {
    name: '수학 모의고사',
    subject: 'math',
    classType: 'test',
    teacherId: 'teacher_2',
    grade: '고3',
    maxStudents: 20,
    currentStudents: 18,
    description: '수능 대비 수학 모의고사',
    materials: ['수학의 정석', '수능특강'],
    status: 'scheduled',
    isActive: true
  },
  {
    name: '영어 모의고사',
    subject: 'english',
    classType: 'test',
    teacherId: 'teacher_3',
    grade: '고3',
    maxStudents: 20,
    currentStudents: 12,
    description: '수능 대비 영어 모의고사',
    materials: ['EBS 수능완성', '수능특강'],
    status: 'scheduled',
    isActive: true
  },
  {
    name: '과학 모의고사',
    subject: 'science',
    classType: 'test',
    teacherId: 'teacher_4',
    grade: '고3',
    maxStudents: 20,
    currentStudents: 10,
    description: '수능 대비 과학 모의고사',
    materials: ['수능특강', '완자'],
    status: 'scheduled',
    isActive: true
  },
  {
    name: '사회 모의고사',
    subject: 'social',
    classType: 'test',
    teacherId: 'teacher_5',
    grade: '고3',
    maxStudents: 20,
    currentStudents: 8,
    description: '수능 대비 사회 모의고사',
    materials: ['수능특강', '완자'],
    status: 'scheduled',
    isActive: true
  },
  {
    name: '국어 기초반',
    subject: 'korean',
    classType: 'regular',
    teacherId: 'teacher_1',
    grade: '중3',
    maxStudents: 15,
    currentStudents: 12,
    description: '중3 국어 기초 다지기',
    materials: ['중학 국어', '기초 문법'],
    status: 'scheduled',
    isActive: true
  },
  {
    name: '수학 심화반',
    subject: 'math',
    classType: 'special',
    teacherId: 'teacher_2',
    grade: '고2',
    maxStudents: 12,
    currentStudents: 10,
    description: '고2 수학 심화 과정',
    materials: ['미적분', '확률과 통계'],
    status: 'scheduled',
    isActive: true
  },
  {
    name: '영어 회화반',
    subject: 'english',
    classType: 'special',
    teacherId: 'teacher_3',
    grade: '고1',
    maxStudents: 10,
    currentStudents: 8,
    description: '고1 영어 회화 연습',
    materials: ['영어 회화 교재', '듣기 자료'],
    status: 'scheduled',
    isActive: true
  },
  {
    name: '과학 실험반',
    subject: 'science',
    classType: 'activity',
    teacherId: 'teacher_4',
    grade: '고2',
    maxStudents: 8,
    currentStudents: 6,
    description: '고2 과학 실험 수업',
    materials: ['실험 도구', '과학 교재'],
    status: 'scheduled',
    isActive: true
  },
  {
    name: '사회 토론반',
    subject: 'social',
    classType: 'activity',
    teacherId: 'teacher_5',
    grade: '고1',
    maxStudents: 12,
    currentStudents: 9,
    description: '고1 사회 토론 수업',
    materials: ['사회 교재', '토론 자료'],
    status: 'scheduled',
    isActive: true
  },
  {
    name: '국어 문학반',
    subject: 'korean',
    classType: 'regular',
    teacherId: 'teacher_1',
    grade: '고2',
    maxStudents: 15,
    currentStudents: 11,
    description: '고2 국어 문학 수업',
    materials: ['문학 교재', '고전 문학'],
    status: 'scheduled',
    isActive: true
  },
  {
    name: '수학 기초반',
    subject: 'math',
    classType: 'regular',
    teacherId: 'teacher_2',
    grade: '중3',
    maxStudents: 18,
    currentStudents: 14,
    description: '중3 수학 기초 과정',
    materials: ['중학 수학', '기초 문제집'],
    status: 'scheduled',
    isActive: true
  },
  {
    name: '영어 문법반',
    subject: 'english',
    classType: 'regular',
    teacherId: 'teacher_3',
    grade: '고3',
    maxStudents: 16,
    currentStudents: 13,
    description: '고3 영어 문법 정리',
    materials: ['영어 문법 교재', '문제집'],
    status: 'scheduled',
    isActive: true
  },
  {
    name: '과학 탐구반',
    subject: 'science',
    classType: 'activity',
    teacherId: 'teacher_4',
    grade: '고1',
    maxStudents: 14,
    currentStudents: 10,
    description: '고1 과학 탐구 수업',
    materials: ['과학 탐구 교재', '실험 키트'],
    status: 'scheduled',
    isActive: true
  },
  {
    name: '사회 역사반',
    subject: 'social',
    classType: 'regular',
    teacherId: 'teacher_5',
    grade: '고2',
    maxStudents: 15,
    currentStudents: 12,
    description: '고2 사회 역사 수업',
    materials: ['역사 교재', '지도 자료'],
    status: 'scheduled',
    isActive: true
  }
]

// ===== 시간표 샘플 데이터 =====
export const sampleTimetableRequest: CreateTimetableRequest = {
  name: '2024년 1학기 시간표',
  academicYear: '2024',
  semester: 'spring',
  startDate: '2024-03-01',
  endDate: '2024-08-31',
  description: '2024년 1학기 정규 시간표'
}

// ===== 시간표 항목 샘플 데이터 =====
export const sampleTimetableItems: Omit<TimetableItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    classId: 'class_1',
    teacherId: 'teacher_1',
    dayOfWeek: 'monday',
    timeSlotId: 'time_1',
    roomId: 'room_1',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['monday']
    },
    status: 'scheduled',
    notes: '월요일 09:00-10:00 국어 모의고사'
  },
  {
    classId: 'class_6',
    teacherId: 'teacher_1',
    dayOfWeek: 'monday',
    timeSlotId: 'time_5',
    roomId: 'room_2',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['monday']
    },
    status: 'scheduled',
    notes: '월요일 13:00-14:00 국어 기초반'
  },
  {
    classId: 'class_2',
    teacherId: 'teacher_2',
    dayOfWeek: 'tuesday',
    timeSlotId: 'time_2',
    roomId: 'room_1',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['tuesday']
    },
    status: 'scheduled',
    notes: '화요일 10:00-11:00 수학 모의고사'
  },
  {
    classId: 'class_7',
    teacherId: 'teacher_2',
    dayOfWeek: 'tuesday',
    timeSlotId: 'time_6',
    roomId: 'room_2',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['tuesday']
    },
    status: 'scheduled',
    notes: '화요일 14:00-15:00 수학 심화반'
  },
  {
    classId: 'class_3',
    teacherId: 'teacher_3',
    dayOfWeek: 'wednesday',
    timeSlotId: 'time_3',
    roomId: 'room_1',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['wednesday']
    },
    status: 'scheduled',
    notes: '수요일 11:00-12:00 영어 모의고사'
  },
  {
    classId: 'class_8',
    teacherId: 'teacher_3',
    dayOfWeek: 'wednesday',
    timeSlotId: 'time_7',
    roomId: 'room_2',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['wednesday']
    },
    status: 'scheduled',
    notes: '수요일 15:00-16:00 영어 회화반'
  },
  {
    classId: 'class_4',
    teacherId: 'teacher_4',
    dayOfWeek: 'thursday',
    timeSlotId: 'time_4',
    roomId: 'room_1',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['thursday']
    },
    status: 'scheduled',
    notes: '목요일 12:00-13:00 과학 모의고사'
  },
  {
    classId: 'class_9',
    teacherId: 'teacher_4',
    dayOfWeek: 'thursday',
    timeSlotId: 'time_8',
    roomId: 'room_3',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['thursday']
    },
    status: 'scheduled',
    notes: '목요일 16:00-17:00 과학 실험반'
  },
  {
    classId: 'class_5',
    teacherId: 'teacher_5',
    dayOfWeek: 'friday',
    timeSlotId: 'time_5',
    roomId: 'room_1',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['friday']
    },
    status: 'scheduled',
    notes: '금요일 13:00-14:00 사회 모의고사'
  },
  {
    classId: 'class_10',
    teacherId: 'teacher_5',
    dayOfWeek: 'friday',
    timeSlotId: 'time_9',
    roomId: 'room_2',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['friday']
    },
    status: 'scheduled',
    notes: '금요일 17:00-18:00 사회 토론반'
  },
  {
    classId: 'class_11',
    teacherId: 'teacher_1',
    dayOfWeek: 'saturday',
    timeSlotId: 'time_11',
    roomId: 'room_1',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['saturday']
    },
    status: 'scheduled',
    notes: '토요일 19:00-20:00 국어 문학반'
  },
  {
    classId: 'class_12',
    teacherId: 'teacher_2',
    dayOfWeek: 'saturday',
    timeSlotId: 'time_12',
    roomId: 'room_2',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['saturday']
    },
    status: 'scheduled',
    notes: '토요일 20:00-21:00 수학 기초반'
  },
  {
    classId: 'class_13',
    teacherId: 'teacher_3',
    dayOfWeek: 'sunday',
    timeSlotId: 'time_13',
    roomId: 'room_1',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['sunday']
    },
    status: 'scheduled',
    notes: '일요일 21:00-22:00 영어 문법반'
  },
  {
    classId: 'class_14',
    teacherId: 'teacher_4',
    dayOfWeek: 'sunday',
    timeSlotId: 'time_14',
    roomId: 'room_2',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['sunday']
    },
    status: 'scheduled',
    notes: '일요일 22:00-23:00 과학 탐구반'
  },
  {
    classId: 'class_15',
    teacherId: 'teacher_5',
    dayOfWeek: 'monday',
    timeSlotId: 'time_11',
    roomId: 'room_3',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['monday']
    },
    status: 'scheduled',
    notes: '월요일 19:00-20:00 사회 역사반'
  },
  {
    classId: 'class_1',
    teacherId: 'teacher_1',
    dayOfWeek: 'tuesday',
    timeSlotId: 'time_1',
    roomId: 'room_3',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['tuesday']
    },
    status: 'scheduled',
    notes: '화요일 09:00-10:00 국어 기초반'
  },
  {
    classId: 'class_2',
    teacherId: 'teacher_2',
    dayOfWeek: 'wednesday',
    timeSlotId: 'time_2',
    roomId: 'room_3',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['wednesday']
    },
    status: 'scheduled',
    notes: '수요일 10:00-11:00 수학 기초반'
  },
  {
    classId: 'class_3',
    teacherId: 'teacher_3',
    dayOfWeek: 'thursday',
    timeSlotId: 'time_3',
    roomId: 'room_3',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['thursday']
    },
    status: 'scheduled',
    notes: '목요일 11:00-12:00 영어 기초반'
  },
  {
    classId: 'class_4',
    teacherId: 'teacher_4',
    dayOfWeek: 'friday',
    timeSlotId: 'time_4',
    roomId: 'room_3',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['friday']
    },
    status: 'scheduled',
    notes: '금요일 12:00-13:00 과학 기초반'
  },
  {
    classId: 'class_5',
    teacherId: 'teacher_5',
    dayOfWeek: 'saturday',
    timeSlotId: 'time_5',
    roomId: 'room_3',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['saturday']
    },
    status: 'scheduled',
    notes: '토요일 13:00-14:00 사회 기초반'
  },
  {
    classId: 'class_6',
    teacherId: 'teacher_1',
    dayOfWeek: 'sunday',
    timeSlotId: 'time_6',
    roomId: 'room_3',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['sunday']
    },
    status: 'scheduled',
    notes: '일요일 14:00-15:00 국어 심화반'
  },
  {
    classId: 'class_7',
    teacherId: 'teacher_2',
    dayOfWeek: 'monday',
    timeSlotId: 'time_7',
    roomId: 'room_1',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['monday']
    },
    status: 'scheduled',
    notes: '월요일 15:00-16:00 수학 심화반'
  },
  {
    classId: 'class_8',
    teacherId: 'teacher_3',
    dayOfWeek: 'tuesday',
    timeSlotId: 'time_8',
    roomId: 'room_2',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['tuesday']
    },
    status: 'scheduled',
    notes: '화요일 16:00-17:00 영어 심화반'
  },
  {
    classId: 'class_9',
    teacherId: 'teacher_4',
    dayOfWeek: 'wednesday',
    timeSlotId: 'time_9',
    roomId: 'room_1',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['wednesday']
    },
    status: 'scheduled',
    notes: '수요일 17:00-18:00 과학 심화반'
  },
  {
    classId: 'class_10',
    teacherId: 'teacher_5',
    dayOfWeek: 'thursday',
    timeSlotId: 'time_10',
    roomId: 'room_2',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['thursday']
    },
    status: 'scheduled',
    notes: '목요일 18:00-19:00 사회 심화반'
  },
  {
    classId: 'class_11',
    teacherId: 'teacher_1',
    dayOfWeek: 'friday',
    timeSlotId: 'time_11',
    roomId: 'room_1',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['friday']
    },
    status: 'scheduled',
    notes: '금요일 19:00-20:00 국어 문학반'
  },
  {
    classId: 'class_12',
    teacherId: 'teacher_2',
    dayOfWeek: 'saturday',
    timeSlotId: 'time_12',
    roomId: 'room_2',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['saturday']
    },
    status: 'scheduled',
    notes: '토요일 20:00-21:00 수학 문학반'
  },
  {
    classId: 'class_13',
    teacherId: 'teacher_3',
    dayOfWeek: 'sunday',
    timeSlotId: 'time_13',
    roomId: 'room_1',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['sunday']
    },
    status: 'scheduled',
    notes: '일요일 21:00-22:00 영어 문학반'
  },
  {
    classId: 'class_14',
    teacherId: 'teacher_4',
    dayOfWeek: 'monday',
    timeSlotId: 'time_14',
    roomId: 'room_2',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['monday']
    },
    status: 'scheduled',
    notes: '월요일 22:00-23:00 과학 문학반'
  },
  {
    classId: 'class_15',
    teacherId: 'teacher_5',
    dayOfWeek: 'tuesday',
    timeSlotId: 'time_15',
    roomId: 'room_3',
    startDate: '2024-03-01',
    endDate: '2024-08-31',
    isRecurring: true,
    recurrencePattern: {
      type: 'weekly',
      interval: 1,
      daysOfWeek: ['tuesday']
    },
    status: 'scheduled',
    notes: '화요일 22:00-23:00 사회 문학반'
  }
]
