import * as admin from "firebase-admin";
import { db } from "../../config/firebase";
import {
  Teacher,
  PublicTeacher,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  TeacherFilter,
  TeacherWithUser,
  TeacherWithClass,
  TeacherWithSubjects,
  TeacherSubjectRelation,
} from "./teacher.types";

const COL = process.env.COL_TEACHERS ?? "teachers";
const TEACHER_SUBJECTS_COL = "teacher_subjects";

// 고유 ID 생성 (bigint 형태의 timestamp 기반)
function generateTeacherId(): string {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, "0");
}

// 선생님 데이터에서 민감한 정보 제거
function toPublicTeacher(teacher: Teacher): PublicTeacher {
  const { ...publicTeacher } = teacher;
  return publicTeacher;
}

// 사용자 ID로 선생님 조회 (내부용)
export async function getTeacherByUserIdInternal(userId: string): Promise<Teacher | null> {
  const query = db.collection(COL).where("user_id", "==", userId).limit(1);
  const snapshot = await query.get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data() as Teacher;
}

// 선생님 ID로 선생님 조회 (내부용)
export async function getTeacherByIdInternal(teacherId: string): Promise<Teacher | null> {
  const doc = await db.collection(COL).doc(teacherId).get();
  if (!doc.exists) {
    return null;
  }

  return doc.data() as Teacher;
}

// 사용자 ID 중복 체크
export async function checkUserIdExists(userId: string, excludeTeacherId?: string): Promise<boolean> {
  const query = db.collection(COL).where("user_id", "==", userId);
  const snapshot = await query.get();

  if (excludeTeacherId) {
    // 업데이트 시 자신의 user_id는 제외
    return snapshot.docs.some((doc) => doc.id !== excludeTeacherId);
  }

  return !snapshot.empty;
}

// 선생님 생성
export async function createTeacher(data: CreateTeacherRequest): Promise<PublicTeacher> {
  // 사용자 ID 중복 체크
  const userExists = await checkUserIdExists(data.user_id);
  if (userExists) {
    const error = new Error("User already has a teacher profile");
    (error as any).status = 409;
    throw error;
  }

  const teacherId = generateTeacherId();
  const now = admin.firestore.FieldValue.serverTimestamp();

  const teacherData: Teacher = {
    teacher_id: teacherId,
    user_id: data.user_id,
    class_id: data.class_id,
    teacher_name: data.teacher_name,
    teacher_subject: data.teacher_subject,
    createdAt: now as any,
    updatedAt: now as any,
  };

  await db.collection(COL).doc(teacherId).set(teacherData);

  return toPublicTeacher(teacherData);
}

// 선생님 ID로 선생님 조회
export async function getTeacherById(teacherId: string): Promise<PublicTeacher | null> {
  const teacher = await getTeacherByIdInternal(teacherId);
  return teacher ? toPublicTeacher(teacher) : null;
}

// 사용자 ID로 선생님 조회
export async function getTeacherByUserId(userId: string): Promise<PublicTeacher | null> {
  const teacher = await getTeacherByUserIdInternal(userId);
  return teacher ? toPublicTeacher(teacher) : null;
}

// 선생님 정보 업데이트
export async function updateTeacher(teacherId: string, data: UpdateTeacherRequest): Promise<PublicTeacher> {
  const existingTeacher = await getTeacherByIdInternal(teacherId);
  if (!existingTeacher) {
    const error = new Error("Teacher not found");
    (error as any).status = 404;
    throw error;
  }

  const updateData: Partial<Teacher> = {
    updatedAt: admin.firestore.FieldValue.serverTimestamp() as any,
  };

  if (data.class_id !== undefined) updateData.class_id = data.class_id;
  if (data.teacher_name !== undefined) updateData.teacher_name = data.teacher_name;
  if (data.teacher_subject !== undefined) updateData.teacher_subject = data.teacher_subject;

  await db.collection(COL).doc(teacherId).update(updateData);

  const updatedTeacher = await getTeacherByIdInternal(teacherId);
  return toPublicTeacher(updatedTeacher!);
}

// 선생님 삭제
export async function deleteTeacher(teacherId: string): Promise<void> {
  const existingTeacher = await getTeacherByIdInternal(teacherId);
  if (!existingTeacher) {
    const error = new Error("Teacher not found");
    (error as any).status = 404;
    throw error;
  }

  await db.collection(COL).doc(teacherId).delete();
}

// 전체 선생님 목록 조회
export async function getAllTeachers(): Promise<PublicTeacher[]> {
  const snapshot = await db.collection(COL).get();
  return snapshot.docs.map((doc) => toPublicTeacher(doc.data() as Teacher));
}

