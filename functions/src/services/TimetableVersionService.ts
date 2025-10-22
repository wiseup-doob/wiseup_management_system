import * as admin from 'firebase-admin'
import { BaseService } from './BaseService'
import type {
  TimetableVersion,
  CreateTimetableVersionRequest,
  UpdateTimetableVersionRequest,
  TimetableVersionSearchParams
} from '@shared/types'

export class TimetableVersionService extends BaseService {
  constructor() {
    super('timetable_versions')
  }

  // 버전 생성
  async createVersion(data: CreateTimetableVersionRequest): Promise<string> {
    const versionData: Omit<TimetableVersion, 'id'> = {
      ...data,
      isActive: false,
      order: data.order || 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp,
      updatedAt: admin.firestore.FieldValue.serverTimestamp() as admin.firestore.Timestamp
    }

    return this.create(versionData)
  }

  // 버전 조회
  async getVersionById(id: string): Promise<TimetableVersion | null> {
    return this.getById<TimetableVersion>(id)
  }

  // 모든 버전 조회 (순서대로)
  async getAllVersions(): Promise<TimetableVersion[]> {
    const query = this.db.collection(this.collectionName).orderBy('order', 'asc')
    return this.search<TimetableVersion>(query)
  }

  // 활성 버전 조회
  async getActiveVersion(): Promise<TimetableVersion | null> {
    const query = this.db.collection(this.collectionName).where('isActive', '==', true).limit(1)
    const versions = await this.search<TimetableVersion>(query)
    return versions.length > 0 ? versions[0] : null
  }

