// shared에서 Grade 타입 import
import type { Grade } from '@shared/types';

// 학생 상태
export type StudentStatus = 'active' | 'inactive';

// 학생 연락처 정보
export interface StudentContactInfo {
  phone?: string;
  email?: string;
  address?: string;
}

// 학생 정보 (백엔드와 일치)
export interface Student {
  id: string;
  name: string;
  grade: Grade;
  firstAttendanceDate?: string;
  lastAttendanceDate?: string;
  parentsId?: string;
  status: StudentStatus;
  contactInfo?: StudentContactInfo;
  createdAt: string;
  updatedAt: string;
}

// 학생 생성 요청 데이터
export interface CreateStudentRequest {
  name: string;
  grade: Grade;
  firstAttendanceDate?: string;
  lastAttendanceDate?: string;
  parentsId?: string;
  status?: StudentStatus;
  contactInfo?: StudentContactInfo;
}

// 학생 수정 요청 데이터
export interface UpdateStudentRequest {
  name?: string;
  grade?: Grade;
  firstAttendanceDate?: string;
  lastAttendanceDate?: string;
  parentsId?: string;
  status?: StudentStatus;
  contactInfo?: StudentContactInfo;
}

// 학생 검색 파라미터
export interface StudentSearchParams {
  name?: string;
  grade?: Grade;
  status?: StudentStatus;
  parentsId?: string;
  firstAttendanceDateRange?: {
    start: string;
    end: string;
  };
  lastAttendanceDateRange?: {
    start: string;
    end: string;
  };
}

// 학생 통계
export interface StudentStatistics {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  studentsByGrade: Record<Grade, number>;
  studentsWithAttendance: number;
  averageAttendanceRate: number;
}

// 학생 폼 데이터
export interface StudentFormData {
  name: string;
  grade: Grade;
  firstAttendanceDate?: string;
  lastAttendanceDate?: string;
  parentsId?: string;
  status: StudentStatus;
  contactInfo: StudentContactInfo;
}

// 학생 상태 관리
export interface StudentsState {
  students: Student[];
  selectedStudent: Student | null;
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
  filters: {
    grade: Grade | '';
    status: StudentStatus | '';
  };
} 