// 필터로 선생님 검색
export async function getTeachersByFilter(filter: TeacherFilter): Promise<PublicTeacher[]> {
  let query: admin.firestore.Query = db.collection(COL);

  if (filter.user_id) {
    query = query.where("user_id", "==", filter.user_id);
  }

  if (filter.class_id) {
    query = query.where("class_id", "==", filter.class_id);
  }

  if (filter.teacher_name) {
    query = query.where("teacher_name", "==", filter.teacher_name);
  }

  const snapshot = await query.get();
  let teachers = snapshot.docs.map((doc) => doc.data() as Teacher);

  // 이름으로 부분 검색 (Firestore에서 직접 지원하지 않으므로 클라이언트에서 필터링)
  if (filter.teacher_name) {
    teachers = teachers.filter((teacher) =>
      teacher.teacher_name.toLowerCase().includes(filter.teacher_name!.toLowerCase())
    );
  }

  // teacher_subject로 필터링
  if (filter.teacher_subject) {
    teachers = teachers.filter((teacher) =>
      teacher.teacher_subject === filter.teacher_subject
    );
  }

  return teachers.map(toPublicTeacher);
}

// 선생님과 사용자 정보 함께 조회
export async function getTeacherWithUser(teacherId: string): Promise<TeacherWithUser | null> {
  const teacher = await getTeacherByIdInternal(teacherId);
  if (!teacher) return null;

  // 직접 쿼리로 사용자 정보 조회
  const userDoc = await db.collection("users").doc(teacher.user_id).get();
  const user = userDoc.exists ? userDoc.data() : null;

  if (!user) return null;

  return {
    ...teacher,
    user: {
      user_id: user.user_id,
      user_name: user.user_name,
      user_phone: user.user_phone,
      user_email: user.user_email,
      user_status: user.user_status,
    },
  };
}

// 선생님과 반 정보 함께 조회
export async function getTeacherWithClass(teacherId: string): Promise<TeacherWithClass | null> {
  const teacher = await getTeacherByIdInternal(teacherId);
  if (!teacher) return null;

  // 반 정보 조회 (class 모듈이 구현되면 사용)
  const classDoc = await db.collection("classes").doc(teacher.class_id).get();
  const classData = classDoc.exists ? classDoc.data() : null;

  if (!classData) return null;

  return {
    ...teacher,
    class: {
      class_id: classData.class_id,
      class_name: classData.class_name,
      subject_id: classData.subject_id,
    },
  };
}

// 선생님과 과목 정보 함께 조회 (다대다 관계)
export async function getTeacherWithSubjects(teacherId: string): Promise<TeacherWithSubjects | null> {
  const teacher = await getTeacherByIdInternal(teacherId);
  if (!teacher) return null;

  // 선생님-과목 관계 조회
  const query = db.collection(TEACHER_SUBJECTS_COL).where("teacher_id", "==", teacherId);
  const snapshot = await query.get();
  const subjectRelations = snapshot.docs.map((doc) => doc.data() as TeacherSubjectRelation);

  const subjects = await Promise.all(subjectRelations.map(async (relation) => {
    const subjectDoc = await db.collection("subjects").doc(relation.subject_id).get();
    const subject = subjectDoc.exists ? subjectDoc.data() : null;
    return subject ? {
      subject_id: subject.subject_id,
      subject_name: subject.subject_name,
      is_primary: relation.is_primary,
    } : null;
  }));

  const validSubjects = subjects.filter((subject) => subject !== null) as Array<{
    subject_id: string;
    subject_name: string;
    is_primary: boolean;
  }>;

  return {
    ...teacher,
    subjects: validSubjects,
  };
}

// 선생님에게 과목 할당 (다대다 관계)
export async function assignSubjectToTeacher(teacherId: string, subjectId: string, isPrimary = false): Promise<void> {
  const teacher = await getTeacherByIdInternal(teacherId);
  if (!teacher) {
    const error = new Error("Teacher not found");
    (error as any).status = 404;
    throw error;
  }

  const relation: TeacherSubjectRelation = {
    teacher_id: teacherId,
    subject_id: subjectId,
    is_primary: isPrimary,
  };

  // 기존 관계가 있는지 확인
  const existingQuery = db.collection(TEACHER_SUBJECTS_COL)
    .where("teacher_id", "==", teacherId)
    .where("subject_id", "==", subjectId);
  const existingSnapshot = await existingQuery.get();

  if (!existingSnapshot.empty) {
    // 기존 관계 업데이트
    const docId = existingSnapshot.docs[0].id;
    await db.collection(TEACHER_SUBJECTS_COL).doc(docId).update({
      is_primary: isPrimary,
    });
  } else {
    // 새로운 관계 생성
    await db.collection(TEACHER_SUBJECTS_COL).add(relation);
  }
}

// 선생님에서 과목 제거 (다대다 관계)
export async function removeSubjectFromTeacher(teacherId: string, subjectId: string): Promise<void> {
  const query = db.collection(TEACHER_SUBJECTS_COL)
    .where("teacher_id", "==", teacherId)
    .where("subject_id", "==", subjectId);
  const snapshot = await query.get();

  if (!snapshot.empty) {
    const docId = snapshot.docs[0].id;
    await db.collection(TEACHER_SUBJECTS_COL).doc(docId).delete();
  }
}

// 사용자 ID로 선생님 존재 여부 확인
export async function checkTeacherExists(userId: string): Promise<boolean> {
  const teacher = await getTeacherByUserIdInternal(userId);
  return teacher !== null;
}
