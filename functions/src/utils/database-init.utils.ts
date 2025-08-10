// 데이터베이스 초기화 유틸리티
import type { Student } from '@shared/types';

// ===== 컬렉션 이름 상수 =====

export const COLLECTIONS = {
  STUDENTS: 'students',
  SEATS: 'seats',
  SEAT_ASSIGNMENTS: 'seat_assignments',
  ATTENDANCE_RECORDS: 'attendance_records',
  DAILY_SUMMARIES: 'daily_summaries',
  MONTHLY_REPORTS: 'monthly_reports',
  SYSTEM_SETTINGS: 'system_settings',
  USER_ROLES: 'user_roles'
} as const;

// ===== 데이터 검증 =====

/**
 * 컬렉션 존재 여부 확인
 */
export const validateCollectionExists = async (
  db: any,
  collectionName: string
): Promise<boolean> => {
  try {
    const snapshot = await db.collection(collectionName).limit(1).get();
    return !snapshot.empty;
  } catch (error) {
    console.error(`컬렉션 존재 확인 오류 (${collectionName}):`, error);
    return false;
  }
};

/**
 * 데이터 무결성 검증
 */
export const validateDataIntegrity = async (
  db: any,
  students: Student[],
  attendanceRecords: any[]
): Promise<string[]> => {
  const errors: string[] = [];
  
  try {
    // 학생 데이터 검증
    for (const student of students) {
      if (!student.id || !student.name) {
        errors.push(`학생 데이터 누락: ${student.id || 'unknown'}`);
      }
    }
    
    // 출석 기록 검증
    for (const record of attendanceRecords) {
      if (!record.id || !record.studentId || !record.date) {
        errors.push(`출석 기록 데이터 누락: ${record.id || 'unknown'}`);
      }
    }
    
    console.log(`데이터 무결성 검증 완료: ${errors.length}개 오류`);
    return errors;
  } catch (error) {
    console.error('데이터 무결성 검증 오류:', error);
    errors.push('데이터 무결성 검증 중 오류 발생');
    return errors;
  }
};

/**
 * 시스템 설정 생성
 */
export const createSystemSettings = () => {
  return {
    id: 'system_settings',
    version: 'v2.0.0',
    lastUpdated: new Date().toISOString(),
    features: {
      studentManagement: true,
      seatManagement: true,
      attendanceTracking: true,
      assignmentManagement: true,
      statistics: true
    },
    settings: {
      maxStudentsPerClass: 50,
      maxSeatsPerRoom: 48,
      attendanceTrackingEnabled: true,
      autoAssignmentEnabled: true
    }
  };
};
