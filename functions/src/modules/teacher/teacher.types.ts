// 선생님 인터페이스 (ERD 구조에 맞게 수정)
export interface Teacher {
  teacher_id: string; // bigint를 string으로 처리 (Firebase 호환)
  user_id: string; // ERD의 user_id 필드 (User 테이블 참조)
  class_id: string; // ERD의 class_id 필드 (Class 테이블 참조, NOT NULL)
  teacher_name: string; // ERD의 teacher_name 필드
  teacher_subject: TeacherSubjectEnum; // ERD의 teacher_subject ENUM 필드

  // 메타데이터
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// 선생님 과목 ENUM (ERD에 맞게 정의)
export type TeacherSubjectEnum =
  | "MATH"
  | "ENGLISH"
  | "KOREAN"
  | "SCIENCE"
  | "SOCIAL_STUDIES"
  | "PHYSICAL_EDUCATION"
  | "ART"
  | "MUSIC"
  | "TECHNOLOGY"
  | "OTHER";

// 선생님-과목 관계 테이블 (다대다 관계)
export interface TeacherSubjectRelation {
  teacher_id: string;
  subject_id: string;
  is_primary: boolean;
}

// 공개용 선생님 정보 (민감한 정보 제외)
export interface PublicTeacher {
  teacher_id: string;
  user_id: string;
  class_id: string;
  teacher_name: string;
  teacher_subject: TeacherSubjectEnum;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// 선생님 생성 요청 타입
export interface CreateTeacherRequest {
  user_id: string;
  class_id: string;
  teacher_name: string;
  teacher_subject: TeacherSubjectEnum;
}

// 선생님 업데이트 요청 타입
export interface UpdateTeacherRequest {
  class_id?: string;
  teacher_name?: string;
  teacher_subject?: TeacherSubjectEnum;
}

// 선생님 조회 필터 타입
export interface TeacherFilter {
  user_id?: string;
  class_id?: string;
  teacher_name?: string;
  teacher_subject?: TeacherSubjectEnum;
}

// 선생님과 사용자 정보를 포함한 확장 타입
export interface TeacherWithUser extends Teacher {
  user: {
    user_id: string;
    user_name: string;
    user_phone: string;
    user_email: string;
    user_status: string;
  };
}

// 선생님과 과목 정보를 포함한 확장 타입 (다대다 관계)
export interface TeacherWithSubjects extends Teacher {
  subjects: Array<{
    subject_id: string;
    subject_name: string;
    is_primary: boolean;
  }>;
}

// 선생님과 반 정보를 포함한 확장 타입
export interface TeacherWithClass extends Teacher {
  class: {
    class_id: string;
    class_name: string;
    subject_id: string;
  };
}

// 과목과 선생님 정보를 포함한 확장 타입 (다대다 관계)
export interface SubjectWithTeachers {
  subject_id: string;
  subject_name: string;
  teachers: Array<{
    teacher_id: string;
    teacher_name: string;
    user_id: string;
    class_id: string;
    teacher_subject: TeacherSubjectEnum;
    is_primary: boolean;
  }>;
}
