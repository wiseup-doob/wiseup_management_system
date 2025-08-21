// 데이터베이스 유틸리티 함수들
import type { 
  Student,
  StudentSearchParams
} from '../types/student.types';

import type {
  AttendanceRecord,
  AttendanceSearchParams
} from '../types/attendance.types';

// 학생 검색 유틸리티
export function filterStudents(students: Student[], criteria: StudentSearchParams): Student[] {
  return students.filter(student => {
    if (criteria.name && !student.name.toLowerCase().includes(criteria.name.toLowerCase())) {
      return false;
    }
    if (criteria.grade && student.grade !== criteria.grade) {
      return false;
    }
    if (criteria.status && student.status !== criteria.status) {
      return false;
    }
    return true;
  });
}

// 출석 기록 검색 유틸리티
export function filterAttendanceRecords(records: AttendanceRecord[], criteria: AttendanceSearchParams): AttendanceRecord[] {
  return records.filter(record => {
    if (criteria.studentId && record.studentId !== criteria.studentId) {
      return false;
    }
    if (criteria.status && record.status !== criteria.status) {
      return false;
    }
    return true;
  });
}

// 데이터 검증 유틸리티
export function validateStudentData(student: Partial<Student>): boolean {
  if (!student.name || !student.grade) {
    return false;
  }
  return true;
}

export function validateAttendanceData(attendance: Partial<AttendanceRecord>): boolean {
  if (!attendance.studentId || !attendance.date || !attendance.status) {
    return false;
  }
  return true;
} 