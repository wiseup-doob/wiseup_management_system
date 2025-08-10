import type { Student } from '@shared/types';
import type { AttendanceStatus } from '@shared/types/common.types';
import { StudentUUIDGenerator } from '@shared/utils/uuid';

// UUID 생성기 인스턴스
const studentUUIDGenerator = new StudentUUIDGenerator();

// 학생 이름 배열 정의
const STUDENT_NAMES = [
  '김철수', '이영희', '박민수', '정수진', '최동현', '한미영', '송태호', '윤지은',
  '강현우', '임서연', '조성민', '백하은', '남준호', '오유진', '신동욱', '류지현',
  '곽민석', '차은지', '전우진', '홍서영', '문태현', '양소희', '구현수', '노예진',
  '안준영', '배수민', '고태우', '서지원', '한동훈', '김나영', '이승우', '박소연',
  '정민재', '최은주', '강도현', '임준호', '조은영', '백현수', '남지민', '오태영',
  '신소영', '류현우', '곽지원', '차민재', '전은주', '홍도현', '문준호', '양은영'
];

// 출석 상태 배열 (가중치 적용)
const ATTENDANCE_STATUSES: { status: AttendanceStatus; weight: number }[] = [
  { status: 'present', weight: 0.6 },              // 60% 등원
  { status: 'dismissed', weight: 0.2 },            // 20% 하원
  { status: 'unauthorized_absent', weight: 0.15 }, // 15% 무단결석
  { status: 'authorized_absent', weight: 0.05 }    // 5% 사유결석
];

// 현재 시간을 ISO 8601 형식으로 생성
const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

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

const generateFirstAttendanceDate = (): Date => {
  const today = new Date();
  const randomDaysAgo = Math.floor(Math.random() * 30) + 1;
  const firstDate = new Date(today);
  firstDate.setDate(today.getDate() - randomDaysAgo);
  return firstDate;
};

const generateStudentData = (index: number): Student => {
  const name = STUDENT_NAMES[index];
  const currentAttendance = getRandomAttendanceStatus();
  const firstAttendanceDate = generateFirstAttendanceDate();
  const enrollmentDate = new Date();
  enrollmentDate.setDate(enrollmentDate.getDate() - Math.floor(Math.random() * 365) + 30); // 30일~1년 전
  
  return {
    id: studentUUIDGenerator.generate(),
    name,
    grade: '1학년',
    className: '3반',
    status: 'active',
    enrollmentDate: enrollmentDate.toISOString().split('T')[0],
    graduationDate: undefined,
    contactInfo: {
      phone: `010-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
      email: `${name}@example.com`,
      address: '서울시 강남구'
    },
    parentInfo: {
      name: `${name}부모님`,
      phone: `010-${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
      email: `parent_${name}@example.com`
    },
    currentStatus: {
      currentAttendance,
      lastAttendanceUpdate: getCurrentTimestamp(),
      firstAttendanceDate: firstAttendanceDate.toISOString().split('T')[0],
      totalAttendanceDays: Math.floor(Math.random() * 20) + 5, // 5-25일
      averageCheckInTime: '09:00',
      averageCheckOutTime: '18:00'
    },
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp()
  };
};

export const INITIAL_STUDENTS_DATA: Student[] = Array.from(
  { length: 48 }, 
  (_, index) => generateStudentData(index)
); 