  // 버전 활성화 (기존 활성 버전 비활성화)
  async activateVersion(versionId: string): Promise<void> {
    return this.runTransaction(async (transaction) => {
      // 1. 모든 버전 조회 (트랜잭션 전에 완료해야 함)
      const allVersionsSnapshot = await this.db.collection(this.collectionName).get()

      // 2. 모든 버전을 비활성화
      allVersionsSnapshot.docs.forEach(doc => {
        const versionRef = this.db.collection(this.collectionName).doc(doc.id)
        transaction.update(versionRef, {
          isActive: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
      })

      // 3. 선택한 버전만 활성화
      const targetRef = this.db.collection(this.collectionName).doc(versionId)
      transaction.update(targetRef, {
        isActive: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })
    })
  }

  // 버전 수정
  async updateVersion(id: string, data: UpdateTimetableVersionRequest): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
    await this.update(id, updateData)
  }

  // 버전 삭제
  async deleteVersion(id: string): Promise<void> {
    await this.delete(id)
  }

  // 버전 복사 (다음 학기 시간표 생성 시 사용)
  async copyVersion(
    sourceVersionId: string,
    targetData: CreateTimetableVersionRequest
  ): Promise<string> {
    // 1. 새 버전 생성
    const newVersionId = await this.createVersion(targetData)

    // 2. 교사 복사 (teacherId 매핑 생성)
    const teacherIdMap = await this.copyTeachers(sourceVersionId, newVersionId)

    // 3. 수업 복사 (classId 매핑 생성, teacherId 변환 적용)
    const classIdMap = await this.copyClassSections(sourceVersionId, newVersionId, teacherIdMap)

    // 4. 학생 시간표 복사 (classSectionIds 변환 적용)
    await this.copyStudentTimetables(sourceVersionId, newVersionId, classIdMap)

    return newVersionId
  }

  // 교사 복사 (내부 헬퍼 메서드)
  private async copyTeachers(
    sourceVersionId: string,
    targetVersionId: string
  ): Promise<Map<string, string>> {
    const teacherIdMap = new Map<string, string>()

    const sourceTeachersSnapshot = await this.db
      .collection('teachers')
      .where('versionId', '==', sourceVersionId)
      .get()

    const batchSize = 500
    const batches: admin.firestore.WriteBatch[] = []
    let currentBatch = this.db.batch()
    let operationCount = 0

    sourceTeachersSnapshot.docs.forEach((doc) => {
      const sourceTeacher = doc.data()
      const newTeacherRef = this.db.collection('teachers').doc()

      currentBatch.set(newTeacherRef, {
        ...sourceTeacher,
        versionId: targetVersionId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })

      teacherIdMap.set(doc.id, newTeacherRef.id)
      operationCount++

      if (operationCount >= batchSize) {
        batches.push(currentBatch)
        currentBatch = this.db.batch()
        operationCount = 0
      }
    })

    if (operationCount > 0) {
      batches.push(currentBatch)
    }

    await Promise.all(batches.map(batch => batch.commit()))
    return teacherIdMap
  }

  // 수업 복사 (내부 헬퍼 메서드)
  private async copyClassSections(
    sourceVersionId: string,
    targetVersionId: string,
    teacherIdMap: Map<string, string>
  ): Promise<Map<string, string>> {
    const classIdMap = new Map<string, string>()

    const sourceClassesSnapshot = await this.db
      .collection('class_sections')
      .where('versionId', '==', sourceVersionId)
      .get()

    const batchSize = 500
    const batches: admin.firestore.WriteBatch[] = []
    let currentBatch = this.db.batch()
    let operationCount = 0

    sourceClassesSnapshot.docs.forEach((doc) => {
      const sourceClass = doc.data()
      const newClassRef = this.db.collection('class_sections').doc()

      // teacherId 변환
      const newTeacherId = teacherIdMap.get(sourceClass.teacherId) || sourceClass.teacherId

      currentBatch.set(newClassRef, {
        ...sourceClass,
        versionId: targetVersionId,
        teacherId: newTeacherId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })

      classIdMap.set(doc.id, newClassRef.id)
      operationCount++

      if (operationCount >= batchSize) {
        batches.push(currentBatch)
        currentBatch = this.db.batch()
        operationCount = 0
      }
    })

    if (operationCount > 0) {
      batches.push(currentBatch)
    }

    await Promise.all(batches.map(batch => batch.commit()))
    return classIdMap
  }

  // 학생 시간표 복사 (내부 헬퍼 메서드)
  private async copyStudentTimetables(
    sourceVersionId: string,
    targetVersionId: string,
    classIdMap: Map<string, string>
  ): Promise<void> {
    const sourceTimetablesSnapshot = await this.db
      .collection('student_timetables')
      .where('versionId', '==', sourceVersionId)
      .get()

    const batchSize = 500
    const batches: admin.firestore.WriteBatch[] = []
    let currentBatch = this.db.batch()
    let operationCount = 0

    sourceTimetablesSnapshot.docs.forEach((doc) => {
      const sourceTimetable = doc.data()
      const newTimetableRef = this.db.collection('student_timetables').doc()

      // classSectionIds 변환
      const newClassSectionIds = (sourceTimetable.classSectionIds || []).map(
        (oldId: string) => classIdMap.get(oldId) || oldId
      )

      currentBatch.set(newTimetableRef, {
        studentId: sourceTimetable.studentId,
        versionId: targetVersionId,
        classSectionIds: newClassSectionIds,
        notes: sourceTimetable.notes || '',
        createAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })

      operationCount++

      if (operationCount >= batchSize) {
        batches.push(currentBatch)
        currentBatch = this.db.batch()
        operationCount = 0
      }
    })

    if (operationCount > 0) {
      batches.push(currentBatch)
    }

    await Promise.all(batches.map(batch => batch.commit()))
  }

  // 특정 버전의 모든 학생 시간표 일괄 초기화
  async bulkInitializeTimetables(versionId: string, studentIds: string[]): Promise<void> {
    // 1. 이미 존재하는 시간표 조회
    const existingTimetablesSnapshot = await this.db
      .collection('student_timetables')
      .where('versionId', '==', versionId)
      .get()

    const existingStudentIds = new Set(
      existingTimetablesSnapshot.docs.map(doc => doc.data().studentId)
    )

    // 2. 생성이 필요한 학생 ID 필터링
    const studentIdsToCreate = studentIds.filter(
      studentId => !existingStudentIds.has(studentId)
    )

    // 3. Firestore Batch를 사용하여 일괄 생성
    const batchSize = 500
    const batches: admin.firestore.WriteBatch[] = []
    let currentBatch = this.db.batch()
    let operationCount = 0

    studentIdsToCreate.forEach(studentId => {
      const newTimetableRef = this.db.collection('student_timetables').doc()

      currentBatch.set(newTimetableRef, {
        studentId,
        versionId,
        classSectionIds: [],
        notes: '',
        createAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })

      operationCount++

      if (operationCount >= batchSize) {
        batches.push(currentBatch)
        currentBatch = this.db.batch()
        operationCount = 0
      }
    })

    if (operationCount > 0) {
      batches.push(currentBatch)
    }

    await Promise.all(batches.map(batch => batch.commit()))
  }

  // 버전 검색
  async searchVersions(params: TimetableVersionSearchParams): Promise<TimetableVersion[]> {
    let query: admin.firestore.Query = this.db.collection(this.collectionName)

    if (params.isActive !== undefined) {
      query = query.where('isActive', '==', params.isActive)
    }

    return this.search<TimetableVersion>(query)
  }
}
