// Shared types 사용
import type { 
  Student, 
  CreateStudentRequest,
  UpdateStudentRequest 
} from '@shared/types';

// 백엔드에서 사용하는 추가 타입들
export interface BackendStudent extends Student {
  // 백엔드 특화 필드들
  _id?: string; // Firestore 문서 ID
  _rev?: string; // 문서 버전
  firestoreId?: string; // Firestore 특화 ID
}

export interface BackendCreateStudentRequest extends CreateStudentRequest {
  // 백엔드 특화 필드들
  createdBy: string;
  createdAt: string;
}

export interface BackendUpdateStudentRequest extends UpdateStudentRequest {
  // 백엔드 특화 필드들
  updatedBy: string;
  updatedAt: string;
}

// 백엔드에서 사용하는 내부 타입들
export interface StudentDocument {
  id: string;
  data: BackendStudent;
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
  };
} 