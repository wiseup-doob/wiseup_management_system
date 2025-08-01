// 반 인터페이스 (ERD 구조에 맞게 수정)
export interface Class {
  class_id: string; // class_id 필드
  subject_id: string; // subject_id 필드 (Subjects 테이블 참조)
  class_name: string; // class_name 필드

  // 메타데이터
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// 공개용 반 정보 (민감한 정보 제외)
export interface PublicClass {
  class_id: string;
  subject_id: string;
  class_name: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// 반 생성 요청 타입
export interface CreateClassRequest {
  subject_id: string; // subject_id 필드 (과목 ID)
  class_name: string; // class_name 필드
}

// 반 업데이트 요청 타입
export interface UpdateClassRequest {
  subject_id?: string; // subject_id 필드
  class_name?: string; // class_name 필드
}

// 반 조회 필터 타입
export interface ClassFilter {
  subject_id?: string; // subject_id 필드 (과목 ID)
  class_name?: string; // class_name 필드
}

// 반과 선생님 정보를 포함한 확장 타입
export interface ClassWithTeacher extends Class {
  teacher?: {
    teacher_id: string;
    teacher_name: string;
    user_id: string;
  };
}

// 반과 과목 정보를 포함한 확장 타입
export interface ClassWithSubject extends Class {
  subject?: {
    subject_id: string;
    subject_name: string;
  };
}

// 반과 학생 정보를 포함한 확장 타입
export interface ClassWithStudents extends Class {
  students: Array<{
    student_id: string;
    student_name: string;
    user_id: string;
  }>;
}

// 반과 모든 관련 정보를 포함한 확장 타입
export interface ClassWithDetails extends Class {
  teacher?: {
    teacher_id: string;
    teacher_name: string;
    user_id: string;
  };
  subject?: {
    subject_id: string;
    subject_name: string;
  };
  students: Array<{
    student_id: string;
    student_name: string;
    user_id: string;
  }>;
}
