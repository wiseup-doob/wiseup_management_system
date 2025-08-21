import * as admin from 'firebase-admin'
import { studentsTestData } from '../test-data/students-data'
import { teachersTestData } from '../test-data/teachers-data'

export class TestDataService {
  private db = admin.firestore()

  // ===== 전체 테스트 데이터 초기화 =====
  public async initializeAllTestData(): Promise<{
    students: { created: number; errors: string[] }
    teachers: { created: number; errors: string[] }
  }> {
    const [studentsResult, teachersResult] = await Promise.all([
      this.initializeStudentsData(),
      this.initializeTeachersData()
    ])

    return {
      students: studentsResult,
      teachers: teachersResult
    }
  }

  // ===== 학생 테스트 데이터 초기화 =====
  public async initializeStudentsData(): Promise<{ created: number; errors: string[] }> {
    const errors: string[] = []
    let created = 0

    try {
      // 기존 학생 데이터 삭제
      await this.clearStudentsData()

      // 새 학생 데이터 생성
      for (const studentData of studentsTestData) {
        try {
          const docRef = await this.db.collection('students').add({
            ...studentData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
          created++
          console.log(`학생 생성 성공: ${studentData.name} (ID: ${docRef.id})`)
        } catch (error) {
          const errorMsg = `학생 ${studentData.name} 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
          errors.push(errorMsg)
          console.error(errorMsg)
        }
      }

      return { created, errors }
    } catch (error) {
      const errorMsg = `학생 테스트 데이터 초기화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      errors.push(errorMsg)
      console.error(errorMsg)
      return { created, errors }
    }
  }

  // ===== 교사 테스트 데이터 초기화 =====
  public async initializeTeachersData(): Promise<{ created: number; errors: string[] }> {
    const errors: string[] = []
    let created = 0

    try {
      // 기존 교사 데이터 삭제
      await this.clearTeachersData()

      // 새 교사 데이터 생성
      for (const teacherData of teachersTestData) {
        try {
          const docRef = await this.db.collection('teachers').add({
            ...teacherData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
          created++
          console.log(`교사 생성 성공: ${teacherData.name} (ID: ${docRef.id})`)
        } catch (error) {
          const errorMsg = `교사 ${teacherData.name} 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
          errors.push(errorMsg)
          console.error(errorMsg)
        }
      }

      return { created, errors }
    } catch (error) {
      const errorMsg = `교사 테스트 데이터 초기화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      errors.push(errorMsg)
      console.error(errorMsg)
      return { created, errors }
    }
  }

  // ===== 학생 테스트 데이터 삭제 =====
  public async clearStudentsData(): Promise<{ deleted: number; errors: string[] }> {
    const errors: string[] = []
    let deleted = 0

    try {
      const snapshot = await this.db.collection('students').get()
      
      if (snapshot.empty) {
        return { deleted: 0, errors: [] }
      }

      const batch = this.db.batch()
      snapshot.docs.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
        batch.delete(doc.ref)
      })

      await batch.commit()
      deleted = snapshot.docs.length
      console.log(`학생 테스트 데이터 ${deleted}개 삭제 완료`)

      return { deleted, errors }
    } catch (error) {
      const errorMsg = `학생 테스트 데이터 삭제 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      errors.push(errorMsg)
      console.error(errorMsg)
      return { deleted, errors }
    }
  }

  // ===== 교사 테스트 데이터 삭제 =====
  public async clearTeachersData(): Promise<{ deleted: number; errors: string[] }> {
    const errors: string[] = []
    let deleted = 0

    try {
      const snapshot = await this.db.collection('teachers').get()
      
      if (snapshot.empty) {
        return { deleted: 0, errors: [] }
      }

      const batch = this.db.batch()
      snapshot.docs.forEach((doc: admin.firestore.QueryDocumentSnapshot) => {
        batch.delete(doc.ref)
      })

      await batch.commit()
      deleted = snapshot.docs.length
      console.log(`교사 테스트 데이터 ${deleted}개 삭제 완료`)

      return { deleted, errors }
    } catch (error) {
      const errorMsg = `교사 테스트 데이터 삭제 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      errors.push(errorMsg)
      console.error(errorMsg)
      return { deleted, errors }
    }
  }

  // ===== 전체 테스트 데이터 삭제 =====
  public async clearAllTestData(): Promise<{
    students: { deleted: number; errors: string[] }
    teachers: { deleted: number; errors: string[] }
  }> {
    const [studentsResult, teachersResult] = await Promise.all([
      this.clearStudentsData(),
      this.clearTeachersData()
    ])

    return {
      students: studentsResult,
      teachers: teachersResult
    }
  }

  // ===== 테스트 데이터 상태 확인 =====
  public async getTestDataStatus(): Promise<{
    students: { count: number; hasData: boolean }
    teachers: { count: number; hasData: boolean }
  }> {
    try {
      const [studentsSnapshot, teachersSnapshot] = await Promise.all([
        this.db.collection('students').get(),
        this.db.collection('teachers').get()
      ])

      return {
        students: {
          count: studentsSnapshot.size,
          hasData: !studentsSnapshot.empty
        },
        teachers: {
          count: teachersSnapshot.size,
          hasData: !teachersSnapshot.empty
        }
      }
    } catch (error) {
      console.error('테스트 데이터 상태 조회 실패:', error)
      throw error
    }
  }
}
