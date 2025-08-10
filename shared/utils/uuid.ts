import type { UUID, UUIDGenerator } from '../types/common.types';

/**
 * UUID v4 생성기
 * RFC 4122 표준을 따르는 UUID v4를 생성합니다.
 */
export class UUIDGeneratorV4 implements UUIDGenerator {
  generate(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

/**
 * 타임스탬프 기반 UUID 생성기
 * 시간 기반으로 고유한 ID를 생성합니다.
 */
export class TimestampUUIDGenerator implements UUIDGenerator {
  generate(): UUID {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}-${random}`;
  }
}

/**
 * 학생 전용 UUID 생성기
 * 학생 ID에 특화된 형식을 사용합니다.
 */
export class StudentUUIDGenerator implements UUIDGenerator {
  generate(): UUID {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `student_${timestamp}_${random}`;
  }
}

/**
 * 좌석 ID 생성기
 * 좌석 번호를 기반으로 ID를 생성합니다.
 */
export class SeatIdGenerator {
  static generate(seatNumber: number): string {
    return `seat_${seatNumber.toString().padStart(3, '0')}`;
  }
  
  static generateFromRowCol(row: number, col: number): string {
    const seatNumber = (row - 1) * 6 + col; // 6열 기준
    return this.generate(seatNumber);
  }
}

/**
 * 출석 기록 ID 생성기
 * 학생 ID와 날짜를 기반으로 ID를 생성합니다.
 */
export class AttendanceRecordIdGenerator {
  static generate(studentId: UUID, date: string): string {
    return `${studentId}_${date}`;
  }
}

/**
 * 기본 UUID 생성기 인스턴스
 */
export const defaultUUIDGenerator = new UUIDGeneratorV4();
export const studentUUIDGenerator = new StudentUUIDGenerator();
export const timestampUUIDGenerator = new TimestampUUIDGenerator();

/**
 * UUID 유효성 검사
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * 학생 ID 유효성 검사
 */
export function isValidStudentId(studentId: string): boolean {
  return studentId.startsWith('student_') && studentId.length > 10;
}

/**
 * 좌석 ID 유효성 검사
 */
export function isValidSeatId(seatId: string): boolean {
  return seatId.startsWith('seat_') && /^seat_\d{3}$/.test(seatId);
}
