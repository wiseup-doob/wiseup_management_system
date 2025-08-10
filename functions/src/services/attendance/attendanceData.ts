import type { AttendanceRecord, UUID } from '@shared/types';
import type { AttendanceStatus } from '@shared/types/common.types';
import { AttendanceRecordIdGenerator } from '@shared/utils/uuid';

// 출석 상태 배열 (가중치 적용)
const ATTENDANCE_STATUSES: { status: AttendanceStatus; weight: number }[] = [
  { status: 'present', weight: 0.6 },              // 60% 등원
  { status: 'dismissed', weight: 0.2 },            // 20% 하원
  { status: 'unauthorized_absent', weight: 0.15 }, // 15% 무단결석
  { status: 'authorized_absent', weight: 0.05 }    // 5% 사유결석
];

// 가중치 기반 랜덤 출석 상태 선택
const getRandomAttendanceStatus = (): AttendanceStatus => {
  const random = Math.random();
  let cumulativeWeight = 0;
  
  for (const { status, weight } of ATTENDANCE_STATUSES) {
    cumulativeWeight += weight;
    if (random <= cumulativeWeight) {
      return status;
    }
  }
  
  return 'present'; // 기본값
};

// 랜덤 시간 생성 (HH:MM 형식)
const generateRandomTime = (startHour: number, endHour: number): string => {
  const hour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
  const minute = Math.floor(Math.random() * 60);
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

// 랜덤 총 등원 시간 생성 (시간 단위)
const generateRandomTotalHours = (): number => {
  return Math.floor(Math.random() * 8) + 1; // 1-8시간
};

// 특정 날짜의 출석 기록 생성
const generateAttendanceRecordForDate = (
  studentId: UUID, 
  date: string, 
  seatId?: string,
  isFirstDay: boolean = false
): AttendanceRecord => {
  const status = isFirstDay ? 'present' : getRandomAttendanceStatus();
  const timestamp = new Date(date).toISOString();
  
  let checkInTime: string | undefined;
  let checkOutTime: string | undefined;
  let totalHours: number | undefined;
  
  if (status === 'present') {
    checkInTime = generateRandomTime(8, 10); // 08:00-10:00
    totalHours = generateRandomTotalHours();
  }
  
  if (status === 'dismissed') {
    checkInTime = generateRandomTime(8, 10); // 08:00-10:00
    checkOutTime = generateRandomTime(14, 18); // 14:00-18:00
    totalHours = generateRandomTotalHours();
  }
  
  return {
    id: AttendanceRecordIdGenerator.generate(studentId, date),
    studentId,
    seatId,
    date,
    status,
    timestamp,
    updatedBy: 'admin',
    checkInTime,
    checkOutTime,
    totalHours,
    location: '교실',
    notes: isFirstDay ? '첫 등원' : undefined,
    isLate: checkInTime ? parseInt(checkInTime.split(':')[0]) > 9 : false,
    isEarlyLeave: status === 'dismissed',
    createdAt: timestamp,
    updatedAt: timestamp
  } as AttendanceRecord;
};

// 학생별 출석 기록 생성 (최근 30일)
const generateStudentAttendanceHistory = (studentId: UUID, seatId?: string): AttendanceRecord[] => {
  const history: AttendanceRecord[] = [];
  const today = new Date();
  const firstAttendanceDate = new Date(today);
  firstAttendanceDate.setDate(today.getDate() - Math.floor(Math.random() * 30) + 1);
  
  const currentDate = new Date(firstAttendanceDate);
  
  while (currentDate <= today) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const isFirstDay = currentDate.getTime() === firstAttendanceDate.getTime();
    
    history.push(generateAttendanceRecordForDate(studentId, dateStr, seatId, isFirstDay));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return history;
};

// 모든 학생의 출석 기록 생성
const generateAllAttendanceRecords = (studentIds: UUID[], seatIds?: string[]): AttendanceRecord[] => {
  const allRecords: AttendanceRecord[] = [];
  
  for (let i = 0; i < studentIds.length; i++) {
    const studentId = studentIds[i];
    const seatId = seatIds ? seatIds[i] : undefined;
    const studentRecords = generateStudentAttendanceHistory(studentId, seatId);
    allRecords.push(...studentRecords);
  }
  
  return allRecords;
};

// 오늘 날짜의 출석 기록만 생성
const generateTodayAttendanceRecords = (studentIds: UUID[], seatIds?: string[]): AttendanceRecord[] => {
  const today = new Date().toISOString().split('T')[0];
  const records: AttendanceRecord[] = [];
  
  for (let i = 0; i < studentIds.length; i++) {
    const studentId = studentIds[i];
    const seatId = seatIds ? seatIds[i] : undefined;
    records.push(generateAttendanceRecordForDate(studentId, today, seatId));
  }
  
  return records;
};

export const generateAttendanceData = {
  // 모든 학생의 전체 출석 기록 생성
  generateAllRecords: (studentIds: UUID[], seatIds?: string[]): AttendanceRecord[] => {
    return generateAllAttendanceRecords(studentIds, seatIds);
  },
  
  // 오늘 날짜의 출석 기록만 생성
  generateTodayRecords: (studentIds: UUID[], seatIds?: string[]): AttendanceRecord[] => {
    return generateTodayAttendanceRecords(studentIds, seatIds);
  },
  
  // 특정 학생의 출석 기록 생성
  generateStudentRecords: (studentId: UUID, seatId?: string): AttendanceRecord[] => {
    return generateStudentAttendanceHistory(studentId, seatId);
  },
  
  // 특정 날짜의 출석 기록 생성
  generateDateRecords: (studentIds: UUID[], date: string, seatIds?: string[]): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    
    for (let i = 0; i < studentIds.length; i++) {
      const studentId = studentIds[i];
      const seatId = seatIds ? seatIds[i] : undefined;
      records.push(generateAttendanceRecordForDate(studentId, date, seatId));
    }
    
    return records;
  }
};
