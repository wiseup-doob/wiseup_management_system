// 선생님-과목 관계 인터페이스 (다대다 관계)
export interface TeacherSubject {
  teacher_id: string;
  subject_id: string;
  is_primary: boolean;
}

// 선생님-과목 관계 생성 요청 타입
export interface CreateTeacherSubjectRequest {
  teacher_id: string;
  subject_id: string;
  is_primary?: boolean;
}

// 선생님-과목 관계 업데이트 요청 타입
export interface UpdateTeacherSubjectRequest {
  is_primary?: boolean;
}

// 선생님-과목 관계 조회 필터 타입
export interface TeacherSubjectFilter {
  teacher_id?: string;
  subject_id?: string;
  is_primary?: boolean;
}

// 선생님과 과목 정보를 포함한 확장 타입
export interface TeacherSubjectWithDetails extends TeacherSubject {
  teacher?: {
    teacher_id: string;
    teacher_name: string;
    user_id: string;
    class_id: string;
  };
  subject?: {
    subject_id: string;
    subject_name: string;
  };
}
