import { db } from '../../config/firebase'
import { StudentTimetable, TimetableFilter, TimetableEntry } from './timetable.types'
import * as admin from 'firebase-admin'

const COL = process.env.COL_TIMETABLE ?? 'timetables'

export async function createOrReplace(
  studentId: string,
  data: Omit<StudentTimetable, 'updatedAt' | 'createdAt'>
) {
  const docRef = db.collection(COL).doc(studentId)
  const existingDoc = await docRef.get()
  
  if (existingDoc.exists) {
    // 기존 문서가 있으면 업데이트 (createdAt 보존)
    const existingData = existingDoc.data() as StudentTimetable
    await docRef.set({ 
      ...data, 
      createdAt: existingData.createdAt, // 기존 createdAt 보존
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })
  } else {
    // 새 문서면 생성 (createdAt 새로 설정)
    await docRef.set({ 
      ...data, 
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })
  }
}

export async function get(studentId: string): Promise<StudentTimetable | null> {
  const doc = await db.collection(COL).doc(studentId).get()
  return doc.exists ? (doc.data() as StudentTimetable) : null
}

export async function update(
  studentId: string,
  data: Partial<StudentTimetable>
) {
  await db.collection(COL)
          .doc(studentId)
          .update({ ...data, updatedAt: admin.firestore.FieldValue.serverTimestamp() })
}

export async function remove(studentId: string) {
  await db.collection(COL).doc(studentId).delete()
}

export async function list(): Promise<StudentTimetable[]> {
  const snap = await db.collection(COL).get()
  return snap.docs.map(d => d.data() as StudentTimetable)
}

export async function getByFilter(filter: TimetableFilter): Promise<TimetableEntry[]> {
  const timetable = await get(filter.studentId)
  if (!timetable) return []

  let filteredEntries = timetable.entries

  // 활성 상태 필터
  if (filter.isActive !== undefined) {
    filteredEntries = filteredEntries.filter(entry => 
      (entry.isActive ?? true) === filter.isActive
    )
  }

  // 학기 필터
  if (filter.semester && timetable.semester) {
    if (timetable.semester !== filter.semester) {
      return []
    }
  }

  // 요일 필터
  if (filter.weekday) {
    filteredEntries = filteredEntries.filter(entry => 
      entry.weekday === filter.weekday
    )
  }

  // 특정 날짜 필터
  if (filter.date) {
    filteredEntries = filteredEntries.filter(entry => {
      if (entry.type === 'specific') {
        return entry.date === filter.date
      } else if (entry.type === 'weekly') {
        // 해당 날짜의 요일이 맞는지 확인
        const targetDate = new Date(filter.date!)
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const dayOfWeek = weekdays[targetDate.getDay()]
        
        if (entry.weekday !== dayOfWeek) return false
        
        // 유효 기간 체크
        if (entry.effectiveFrom && filter.date! < entry.effectiveFrom) return false
        if (entry.effectiveTo && filter.date! > entry.effectiveTo) return false
        
        return true
      }
      return false
    })
  }

  // 기간 필터
  if (filter.dateRange) {
    filteredEntries = filteredEntries.filter(entry => {
      if (entry.type === 'specific') {
        return entry.date && 
               entry.date >= filter.dateRange!.from && 
               entry.date <= filter.dateRange!.to
      } else if (entry.type === 'weekly') {
        // 주간 반복 일정이 해당 기간과 겹치는지 확인
        const startDate = entry.effectiveFrom || '1900-01-01'
        const endDate = entry.effectiveTo || '2100-12-31'
        
        return !(endDate < filter.dateRange!.from || startDate > filter.dateRange!.to)
      }
      return false
    })
  }

  return filteredEntries
}