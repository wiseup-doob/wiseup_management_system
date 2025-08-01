import { db } from "../../config/firebase";
import * as admin from "firebase-admin";
import {
  Class,
  PublicClass,
  CreateClassRequest,
  UpdateClassRequest,
  ClassFilter,
  ClassWithTeacher,
  ClassWithSubject,
  ClassWithStudents,
  ClassWithDetails,
} from "./class.types";

const COL = "classes";

// 공용 변환 함수
const toPublicClass = (classData: Class): PublicClass => {
  const { class_id, subject_id, class_name, createdAt, updatedAt } = classData;
  return {
    class_id,
    subject_id,
    class_name,
    createdAt,
    updatedAt,
  };
};

// 반 ID로 반 조회 (내부용)
async function getClassByIdInternal(classId: string): Promise<Class | null> {
  const doc = await db.collection(COL).doc(classId).get();
  if (!doc.exists) return null;
  return doc.data() as Class;
}

// 반 ID로 반 조회
export async function getClassById(classId: string): Promise<PublicClass | null> {
  const classData = await getClassByIdInternal(classId);
  if (!classData) return null;
  return toPublicClass(classData);
}

// 반 생성
export async function createClass(data: CreateClassRequest): Promise<PublicClass> {
  const now = admin.firestore.FieldValue.serverTimestamp();
  const classId = db.collection(COL).doc().id;

  const classData: Class = {
    class_id: classId,
    subject_id: data.subject_id,
    class_name: data.class_name,
    createdAt: now as any,
    updatedAt: now as any,
  };

  await db.collection(COL).doc(classId).set(classData);
  return toPublicClass(classData);
}

// 반 업데이트
export async function updateClass(classId: string, data: UpdateClassRequest): Promise<PublicClass | null> {
  const existingClass = await getClassByIdInternal(classId);
  if (!existingClass) return null;

  const updateData: Partial<Class> = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp() as any,
  };

  if (data.class_name !== undefined) updateData.class_name = data.class_name;
  if (data.subject_id !== undefined) updateData.subject_id = data.subject_id;

  await db.collection(COL).doc(classId).update(updateData);

  const updatedClass = await getClassByIdInternal(classId);
  return updatedClass ? toPublicClass(updatedClass) : null;
}

// 반 삭제
export async function deleteClass(classId: string): Promise<boolean> {
  const existingClass = await getClassByIdInternal(classId);
  if (!existingClass) return false;

  await db.collection(COL).doc(classId).delete();
  return true;
}

// 필터로 반 조회
export async function getClassesByFilter(filter: ClassFilter): Promise<PublicClass[]> {
  let query: FirebaseFirestore.Query = db.collection(COL);

  if (filter.subject_id) {
    query = query.where("subject_id", "==", filter.subject_id);
  }

  const snapshot = await query.get();
  let classes = snapshot.docs.map((doc) => doc.data() as Class);

  // 이름으로 부분 검색 (Firestore에서 직접 지원하지 않으므로 클라이언트에서 필터링)
  if (filter.class_name) {
    classes = classes.filter((classData) =>
      classData.class_name.toLowerCase().includes(filter.class_name!.toLowerCase())
    );
  }

  return classes.map(toPublicClass);
}

// 모든 반 조회
export async function getAllClasses(): Promise<PublicClass[]> {
  const snapshot = await db.collection(COL).get();
  const classes = snapshot.docs.map((doc) => doc.data() as Class);
  return classes.map(toPublicClass);
}

// 반과 선생님 정보 함께 조회
export async function getClassWithTeacher(classId: string): Promise<ClassWithTeacher | null> {
  const classData = await getClassByIdInternal(classId);
  if (!classData) return null;

  // 해당 반을 담당하는 선생님 조회
  const teacherSnapshot = await db.collection("teachers").where("class_id", "==", classId).get();
  const teacherDoc = teacherSnapshot.docs[0];
  const teacher = teacherDoc ? teacherDoc.data() : null;

  return {
    ...classData,
    teacher: teacher ? {
      teacher_id: teacher.teacher_id,
      teacher_name: teacher.teacher_name,
      user_id: teacher.user_id,
    } : undefined,
  };
}

// 반과 과목 정보 함께 조회
export async function getClassWithSubject(classId: string): Promise<ClassWithSubject | null> {
  const classData = await getClassByIdInternal(classId);
  if (!classData) return null;

  // 과목 정보 조회
  const subjectDoc = await db.collection("subjects").doc(classData.subject_id).get();
  const subject = subjectDoc.exists ? subjectDoc.data() : null;

  return {
    ...classData,
    subject: subject ? {
      subject_id: subject.subject_id,
      subject_name: subject.subject_name,
    } : undefined,
  };
}

// 반과 학생 정보 함께 조회
export async function getClassWithStudents(classId: string): Promise<ClassWithStudents | null> {
  const classData = await getClassByIdInternal(classId);
  if (!classData) return null;

  // 해당 반에 속한 학생들 조회
  const studentsSnapshot = await db.collection("students").where("class_id", "==", classId).get();
  const students = studentsSnapshot.docs.map((doc) => {
    const studentData = doc.data();
    return {
      student_id: studentData.student_id,
      student_name: studentData.student_name,
      user_id: studentData.user_id,
    };
  });

  return {
    ...classData,
    students,
  };
}

// 반과 모든 관련 정보 함께 조회
export async function getClassWithDetails(classId: string): Promise<ClassWithDetails | null> {
  const classData = await getClassByIdInternal(classId);
  if (!classData) return null;

  // 선생님 정보 조회
  const teacherSnapshot = await db.collection("teachers").where("class_id", "==", classId).get();
  const teacherDoc = teacherSnapshot.docs[0];
  const teacherData = teacherDoc ? teacherDoc.data() : null;
  const teacher = teacherData ? {
    teacher_id: teacherData.teacher_id,
    teacher_name: teacherData.teacher_name,
    user_id: teacherData.user_id,
  } : undefined;

  // 과목 정보 조회
  const subjectDoc = await db.collection("subjects").doc(classData.subject_id).get();
  const subjectData = subjectDoc.exists ? subjectDoc.data() : null;
  const subject = subjectData ? {
    subject_id: subjectData.subject_id,
    subject_name: subjectData.subject_name,
  } : undefined;

  // 학생 정보 조회
  const studentsSnapshot = await db.collection("students").where("class_id", "==", classId).get();
  const students = studentsSnapshot.docs.map((doc) => {
    const studentData = doc.data();
    return {
      student_id: studentData.student_id,
      student_name: studentData.student_name,
      user_id: studentData.user_id,
    };
  });

  return {
    ...classData,
    teacher,
    subject,
    students,
  };
}

// 반 이름 중복 체크
export async function checkClassNameExists(className: string, excludeClassId?: string): Promise<boolean> {
  const snapshot = await db.collection(COL).where("class_name", "==", className).get();
  const classes = snapshot.docs.map((doc) => doc.data() as Class);

  if (excludeClassId) {
    return classes.some((classData) => classData.class_id !== excludeClassId);
  }

  return classes.length > 0;
}

// 과목 ID 유효성 체크
export async function checkSubjectExists(subjectId: string): Promise<boolean> {
  const doc = await db.collection("subjects").doc(subjectId).get();
  return doc.exists;
}
