import { FieldValue } from 'firebase-admin/firestore'
import { db } from '../../config/firebase'
import { Student, StudentFilter } from './student.types'

export async function createStudent(id: string, data: Student) {
  const studentData = {
    ...data,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }
  await db.collection('students').doc(id).set(studentData)
}

export async function getStudent(id: string): Promise<Student | null> {
  const doc = await db.collection('students').doc(id).get()
  return doc.exists ? (doc.data() as Student) : null
}

export async function getStudentByUserId(user_id: string): Promise<Student | null> {
  const snap = await db.collection('students')
    .where('user_id', '==', user_id)
    .limit(1)
    .get()
  
  if (snap.empty) {
    return null
  }
  
  return snap.docs[0].data() as Student
}

export async function getAllStudents(): Promise<Student[]> {
  const snap = await db.collection('students').get()
  return snap.docs.map((d) => d.data() as Student)
}

export async function getStudentsByFilter(filter: StudentFilter): Promise<Student[]> {
  let query: FirebaseFirestore.Query = db.collection('students')
  
  // 필터 조건 적용
  if (filter.user_id) {
    query = query.where('user_id', '==', filter.user_id)
  }
  if (filter.name) {
    query = query.where('name', '>=', filter.name)
      .where('name', '<=', filter.name + '\uf8ff')
  }
  if (filter.school) {
    query = query.where('school', '>=', filter.school)
      .where('school', '<=', filter.school + '\uf8ff')
  }
  if (filter.grade !== undefined) {
    query = query.where('grade', '==', filter.grade)
  }
  
  const snap = await query.get()
  return snap.docs.map(doc => doc.data() as Student)
}

export async function updateStudent(
  id: string,
  data: Partial<Student>
): Promise<void> {
  const updateData = {
    ...data,
    updatedAt: FieldValue.serverTimestamp()
  }
  await db.collection('students').doc(id).update(updateData)
}

export async function deleteStudent(id: string) {
  await db.collection('students').doc(id).delete()
}