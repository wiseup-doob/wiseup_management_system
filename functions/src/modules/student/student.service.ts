import {FieldValue} from "firebase-admin/firestore";
import {db} from "../../config/firebase";
import {
  Student,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentFilter,
  StudentWithUser,
  ParentStudent,
} from "./student.types";

const COL_STUDENTS = process.env.COL_STUDENTS ?? "students";
const COL_USERS = process.env.COL_USERS ?? "users";
const COL_PARENT_STUDENT = process.env.COL_PARENT_STUDENT ?? "parent_student";

// 고유 ID 생성
function generateStudentId(): string {
  return "STU_" + Date.now().toString() + Math.floor(Math.random() * 1000).toString().padStart(3, "0");
}

// 사용자 존재 여부 확인
async function checkUserExists(userId: string): Promise<boolean> {
  const doc = await db.collection(COL_USERS).doc(userId).get();
  return doc.exists;
}

// 학생 생성
export async function createStudent(data: CreateStudentRequest): Promise<Student> {
  // 사용자 존재 여부 확인
  const userExists = await checkUserExists(data.user_id);
  if (!userExists) {
    const error = new Error("User not found")
    ;(error as any).status = 404;
    throw error;
  }

  // 이미 학생으로 등록된 사용자인지 확인
  const existingStudent = await getStudentByUserId(data.user_id);
  if (existingStudent) {
    const error = new Error("User is already registered as a student")
    ;(error as any).status = 409;
    throw error;
  }

  const studentId = generateStudentId();
  const studentData: Student = {
    student_id: studentId,
    user_id: data.user_id,
    student_name: data.student_name,
    student_target_univ: data.student_target_univ,
    student_photo: data.student_photo,
    student_age: data.student_age,
    student_schoolname: data.student_schoolname,
    createdAt: FieldValue.serverTimestamp() as any,
    updatedAt: FieldValue.serverTimestamp() as any,
  };

  await db.collection(COL_STUDENTS).doc(studentId).set(studentData);
  return studentData;
}

// 학생 ID로 조회
export async function getStudentById(studentId: string): Promise<Student | null> {
  const doc = await db.collection(COL_STUDENTS).doc(studentId).get();
  if (!doc.exists) {
    return null;
  }
  return doc.data() as Student;
}

// 사용자 ID로 학생 조회
export async function getStudentByUserId(userId: string): Promise<Student | null> {
  const query = db.collection(COL_STUDENTS).where("user_id", "==", userId).limit(1);
  const snapshot = await query.get();

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data() as Student;
}

// 학생과 사용자 정보 함께 조회
export async function getStudentWithUser(studentId: string): Promise<StudentWithUser | null> {
  const student = await getStudentById(studentId);
  if (!student) {
    return null;
  }

  const userDoc = await db.collection(COL_USERS).doc(student.user_id).get();
  if (!userDoc.exists) {
    return null;
  }

  const userData = userDoc.data();
  return {
    ...student,
    user: {
      user_id: userData!.user_id,
      name: userData!.name,
      phone: userData!.phone,
      email: userData!.email,
      status: userData!.status,
    },
  };
}

// 학생 업데이트
export async function updateStudent(studentId: string, data: UpdateStudentRequest): Promise<Student> {
  const student = await getStudentById(studentId);
  if (!student) {
    const error = new Error("Student not found")
    ;(error as any).status = 404;
    throw error;
  }

  const updateData: Partial<Student> = {
    ...data,
    updatedAt: FieldValue.serverTimestamp() as any,
  };

  await db.collection(COL_STUDENTS).doc(studentId).update(updateData);

  // 업데이트된 데이터 반환
  const updatedDoc = await db.collection(COL_STUDENTS).doc(studentId).get();
  return updatedDoc.data() as Student;
}

// 학생 삭제
export async function deleteStudent(studentId: string): Promise<void> {
  const student = await getStudentById(studentId);
  if (!student) {
    const error = new Error("Student not found")
    ;(error as any).status = 404;
    throw error;
  }

  // 부모-학생 관계도 함께 삭제
  const parentStudentQuery = db.collection(COL_PARENT_STUDENT).where("student_id", "==", studentId);
  const parentStudentSnapshot = await parentStudentQuery.get();

  const batch = db.batch();

  // 학생 삭제
  batch.delete(db.collection(COL_STUDENTS).doc(studentId));

  // 부모-학생 관계 삭제
  parentStudentSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}

// 모든 학생 조회
export async function getAllStudents(): Promise<Student[]> {
  const snapshot = await db.collection(COL_STUDENTS).get();
  return snapshot.docs.map((doc) => doc.data() as Student);
}

// 필터로 학생 조회
export async function getStudentsByFilter(filter: StudentFilter): Promise<Student[]> {
  let query: any = db.collection(COL_STUDENTS);

  if (filter.user_id) {
    query = query.where("user_id", "==", filter.user_id);
  }

  if (filter.student_target_univ) {
    query = query.where("student_target_univ", "==", filter.student_target_univ);
  }

  if (filter.student_schoolname) {
    query = query.where("student_schoolname", "==", filter.student_schoolname);
  }

  const snapshot = await query.get();
  let students = snapshot.docs.map((doc: any) => doc.data() as Student);

  // 이름으로 부분 검색 (Firestore에서 직접 지원하지 않으므로 클라이언트에서 필터링)
  if (filter.student_name) {
    students = students.filter((student: Student) =>
      student.student_name.toLowerCase().includes(filter.student_name!.toLowerCase())
    );
  }

  return students;
}

// 부모와 학생 관계 생성
export async function createParentStudentRelation(parentId: string, studentId: string): Promise<ParentStudent> {
  // 학생 존재 여부 확인
  const student = await getStudentById(studentId);
  if (!student) {
    const error = new Error("Student not found")
    ;(error as any).status = 404;
    throw error;
  }

  // 이미 관계가 존재하는지 확인
  const existingRelation = await db.collection(COL_PARENT_STUDENT)
    .where("parent_id", "==", parentId)
    .where("student_id", "==", studentId)
    .limit(1)
    .get();

  if (!existingRelation.empty) {
    const error = new Error("Parent-student relation already exists")
    ;(error as any).status = 409;
    throw error;
  }

  const relationData: ParentStudent = {
    parent_id: parentId,
    student_id: studentId,
    createdAt: FieldValue.serverTimestamp() as any,
  };

  await db.collection(COL_PARENT_STUDENT).add(relationData);
  return relationData;
}

// 학생의 부모 목록 조회
export async function getParentsByStudentId(studentId: string): Promise<string[]> {
  const snapshot = await db.collection(COL_PARENT_STUDENT)
    .where("student_id", "==", studentId)
    .get();

  return snapshot.docs.map((doc) => doc.data().parent_id);
}

// 부모의 학생 목록 조회
export async function getStudentsByParentId(parentId: string): Promise<Student[]> {
  const snapshot = await db.collection(COL_PARENT_STUDENT)
    .where("parent_id", "==", parentId)
    .get();

  const studentIds = snapshot.docs.map((doc) => doc.data().student_id);
  const students: Student[] = [];

  for (const studentId of studentIds) {
    const student = await getStudentById(studentId);
    if (student) {
      students.push(student);
    }
  }

  return students;
}
