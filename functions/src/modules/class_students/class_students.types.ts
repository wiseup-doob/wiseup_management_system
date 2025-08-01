// 반-학생 관계 인터페이스 (다대다 관계)
export interface ClassStudent {
  class_id: string;
  student_id: string;
  enrollment_date: Date;
  status: ClassStudentStatus;
}

// 반-학생 상태 타입
export type ClassStudentStatus = "active" | "inactive" | "graduated" | "transferred";

// 반-학생 관계 생성 요청 타입
export interface CreateClassStudentRequest {
  class_id: string;
  student_id: string;
  enrollment_date?: Date;
  status?: ClassStudentStatus;
}

// 반-학생 관계 업데이트 요청 타입
export interface UpdateClassStudentRequest {
  enrollment_date?: Date;
  status?: ClassStudentStatus;
}

// 반-학생 관계 조회 필터 타입
export interface ClassStudentFilter {
  class_id?: string;
  student_id?: string;
  status?: ClassStudentStatus;
  enrollment_date_from?: Date;
  enrollment_date_to?: Date;
}

// 반-학생 관계와 상세 정보를 포함한 확장 타입
export interface ClassStudentWithDetails extends ClassStudent {
  class?: {
    class_id: string;
    class_name: string;
    subject_id: string;
  };
  student?: {
    student_id: string;
    student_name: string;
    user_id: string;
  };
}

// 반별 학생 목록을 포함한 확장 타입
export interface ClassWithStudents {
  class_id: string;
  class_name: string;
  subject_id: string;
  students: Array<{
    student_id: string;
    student_name: string;
    user_id: string;
    enrollment_date: Date;
    status: ClassStudentStatus;
  }>;
}

// 학생별 수강 반 목록을 포함한 확장 타입
export interface StudentWithClasses {
  student_id: string;
  student_name: string;
  user_id: string;
  classes: Array<{
    class_id: string;
    class_name: string;
    subject_id: string;
    enrollment_date: Date;
    status: ClassStudentStatus;
  }>;
}
