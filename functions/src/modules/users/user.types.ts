// 사용자 상태 타입
export type UserStatus = "active" | "inactive"

// 기본 사용자 인터페이스 (ERD에 맞춰 정확히 구현)
export interface User {
  user_id: string; // user_id 필드
  user_name: string; // user_name 필드
  user_phone: string; // user_phone 필드
  user_email: string; // user_email 필드
  user_password_hash: string; // user_password_hash 필드
  user_status: UserStatus; // user_status 필드

  createdAt: FirebaseFirestore.Timestamp; // createdAt 필드
  updatedAt: FirebaseFirestore.Timestamp; // updatedAt 필드
}

// 공개용 사용자 정보 (password_hash 제외)
export interface PublicUser {
  user_id: string; // user_id 필드
  user_name: string; // user_name 필드
  user_phone: string; // user_phone 필드
  user_email: string; // user_email 필드
  user_status: UserStatus; // user_status 필드
  createdAt: FirebaseFirestore.Timestamp; // createdAt 필드
  updatedAt: FirebaseFirestore.Timestamp; // updatedAt 필드
}

// 사용자 생성 요청 타입
export interface CreateUserRequest {
  user_name: string; // user_name 필드
  user_phone: string; // user_phone 필드
  user_email: string; // user_email 필드
  password: string; // password 필드
  user_status?: UserStatus; // user_status 필드
}

// 사용자 업데이트 요청 타입 (password 제외)
export interface UpdateUserRequest {
  user_name?: string; // user_name 필드
  user_phone?: string; // user_phone 필드
  user_email?: string; // user_email 필드
  user_status?: UserStatus; // user_status 필드
}

// 사용자 조회 필터 타입
export interface UserFilter {
  user_status?: UserStatus; // user_status 필드
  user_email?: string; // user_email 필드
  user_phone?: string; // user_phone 필드
  user_name?: string; // user_name 필드
}
