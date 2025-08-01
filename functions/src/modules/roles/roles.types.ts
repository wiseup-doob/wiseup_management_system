// 역할 타입 정의 (ERD에 맞춰 정확히 구현)
export type RoleId = "student" | "parent" | "teacher" | "admin"

// 역할 인터페이스 (ERD에 맞춰 정확히 구현)
export interface Role {
  role_id: RoleId; // role_id 필드
  role_name: string; // role_name 필드

  // 메타데이터
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// 역할 생성 요청 타입
export interface CreateRoleRequest {
  role_id: RoleId; // role_id 필드
  role_name: string; // role_name 필드
}

// 역할 업데이트 요청 타입
export interface UpdateRoleRequest {
  role_name?: string; // role_name 필드
}

// 역할 조회 필터 타입
export interface RoleFilter {
  role_id?: RoleId; // role_id 필드
  role_name?: string; // role_name 필드
}
