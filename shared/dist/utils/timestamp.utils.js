/**
 * Firebase Timestamp 유틸리티 함수들
 * 백엔드에서 Timestamp 생성, 변환, 조작을 위한 헬퍼 함수들
 */
export const timestampUtils = {
    /**
     * 현재 시간을 Firestore Timestamp로 반환
     */
    now() {
        return new Date(); // 임시로 Date 객체를 any로 캐스팅
    },
    /**
     * JavaScript Date 객체를 Firestore Timestamp로 변환
     */
    fromDate(date) {
        return date; // 임시로 Date 객체를 any로 캐스팅
    },
    /**
     * ISO 8601 문자열을 Firestore Timestamp로 변환
     */
    fromISOString(isoString) {
        return new Date(isoString); // 임시로 Date 객체를 any로 캐스팅
    },
    /**
     * Firestore Timestamp를 JavaScript Date 객체로 변환
     */
    toDate(timestamp) {
        return timestamp; // 임시로 any를 Date로 캐스팅
    },
    /**
     * Firestore Timestamp를 ISO 8601 문자열로 변환
     */
    toISOString(timestamp) {
        return timestamp.toISOString(); // 임시로 any로 캐스팅
    },
    /**
     * Unix timestamp (초)를 Firestore Timestamp로 변환
     */
    fromSeconds(seconds) {
        return new Date(seconds * 1000); // 임시로 Date 객체를 any로 캐스팅
    },
    /**
     * Unix timestamp (밀리초)를 Firestore Timestamp로 변환
     */
    fromMillis(millis) {
        return new Date(millis); // 임시로 Date 객체를 any로 캐스팅
    }
};
/**
 * 편의를 위한 개별 함수들
 */
export const { now, fromDate, fromISOString, toDate, toISOString, fromSeconds, fromMillis } = timestampUtils;
/**
 * 추가 유틸리티 함수들
 */
/**
 * 두 Timestamp를 비교하여 첫 번째가 두 번째보다 이전인지 확인
 */
export function isBefore(timestamp1, timestamp2) {
    return timestamp1 < timestamp2;
}
/**
 * 두 Timestamp를 비교하여 첫 번째가 두 번째보다 이후인지 확인
 */
export function isAfter(timestamp1, timestamp2) {
    return timestamp1 > timestamp2;
}
/**
 * 두 Timestamp가 같은지 확인
 */
export function isEqual(timestamp1, timestamp2) {
    return timestamp1 === timestamp2;
}
/**
 * Timestamp가 오늘 날짜인지 확인
 */
export function isToday(timestamp) {
    const today = new Date();
    const timestampDate = timestamp;
    return today.toDateString() === timestampDate.toDateString();
}
/**
 * Timestamp가 어제 날짜인지 확인
 */
export function isYesterday(timestamp) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const timestampDate = timestamp;
    return yesterday.toDateString() === timestampDate.toDateString();
}
/**
 * Timestamp가 이번 주에 속하는지 확인
 */
export function isThisWeek(timestamp) {
    const now = new Date();
    const timestampDate = timestamp;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return timestampDate >= weekStart && timestampDate <= weekEnd;
}
/**
 * Timestamp를 읽기 쉬운 형식으로 포맷팅
 */
export function formatTimestamp(timestamp, format = 'short') {
    const date = timestamp;
    switch (format) {
        case 'short':
            return date.toLocaleDateString('ko-KR');
        case 'long':
            return date.toLocaleString('ko-KR');
        case 'relative':
            if (isToday(timestamp))
                return '오늘';
            if (isYesterday(timestamp))
                return '어제';
            const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays < 7)
                return `${diffDays}일 전`;
            return date.toLocaleDateString('ko-KR');
        default:
            return date.toLocaleDateString('ko-KR');
    }
}
/**
 * 현재 시간으로부터 특정 시간 전/후의 Timestamp 생성
 */
export function addTime(timestamp, amount, unit) {
    const date = new Date(timestamp);
    switch (unit) {
        case 'seconds':
            date.setSeconds(date.getSeconds() + amount);
            break;
        case 'minutes':
            date.setMinutes(date.getMinutes() + amount);
            break;
        case 'hours':
            date.setHours(date.getHours() + amount);
            break;
        case 'days':
            date.setDate(date.getDate() + amount);
            break;
    }
    return date;
}
/**
 * 두 Timestamp 간의 차이를 계산
 */
export function timeDifference(timestamp1, timestamp2, unit) {
    const date1 = timestamp1;
    const date2 = timestamp2;
    const diffMs = Math.abs(date2.getTime() - date1.getTime());
    switch (unit) {
        case 'seconds':
            return Math.floor(diffMs / 1000);
        case 'minutes':
            return Math.floor(diffMs / (1000 * 60));
        case 'hours':
            return Math.floor(diffMs / (1000 * 60 * 60));
        case 'days':
            return Math.floor(diffMs / (1000 * 60 * 60 * 24));
        default:
            return diffMs;
    }
}
//# sourceMappingURL=timestamp.utils.js.map