import { db } from "../../config/firebase";
import * as admin from "firebase-admin";
import {
  FirestoreClassStudent,
  convertFirestoreTimestamp,
  convertToFirestoreTimestamp,
} from '../../common/firestore.types';
import {
  createConflictError,
  createDatabaseError
} from '../../common/errors';
import {
  batchGetDocuments,
  OptimizedQueryBuilder
} from '../../common/batch-query';

import {
  ClassStudent,
  CreateClassStudentRequest,
  UpdateClassStudentRequest,
  ClassStudentFilter,
  ClassStudentWithDetails,
  ClassWithStudents,
  StudentWithClasses
} from './class_students.types';

const COL = 'class_students';

// Firestore 데이터를 ClassStudent로 변환
function convertClassStudentFromFirestore(doc: admin.firestore.QueryDocumentSnapshot): ClassStudent {
  const data = doc.data() as FirestoreClassStudent;
  return {
    class_id: data.class_id,
    student_id: data.student_id,
    enrollment_date: convertFirestoreTimestamp(data.enrollment_date) || new Date(),
    status: data.status as ClassStudent['status'],
  };
}

// 내부 조회 함수
async function getClassStudentInternal(classId: string, studentId: string): Promise<ClassStudent | null> {
  try {
    const query = new OptimizedQueryBuilder<ClassStudent>(COL)
      .where('class_id', '==', classId)
      .where('student_id', '==', studentId)
      .limit(1);
    const results = await query.get(convertClassStudentFromFirestore);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    throw createDatabaseError(`Failed to get class-student relationship: ${error}`, error as Error);
  }
}

// Class_Students 관계 생성
export async function createClassStudent(data: CreateClassStudentRequest): Promise<ClassStudent> {
  try {
    // 기존 관계 확인
    const existing = await getClassStudentInternal(data.class_id, data.student_id);
    if (existing) {
      throw createConflictError('Class-student relationship already exists');
    }

    const firestoreData: FirestoreClassStudent = {
      id: `${data.class_id}_${data.student_id}`,
      class_id: data.class_id,
      student_id: data.student_id,
      enrollment_date: convertToFirestoreTimestamp(data.enrollment_date) || admin.firestore.Timestamp.now(),
      status: data.status || 'active',
    };

    await db.collection(COL).add(firestoreData);

    return {
      class_id: data.class_id,
      student_id: data.student_id,
      enrollment_date: data.enrollment_date || new Date(),
      status: data.status || 'active',
    };
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error;
    }
    throw createDatabaseError(`Failed to create class-student relationship: ${error}`, error as Error);
  }
}

// Class_Students 관계 조회
export async function getClassStudent(classId: string, studentId: string): Promise<ClassStudent | null> {
  try {
    return await getClassStudentInternal(classId, studentId);
  } catch (error) {
    throw createDatabaseError(`Failed to get class-student relationship: ${error}`, error as Error);
  }
}

// 반의 모든 학생 관계 조회
export async function getClassStudents(classId: string): Promise<ClassStudent[]> {
  try {
    const query = new OptimizedQueryBuilder<ClassStudent>(COL)
      .where('class_id', '==', classId);
    return await query.get(convertClassStudentFromFirestore);
  } catch (error) {
    throw createDatabaseError(`Failed to get class students: ${error}`, error as Error);
  }
}

// 학생의 모든 반 관계 조회
export async function getStudentClasses(studentId: string): Promise<ClassStudent[]> {
  try {
    const query = new OptimizedQueryBuilder<ClassStudent>(COL)
      .where('student_id', '==', studentId);
    return await query.get(convertClassStudentFromFirestore);
  } catch (error) {
    throw createDatabaseError(`Failed to get student classes: ${error}`, error as Error);
  }
}

