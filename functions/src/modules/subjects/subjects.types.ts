// 과목 인터페이스 (ERD에 맞춰 정확히 구현)
export interface Subject {
  subject_id: string; // bigint를 string으로 처리 (Firebase 호환)
  subject_name: string; // ERD의 subject_name 필드 (varchar)

  // 메타데이터
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// 공개용 과목 정보 (민감한 정보 제외)
export interface PublicSubject {
  subject_id: string;
  subject_name: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// 과목 생성 요청 타입
export interface CreateSubjectRequest {
  subject_name: string; // ERD의 subject_name 필드
}

// 과목 업데이트 요청 타입
export interface UpdateSubjectRequest {
  subject_name?: string; // ERD의 subject_name 필드
}

// 과목 조회 필터 타입
export interface SubjectFilter {
  subject_name?: string; // 과목 이름으로 검색 (부분 일치)
}

// 과목과 선생님 정보를 포함한 확장 타입
export interface SubjectWithTeachers extends Subject {
  teachers: Array<{
    teacher_id: string;
    teacher_name: string;
    user_id: string;
  }>;
}

// 과목과 반 정보를 포함한 확장 타입
export interface SubjectWithClasses extends Subject {
  classes: Array<{
    class_id: string;
    class_name: string;
  }>;
}
