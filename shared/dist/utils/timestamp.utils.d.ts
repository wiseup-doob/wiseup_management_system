import type { FirestoreTimestamp, TimestampUtils } from '../types/common.types';
/**
 * Firebase Timestamp 유틸리티 함수들
 * 백엔드에서 Timestamp 생성, 변환, 조작을 위한 헬퍼 함수들
 */
export declare const timestampUtils: TimestampUtils;
/**
 * 편의를 위한 개별 함수들
 */
export declare const now: () => FirestoreTimestamp, fromDate: (date: Date) => FirestoreTimestamp, fromISOString: (isoString: string) => FirestoreTimestamp, toDate: (timestamp: FirestoreTimestamp) => Date, toISOString: (timestamp: FirestoreTimestamp) => string, fromSeconds: (seconds: number) => FirestoreTimestamp, fromMillis: (millis: number) => FirestoreTimestamp;
/**
 * 추가 유틸리티 함수들
 */
/**
 * 두 Timestamp를 비교하여 첫 번째가 두 번째보다 이전인지 확인
 */
export declare function isBefore(timestamp1: FirestoreTimestamp, timestamp2: FirestoreTimestamp): boolean;
/**
 * 두 Timestamp를 비교하여 첫 번째가 두 번째보다 이후인지 확인
 */
export declare function isAfter(timestamp1: FirestoreTimestamp, timestamp2: FirestoreTimestamp): boolean;
/**
 * 두 Timestamp가 같은지 확인
 */
export declare function isEqual(timestamp1: FirestoreTimestamp, timestamp2: FirestoreTimestamp): boolean;
/**
 * Timestamp가 오늘 날짜인지 확인
 */
export declare function isToday(timestamp: FirestoreTimestamp): boolean;
/**
 * Timestamp가 어제 날짜인지 확인
 */
export declare function isYesterday(timestamp: FirestoreTimestamp): boolean;
/**
 * Timestamp가 이번 주에 속하는지 확인
 */
export declare function isThisWeek(timestamp: FirestoreTimestamp): boolean;
/**
 * Timestamp를 읽기 쉬운 형식으로 포맷팅
 */
export declare function formatTimestamp(timestamp: FirestoreTimestamp, format?: 'short' | 'long' | 'relative'): string;
/**
 * 현재 시간으로부터 특정 시간 전/후의 Timestamp 생성
 */
export declare function addTime(timestamp: FirestoreTimestamp, amount: number, unit: 'seconds' | 'minutes' | 'hours' | 'days'): FirestoreTimestamp;
/**
 * 두 Timestamp 간의 차이를 계산
 */
export declare function timeDifference(timestamp1: FirestoreTimestamp, timestamp2: FirestoreTimestamp, unit: 'seconds' | 'minutes' | 'hours' | 'days'): number;
//# sourceMappingURL=timestamp.utils.d.ts.map