// Class_Students 관계 업데이트
export async function updateClassStudent(
  classId: string,
  studentId: string,
  data: UpdateClassStudentRequest
): Promise<ClassStudent | null> {
  try {
    const existing = await getClassStudentInternal(classId, studentId);
    if (!existing) {
      return null;
    }

    const updateData: Partial<FirestoreClassStudent> = {};
    
    if (data.enrollment_date !== undefined) {
      updateData.enrollment_date = convertToFirestoreTimestamp(data.enrollment_date) || admin.firestore.Timestamp.now();
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    const query = new OptimizedQueryBuilder<ClassStudent>(COL)
      .where('class_id', '==', classId)
      .where('student_id', '==', studentId);
    const snapshot = await query.queryObject.get();

    if (!snapshot.empty) {
      const docId = snapshot.docs[0].id;
      await db.collection(COL).doc(docId).update(updateData);
    }

    return await getClassStudentInternal(classId, studentId);
  } catch (error) {
    throw createDatabaseError(`Failed to update class-student relationship: ${error}`, error as Error);
  }
}

// Class_Students 관계 삭제
export async function deleteClassStudent(classId: string, studentId: string): Promise<boolean> {
  try {
    const query = new OptimizedQueryBuilder<ClassStudent>(COL)
      .where('class_id', '==', classId)
      .where('student_id', '==', studentId);
    const snapshot = await query.queryObject.get();

    if (snapshot.empty) {
      return false;
    }

    const docId = snapshot.docs[0].id;
    await db.collection(COL).doc(docId).delete();
    return true;
  } catch (error) {
    throw createDatabaseError(`Failed to delete class-student relationship: ${error}`, error as Error);
  }
}

// 필터로 Class_Students 관계 조회
export async function getClassStudentsByFilter(filter: ClassStudentFilter): Promise<ClassStudent[]> {
  try {
    let query = new OptimizedQueryBuilder<ClassStudent>(COL);

    if (filter.class_id) {
      query = query.where('class_id', '==', filter.class_id);
    }

    if (filter.student_id) {
      query = query.where('student_id', '==', filter.student_id);
    }

    if (filter.status) {
      query = query.where('status', '==', filter.status);
    }

    return await query.get(convertClassStudentFromFirestore);
  } catch (error) {
    throw createDatabaseError(`Failed to get class students by filter: ${error}`, error as Error);
  }
}

// 반과 학생 정보 함께 조회
export async function getClassWithStudents(classId: string): Promise<ClassWithStudents | null> {
  try {
    // 반 정보 조회
    const classDoc = await db.collection('classes').doc(classId).get();
    if (!classDoc.exists) {
      return null;
    }

    const classData = classDoc.data();
    if (!classData) {
      return null;
    }

    // 반의 모든 학생 관계 조회
    const classStudents = await getClassStudents(classId);

    // 학생 정보 조회
    const studentIds = classStudents.map(cs => cs.student_id);
    const studentsResult = await batchGetDocuments(
      'students',
      studentIds,
      (doc) => {
        const data = doc.data() as any;
        const classStudent = classStudents.find(cs => cs.student_id === data.student_id);
        return {
          student_id: data.student_id,
          student_name: data.student_name,
          user_id: data.user_id,
          enrollment_date: classStudent?.enrollment_date || new Date(),
          status: classStudent?.status || 'active',
        };
      }
    );

    return {
      class_id: classData.class_id,
      class_name: classData.class_name,
      subject_id: classData.subject_id,
      students: studentsResult.data,
    };
  } catch (error) {
    throw createDatabaseError(`Failed to get class with students: ${error}`, error as Error);
  }
}

// 학생과 반 정보 함께 조회
export async function getStudentWithClasses(studentId: string): Promise<StudentWithClasses | null> {
  try {
    // 학생 정보 조회
    const studentDoc = await db.collection('students').doc(studentId).get();
    if (!studentDoc.exists) {
      return null;
    }

    const studentData = studentDoc.data();
    if (!studentData) {
      return null;
    }

    // 학생의 모든 반 관계 조회
    const studentClasses = await getStudentClasses(studentId);

    // 반 정보 조회
    const classIds = studentClasses.map(sc => sc.class_id);
    const classesResult = await batchGetDocuments(
      'classes',
      classIds,
      (doc) => {
        const data = doc.data() as any;
        const studentClass = studentClasses.find(sc => sc.class_id === data.class_id);
        return {
          class_id: data.class_id,
          class_name: data.class_name,
          subject_id: data.subject_id,
          enrollment_date: studentClass?.enrollment_date || new Date(),
          status: studentClass?.status || 'active',
        };
      }
    );

    return {
      student_id: studentData.student_id,
      student_name: studentData.student_name,
      user_id: studentData.user_id,
      classes: classesResult.data,
    };
  } catch (error) {
    throw createDatabaseError(`Failed to get student with classes: ${error}`, error as Error);
  }
}

// Class_Students 관계와 상세 정보 함께 조회
export async function getClassStudentWithDetails(
  classId: string,
  studentId: string
): Promise<ClassStudentWithDetails | null> {
  try {
    const classStudent = await getClassStudentInternal(classId, studentId);
    if (!classStudent) {
      return null;
    }

    // 반 정보 조회
    const classDoc = await db.collection('classes').doc(classId).get();
    const classData = classDoc.exists ? classDoc.data() : null;

    // 학생 정보 조회
    const studentDoc = await db.collection('students').doc(studentId).get();
    const studentData = studentDoc.exists ? studentDoc.data() : null;

    return {
      ...classStudent,
      class: classData ? {
        class_id: classData.class_id,
        class_name: classData.class_name,
        subject_id: classData.subject_id,
      } : undefined,
      student: studentData ? {
        student_id: studentData.student_id,
        student_name: studentData.student_name,
        user_id: studentData.user_id,
      } : undefined,
    };
  } catch (error) {
    throw createDatabaseError(`Failed to get class student with details: ${error}`, error as Error);
  }
} 