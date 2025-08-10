import type { UUID, UUIDGenerator } from '../types/common.types';
/**
 * UUID v4 생성기
 * RFC 4122 표준을 따르는 UUID v4를 생성합니다.
 */
export declare class UUIDGeneratorV4 implements UUIDGenerator {
    generate(): UUID;
}
/**
 * 타임스탬프 기반 UUID 생성기
 * 시간 기반으로 고유한 ID를 생성합니다.
 */
export declare class TimestampUUIDGenerator implements UUIDGenerator {
    generate(): UUID;
}
/**
 * 학생 전용 UUID 생성기
 * 학생 ID에 특화된 형식을 사용합니다.
 */
export declare class StudentUUIDGenerator implements UUIDGenerator {
    generate(): UUID;
}
/**
 * 좌석 ID 생성기
 * 좌석 번호를 기반으로 ID를 생성합니다.
 */
export declare class SeatIdGenerator {
    static generate(seatNumber: number): string;
    static generateFromRowCol(row: number, col: number): string;
}
/**
 * 출석 기록 ID 생성기
 * 학생 ID와 날짜를 기반으로 ID를 생성합니다.
 */
export declare class AttendanceRecordIdGenerator {
    static generate(studentId: UUID, date: string): string;
}
/**
 * 기본 UUID 생성기 인스턴스
 */
export declare const defaultUUIDGenerator: UUIDGeneratorV4;
export declare const studentUUIDGenerator: StudentUUIDGenerator;
export declare const timestampUUIDGenerator: TimestampUUIDGenerator;
/**
 * UUID 유효성 검사
 */
export declare function isValidUUID(uuid: string): boolean;
/**
 * 학생 ID 유효성 검사
 */
export declare function isValidStudentId(studentId: string): boolean;
/**
 * 좌석 ID 유효성 검사
 */
export declare function isValidSeatId(seatId: string): boolean;
//# sourceMappingURL=uuid.d.ts.map