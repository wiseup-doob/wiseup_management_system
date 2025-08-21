// TODO: firebase-admin/firestore 모듈이 설치되면 실제 Timestamp 타입 사용
// import { Timestamp } from 'firebase-admin/firestore';
import type { FirestoreTimestamp, TimestampUtils } from '../types/common.types';

/**
 * Firebase Timestamp 유틸리티 함수들
 * 백엔드에서 Timestamp 생성, 변환, 조작을 위한 헬퍼 함수들
 */
export const timestampUtils: TimestampUtils = {
  /**
   * 현재 시간을 Firestore Timestamp로 반환
   */
  now(): FirestoreTimestamp { 
    return new Date() as any; // 임시로 Date 객체를 any로 캐스팅
  },

  /**
   * JavaScript Date 객체를 Firestore Timestamp로 변환
   */
  fromDate(date: Date): FirestoreTimestamp { 
    return date as any; // 임시로 Date 객체를 any로 캐스팅
  },

  /**
   * ISO 8601 문자열을 Firestore Timestamp로 변환
   */
  fromISOString(isoString: string): FirestoreTimestamp { 
    return new Date(isoString) as any; // 임시로 Date 객체를 any로 캐스팅
  },

  /**
   * Firestore Timestamp를 JavaScript Date 객체로 변환
   */
  toDate(timestamp: FirestoreTimestamp): Date { 
    return timestamp as any; // 임시로 any를 Date로 캐스팅
  },

  /**
   * Firestore Timestamp를 ISO 8601 문자열로 변환
   */
  toISOString(timestamp: FirestoreTimestamp): string { 
    return (timestamp as any).toISOString(); // 임시로 any로 캐스팅
  },

  /**
   * Unix timestamp (초)를 Firestore Timestamp로 변환
   */
  fromSeconds(seconds: number): FirestoreTimestamp { 
    return new Date(seconds * 1000) as any; // 임시로 Date 객체를 any로 캐스팅
  },

  /**
   * Unix timestamp (밀리초)를 Firestore Timestamp로 변환
   */
  fromMillis(millis: number): FirestoreTimestamp { 
    return new Date(millis) as any; // 임시로 Date 객체를 any로 캐스팅
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
export function isBefore(timestamp1: FirestoreTimestamp, timestamp2: FirestoreTimestamp): boolean {
  return (timestamp1 as any) < (timestamp2 as any);
}

/**
 * 두 Timestamp를 비교하여 첫 번째가 두 번째보다 이후인지 확인
 */
export function isAfter(timestamp1: FirestoreTimestamp, timestamp2: FirestoreTimestamp): boolean {
  return (timestamp1 as any) > (timestamp2 as any);
}

/**
 * 두 Timestamp가 같은지 확인
 */
export function isEqual(timestamp1: FirestoreTimestamp, timestamp2: FirestoreTimestamp): boolean {
  return (timestamp1 as any) === (timestamp2 as any);
}

/**
 * Timestamp가 오늘 날짜인지 확인
 */
export function isToday(timestamp: FirestoreTimestamp): boolean {
  const today = new Date();
  const timestampDate = timestamp as any;
  return today.toDateString() === timestampDate.toDateString();
}

/**
 * Timestamp가 어제 날짜인지 확인
 */
export function isYesterday(timestamp: FirestoreTimestamp): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const timestampDate = timestamp as any;
  return yesterday.toDateString() === timestampDate.toDateString();
}

/**
 * Timestamp가 이번 주에 속하는지 확인
 */
export function isThisWeek(timestamp: FirestoreTimestamp): boolean {
  const now = new Date();
  const timestampDate = timestamp as any;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  return timestampDate >= weekStart && timestampDate <= weekEnd;
}

/**
 * Timestamp를 읽기 쉬운 형식으로 포맷팅
 */
export function formatTimestamp(timestamp: FirestoreTimestamp, format: 'short' | 'long' | 'relative' = 'short'): string {
  const date = timestamp as any;
  
  switch (format) {
    case 'short':
      return date.toLocaleDateString('ko-KR');
    case 'long':
      return date.toLocaleString('ko-KR');
    case 'relative':
      if (isToday(timestamp)) return '오늘';
      if (isYesterday(timestamp)) return '어제';
      const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays < 7) return `${diffDays}일 전`;
      return date.toLocaleDateString('ko-KR');
    default:
      return date.toLocaleDateString('ko-KR');
  }
}

/**
 * 현재 시간으로부터 특정 시간 전/후의 Timestamp 생성
 */
export function addTime(timestamp: FirestoreTimestamp, amount: number, unit: 'seconds' | 'minutes' | 'hours' | 'days'): FirestoreTimestamp {
  const date = new Date(timestamp as any);
  
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
  
  return date as any;
}

/**
 * 두 Timestamp 간의 차이를 계산
 */
export function timeDifference(timestamp1: FirestoreTimestamp, timestamp2: FirestoreTimestamp, unit: 'seconds' | 'minutes' | 'hours' | 'days'): number {
  const date1 = timestamp1 as any;
  const date2 = timestamp2 as any;
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
