import * as admin from "firebase-admin";
import { db } from "../../config/firebase";
import {
  Subject,
  PublicSubject,
  CreateSubjectRequest,
  UpdateSubjectRequest,
  SubjectFilter,
  SubjectWithTeachers,
  SubjectWithClasses,
} from "./subjects.types";

const COL = process.env.COL_SUBJECTS ?? "subjects";

// 고유 ID 생성 (bigint 형태의 timestamp 기반)
function generateSubjectId(): string {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, "0");
}

// 과목 데이터에서 민감한 정보 제거
function toPublicSubject(subject: Subject): PublicSubject {
  const { ...publicSubject } = subject;
  return publicSubject;
}

// 과목 이름 중복 체크
export async function checkSubjectNameExists(subjectName: string, excludeSubjectId?: string): Promise<boolean> {
  const query = db.collection(COL).where("subject_name", "==", subjectName);
  const snapshot = await query.get();

  if (excludeSubjectId) {
    // 업데이트 시 자신의 과목 이름은 제외
    return snapshot.docs.some((doc) => doc.id !== excludeSubjectId);
  }

  return !snapshot.empty;
}

// 과목 ID로 과목 조회 (내부용)
export async function getSubjectByIdInternal(subjectId: string): Promise<Subject | null> {
  const doc = await db.collection(COL).doc(subjectId).get();
  if (!doc.exists) {
    return null;
  }

  return doc.data() as Subject;
}

// 과목 생성
export async function createSubject(data: CreateSubjectRequest): Promise<PublicSubject> {
  // 과목 이름 중복 체크
  const nameExists = await checkSubjectNameExists(data.subject_name);
  if (nameExists) {
    const error = new Error("Subject name already exists");
    (error as any).status = 409;
    throw error;
  }

  const subjectId = generateSubjectId();
  const now = admin.firestore.FieldValue.serverTimestamp();

  const subjectData: Subject = {
    subject_id: subjectId,
    subject_name: data.subject_name,
    createdAt: now as any,
    updatedAt: now as any,
  };

  await db.collection(COL).doc(subjectId).set(subjectData);

  return toPublicSubject(subjectData);
}

// 과목 ID로 과목 조회
export async function getSubjectById(subjectId: string): Promise<PublicSubject | null> {
  const subject = await getSubjectByIdInternal(subjectId);
  return subject ? toPublicSubject(subject) : null;
}

// 과목 정보 업데이트
export async function updateSubject(subjectId: string, data: UpdateSubjectRequest): Promise<PublicSubject> {
  const existingSubject = await getSubjectByIdInternal(subjectId);
  if (!existingSubject) {
    const error = new Error("Subject not found");
    (error as any).status = 404;
    throw error;
  }

  // 과목 이름 중복 체크 (업데이트 시)
  if (data.subject_name) {
    const nameExists = await checkSubjectNameExists(data.subject_name, subjectId);
    if (nameExists) {
      const error = new Error("Subject name already exists");
      (error as any).status = 409;
      throw error;
    }
  }

  const updateData: Partial<Subject> = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp() as any,
  };

  if (data.subject_name !== undefined) updateData.subject_name = data.subject_name;

  await db.collection(COL).doc(subjectId).update(updateData);

  const updatedSubject = await getSubjectByIdInternal(subjectId);
  return toPublicSubject(updatedSubject!);
}

// 과목 삭제
export async function deleteSubject(subjectId: string): Promise<void> {
  const existingSubject = await getSubjectByIdInternal(subjectId);
  if (!existingSubject) {
    const error = new Error("Subject not found");
    (error as any).status = 404;
    throw error;
  }

  await db.collection(COL).doc(subjectId).delete();
}

// 전체 과목 목록 조회
export async function getAllSubjects(): Promise<PublicSubject[]> {
  const snapshot = await db.collection(COL).get();
  return snapshot.docs.map((doc) => toPublicSubject(doc.data() as Subject));
}

// 필터로 과목 검색
export async function getSubjectsByFilter(filter: SubjectFilter): Promise<PublicSubject[]> {
  const snapshot = await db.collection(COL).get();
  let subjects = snapshot.docs.map((doc) => doc.data() as Subject);

  // 과목 이름으로 부분 검색
  if (filter.subject_name) {
    subjects = subjects.filter((subject) =>
      subject.subject_name.toLowerCase().includes(filter.subject_name!.toLowerCase())
    );
  }

  return subjects.map(toPublicSubject);
}

// 과목과 선생님 정보 함께 조회
export async function getSubjectWithTeachers(subjectId: string): Promise<SubjectWithTeachers | null> {
  const subject = await getSubjectByIdInternal(subjectId);
  if (!subject) return null;

  // 해당 과목을 담당하는 모든 선생님 조회 (배열 포함 검색)
  const teacherSnapshot = await db.collection("teachers").get();
  const teachers = teacherSnapshot.docs
    .map((doc) => doc.data())
    .filter((teacher) => teacher.subject_ids && teacher.subject_ids.includes(subjectId))
    .map((teacher) => ({
      teacher_id: teacher.teacher_id,
      teacher_name: teacher.teacher_name,
      user_id: teacher.user_id,
      is_primary: teacher.primary_subject_id === subjectId,
    }));

  return {
    subject_id: subject.subject_id,
    subject_name: subject.subject_name,
    createdAt: subject.createdAt,
    updatedAt: subject.updatedAt,
    teachers,
  };
}

// 과목과 반 정보 함께 조회
export async function getSubjectWithClasses(subjectId: string): Promise<SubjectWithClasses | null> {
  const subject = await getSubjectByIdInternal(subjectId);
  if (!subject) return null;

  // 반 정보 조회 (class 모듈이 구현되면 사용)
  // 현재는 기본 정보만 반환
  return {
    ...subject,
    classes: [], // Class 모듈 구현 시 실제 데이터 반환
  };
}

// 과목 이름으로 과목 존재 여부 확인
export async function checkSubjectExists(subjectName: string): Promise<boolean> {
  const query = db.collection(COL).where("subject_name", "==", subjectName).limit(1);
  const snapshot = await query.get();
  return !snapshot.empty;
}
