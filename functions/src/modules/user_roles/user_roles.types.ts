// 사용자 역할 할당 인터페이스 (ERD에 맞춰 정확히 구현)
export interface UserRole {
  user_id: string; // user_id 필드 (User 테이블 참조)
  role_id: string; // role_id 필드 (Role 테이블 참조)

  // 메타데이터
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// 사용자 역할 할당 요청 타입
export interface AssignUserRoleRequest {
  user_id: string; // user_id 필드
  role_id: string; // role_id 필드
}

// 사용자 역할 조회 필터 타입
export interface UserRoleFilter {
  user_id?: string; // user_id 필드
  role_id?: string; // role_id 필드
}

// 사용자와 역할 정보를 포함한 확장 타입
export interface UserWithRoles {
  user_id: string;
  user_name: string;
  user_email: string;
  roles: Array<{
    role_id: string;
    role_name: string;
  }>;
}

// 역할과 사용자 정보를 포함한 확장 타입
export interface RoleWithUsers {
  role_id: string;
  role_name: string;
  users: Array<{
    user_id: string;
    user_name: string;
    user_email: string;
  }>;
}
