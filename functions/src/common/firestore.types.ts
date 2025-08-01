import * as admin from 'firebase-admin'

// Firestore 문서 기본 타입
export interface FirestoreDocument {
  id: string;
  createdAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
}

// User 관련 Firestore 타입
export interface FirestoreUser extends FirestoreDocument {
  user_name: string;
  user_phone: string;
  user_email: string;
  user_password_hash: string;
  user_status: string;
}

// Student 관련 Firestore 타입
export interface FirestoreStudent extends FirestoreDocument {
  user_id: string;
  student_name: string;
  student_target_univ?: string;
  student_photo?: string;
  student_age?: string;
  student_schoolname?: string;
}

// Class 관련 Firestore 타입
export interface FirestoreClass extends FirestoreDocument {
  subject_id: string;
  class_name: string;
}

// ClassStudent 관련 Firestore 타입
export interface FirestoreClassStudent extends FirestoreDocument {
  class_id: string;
  student_id: string;
  enrollment_date: admin.firestore.Timestamp;
  status: string;
}

// Teacher 관련 Firestore 타입
export interface FirestoreTeacher extends FirestoreDocument {
  user_id: string;
  class_id: string;
  teacher_name: string;
  teacher_subject: string;
}

// TeacherSubject 관련 Firestore 타입
export interface FirestoreTeacherSubject extends FirestoreDocument {
  teacher_id: string;
  subject_id: string;
  is_primary: boolean;
}

// Subject 관련 Firestore 타입
export interface FirestoreSubject extends FirestoreDocument {
  subject_name: string;
}

// Role 관련 Firestore 타입
export interface FirestoreRole extends FirestoreDocument {
  role_name: string;
}

// UserRole 관련 Firestore 타입
export interface FirestoreUserRole extends FirestoreDocument {
  user_id: string;
  role_id: string;
}

// Attendance 관련 Firestore 타입
export interface FirestoreAttendance extends FirestoreDocument {
  user_id: string;
  student_id: string;
  att_date: admin.firestore.Timestamp;
  att_status: string;
  att_reason?: string;
  att_checkin_time?: admin.firestore.Timestamp;
  att_checkout_time?: admin.firestore.Timestamp;
}

// Parents 관련 Firestore 타입
export interface FirestoreParent extends FirestoreDocument {
  user_id: string;
}

// ParentStudent 관련 Firestore 타입
export interface FirestoreParentStudent extends FirestoreDocument {
  parent_id: string;
  student_id: string;
}

// Schedule 관련 Firestore 타입
export interface FirestoreSchedule extends FirestoreDocument {
  schedule_id: string;
  user_id: string;
  class_id: string;
  subject_id: string;
  student_id: string;
  start_date: string;
  end_date: string;
  title: string;
  description?: string;
}

// 타입 변환 헬퍼 함수들
export const convertFirestoreTimestamp = (timestamp: admin.firestore.Timestamp | undefined): Date | undefined => {
  return timestamp ? timestamp.toDate() : undefined;
};

export const convertToFirestoreTimestamp = (date: Date | undefined): admin.firestore.Timestamp | undefined => {
  return date ? admin.firestore.Timestamp.fromDate(date) : undefined;
};

// Firestore 문서를 도메인 객체로 변환하는 제네릭 함수
export const convertFirestoreDoc = <T extends FirestoreDocument>(
  doc: admin.firestore.QueryDocumentSnapshot,
  converter: (data: any) => Omit<T, 'id'>
): T => {
  const data = doc.data();
  return {
    id: doc.id,
    ...converter(data),
  } as T;
};

// 타입 안전한 Firestore 쿼리 결과 처리
export const processFirestoreQuery = <T>(
  snapshot: admin.firestore.QuerySnapshot,
  converter: (doc: admin.firestore.QueryDocumentSnapshot) => T
): T[] => {
  return snapshot.docs.map(converter);
}; 