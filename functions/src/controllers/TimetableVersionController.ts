import { Request, Response } from 'express'
import { TimetableVersionService } from '../services/TimetableVersionService'
import { StudentService } from '../services/StudentService'
import * as admin from 'firebase-admin'
import type {
  CreateTimetableVersionRequest,
  UpdateTimetableVersionRequest
} from '@shared/types'

export class TimetableVersionController {
  private versionService: TimetableVersionService
  private studentService: StudentService

  constructor() {
    this.versionService = new TimetableVersionService()
    this.studentService = new StudentService()
  }

  // 모든 버전 조회
  async getAllVersions(req: Request, res: Response): Promise<void> {
    try {
      const versions = await this.versionService.getAllVersions()

      res.status(200).json({
        success: true,
        data: versions,
        meta: {
          count: versions.length,
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Error fetching all versions:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // 활성 버전 조회
  async getActiveVersion(req: Request, res: Response): Promise<void> {
    try {
      const activeVersion = await this.versionService.getActiveVersion()

      if (!activeVersion) {
        res.status(404).json({
          success: false,
          error: 'No active version found'
        })
        return
      }

      res.status(200).json({
        success: true,
        data: activeVersion
      })
    } catch (error) {
      console.error('Error fetching active version:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // 버전 조회
  async getVersionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      const version = await this.versionService.getVersionById(id)

      if (!version) {
        res.status(404).json({
          success: false,
          error: 'Version not found'
        })
        return
      }

      res.status(200).json({
        success: true,
        data: version
      })
    } catch (error) {
      console.error('Error fetching version:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // 버전 생성
  async createVersion(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateTimetableVersionRequest = req.body

      const versionId = await this.versionService.createVersion(data)

      // 모든 활성 학생들에게 빈 시간표 생성
      const students = await this.studentService.getAllStudents()
      const activeStudents = students.filter(s => s.status === 'active')

      console.log(`📚 새 버전 "${data.displayName}" 생성됨. ${activeStudents.length}명의 활성 학생에게 빈 시간표 생성 중...`)

      // Firestore Batch로 일괄 생성
      const db = admin.firestore()
      const BATCH_SIZE = 500
      let createdCount = 0

      for (let i = 0; i < activeStudents.length; i += BATCH_SIZE) {
        const batch = db.batch()
        const chunk = activeStudents.slice(i, i + BATCH_SIZE)

        for (const student of chunk) {
          const timetableRef = db.collection('student_timetables').doc()
          batch.set(timetableRef, {
            studentId: student.id,
            versionId: versionId,
            classSectionIds: [],
            notes: '',
            createAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
          createdCount++
        }

        await batch.commit()
        console.log(`✅ 배치 ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length}개 시간표 생성됨`)
      }

      console.log(`✅ 총 ${createdCount}개의 빈 시간표가 생성되었습니다.`)

      res.status(201).json({
        success: true,
        data: {
          id: versionId,
          timetablesCreated: createdCount
        },
        message: `Timetable version created successfully with ${createdCount} empty timetables`
      })
    } catch (error) {
      console.error('Error creating version:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // 버전 활성화
  async activateVersion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      await this.versionService.activateVersion(id)

      res.status(200).json({
        success: true,
        message: 'Timetable version activated successfully'
      })
    } catch (error) {
      console.error('Error activating version:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // 버전 수정
  async updateVersion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const data: UpdateTimetableVersionRequest = req.body

      await this.versionService.updateVersion(id, data)

      res.status(200).json({
        success: true,
        message: 'Timetable version updated successfully'
      })
    } catch (error) {
      console.error('Error updating version:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // 버전 삭제
  async deleteVersion(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params

      // 활성 버전인지 확인
      const version = await this.versionService.getVersionById(id)
      if (version?.isActive) {
        res.status(400).json({
          success: false,
          error: 'Cannot delete active version'
        })
        return
      }

      await this.versionService.deleteVersion(id)

      res.status(200).json({
        success: true,
        message: 'Timetable version deleted successfully'
      })
    } catch (error) {
      console.error('Error deleting version:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // 버전 복사
  async copyVersion(req: Request, res: Response): Promise<void> {
    try {
      const { sourceVersionId } = req.params
      const targetData: CreateTimetableVersionRequest = req.body

      const newVersionId = await this.versionService.copyVersion(sourceVersionId, targetData)

      res.status(201).json({
        success: true,
        data: { id: newVersionId },
        message: 'Timetable version copied successfully'
      })
    } catch (error) {
      console.error('Error copying version:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // 특정 버전의 모든 학생 시간표 일괄 초기화
  async bulkInitializeTimetables(req: Request, res: Response): Promise<void> {
    try {
      const { versionId } = req.params

      // 모든 활성 학생 조회
      const allStudents = await this.studentService.getAllStudents()
      const activeStudentIds = allStudents
        .filter(s => s.status === 'active')
        .map(s => s.id)

      await this.versionService.bulkInitializeTimetables(versionId, activeStudentIds)

      res.status(200).json({
        success: true,
        message: `Initialized timetables for ${activeStudentIds.length} students`,
        meta: {
          totalStudents: activeStudentIds.length
        }
      })
    } catch (error) {
      console.error('Error bulk initializing timetables:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // 마이그레이션 상태 확인 (교사, 수업, 학생 시간표)
  async getMigrationStatus(req: Request, res: Response): Promise<void> {
    try {
      const db = admin.firestore()

      // 직접 Firestore 접근하여 마이그레이션 상태 확인
      const [teachersSnapshot, classSectionsSnapshot, timetablesSnapshot] = await Promise.all([
        db.collection('teachers').get(),
        db.collection('class_sections').get(),
        db.collection('student_timetables').get()
      ])

      const teachers = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const classSections = classSectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      const timetables = timetablesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      const teachersMigrated = teachers.filter((t: any) => !!t.versionId).length
      const classSeectionsMigrated = classSections.filter((c: any) => !!c.versionId).length
      const timetablesMigrated = timetables.filter((t: any) => !!t.versionId).length

      res.status(200).json({
        success: true,
        data: {
          teachers: {
            total: teachers.length,
            migrated: teachersMigrated,
            unmigrated: teachers.length - teachersMigrated
          },
          classSections: {
            total: classSections.length,
            migrated: classSeectionsMigrated,
            unmigrated: classSections.length - classSeectionsMigrated
          },
          timetables: {
            total: timetables.length,
            migrated: timetablesMigrated,
            unmigrated: timetables.length - timetablesMigrated
          }
        }
      })
    } catch (error) {
      console.error('Error getting migration status:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // 데이터 마이그레이션 실행 (학생 시간표만)
  async migrateTimetables(req: Request, res: Response): Promise<void> {
    try {
      const { versionId } = req.params

      // 버전 존재 여부 확인
      const version = await this.versionService.getVersionById(versionId)
      if (!version) {
        res.status(404).json({
          success: false,
          error: 'Timetable version not found'
        })
        return
      }

      // versionId가 없는 시간표 조회 (직접 Firestore 접근)
      const db = admin.firestore()
      const timetablesSnapshot = await db.collection('student_timetables').get()
      const timetablesToMigrate = timetablesSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((t: any) => !t.versionId)

      const BATCH_SIZE = 500
      let migratedCount = 0

      for (let i = 0; i < timetablesToMigrate.length; i += BATCH_SIZE) {
        const batch = db.batch()
        const chunk = timetablesToMigrate.slice(i, i + BATCH_SIZE)

        for (const timetable of chunk) {
          const docRef = db.collection('student_timetables').doc(timetable.id)
          batch.update(docRef, {
            versionId: versionId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
          migratedCount++
        }

        await batch.commit()
        console.log(`Migrated batch ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length} timetables`)
      }

      res.status(200).json({
        success: true,
        message: `Successfully migrated ${migratedCount} timetables to version "${version.name}"`,
        data: {
          migratedCount,
          versionId,
          versionName: version.name
        }
      })
    } catch (error) {
      console.error('Error migrating timetables:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // 전체 데이터 마이그레이션 실행 (교사, 수업, 학생 시간표)
  async migrateAll(req: Request, res: Response): Promise<void> {
    try {
      const { versionId } = req.params

      // 버전 존재 여부 확인
      const version = await this.versionService.getVersionById(versionId)
      if (!version) {
        res.status(404).json({
          success: false,
          error: 'Timetable version not found'
        })
        return
      }

      const db = admin.firestore()
      const BATCH_SIZE = 500

      // 1. 교사 마이그레이션 (전체 데이터)
      const teachersSnapshot = await db.collection('teachers').get()
      const teachersToMigrate = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      let teachersMigrated = 0
      for (let i = 0; i < teachersToMigrate.length; i += BATCH_SIZE) {
        const batch = db.batch()
        const chunk = teachersToMigrate.slice(i, i + BATCH_SIZE)
        for (const teacher of chunk) {
          const docRef = db.collection('teachers').doc(teacher.id)
          batch.update(docRef, {
            versionId: versionId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
          teachersMigrated++
        }
        await batch.commit()
        console.log(`✅ Teachers migrated: ${chunk.length}`)
      }

      // 2. 수업 마이그레이션 (전체 데이터)
      const classSectionsSnapshot = await db.collection('class_sections').get()
      const classSectionsToMigrate = classSectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      let classSectionsMigrated = 0
      for (let i = 0; i < classSectionsToMigrate.length; i += BATCH_SIZE) {
        const batch = db.batch()
        const chunk = classSectionsToMigrate.slice(i, i + BATCH_SIZE)
        for (const classSection of chunk) {
          const docRef = db.collection('class_sections').doc(classSection.id)
          batch.update(docRef, {
            versionId: versionId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
          classSectionsMigrated++
        }
        await batch.commit()
        console.log(`✅ Class sections migrated: ${chunk.length}`)
      }

      // 3. 학생 시간표 마이그레이션 (전체 데이터)
      const timetablesSnapshot = await db.collection('student_timetables').get()
      const timetablesToMigrate = timetablesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      let timetablesMigrated = 0
      for (let i = 0; i < timetablesToMigrate.length; i += BATCH_SIZE) {
        const batch = db.batch()
        const chunk = timetablesToMigrate.slice(i, i + BATCH_SIZE)
        for (const timetable of chunk) {
          const docRef = db.collection('student_timetables').doc(timetable.id)
          batch.update(docRef, {
            versionId: versionId,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          })
          timetablesMigrated++
        }
        await batch.commit()
        console.log(`✅ Timetables migrated: ${chunk.length}`)
      }

      res.status(200).json({
        success: true,
        message: `Successfully migrated all data to version "${version.name}"`,
        data: {
          versionId,
          versionName: version.name,
          migrated: {
            teachers: teachersMigrated,
            classSections: classSectionsMigrated,
            timetables: timetablesMigrated
          }
        }
      })
    } catch (error) {
      console.error('Error migrating all data:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
}
