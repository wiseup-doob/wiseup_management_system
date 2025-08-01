// 학생 인터페이스 (ERD에 맞춰 정확히 구현)
export interface Student {
  student_id: string; // bigint를 string으로 처리
  user_id: string; // User 테이블 참조
  student_name: string; // ERD의 student_name 필드
  student_target_univ?: string; // ERD의 student_target_univ 필드
  student_photo?: string; // ERD의 student_photo 필드
  student_age?: string; // ERD의 student_age 필드
  student_schoolname?: string; // ERD의 student_schoolname 필드
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// 학생 생성 요청 타입
export interface CreateStudentRequest {
  user_id: string;
  student_name: string;
  student_target_univ?: string;
  student_photo?: string;
  student_age?: string;
  student_schoolname?: string;
}

// 학생 업데이트 요청 타입
export interface UpdateStudentRequest {
  student_name?: string;
  student_target_univ?: string;
  student_photo?: string;
  student_age?: string;
  student_schoolname?: string;
}

// 학생 조회 필터 타입
export interface StudentFilter {
  user_id?: string;
  student_name?: string;
  student_target_univ?: string;
  student_schoolname?: string;
}

// 학생과 부모 관계 타입
export interface ParentStudent {
  parent_id: string;
  student_id: string;
  createdAt: FirebaseFirestore.Timestamp;
}

// 학생 상세 정보 (User 정보 포함)
export interface StudentWithUser extends Student {
  user: {
    user_id: string;
    name: string;
    phone: string;
    email: string;
    status: string;
  };
}
