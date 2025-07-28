// 사용자 상태 타입
export type UserStatus = 'active' | 'inactive'

// 기본 사용자 인터페이스 (DB 저장용)
export interface User {
  user_id: string;          // bigint를 string으로 처리 (Firebase 호환)
  name: string;
  phone: string;
  email: string;
  password_hash: string;
  status: UserStatus;
  
  // 메타데이터
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// 공개용 사용자 정보 (password_hash 제외)
export interface PublicUser {
  user_id: string;
  name: string;
  phone: string;
  email: string;
  status: UserStatus;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// 사용자 생성 요청 타입
export interface CreateUserRequest {
  name: string;
  phone: string;
  email: string;
  password: string;        // 평문 비밀번호 (해싱 전)
  status?: UserStatus;     // 기본값: 'active'
}

// 사용자 업데이트 요청 타입 (password 제외)
export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  email?: string;
  status?: UserStatus;
}

// 사용자 조회 필터 타입
export interface UserFilter {
  status?: UserStatus;
  email?: string;
  phone?: string;
  name?: string;           // 이름으로 검색 (부분 일치)
}
