// Shared types 사용
import type { ApiResponse, BaseEntity } from '@shared/types';

// 백엔드에서 사용하는 추가 타입들
export interface BackendApiResponse<T> extends ApiResponse<T> {
  // 백엔드 특화 필드들
  timestamp: string;
  requestId: string;
}

export interface BackendBaseEntity extends BaseEntity {
  // 백엔드 특화 필드들
  _id?: string; // MongoDB/Firestore ID
  _rev?: string; // 문서 버전
} 