// 부모 인터페이스
export interface Parent {
  user_id: string; // USERS 테이블과 연결
  parent_id: string; // 복합 키의 일부
  relationship?: string; // 학생과의 관계 (부, 모, 보호자 등)
  emergency_contact?: string; // 비상연락처
  occupation?: string; // 직업
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// 부모-학생 관계 인터페이스
export interface ParentStudent {
  parent_id: string;
  student_id: string;
  user_id: string; // 학생의 user_id
  relationship?: string; // 관계 유형
  is_primary_contact?: boolean; // 주요 연락처 여부
  createdAt: FirebaseFirestore.Timestamp;
}

// 부모 생성 요청 타입
export interface CreateParentRequest {
  user_id: string;
  relationship?: string;
  emergency_contact?: string;
  occupation?: string;
}

// 부모 업데이트 요청 타입
export interface UpdateParentRequest {
  relationship?: string;
  emergency_contact?: string;
  occupation?: string;
}

// 부모-학생 관계 생성 요청 타입
export interface CreateParentStudentRequest {
  parent_id: string;
  student_id: string;
  user_id: string;
  relationship?: string;
  is_primary_contact?: boolean;
}

// 부모 조회 필터 타입
export interface ParentFilter {
  user_id?: string;
  relationship?: string;
}

// 부모-학생 관계 조회 필터 타입
export interface ParentStudentFilter {
  parent_id?: string;
  student_id?: string;
  user_id?: string;
  is_primary_contact?: boolean;
}

// 부모 정보와 학생 정보를 포함한 확장 타입
export interface ParentWithStudents {
  parent: Parent;
  students: Array<{
    student_id: string;
    user_id: string;
    name: string;
    relationship?: string;
    is_primary_contact?: boolean;
  }>;
}

// 학생 정보와 부모 정보를 포함한 확장 타입
export interface StudentWithParents {
  student_id: string;
  user_id: string;
  name: string;
  parents: Array<{
    parent_id: string;
    user_id: string;
    name: string;
    relationship?: string;
    is_primary_contact?: boolean;
  }>;
}
