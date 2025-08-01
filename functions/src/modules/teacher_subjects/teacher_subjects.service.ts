import * as admin from "firebase-admin";
import { db } from "../../config/firebase";
import {
  TeacherSubject,
  CreateTeacherSubjectRequest,
  UpdateTeacherSubjectRequest,
  TeacherSubjectFilter,
  TeacherSubjectWithDetails,
} from "./teacher_subjects.types";

const COL = "teacher_subjects";

// 선생님-과목 관계 조회 (내부용)
async function getTeacherSubjectInternal(teacherId: string, subjectId: string): Promise<TeacherSubject | null> {
  const query = db.collection(COL)
    .where("teacher_id", "==", teacherId)
    .where("subject_id", "==", subjectId)
    .limit(1);
  const snapshot = await query.get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data() as TeacherSubject;
}

// 선생님-과목 관계 생성
export async function createTeacherSubject(data: CreateTeacherSubjectRequest): Promise<TeacherSubject> {
  // 기존 관계 확인
  const existing = await getTeacherSubjectInternal(data.teacher_id, data.subject_id);
  if (existing) {
    const error = new Error("Teacher-subject relationship already exists");
    (error as any).status = 409;
    throw error;
  }

  const teacherSubject: TeacherSubject = {
    teacher_id: data.teacher_id,
    subject_id: data.subject_id,
    is_primary: data.is_primary || false,
  };

  await db.collection(COL).add(teacherSubject);
  return teacherSubject;
}

// 선생님-과목 관계 조회
export async function getTeacherSubject(teacherId: string, subjectId: string): Promise<TeacherSubject | null> {
  return await getTeacherSubjectInternal(teacherId, subjectId);
}

// 선생님의 모든 과목 관계 조회
export async function getTeacherSubjects(teacherId: string): Promise<TeacherSubject[]> {
  const query = db.collection(COL).where("teacher_id", "==", teacherId);
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => doc.data() as TeacherSubject);
}

// 과목의 모든 선생님 관계 조회
export async function getSubjectTeachers(subjectId: string): Promise<TeacherSubject[]> {
  const query = db.collection(COL).where("subject_id", "==", subjectId);
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => doc.data() as TeacherSubject);
}

// 선생님-과목 관계 업데이트
export async function updateTeacherSubject(teacherId: string, subjectId: string, data: UpdateTeacherSubjectRequest): Promise<TeacherSubject | null> {
  const existing = await getTeacherSubjectInternal(teacherId, subjectId);
  if (!existing) {
    const error = new Error("Teacher-subject relationship not found");
    (error as any).status = 404;
    throw error;
  }

  const updateData: Partial<TeacherSubject> = {};
  if (data.is_primary !== undefined) updateData.is_primary = data.is_primary;

  const query = db.collection(COL)
    .where("teacher_id", "==", teacherId)
    .where("subject_id", "==", subjectId);
  const snapshot = await query.get();

  if (!snapshot.empty) {
    const docId = snapshot.docs[0].id;
    await db.collection(COL).doc(docId).update(updateData);
  }

  return await getTeacherSubjectInternal(teacherId, subjectId);
}

// 선생님-과목 관계 삭제
export async function deleteTeacherSubject(teacherId: string, subjectId: string): Promise<boolean> {
  const query = db.collection(COL)
    .where("teacher_id", "==", teacherId)
    .where("subject_id", "==", subjectId);
  const snapshot = await query.get();

  if (snapshot.empty) {
    return false;
  }

  const docId = snapshot.docs[0].id;
  await db.collection(COL).doc(docId).delete();
  return true;
}

// 필터로 선생님-과목 관계 조회
export async function getTeacherSubjectsByFilter(filter: TeacherSubjectFilter): Promise<TeacherSubject[]> {
  let query: admin.firestore.Query = db.collection(COL);

  if (filter.teacher_id) {
    query = query.where("teacher_id", "==", filter.teacher_id);
  }

  if (filter.subject_id) {
    query = query.where("subject_id", "==", filter.subject_id);
  }

  const snapshot = await query.get();
  let teacherSubjects = snapshot.docs.map((doc) => doc.data() as TeacherSubject);

  // is_primary로 필터링
  if (filter.is_primary !== undefined) {
    teacherSubjects = teacherSubjects.filter((ts) => ts.is_primary === filter.is_primary);
  }

  return teacherSubjects;
}

// 선생님-과목 관계와 상세 정보 함께 조회
export async function getTeacherSubjectWithDetails(teacherId: string, subjectId: string): Promise<TeacherSubjectWithDetails | null> {
  const teacherSubject = await getTeacherSubjectInternal(teacherId, subjectId);
  if (!teacherSubject) return null;

  // 선생님 정보 조회
  const teacherDoc = await db.collection("teachers").doc(teacherId).get();
  const teacher = teacherDoc.exists ? teacherDoc.data() : null;

  // 과목 정보 조회
  const subjectDoc = await db.collection("subjects").doc(subjectId).get();
  const subject = subjectDoc.exists ? subjectDoc.data() : null;

  return {
    ...teacherSubject,
    teacher: teacher ? {
      teacher_id: teacher.teacher_id,
      teacher_name: teacher.teacher_name,
      user_id: teacher.user_id,
      class_id: teacher.class_id,
    } : undefined,
    subject: subject ? {
      subject_id: subject.subject_id,
      subject_name: subject.subject_name,
    } : undefined,
  };
}
