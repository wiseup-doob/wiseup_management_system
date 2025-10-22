# 시간표 버전 관리 시스템 구현 계획

## 📋 목차
1. [현황 분석](#현황-분석)
2. [제안하는 솔루션](#제안하는-솔루션)
3. [데이터베이스 설계](#데이터베이스-설계)
4. [백엔드 구현](#백엔드-구현)
5. [프론트엔드 구현](#프론트엔드-구현)
6. [데이터 마이그레이션](#데이터-마이그레이션)
7. [개발 일정](#개발-일정)
8. [⚠️ 프로젝트 적합성 검증 및 수정사항](#프로젝트-적합성-검증-및-수정사항)

---

## 현황 분석

### 현재 시스템의 제약사항

#### 1. 데이터베이스 구조
```typescript
// student_timetables 컬렉션 (현재)
interface StudentTimetable {
  id: string              // 자동 생성 ID
  studentId: string       // 학생 ID
  classSectionIds: []     // 수업 ID 배열
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**문제점:**
- ❌ 학생당 **단일 시간표 문서**만 존재
- ❌ 학기/기간 구분 불가능
- ❌ 버전 관리 필드 없음
- ❌ 이력 추적 불가능

#### 2. 백엔드 API
```typescript
// StudentTimetableService (현재)
class StudentTimetableService {
  getStudentTimetableByStudentId(studentId)     // 단일 시간표만 조회
  createStudentTimetable(data)                   // 중복 생성 불가
  updateStudentTimetable(id, data)               // 기존 시간표 덮어쓰기
}
```

**문제점:**
- ❌ 모든 메서드가 단일 시간표 전제
- ❌ 버전 파라미터를 받는 API 없음
- ❌ 일괄 관리 기능 없음

#### 3. 프론트엔드 UI
```typescript
// SchedulePage (현재)
const [timetableData, setTimetableData] = useState<any>(null) // 단일 시간표만
```

**문제점:**
- ❌ 버전 선택 UI 없음
- ❌ 버전 생성/관리 인터페이스 없음
- ❌ 단일 시간표 표시만 가능

### 요구사항

✅ **전체 학생 일괄 관리**
- 학기별, 기간별(여름방학, 겨울방학 등) 시간표 관리
- 모든 학생이 동일한 버전 체계 사용
- 관리자가 버전을 전환하면 전체 학생에게 자동 적용

✅ **운영 효율성**
- 새 학기 시작 시 이전 학기 시간표 복사
- 버전 단위로 일괄 수정/삭제
- 과거 이력 조회 가능

---

## 제안하는 솔루션

### 핵심 개념: **시간표 버전 시스템**

```
┌─────────────────────────────────────────────────────────┐
│          timetable_versions (전역 버전 관리)              │
├─────────────────────────────────────────────────────────┤
│ • 2024년 1학기                                           │
│ • 2024년 여름방학                                        │
│ • 2024년 2학기           ◄── 관리자가 일괄 관리          │
│ • 2025년 겨울방학                                        │
└─────────────────────────────────────────────────────────┘
                          │
                          │ versionId로 연결
                          ▼
┌─────────────────────────────────────────────────────────┐
│       student_timetables (학생별 버전별 시간표)           │
├─────────────────────────────────────────────────────────┤
│ 학생A - 2024년 1학기 - [수업1, 수업2, 수업3]             │
│ 학생A - 2024년 여름방학 - [수업4, 수업5]                 │
│ 학생B - 2024년 1학기 - [수업1, 수업6, 수업7]             │
│ 학생B - 2024년 여름방학 - [수업8]                        │
└─────────────────────────────────────────────────────────┘
```

### 작동 방식

1. **버전 생성**: 관리자가 "2024년 1학기" 버전 생성
2. **시간표 할당**: 각 학생에게 해당 버전의 시간표 생성
3. **일괄 전환**: "2024년 여름방학" 활성화 → 모든 학생이 여름방학 시간표 표시
4. **개별 편집**: 특정 학생의 특정 버전 시간표만 수정 가능

---

## 데이터베이스 설계

### 1. 새 컬렉션: `timetable_versions`

```typescript
interface TimetableVersion extends BaseEntity {
  id: string                    // 버전 고유 ID (예: "2024-spring")
  name: string                  // 버전 이름 (예: "2024년 1학기")
  displayName: string           // 화면 표시명 (예: "2024-1학기")
  startDate: FirestoreTimestamp // 시작일
  endDate: FirestoreTimestamp   // 종료일
  isActive: boolean             // 현재 활성 버전 (전체 중 1개만 true)
  description?: string          // 설명
  order: number                 // 정렬 순서
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}
```

**예시 데이터:**
```javascript
{
  id: "2024-spring",
  name: "2024년 1학기",
  displayName: "2024-1학기",
  startDate: Timestamp("2024-03-01"),
  endDate: Timestamp("2024-06-30"),
  isActive: true,
  description: "2024학년도 1학기 정규 시간표",
  order: 1
}
```

### 2. 수정된 컬렉션: `student_timetables`

```typescript
interface StudentTimetable extends BaseEntity {
  id: string                    // 자동 생성 ID
  studentId: string             // 학생 ID
  versionId: string             // ✨ 새로 추가: 버전 ID (timetable_versions 참조)
  classSectionIds: string[]     // 수업 ID 배열
  notes?: string                // 메모 (특이사항)
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}
```

**복합 인덱스 추가:**
```javascript
// Firestore 인덱스 설정 필요
student_timetables: {
  studentId: "Ascending",
  versionId: "Ascending"
}
```

**쿼리 예시:**
```javascript
// 특정 학생의 특정 버전 시간표 조회
db.collection('student_timetables')
  .where('studentId', '==', 'student123')
  .where('versionId', '==', '2024-spring')
  .limit(1)
```

### 3. 기존 컬렉션 유지

- `class_sections`: 변경 없음
- `students`: 변경 없음
- `teachers`: 변경 없음
- `classrooms`: 변경 없음

---

## 백엔드 구현

### 1. 타입 정의 (`shared/types/`)

#### `timetable-version.types.ts` (신규)
```typescript
import type { BaseEntity, FirestoreTimestamp } from './common.types'

// ===== 시간표 버전 관련 타입 =====

export interface TimetableVersion extends BaseEntity {
  id: string
  name: string
  displayName: string
  startDate: FirestoreTimestamp
  endDate: FirestoreTimestamp
  isActive: boolean
  description?: string
  order: number
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export interface CreateTimetableVersionRequest {
  name: string
  displayName: string
  startDate: FirestoreTimestamp
  endDate: FirestoreTimestamp
  description?: string
  order?: number
}

export interface UpdateTimetableVersionRequest {
  name?: string
  displayName?: string
  startDate?: FirestoreTimestamp
  endDate?: FirestoreTimestamp
  isActive?: boolean
  description?: string
  order?: number
}

export interface TimetableVersionSearchParams {
  isActive?: boolean
}

export interface CopyTimetableVersionRequest {
  sourceVersionId: string
  targetVersionId: string
  targetVersionName: string
  targetStartDate: FirestoreTimestamp
  targetEndDate: FirestoreTimestamp
}
```

#### `student-timetable.types.ts` (수정)
```typescript
// 기존 코드에 추가
export interface StudentTimetable extends BaseEntity {
  id: string
  studentId: string
  versionId: string              // ✨ 새로 추가
  classSectionIds: string[]
  notes?: string                 // ✨ 새로 추가
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export interface CreateStudentTimetableRequest {
  studentId: string
  versionId: string              // ✨ 새로 추가
  classSectionIds?: string[]
  notes?: string
}

export interface UpdateStudentTimetableRequest {
  versionId?: string             // ✨ 새로 추가
  classSectionIds?: string[]
  notes?: string
}

export interface StudentTimetableSearchParams {
  studentId?: string
  versionId?: string             // ✨ 새로 추가
}
```

### 2. Service Layer

#### `TimetableVersionService.ts` (신규)
```typescript
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
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
      // 1. 모든 버전을 비활성화
      const allVersions = await this.getAllVersions()
      allVersions.forEach(version => {
        const versionRef = this.db.collection(this.collectionName).doc(version.id)
        transaction.update(versionRef, {
          isActive: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
      })

      // 2. 선택한 버전만 활성화
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

    // 2. 원본 버전의 모든 학생 시간표 조회
    const studentTimetableService = new (await import('./StudentTimetableService')).StudentTimetableService()
    const sourceTimetables = await studentTimetableService.searchStudentTimetables({ versionId: sourceVersionId })

    // 3. 각 학생에 대해 새 버전 시간표 생성
    for (const sourceTimetable of sourceTimetables) {
      await studentTimetableService.createStudentTimetable({
        studentId: sourceTimetable.studentId,
        versionId: newVersionId,
        classSectionIds: sourceTimetable.classSectionIds,
        notes: sourceTimetable.notes
      })
    }

    return newVersionId
  }

  // 특정 버전의 모든 학생 시간표 일괄 초기화
  async bulkInitializeTimetables(versionId: string, studentIds: string[]): Promise<void> {
    const studentTimetableService = new (await import('./StudentTimetableService')).StudentTimetableService()

    for (const studentId of studentIds) {
      // 이미 존재하는지 확인
      const existing = await studentTimetableService.getStudentTimetableByStudentIdAndVersion(studentId, versionId)

      if (!existing) {
        await studentTimetableService.createStudentTimetable({
          studentId,
          versionId,
          classSectionIds: []
        })
      }
    }
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
```

#### `StudentTimetableService.ts` (수정)
```typescript
// 기존 코드에서 수정 필요한 부분

export class StudentTimetableService extends BaseService {
  constructor() {
    super('student_timetables')
  }

  // 학생 시간표 생성 (versionId 추가)
  async createStudentTimetable(data: CreateStudentTimetableRequest): Promise<string> {
    // versionId 필수 검증 추가
    if (!data.versionId) {
      throw new Error('versionId is required')
    }

    const timetableData: Omit<StudentTimetable, 'id'> = {
      ...data,
      classSectionIds: data.classSectionIds || [],
      notes: data.notes || '',
      createAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }

    return this.create(timetableData)
  }

  // ✨ 새로 추가: 학생 ID와 버전 ID로 시간표 조회
  async getStudentTimetableByStudentIdAndVersion(
    studentId: string,
    versionId: string
  ): Promise<StudentTimetable | null> {
    const query = this.db.collection(this.collectionName)
      .where('studentId', '==', studentId)
      .where('versionId', '==', versionId)
      .limit(1)

    const timetables = await this.search<StudentTimetable>(query)
    return timetables.length > 0 ? timetables[0] : null
  }

  // ✨ 기존 메서드 수정: 활성 버전의 시간표 조회
  async getStudentTimetableByStudentId(studentId: string): Promise<StudentTimetable | null> {
    // 활성 버전 조회
    const versionService = new TimetableVersionService()
    const activeVersion = await versionService.getActiveVersion()

    if (!activeVersion) {
      throw new Error('No active timetable version found')
    }

    return this.getStudentTimetableByStudentIdAndVersion(studentId, activeVersion.id)
  }

  // 학생 시간표 검색 (versionId 파라미터 추가)
  async searchStudentTimetables(params: StudentTimetableSearchParams): Promise<StudentTimetable[]> {
    let query: admin.firestore.Query = this.db.collection(this.collectionName)

    if (params.studentId) {
      query = query.where('studentId', '==', params.studentId)
    }

    if (params.versionId) {
      query = query.where('versionId', '==', params.versionId)
    }

    return this.search<StudentTimetable>(query)
  }

  // 나머지 메서드는 기존과 동일...
}
```

### 3. Controller Layer

#### `TimetableVersionController.ts` (신규)
```typescript
import { Request, Response } from 'express'
import { TimetableVersionService } from '../services/TimetableVersionService'
import { StudentService } from '../services/StudentService'
import type {
  CreateTimetableVersionRequest,
  UpdateTimetableVersionRequest,
  TimetableVersionSearchParams,
  CopyTimetableVersionRequest
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

  // 버전 생성
  async createVersion(req: Request, res: Response): Promise<void> {
    try {
      const data: CreateTimetableVersionRequest = req.body

      const versionId = await this.versionService.createVersion(data)

      res.status(201).json({
        success: true,
        data: { id: versionId },
        message: 'Timetable version created successfully'
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
}
```

#### `StudentTimetableController.ts` (수정)
```typescript
// 기존 코드에서 수정 필요한 부분

export class StudentTimetableController {
  // ... 기존 생성자 코드 ...

  // ✨ 새로 추가: 학생별 버전별 시간표 조회
  async getStudentTimetableByStudentIdAndVersion(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, versionId } = req.params

      const timetable = await this.studentTimetableService.getStudentTimetableByStudentIdAndVersion(
        studentId,
        versionId
      )

      if (!timetable) {
        // 시간표가 없는 경우 빈 시간표로 응답
        const student = await this.studentService.getStudentById(studentId)
        if (!student) {
          res.status(404).json({ success: false, error: 'Student not found' })
          return
        }

        const emptyTimetableData: CompleteTimetableData = {
          studentId: student.id,
          studentName: student.name,
          grade: student.grade || '',
          status: student.status || 'active',
          classSections: []
        }

        res.status(200).json({
          success: true,
          message: 'Student timetable retrieved successfully (empty)',
          data: emptyTimetableData
        })
        return
      }

      const completeTimetableData = await this.buildCompleteTimetableData(studentId, timetable)

      res.status(200).json({
        success: true,
        message: 'Student timetable retrieved successfully',
        data: completeTimetableData
      })
    } catch (error) {
      console.error('Error fetching student timetable by version:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // ✨ 기존 메서드 수정: 활성 버전 기준으로 조회
  async getStudentTimetableByStudentId(req: Request, res: Response): Promise<void> {
    // 기존 로직은 동일하되, 내부에서 활성 버전의 시간표를 조회
    // StudentTimetableService.getStudentTimetableByStudentId()가 자동으로 활성 버전 사용
    // ... 기존 코드 유지 ...
  }

  // ✨ 새로 추가: 학생 ID와 버전 ID 기반으로 수업 추가
  async addClassToStudentTimetableByVersion(req: Request, res: Response): Promise<void> {
    try {
      const { studentId, versionId } = req.params
      const { classSectionId } = req.body

      if (!classSectionId) {
        res.status(400).json({
          success: false,
          error: 'Class section ID is required'
        })
        return
      }

      // 학생 존재 여부 확인
      const student = await this.studentService.getStudentById(studentId)
      if (!student) {
        res.status(404).json({ success: false, error: 'Student not found' })
        return
      }

      // 학생 시간표 조회 (없으면 생성)
      let timetable = await this.studentTimetableService.getStudentTimetableByStudentIdAndVersion(
        studentId,
        versionId
      )

      if (!timetable) {
        const newTimetableId = await this.studentTimetableService.createStudentTimetable({
          studentId,
          versionId,
          classSectionIds: []
        })
        timetable = await this.studentTimetableService.getStudentTimetableById(newTimetableId)
        if (!timetable) {
          res.status(500).json({
            success: false,
            error: 'Failed to create student timetable'
          })
          return
        }
      }

      // 수업 존재 여부 확인
      const classSection = await this.classSectionService.getClassSectionById(classSectionId)
      if (!classSection) {
        res.status(404).json({ success: false, error: 'Class section not found' })
        return
      }

      // 이미 추가된 수업인지 확인
      if (timetable.classSectionIds.includes(classSectionId)) {
        res.status(409).json({
          success: false,
          error: 'Class section already exists in timetable'
        })
        return
      }

      // 수업 추가
      const updatedClassSectionIds = [...timetable.classSectionIds, classSectionId]
      await this.studentTimetableService.updateStudentTimetable(timetable.id, {
        classSectionIds: updatedClassSectionIds
      })

      // 업데이트된 시간표 조회
      const updatedTimetable = await this.studentTimetableService.getStudentTimetableById(timetable.id)
      if (!updatedTimetable) {
        res.status(500).json({
          success: false,
          error: 'Failed to retrieve updated timetable'
        })
        return
      }

      const completeTimetableData = await this.buildCompleteTimetableData(studentId, updatedTimetable)

      res.status(200).json({
        success: true,
        message: 'Class section added to student timetable successfully',
        data: completeTimetableData
      })
    } catch (error) {
      console.error('Error adding class to student timetable by version:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }

  // 나머지 메서드는 유사한 방식으로 수정...
}
```

### 4. Routes

#### `timetable-version.ts` (신규)
```typescript
import { Router } from 'express'
import { TimetableVersionController } from '../controllers/TimetableVersionController'

const router = Router()
const controller = new TimetableVersionController()

// 모든 버전 조회
router.get('/', (req, res) => controller.getAllVersions(req, res))

// 활성 버전 조회
router.get('/active', (req, res) => controller.getActiveVersion(req, res))

// 버전 생성
router.post('/', (req, res) => controller.createVersion(req, res))

// 버전 조회
router.get('/:id', (req, res) => controller.getVersionById(req, res))

// 버전 수정
router.put('/:id', (req, res) => controller.updateVersion(req, res))

// 버전 삭제
router.delete('/:id', (req, res) => controller.deleteVersion(req, res))

// 버전 활성화
router.post('/:id/activate', (req, res) => controller.activateVersion(req, res))

// 버전 복사
router.post('/:sourceVersionId/copy', (req, res) => controller.copyVersion(req, res))

// 특정 버전의 모든 학생 시간표 일괄 초기화
router.post('/:versionId/bulk-initialize', (req, res) => controller.bulkInitializeTimetables(req, res))

export { router as timetableVersionRoutes }
```

#### `student-timetable.ts` (수정)
```typescript
// 기존 라우트에 추가

// ===== 버전별 학생 시간표 라우트 =====

// 학생별 버전별 시간표 조회
router.get('/student/:studentId/version/:versionId', (req, res) => {
  console.log('🔍 [DEBUG] GET /student/:studentId/version/:versionId 라우트 매칭됨')
  studentTimetableController.getStudentTimetableByStudentIdAndVersion(req, res)
})

// 학생별 버전별 수업 추가
router.post('/student/:studentId/version/:versionId/add-class', (req, res) => {
  console.log('🔍 [DEBUG] POST /student/:studentId/version/:versionId/add-class 라우트 매칭됨')
  studentTimetableController.addClassToStudentTimetableByVersion(req, res)
})

// 학생별 버전별 수업 제거
router.post('/student/:studentId/version/:versionId/remove-class', (req, res) => {
  console.log('🔍 [DEBUG] POST /student/:studentId/version/:versionId/remove-class 라우트 매칭됨')
  studentTimetableController.removeClassFromStudentTimetableByVersion(req, res)
})

// ... 기존 라우트 유지 ...
```

#### `index.ts` (수정)
```typescript
// 기존 코드에 추가

import { timetableVersionRoutes } from './routes/timetable-version'

// ... 기존 라우트 등록 ...

// 시간표 버전 관련 라우트
app.use('/api/timetable-versions', timetableVersionRoutes)
console.log('✅ Timetable-versions routes registered successfully')

// ... 나머지 코드 ...
```

---

## 프론트엔드 구현

### 1. 타입 정의 (`frontend/src/features/schedule/types/`)

#### `timetable-version.types.ts` (신규)
```typescript
export interface TimetableVersion {
  id: string
  name: string
  displayName: string
  startDate: string // ISO string
  endDate: string   // ISO string
  isActive: boolean
  description?: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateTimetableVersionRequest {
  name: string
  displayName: string
  startDate: string
  endDate: string
  description?: string
  order?: number
}

export interface UpdateTimetableVersionRequest {
  name?: string
  displayName?: string
  startDate?: string
  endDate?: string
  isActive?: boolean
  description?: string
  order?: number
}
```

### 2. API Service (`frontend/src/services/api.ts`)

```typescript
// 기존 ApiService 클래스에 추가

class ApiService {
  // ... 기존 코드 ...

  // ===== 시간표 버전 관리 API =====

  async getTimetableVersions(): Promise<ApiResponse<TimetableVersion[]>> {
    return this.request<TimetableVersion[]>('/api/timetable-versions')
  }

  async getActiveTimetableVersion(): Promise<ApiResponse<TimetableVersion>> {
    return this.request<TimetableVersion>('/api/timetable-versions/active')
  }

  async createTimetableVersion(data: CreateTimetableVersionRequest): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>('/api/timetable-versions', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateTimetableVersion(id: string, data: UpdateTimetableVersionRequest): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/timetable-versions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteTimetableVersion(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/timetable-versions/${id}`, {
      method: 'DELETE'
    })
  }

  async activateTimetableVersion(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/timetable-versions/${id}/activate`, {
      method: 'POST'
    })
  }

  async copyTimetableVersion(sourceVersionId: string, data: CreateTimetableVersionRequest): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>(`/api/timetable-versions/${sourceVersionId}/copy`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async bulkInitializeTimetables(versionId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/api/timetable-versions/${versionId}/bulk-initialize`, {
      method: 'POST'
    })
  }

  // ===== 학생 시간표 API (버전별) =====

  async getStudentTimetableByVersion(studentId: string, versionId: string): Promise<ApiResponse<StudentTimetableResponse['data']>> {
    return this.request<StudentTimetableResponse['data']>(
      `/api/student-timetables/student/${studentId}/version/${versionId}`
    )
  }

  async addClassToStudentTimetableByVersion(
    studentId: string,
    versionId: string,
    classSectionId: string
  ): Promise<ApiResponse<StudentTimetableResponse['data']>> {
    return this.request<StudentTimetableResponse['data']>(
      `/api/student-timetables/student/${studentId}/version/${versionId}/add-class`,
      {
        method: 'POST',
        body: JSON.stringify({ classSectionId })
      }
    )
  }

  async removeClassFromStudentTimetableByVersion(
    studentId: string,
    versionId: string,
    classSectionId: string
  ): Promise<ApiResponse<StudentTimetableResponse['data']>> {
    return this.request<StudentTimetableResponse['data']>(
      `/api/student-timetables/student/${studentId}/version/${versionId}/remove-class`,
      {
        method: 'POST',
        body: JSON.stringify({ classSectionId })
      }
    )
  }
}
```

### 3. 버전 관리 Context (`frontend/src/contexts/TimetableVersionContext.tsx`)

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiService } from '../services/api'
import type { TimetableVersion } from '../features/schedule/types/timetable-version.types'

interface TimetableVersionContextType {
  versions: TimetableVersion[]
  activeVersion: TimetableVersion | null
  selectedVersion: TimetableVersion | null
  isLoading: boolean
  error: string | null
  loadVersions: () => Promise<void>
  selectVersion: (version: TimetableVersion) => void
  activateVersion: (versionId: string) => Promise<void>
}

const TimetableVersionContext = createContext<TimetableVersionContextType | undefined>(undefined)

export const TimetableVersionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [versions, setVersions] = useState<TimetableVersion[]>([])
  const [activeVersion, setActiveVersion] = useState<TimetableVersion | null>(null)
  const [selectedVersion, setSelectedVersion] = useState<TimetableVersion | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadVersions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [versionsResponse, activeResponse] = await Promise.all([
        apiService.getTimetableVersions(),
        apiService.getActiveTimetableVersion()
      ])

      if (versionsResponse.success && versionsResponse.data) {
        setVersions(versionsResponse.data)
      }

      if (activeResponse.success && activeResponse.data) {
        setActiveVersion(activeResponse.data)
        setSelectedVersion(activeResponse.data) // 기본값으로 활성 버전 선택
      }
    } catch (err) {
      console.error('버전 로드 실패:', err)
      setError('버전을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const selectVersion = (version: TimetableVersion) => {
    setSelectedVersion(version)
  }

  const activateVersion = async (versionId: string) => {
    try {
      await apiService.activateTimetableVersion(versionId)
      await loadVersions() // 버전 목록 새로고침
    } catch (err) {
      console.error('버전 활성화 실패:', err)
      throw err
    }
  }

  useEffect(() => {
    loadVersions()
  }, [])

  return (
    <TimetableVersionContext.Provider
      value={{
        versions,
        activeVersion,
        selectedVersion,
        isLoading,
        error,
        loadVersions,
        selectVersion,
        activateVersion
      }}
    >
      {children}
    </TimetableVersionContext.Provider>
  )
}

export const useTimetableVersion = () => {
  const context = useContext(TimetableVersionContext)
  if (!context) {
    throw new Error('useTimetableVersion must be used within TimetableVersionProvider')
  }
  return context
}
```

### 4. 버전 선택 컴포넌트 (`frontend/src/components/TimetableVersionSelector.tsx`)

```typescript
import React from 'react'
import { Select } from 'antd'
import { useTimetableVersion } from '../contexts/TimetableVersionContext'
import './TimetableVersionSelector.css'

export const TimetableVersionSelector: React.FC = () => {
  const { versions, selectedVersion, selectVersion, isLoading } = useTimetableVersion()

  const handleChange = (versionId: string) => {
    const version = versions.find(v => v.id === versionId)
    if (version) {
      selectVersion(version)
    }
  }

  return (
    <div className="timetable-version-selector">
      <label className="version-selector-label">시간표 버전:</label>
      <Select
        value={selectedVersion?.id}
        onChange={handleChange}
        loading={isLoading}
        style={{ width: 200 }}
        placeholder="버전 선택"
      >
        {versions.map(version => (
          <Select.Option key={version.id} value={version.id}>
            {version.displayName}
            {version.isActive && <span className="active-badge"> (활성)</span>}
          </Select.Option>
        ))}
      </Select>
    </div>
  )
}
```

### 5. 버전 관리 페이지 (`frontend/src/features/admin/pages/TimetableVersionManagementPage.tsx`)

```typescript
import React, { useState } from 'react'
import { Button, Table, Modal, Form, Input, DatePicker, message } from 'antd'
import { useTimetableVersion } from '../../../contexts/TimetableVersionContext'
import { apiService } from '../../../services/api'
import type { TimetableVersion } from '../../schedule/types/timetable-version.types'
import dayjs from 'dayjs'

export const TimetableVersionManagementPage: React.FC = () => {
  const { versions, activeVersion, loadVersions, activateVersion } = useTimetableVersion()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<TimetableVersion | null>(null)
  const [form] = Form.useForm()
  const [copyForm] = Form.useForm()

  // 버전 생성
  const handleCreate = async (values: any) => {
    try {
      await apiService.createTimetableVersion({
        name: values.name,
        displayName: values.displayName,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        description: values.description,
        order: values.order || 0
      })

      message.success('버전이 생성되었습니다.')
      setIsModalOpen(false)
      form.resetFields()
      loadVersions()
    } catch (error) {
      message.error('버전 생성에 실패했습니다.')
    }
  }

  // 버전 활성화
  const handleActivate = async (versionId: string) => {
    try {
      await activateVersion(versionId)
      message.success('버전이 활성화되었습니다.')
    } catch (error) {
      message.error('버전 활성화에 실패했습니다.')
    }
  }

  // 버전 삭제
  const handleDelete = async (versionId: string) => {
    Modal.confirm({
      title: '버전을 삭제하시겠습니까?',
      content: '이 작업은 되돌릴 수 없습니다.',
      onOk: async () => {
        try {
          await apiService.deleteTimetableVersion(versionId)
          message.success('버전이 삭제되었습니다.')
          loadVersions()
        } catch (error) {
          message.error('버전 삭제에 실패했습니다.')
        }
      }
    })
  }

  // 버전 복사
  const handleCopy = async (values: any) => {
    if (!selectedVersion) return

    try {
      await apiService.copyTimetableVersion(selectedVersion.id, {
        name: values.name,
        displayName: values.displayName,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        description: values.description,
        order: values.order || 0
      })

      message.success('버전이 복사되었습니다.')
      setIsCopyModalOpen(false)
      copyForm.resetFields()
      setSelectedVersion(null)
      loadVersions()
    } catch (error) {
      message.error('버전 복사에 실패했습니다.')
    }
  }

  // 모든 학생 시간표 초기화
  const handleBulkInitialize = async (versionId: string) => {
    Modal.confirm({
      title: '모든 학생의 시간표를 초기화하시겠습니까?',
      content: '활성 상태의 모든 학생에게 빈 시간표가 생성됩니다.',
      onOk: async () => {
        try {
          await apiService.bulkInitializeTimetables(versionId)
          message.success('학생 시간표가 초기화되었습니다.')
        } catch (error) {
          message.error('초기화에 실패했습니다.')
        }
      }
    })
  }

  const columns = [
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '표시명',
      dataIndex: 'displayName',
      key: 'displayName'
    },
    {
      title: '기간',
      key: 'period',
      render: (record: TimetableVersion) => (
        <span>
          {dayjs(record.startDate).format('YYYY-MM-DD')} ~ {dayjs(record.endDate).format('YYYY-MM-DD')}
        </span>
      )
    },
    {
      title: '상태',
      key: 'status',
      render: (record: TimetableVersion) => (
        <span className={record.isActive ? 'status-active' : 'status-inactive'}>
          {record.isActive ? '활성' : '비활성'}
        </span>
      )
    },
    {
      title: '작업',
      key: 'actions',
      render: (record: TimetableVersion) => (
        <div className="action-buttons">
          {!record.isActive && (
            <Button size="small" onClick={() => handleActivate(record.id)}>
              활성화
            </Button>
          )}
          <Button
            size="small"
            onClick={() => {
              setSelectedVersion(record)
              setIsCopyModalOpen(true)
            }}
          >
            복사
          </Button>
          <Button
            size="small"
            onClick={() => handleBulkInitialize(record.id)}
          >
            학생 초기화
          </Button>
          {!record.isActive && (
            <Button size="small" danger onClick={() => handleDelete(record.id)}>
              삭제
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="timetable-version-management-page">
      <div className="page-header">
        <h1>시간표 버전 관리</h1>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          새 버전 만들기
        </Button>
      </div>

      <Table
        dataSource={versions}
        columns={columns}
        rowKey="id"
        pagination={false}
      />

      {/* 버전 생성 모달 */}
      <Modal
        title="새 시간표 버전 만들기"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item name="name" label="버전 이름" rules={[{ required: true }]}>
            <Input placeholder="예: 2024년 1학기" />
          </Form.Item>
          <Form.Item name="displayName" label="표시명" rules={[{ required: true }]}>
            <Input placeholder="예: 2024-1학기" />
          </Form.Item>
          <Form.Item name="dateRange" label="기간" rules={[{ required: true }]}>
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea rows={3} placeholder="버전 설명 (선택사항)" />
          </Form.Item>
          <Form.Item name="order" label="순서">
            <Input type="number" placeholder="0" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 버전 복사 모달 */}
      <Modal
        title={`"${selectedVersion?.name}" 버전 복사`}
        open={isCopyModalOpen}
        onCancel={() => {
          setIsCopyModalOpen(false)
          copyForm.resetFields()
          setSelectedVersion(null)
        }}
        onOk={() => copyForm.submit()}
      >
        <Form form={copyForm} onFinish={handleCopy} layout="vertical">
          <Form.Item name="name" label="새 버전 이름" rules={[{ required: true }]}>
            <Input placeholder="예: 2024년 2학기" />
          </Form.Item>
          <Form.Item name="displayName" label="표시명" rules={[{ required: true }]}>
            <Input placeholder="예: 2024-2학기" />
          </Form.Item>
          <Form.Item name="dateRange" label="기간" rules={[{ required: true }]}>
            <DatePicker.RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <Input.TextArea rows={3} placeholder="버전 설명 (선택사항)" />
          </Form.Item>
          <Form.Item name="order" label="순서">
            <Input type="number" placeholder="0" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
```

### 6. SchedulePage 수정

```typescript
// frontend/src/features/schedule/pages/SchedulePage.tsx

import { useTimetableVersion } from '../../../contexts/TimetableVersionContext'
import { TimetableVersionSelector } from '../../../components/TimetableVersionSelector'

function SchedulePage() {
  const { selectedVersion } = useTimetableVersion()

  // ... 기존 코드 ...

  // 시간표 로드 함수 수정
  const loadTimetable = useCallback(async (student: Student) => {
    if (!student || !selectedVersion) return

    setIsTimetableLoading(true)
    setTimetableError(null)
    setTimetableData(null)

    try {
      console.log(`📚 ${student.name}의 시간표 로드 (버전: ${selectedVersion.displayName})`)

      // 버전별 시간표 조회
      const response = await apiService.getStudentTimetableByVersion(student.id, selectedVersion.id)

      // ... 기존 데이터 처리 로직 ...
    } catch (error) {
      // ... 에러 처리 ...
    } finally {
      setIsTimetableLoading(false)
    }
  }, [selectedVersion])

  // selectedVersion 변경 시 시간표 다시 로드
  useEffect(() => {
    if (selectedStudent && selectedVersion) {
      loadTimetable(selectedStudent)
    }
  }, [selectedStudent, selectedVersion, loadTimetable])

  return (
    <div className="schedule-page">
      <div className="schedule-page-header">
        <Label variant="heading" size="large">시간표 관리</Label>
        {/* 버전 선택 드롭다운 추가 */}
        <TimetableVersionSelector />
      </div>

      {/* ... 기존 코드 ... */}
    </div>
  )
}
```

### 7. TimetableEditModal 수정

```typescript
// frontend/src/features/schedule/components/TimetableEditModal.tsx

export const TimetableEditModal: React.FC<TimetableEditModalProps> = ({
  // ... 기존 props ...
}) => {
  const { selectedVersion } = useTimetableVersion()

  // ... 기존 상태 ...

  // 수업 추가 함수 수정
  const handleAddClass = async (classSectionId: string) => {
    if (!student || !selectedVersion) return

    try {
      console.log(`📚 ${student.name}에게 수업 추가 (버전: ${selectedVersion.displayName})`)

      // 버전별 수업 추가 API 호출
      const response = await apiService.addClassToStudentTimetableByVersion(
        student.id,
        selectedVersion.id,
        classSectionId
      )

      // ... 기존 처리 로직 ...
    } catch (err) {
      // ... 에러 처리 ...
    }
  }

  // 수업 제거 함수도 유사하게 수정
  const handleRemoveClass = async (classSectionId: string) => {
    if (!student || !selectedVersion) return

    try {
      await apiService.removeClassFromStudentTimetableByVersion(
        student.id,
        selectedVersion.id,
        classSectionId
      )

      // ... 기존 처리 로직 ...
    } catch (err) {
      // ... 에러 처리 ...
    }
  }

  // ... 나머지 코드 ...
}
```

### 8. App.tsx에 Provider 추가

```typescript
// frontend/src/App.tsx

import { TimetableVersionProvider } from './contexts/TimetableVersionContext'

function App() {
  return (
    <Provider store={store}>
      <TimetableVersionProvider>
        <AppProvider>
          {/* ... 기존 라우터 구조 ... */}
        </AppProvider>
      </TimetableVersionProvider>
    </Provider>
  )
}
```

---

## 데이터 마이그레이션

### 마이그레이션 스크립트 (`functions/src/scripts/migrate-timetable-versions.ts`)

```typescript
import * as admin from 'firebase-admin'
import { TimetableVersionService } from '../services/TimetableVersionService'
import { StudentTimetableService } from '../services/StudentTimetableService'

// Firebase Admin 초기화
admin.initializeApp()

async function migrateTimetableVersions() {
  console.log('🚀 시간표 버전 마이그레이션 시작...')

  const versionService = new TimetableVersionService()
  const timetableService = new StudentTimetableService()

  try {
    // 1. 기본 버전 생성
    console.log('📝 기본 버전 생성 중...')
    const defaultVersionId = await versionService.createVersion({
      name: '기본 버전',
      displayName: '기본',
      startDate: admin.firestore.Timestamp.fromDate(new Date('2024-01-01')),
      endDate: admin.firestore.Timestamp.fromDate(new Date('2024-12-31')),
      description: '기존 시간표를 위한 기본 버전',
      order: 0
    })
    console.log(`✅ 기본 버전 생성 완료: ${defaultVersionId}`)

    // 2. 기본 버전 활성화
    console.log('🎯 기본 버전 활성화 중...')
    await versionService.activateVersion(defaultVersionId)
    console.log('✅ 기본 버전 활성화 완료')

    // 3. 모든 기존 시간표 조회
    console.log('📚 기존 시간표 조회 중...')
    const allTimetables = await timetableService.getAllStudentTimetables()
    console.log(`📊 총 ${allTimetables.length}개의 시간표 발견`)

    // 4. 각 시간표에 versionId 추가 (Batch 처리로 성능 최적화)
    console.log('🔄 시간표 업데이트 중...')
    let updatedCount = 0
    let errorCount = 0

    // versionId가 없는 시간표만 필터링
    const allTimetablesToUpdate = allTimetables.filter(t => !(t as any).versionId)
    console.log(`📊 업데이트 대상: ${allTimetablesToUpdate.length}개`)

    // Firestore Batch 처리 (배치당 최대 500개 작업 제한)
    const BATCH_SIZE = 500
    const db = admin.firestore()

    for (let i = 0; i < allTimetablesToUpdate.length; i += BATCH_SIZE) {
      const batch = db.batch()
      const chunk = allTimetablesToUpdate.slice(i, i + BATCH_SIZE)

      for (const timetable of chunk) {
        const docRef = db.collection('student_timetables').doc(timetable.id)
        batch.update(docRef, {
          versionId: defaultVersionId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
      }

      try {
        await batch.commit()
        updatedCount += chunk.length
        console.log(`⏳ 진행률: ${updatedCount}/${allTimetablesToUpdate.length} (${Math.round(updatedCount / allTimetablesToUpdate.length * 100)}%)`)
      } catch (error) {
        console.error(`❌ 배치 작업 실패 (인덱스 ${i}부터 ${i + chunk.length}까지):`, error)
        errorCount += chunk.length
      }
    }

    console.log('\n🎉 마이그레이션 완료!')
    console.log(`✅ 성공: ${updatedCount}개`)
    console.log(`❌ 실패: ${errorCount}개`)
    console.log(`📊 전체: ${allTimetables.length}개`)

  } catch (error) {
    console.error('💥 마이그레이션 중 오류 발생:', error)
    throw error
  }
}

// 스크립트 실행
migrateTimetableVersions()
  .then(() => {
    console.log('✨ 마이그레이션이 정상적으로 완료되었습니다.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 마이그레이션 실패:', error)
    process.exit(1)
  })
```

### 실행 방법

```bash
# 1. 스크립트 컴파일
cd functions
npm run build

# 2. 마이그레이션 실행
node lib/scripts/migrate-timetable-versions.js

# 3. 결과 확인
# Firestore 콘솔에서 student_timetables 컬렉션 확인
# 모든 문서에 versionId 필드가 추가되었는지 확인
```

---

## 개발 일정

### Phase 1: 백엔드 기초 (1주)
- [ ] 타입 정의 작성
- [ ] `TimetableVersionService` 구현
- [ ] `StudentTimetableService` 수정
- [ ] 단위 테스트 작성

### Phase 2: 백엔드 API (1주)
- [ ] `TimetableVersionController` 구현
- [ ] `StudentTimetableController` 수정
- [ ] Routes 설정
- [ ] API 통합 테스트

### Phase 3: 프론트엔드 기초 (1주)
- [ ] 타입 정의 작성
- [ ] API Service 메서드 추가
- [ ] `TimetableVersionContext` 구현
- [ ] `TimetableVersionSelector` 컴포넌트 개발

### Phase 4: 프론트엔드 UI (1-2주)
- [ ] 버전 관리 페이지 개발
- [ ] `SchedulePage` 수정 (버전 연동)
- [ ] `TimetableEditModal` 수정 (버전 연동)
- [ ] UI/UX 개선

### Phase 5: 데이터 마이그레이션 (1주)
- [ ] 마이그레이션 스크립트 작성
- [ ] 테스트 환경에서 마이그레이션 실행
- [ ] 데이터 검증
- [ ] 운영 환경 마이그레이션

### Phase 6: 테스트 및 배포 (1주)
- [ ] 통합 테스트
- [ ] 성능 테스트
- [ ] 버그 수정
- [ ] 문서화
- [ ] 운영 배포

**총 개발 기간: 6-7주**

---

## 예상 효과

### 1. 운영 효율성 향상
- ✅ 새 학기 시작 시 기존 시간표 복사로 빠른 셋업
- ✅ 버전 전환으로 전체 학생 시간표 즉시 변경
- ✅ 과거 이력 조회로 데이터 추적 가능

### 2. 유연성 증가
- ✅ 학기/방학/특별 프로그램별 시간표 관리
- ✅ 학생 개별 조정 가능 (특정 학생만 다른 버전)
- ✅ 미래 기능 확장 용이 (버전 비교, 통계 등)

### 3. 데이터 무결성
- ✅ 기간별 명확한 구분
- ✅ 잘못된 수정 방지 (활성 버전만 편집 가능)
- ✅ 실수로 삭제 방지 (비활성화 후 삭제)

---

## 주의사항

### 개발 시 고려사항

1. **성능 최적화**
   - 버전별 시간표 조회 시 Firestore 복합 인덱스 활용
   - 대량의 학생 시간표 초기화 시 **Batch 처리 필수** (500개씩)
   - 프론트엔드에서 버전 목록 캐싱
   - 마이그레이션 스크립트는 항상 Batch 방식 사용하여 Firestore 쓰기 제한 회피

2. **데이터 일관성**
   - 활성 버전은 항상 1개만 존재
   - 버전 삭제 시 관련 시간표도 함께 삭제 여부 결정
   - 트랜잭션으로 원자적 작업 보장

3. **사용자 경험**
   - 버전 전환 시 로딩 표시
   - 명확한 에러 메시지
   - 작업 확인 모달 (삭제, 초기화 등)

4. **보안**
   - 버전 관리는 관리자만 접근 가능
   - API 권한 검증
   - 입력 데이터 검증

### 배포 체크리스트

- [ ] 백업 생성
- [ ] 마이그레이션 스크립트 테스트
- [ ] API 엔드포인트 테스트
- [ ] 프론트엔드 빌드 확인
- [ ] Firestore 인덱스 생성
- [ ] 롤백 계획 수립
- [ ] 사용자 가이드 작성

---

## ⚠️ 프로젝트 적합성 검증 및 수정사항

### 실제 프로젝트 코드 분석 결과

현재 프로젝트 코드를 꼼꼼히 분석한 결과, 문서의 일부 내용을 프로젝트의 실제 구조에 맞게 수정해야 합니다.

---

### 🔧 필수 수정사항

#### 1. **타입 정의 분리 (백엔드/프론트엔드)**

**문제점:**
문서에서 제안한 타입이 백엔드와 프론트엔드를 구분하지 않음

**실제 프로젝트 구조:**
```typescript
// shared/types/common.types.ts
export type FirestoreTimestamp = any // 백엔드 전용 (firebase-admin)
export type DateString = string      // "2024-01-15"
export type DateTimeString = string  // ISO 8601 형식
```

**✅ 수정된 구현:**

##### 백엔드 타입 (`shared/types/timetable-version.types.ts`)
```typescript
import type { BaseEntity, FirestoreTimestamp } from './common.types'

// ===== 시간표 버전 관련 타입 (백엔드) =====

export interface TimetableVersion extends BaseEntity {
  id: string
  name: string
  displayName: string
  startDate: FirestoreTimestamp  // ✅ 백엔드는 Firestore Timestamp 사용
  endDate: FirestoreTimestamp
  isActive: boolean
  description?: string
  order: number
  createdAt: FirestoreTimestamp
  updatedAt: FirestoreTimestamp
}

export interface CreateTimetableVersionRequest {
  name: string
  displayName: string
  startDate: FirestoreTimestamp
  endDate: FirestoreTimestamp
  description?: string
  order?: number
}

export interface UpdateTimetableVersionRequest {
  name?: string
  displayName?: string
  startDate?: FirestoreTimestamp
  endDate?: FirestoreTimestamp
  isActive?: boolean
  description?: string
  order?: number
}
```

##### 프론트엔드 타입 (`frontend/src/features/schedule/types/timetable-version.types.ts`)
```typescript
// ===== 시간표 버전 관련 타입 (프론트엔드) =====

export interface TimetableVersion {
  id: string
  name: string
  displayName: string
  startDate: string  // ✅ 프론트엔드는 ISO string 사용
  endDate: string
  isActive: boolean
  description?: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateTimetableVersionRequest {
  name: string
  displayName: string
  startDate: string  // ✅ ISO string 또는 DateString
  endDate: string
  description?: string
  order?: number
}

export interface UpdateTimetableVersionRequest {
  name?: string
  displayName?: string
  startDate?: string
  endDate?: string
  isActive?: boolean
  description?: string
  order?: number
}
```

---

#### 2. **API 엔드포인트 상수 사용**

**문제점:**
문서에서 API 엔드포인트를 직접 문자열로 작성

**실제 프로젝트:**
모든 API 엔드포인트는 `shared/constants/api.constants.ts`의 `API_ENDPOINTS` 상수 사용

**✅ 수정된 구현:**

##### API 상수 추가 (`shared/constants/api.constants.ts`)
```typescript
export const API_ENDPOINTS = {
  // ... 기존 엔드포인트들 ...

  // 시간표 버전 관리 API (✨ 새로 추가)
  TIMETABLE_VERSIONS: {
    // GET /api/timetable-versions - 모든 버전 조회
    GET_ALL: '/api/timetable-versions',
    // GET /api/timetable-versions/active - 활성 버전 조회
    GET_ACTIVE: '/api/timetable-versions/active',
    // GET /api/timetable-versions/:id - 개별 버전 조회
    GET_BY_ID: (id: string) => `/api/timetable-versions/${id}`,
    // POST /api/timetable-versions - 버전 생성
    CREATE: '/api/timetable-versions',
    // PUT /api/timetable-versions/:id - 버전 수정
    UPDATE: (id: string) => `/api/timetable-versions/${id}`,
    // DELETE /api/timetable-versions/:id - 버전 삭제
    DELETE: (id: string) => `/api/timetable-versions/${id}`,
    // POST /api/timetable-versions/:id/activate - 버전 활성화
    ACTIVATE: (id: string) => `/api/timetable-versions/${id}/activate`,
    // POST /api/timetable-versions/:sourceId/copy - 버전 복사
    COPY: (sourceId: string) => `/api/timetable-versions/${sourceId}/copy`,
    // POST /api/timetable-versions/:versionId/bulk-initialize - 일괄 초기화
    BULK_INITIALIZE: (versionId: string) => `/api/timetable-versions/${versionId}/bulk-initialize`,
    // GET /api/timetable-versions/search - 버전 검색
    SEARCH: '/api/timetable-versions/search'
  },

  // 학생 시간표 API 확장 (✨ 버전별 엔드포인트 추가)
  STUDENT_TIMETABLES: {
    // ... 기존 엔드포인트들 ...

    // GET /api/student-timetables/student/:studentId/version/:versionId
    GET_BY_STUDENT_AND_VERSION: (studentId: string, versionId: string) =>
      `/api/student-timetables/student/${studentId}/version/${versionId}`,
    // POST /api/student-timetables/student/:studentId/version/:versionId/add-class
    ADD_CLASS_BY_VERSION: (studentId: string, versionId: string) =>
      `/api/student-timetables/student/${studentId}/version/${versionId}/add-class`,
    // POST /api/student-timetables/student/:studentId/version/:versionId/remove-class
    REMOVE_CLASS_BY_VERSION: (studentId: string, versionId: string) =>
      `/api/student-timetables/student/${studentId}/version/${versionId}/remove-class`
  }
}
```

##### API Service 수정 (`frontend/src/services/api.ts`)
```typescript
import { API_ENDPOINTS } from '@shared/constants'

class ApiService {
  // ===== 시간표 버전 관리 API =====

  async getTimetableVersions(): Promise<ApiResponse<TimetableVersion[]>> {
    return this.request<TimetableVersion[]>(API_ENDPOINTS.TIMETABLE_VERSIONS.GET_ALL)
  }

  async getActiveTimetableVersion(): Promise<ApiResponse<TimetableVersion>> {
    return this.request<TimetableVersion>(API_ENDPOINTS.TIMETABLE_VERSIONS.GET_ACTIVE)
  }

  async createTimetableVersion(data: CreateTimetableVersionRequest): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>(API_ENDPOINTS.TIMETABLE_VERSIONS.CREATE, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async activateTimetableVersion(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(API_ENDPOINTS.TIMETABLE_VERSIONS.ACTIVATE(id), {
      method: 'POST'
    })
  }

  // ... 기타 메서드들도 동일한 패턴으로 작성 ...
}
```

---

#### 3. **Service 의존성 처리**

**문제점:**
문서에서 동적 import 사용

**실제 프로젝트:**
모든 Service는 직접 import 사용

**✅ 수정된 구현:**

```typescript
// functions/src/services/TimetableVersionService.ts
import * as admin from 'firebase-admin'
import { BaseService } from './BaseService'
import { StudentTimetableService } from './StudentTimetableService'  // ✅ 직접 import
import type {
  TimetableVersion,
  CreateTimetableVersionRequest,
  UpdateTimetableVersionRequest
} from '@shared/types'

export class TimetableVersionService extends BaseService {
  private studentTimetableService: StudentTimetableService

  constructor() {
    super('timetable_versions')
    this.studentTimetableService = new StudentTimetableService()  // ✅ 생성자에서 초기화
  }

  // 버전 복사
  async copyVersion(
    sourceVersionId: string,
    targetData: CreateTimetableVersionRequest
  ): Promise<string> {
    // 1. 새 버전 생성
    const newVersionId = await this.createVersion(targetData)

    // 2. 원본 버전의 모든 학생 시간표 조회
    const sourceTimetables = await this.studentTimetableService.searchStudentTimetables({
      versionId: sourceVersionId
    })

    // 3. 각 학생에 대해 새 버전 시간표 생성
    for (const sourceTimetable of sourceTimetables) {
      await this.studentTimetableService.createStudentTimetable({
        studentId: sourceTimetable.studentId,
        versionId: newVersionId,
        classSectionIds: sourceTimetable.classSectionIds,
        notes: sourceTimetable.notes
      })
    }

    return newVersionId
  }

  // 특정 버전의 모든 학생 시간표 일괄 초기화 (Batch 처리)
  async bulkInitializeTimetables(versionId: string, studentIds: string[]): Promise<void> {
    // 이미 존재하는 시간표 확인
    const existingTimetables = await this.studentTimetableService.searchStudentTimetables({
      versionId
    })
    const existingStudentIds = new Set(existingTimetables.map(t => t.studentId))

    // 생성이 필요한 학생들만 필터링
    const studentsToCreate = studentIds.filter(id => !existingStudentIds.has(id))

    if (studentsToCreate.length === 0) {
      console.log('✅ 모든 학생에게 이미 시간표가 존재합니다.')
      return
    }

    console.log(`📝 ${studentsToCreate.length}개의 시간표 생성 중...`)

    // Batch 처리 (500개씩)
    const BATCH_SIZE = 500
    let createdCount = 0

    for (let i = 0; i < studentsToCreate.length; i += BATCH_SIZE) {
      const batch = this.db.batch()
      const chunk = studentsToCreate.slice(i, i + BATCH_SIZE)

      for (const studentId of chunk) {
        const docRef = this.db.collection('student_timetables').doc()
        batch.set(docRef, {
          id: docRef.id,
          studentId,
          versionId,
          classSectionIds: [],
          notes: '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
      }

      await batch.commit()
      createdCount += chunk.length
      console.log(`⏳ 진행률: ${createdCount}/${studentsToCreate.length}`)
    }

    console.log(`✅ ${createdCount}개의 시간표 생성 완료`)
  }
}
```

---

#### 4. **Context Provider 구조**

**문제점:**
문서에서 제안한 Provider 구조가 실제 프로젝트와 다름

**실제 프로젝트 구조:**
```typescript
// frontend/src/contexts/AppContext.tsx
export function AppProvider({ children }) {
  return (
    <Provider store={store}>  {/* Redux Provider가 AppProvider 내부에 */}
      <AppContext.Provider value={value}>
        {children}
      </AppContext.Provider>
    </Provider>
  )
}

// frontend/src/App.tsx
<DndProvider backend={HTML5Backend}>
  <AppProvider>  {/* 단일 Provider */}
    <RouterProvider router={router} />
  </AppProvider>
</DndProvider>
```

**✅ 수정된 구현:**

##### Option 1: AppProvider 내부에 추가 (권장)
```typescript
// frontend/src/App.tsx
import { TimetableVersionProvider } from './contexts/TimetableVersionContext'

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <AppProvider>
        <TimetableVersionProvider>  {/* ✅ AppProvider 내부 */}
          <RouterProvider router={router} />
        </TimetableVersionProvider>
      </AppProvider>
    </DndProvider>
  )
}
```

##### Option 2: 독립 Provider로 동일 레벨에 배치
```typescript
// frontend/src/App.tsx
import { TimetableVersionProvider } from './contexts/TimetableVersionContext'

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <TimetableVersionProvider>  {/* ✅ AppProvider와 동일 레벨 */}
        <AppProvider>
          <RouterProvider router={router} />
        </AppProvider>
      </TimetableVersionProvider>
    </DndProvider>
  )
}
```

**권장:** Option 1 (AppProvider 내부)
- Redux store에 접근 가능
- 기존 구조와 일관성 유지

---

#### 5. **에러 처리 통일**

**실제 프로젝트:**
모든 에러는 `@shared/utils/error.utils`의 `AppError` 클래스 사용

**✅ 수정된 구현:**

```typescript
// functions/src/services/TimetableVersionService.ts
import { AppError, ERROR_CODES } from '@shared/utils/error.utils'

export class TimetableVersionService extends BaseService {
  async activateVersion(versionId: string): Promise<void> {
    return this.runTransaction(async (transaction) => {
      // 버전 존재 여부 확인
      const versionDoc = await transaction.get(
        this.db.collection(this.collectionName).doc(versionId)
      )

      if (!versionDoc.exists) {
        throw AppError.notFound(
          ERROR_CODES.RESOURCE_NOT_FOUND,
          `Timetable version not found: ${versionId}`,
          { versionId }
        )
      }

      // 1. 모든 버전을 비활성화
      const allVersions = await this.getAllVersions()
      allVersions.forEach(version => {
        const versionRef = this.db.collection(this.collectionName).doc(version.id)
        transaction.update(versionRef, {
          isActive: false,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
      })

      // 2. 선택한 버전만 활성화
      const targetRef = this.db.collection(this.collectionName).doc(versionId)
      transaction.update(targetRef, {
        isActive: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })
    })
  }
}
```

---

#### 6. **Firestore 인덱스 설정**

**문제점:**
문서에서 인덱스 설정 누락

**✅ 추가 필요:**

##### `firestore.indexes.json` 수정
```json
{
  "indexes": [
    {
      "collectionGroup": "student_timetables",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "studentId", "order": "ASCENDING" },
        { "fieldPath": "versionId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "timetable_versions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "order", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

### 📝 코드 스타일 가이드

실제 프로젝트에서 사용하는 코드 스타일을 준수해야 합니다:

#### 1. **Service 클래스 패턴**
```typescript
export class XxxService extends BaseService {
  constructor() {
    super('collection_name')
  }

  // BaseService의 protected 메서드 활용
  async getById(id: string) {
    return this.getById<EntityType>(id)
  }

  async getAll() {
    return this.getAll<EntityType>()
  }

  // 트랜잭션 사용
  async complexOperation() {
    return this.runTransaction(async (transaction) => {
      // 트랜잭션 로직
    })
  }
}
```

#### 2. **Controller 클래스 패턴**
```typescript
export class XxxController {
  private xxxService: XxxService

  constructor() {
    this.xxxService = new XxxService()
  }

  async methodName(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.xxxService.method()

      res.status(200).json({
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString()
        }
      })
    } catch (error) {
      console.error('Error message:', error)
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      })
    }
  }
}
```

#### 3. **Routes 패턴**
```typescript
import { Router } from 'express'
import { XxxController } from '../controllers/XxxController'

const router = Router()
const controller = new XxxController()

// 구체적인 경로를 먼저 등록
router.get('/active', (req, res) => controller.getActive(req, res))

// 일반적인 경로를 나중에 등록
router.get('/', (req, res) => controller.getAll(req, res))
router.get('/:id', (req, res) => controller.getById(req, res))

export { router as xxxRoutes }
```

---

### 🎯 구현 우선순위 조정

프로젝트 적합성 검증을 반영한 구현 순서:

#### Phase 1: 타입 및 상수 정의 (1주)
- [ ] 백엔드 타입 정의 (`shared/types/timetable-version.types.ts`)
- [ ] 프론트엔드 타입 정의 (`frontend/src/features/schedule/types/`)
- [ ] API 엔드포인트 상수 추가 (`shared/constants/api.constants.ts`)
- [ ] Firestore 인덱스 설정 (`firestore.indexes.json`)

#### Phase 2: 백엔드 Service/Controller (1주)
- [ ] `TimetableVersionService` 구현 (직접 import 사용)
- [ ] `StudentTimetableService` 수정 (versionId 지원)
- [ ] `TimetableVersionController` 구현 (AppError 사용)
- [ ] `StudentTimetableController` 수정 (버전별 API 추가)
- [ ] 단위 테스트

#### Phase 3: 백엔드 Routes (1주)
- [ ] `timetable-version.ts` Routes 구현
- [ ] `student-timetable.ts` Routes 수정
- [ ] `index.ts`에 라우터 등록
- [ ] API 통합 테스트

#### Phase 4: 프론트엔드 Service/Context (1주)
- [ ] API Service 메서드 추가 (API_ENDPOINTS 상수 사용)
- [ ] `TimetableVersionContext` 구현
- [ ] `TimetableVersionSelector` 컴포넌트
- [ ] Context Provider 통합 (AppProvider 내부)

#### Phase 5: 프론트엔드 UI (1-2주)
- [ ] 버전 관리 페이지
- [ ] `SchedulePage` 수정 (버전 연동)
- [ ] `TimetableEditModal` 수정 (버전 연동)
- [ ] UI/UX 개선

#### Phase 6: 데이터 마이그레이션 및 배포 (1주)
- [ ] 마이그레이션 스크립트
- [ ] 테스트 환경 검증
- [ ] 통합 테스트
- [ ] 운영 배포

**총 개발 기간: 6-7주**

---

### 💡 **성능 최적화 추가 권장사항**

#### Firestore Batch 처리의 중요성

대량의 데이터를 다루는 작업(마이그레이션, 일괄 초기화 등)에서는 **Firestore Batch 처리가 필수**입니다.

**성능 비교:**
```typescript
// ❌ 나쁜 예: 순차 처리 (1000개 문서 = 1000번 네트워크 요청)
for (const item of items) {
  await firestore.collection('xxx').doc(item.id).update(data)
}
// 예상 시간: 1000 * 100ms = 100초

// ✅ 좋은 예: Batch 처리 (1000개 문서 = 2번 네트워크 요청)
const BATCH_SIZE = 500
for (let i = 0; i < items.length; i += BATCH_SIZE) {
  const batch = firestore.batch()
  const chunk = items.slice(i, i + BATCH_SIZE)

  chunk.forEach(item => {
    const ref = firestore.collection('xxx').doc(item.id)
    batch.update(ref, data)
  })

  await batch.commit()
}
// 예상 시간: 2 * 500ms = 1초 (100배 빠름!)
```

**주요 이점:**
1. **속도**: 네트워크 요청 횟수 500배 감소
2. **비용**: Firestore 읽기/쓰기 비용 동일 (작업 수는 같음)
3. **안정성**: Firestore 쓰기 제한(초당 10,000회) 회피
4. **원자성**: Batch 내 모든 작업이 성공하거나 모두 실패 (데이터 일관성)

**제한사항:**
- 배치당 최대 500개 작업
- 배치당 최대 10MB 데이터
- 트랜잭션과 달리 읽기 포함 불가

**적용 대상:**
- ✅ 마이그레이션 스크립트
- ✅ `bulkInitializeTimetables` (수백 명의 학생)
- ✅ `copyVersion` (수백 개의 시간표 복사)
- ✅ 대량 데이터 삭제/업데이트

---

## 🚨 영향 지점 분석 및 수정 계획

### 개요

`student_timetables` 컬렉션에 `versionId` 필드를 추가하면 **프로젝트 전체 35개 지점**에서 코드 수정이 필요합니다. 이 섹션은 각 영향 지점의 문제와 수정 방법을 상세히 설명합니다.

---

### 📊 영향 지점 요약

| 카테고리 | 영향받는 위치 | 심각도 | 비고 |
|---------|-------------|--------|------|
| 백엔드 Service (직접 쿼리) | 13곳 (4개 파일) | 🔴 치명적 | versionId 필터링 누락 |
| StudentTimetableService | 1개 메서드 | 🔴 치명적 | 활성 버전 조회 로직 필요 |
| 프론트엔드 API | 3개 메서드 | 🔴 치명적 | versionId 파라미터 누락 |
| 프론트엔드 컴포넌트 | 14개 파일 | 🟡 중간 | 버전 선택 UI 통합 필요 |
| 데이터베이스 구조 | 전체 컬렉션 | 🔴 치명적 | 문서 ID 구조 변경 |

**총 영향 지점**: 35개 위치

---

### 1️⃣ ClassSectionService.ts 수정 (6개 메서드)

#### 📍 **위치 1: deleteClassSectionHierarchically() - 라인 602-633**

**현재 코드:**
```typescript
async deleteClassSectionHierarchically(classSectionId: string): Promise<{...}> {
  return this.runTransaction(async (transaction) => {
    // ❌ 문제: 모든 버전의 시간표를 조회
    const studentTimetableQuery = this.db.collection('student_timetables');
    const studentTimetableDocs = await transaction.get(studentTimetableQuery);

    // 학생 시간표 업데이트
    for (const doc of studentTimetableDocs.docs) {
      const timetableData = doc.data();
      if (timetableData.classSectionIds?.includes(classSectionId)) {
        const updatedClassSectionIds = timetableData.classSectionIds.filter(
          (id: string) => id !== classSectionId
        );
        transaction.update(doc.ref, {
          classSectionIds: updatedClassSectionIds,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
  });
}
```

**문제점:**
- 모든 버전의 시간표에서 수업을 제거하려고 시도
- 특정 버전에서만 사용하는 수업을 삭제할 수 없음

**✅ 수정된 코드:**
```typescript
async deleteClassSectionHierarchically(
  classSectionId: string,
  options?: { versionId?: string; deleteFromAllVersions?: boolean }
): Promise<{
  success: boolean;
  deletedRecords: {
    studentTimetables: number;
    attendanceRecords: number;
    classSection: boolean;
  };
  message: string;
}> {
  try {
    const result = await this.runTransaction(async (transaction) => {
      // === 1단계: 모든 읽기 작업 ===

      let studentTimetableQuery: admin.firestore.Query = this.db.collection('student_timetables');

      // ✅ 수정: 옵션에 따라 버전 필터링
      if (options?.versionId) {
        // 특정 버전의 시간표만 조회
        studentTimetableQuery = studentTimetableQuery.where('versionId', '==', options.versionId);
      } else if (!options?.deleteFromAllVersions) {
        // 기본값: 활성 버전만 조회
        const versionService = new TimetableVersionService();
        const activeVersion = await versionService.getActiveVersion();
        if (activeVersion) {
          studentTimetableQuery = studentTimetableQuery.where('versionId', '==', activeVersion.id);
        }
      }
      // deleteFromAllVersions === true인 경우 필터 없이 모든 버전 처리

      const studentTimetableDocs = await transaction.get(studentTimetableQuery);

      // 출석 기록 조회
      const attendanceQuery = this.db.collection('attendance_records')
                                     .where('classSectionId', '==', classSectionId);
      const attendanceDocs = await transaction.get(attendanceQuery);

      // === 2단계: 모든 쓰기 작업 ===

      let studentTimetablesUpdated = 0;

      // 학생 시간표 업데이트
      for (const doc of studentTimetableDocs.docs) {
        const timetableData = doc.data();
        if (timetableData.classSectionIds && Array.isArray(timetableData.classSectionIds)) {
          const updatedClassSectionIds = timetableData.classSectionIds.filter(
            (id: string) => id !== classSectionId
          );

          if (updatedClassSectionIds.length !== timetableData.classSectionIds.length) {
            transaction.update(doc.ref, {
              classSectionIds: updatedClassSectionIds,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            studentTimetablesUpdated++;
          }
        }
      }

      // 출석 기록 삭제
      attendanceDocs.forEach(doc => transaction.delete(doc.ref));

      // 수업 삭제
      const classSectionRef = this.db.collection('class_sections').doc(classSectionId);
      transaction.delete(classSectionRef);

      return {
        studentTimetablesUpdated,
        attendanceRecordsDeleted: attendanceDocs.size,
        classSectionDeleted: true
      };
    });

    return {
      success: true,
      deletedRecords: {
        studentTimetables: result.studentTimetablesUpdated,
        attendanceRecords: result.attendanceRecordsDeleted,
        classSection: result.classSectionDeleted
      },
      message: `수업과 관련 데이터가 모두 삭제되었습니다 (${options?.versionId ? '특정 버전' : options?.deleteFromAllVersions ? '모든 버전' : '활성 버전'}).`
    };
  } catch (error) {
    console.error('수업 계층적 삭제 실패:', error);
    throw new Error(`수업 계층적 삭제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}
```

**변경 사항:**
1. ✅ `options` 파라미터 추가 (`versionId`, `deleteFromAllVersions`)
2. ✅ 기본 동작: 활성 버전만 처리
3. ✅ `versionId` 지정 시: 특정 버전만 처리
4. ✅ `deleteFromAllVersions: true`: 모든 버전 처리
5. ✅ `TimetableVersionService` 의존성 추가

---

#### 📍 **위치 2: getAffectedStudentCountByClassSectionId() - 라인 669-683**

**현재 코드:**
```typescript
private async getAffectedStudentCountByClassSectionId(classSectionId: string): Promise<number> {
  // ❌ 문제: 모든 버전의 시간표를 조회
  const studentTimetableQuery = this.db.collection('student_timetables');
  const studentTimetables = await this.search<{ studentId: string; classSectionIds?: string[] }>(studentTimetableQuery);

  let affectedStudentCount = 0;
  studentTimetables.forEach(timetable => {
    if (timetable.classSectionIds?.includes(classSectionId)) {
      affectedStudentCount++;
    }
  });

  return affectedStudentCount;
}
```

**문제점:**
- 모든 버전의 시간표를 조회하여 카운트가 부정확함
- 한 학생이 여러 버전에서 같은 수업을 듣는 경우 중복 카운트

**✅ 수정된 코드:**
```typescript
private async getAffectedStudentCountByClassSectionId(
  classSectionId: string,
  versionId?: string
): Promise<number> {
  try {
    let query: admin.firestore.Query = this.db.collection('student_timetables')
      .where('classSectionIds', 'array-contains', classSectionId);

    // ✅ 수정: versionId로 필터링 (기본값: 활성 버전)
    if (versionId) {
      query = query.where('versionId', '==', versionId);
    } else {
      // 활성 버전 조회
      const versionService = new TimetableVersionService();
      const activeVersion = await versionService.getActiveVersion();
      if (activeVersion) {
        query = query.where('versionId', '==', activeVersion.id);
      }
    }

    const studentTimetables = await this.search<{
      studentId: string;
      versionId: string;
      classSectionIds?: string[]
    }>(query);

    // ✅ 고유한 학생 수만 카운트
    const uniqueStudentIds = new Set(studentTimetables.map(t => t.studentId));
    return uniqueStudentIds.size;

  } catch (error) {
    console.error('영향받는 학생 수 조회 실패:', error);
    return 0;
  }
}
```

**변경 사항:**
1. ✅ `versionId` 파라미터 추가 (선택적)
2. ✅ 기본값: 활성 버전만 조회
3. ✅ `array-contains` 쿼리 + `versionId` 필터 (복합 인덱스 필요)
4. ✅ 고유한 학생 수만 카운트 (Set 사용)

**Firestore 인덱스 추가 필요:**
```json
{
  "collectionGroup": "student_timetables",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "classSectionIds", "arrayConfig": "CONTAINS" },
    { "fieldPath": "versionId", "order": "ASCENDING" }
  ]
}
```

---

#### 📍 **위치 3-5: addStudentToClass(), removeStudentFromClass(), getEnrolledStudents() - 라인 694-882**

**현재 코드의 문제점:**
```typescript
// ❌ 문제: studentId를 문서 ID로 사용
const studentTimetableRef = this.db.collection('student_timetables').doc(studentId);

// 버전 시스템에서는 한 학생이 여러 문서를 가지므로 doc(studentId) 패턴 불가능
```

**✅ 수정된 코드:**

```typescript
// 수업에 학생 추가
async addStudentToClass(
  classSectionId: string,
  studentId: string,
  versionId?: string  // ✅ 추가
): Promise<void> {
  try {
    await this.runTransaction(async (transaction) => {
      // === 1단계: 읽기 ===

      // 수업 존재 확인
      const classSectionRef = this.db.collection('class_sections').doc(classSectionId);
      const classSectionDoc = await transaction.get(classSectionRef);

      if (!classSectionDoc.exists) {
        throw new Error('수업을 찾을 수 없습니다.');
      }

      const classSectionData = classSectionDoc.data() as ClassSection;

      // 학생 존재 확인
      const studentRef = this.db.collection('students').doc(studentId);
      const studentDoc = await transaction.get(studentRef);

      if (!studentDoc.exists) {
        throw new Error('학생을 찾을 수 없습니다.');
      }

      // 정원 확인
      if ((classSectionData.currentStudents || 0) >= classSectionData.maxStudents) {
        throw new Error('수업 정원이 가득 찼습니다.');
      }

      // ✅ 수정: 버전 결정 (제공되지 않으면 활성 버전 사용)
      let targetVersionId = versionId;
      if (!targetVersionId) {
        const versionService = new TimetableVersionService();
        const activeVersion = await versionService.getActiveVersion();
        if (!activeVersion) {
          throw new Error('활성 시간표 버전이 없습니다.');
        }
        targetVersionId = activeVersion.id;
      }

      // ✅ 수정: studentId + versionId로 시간표 조회
      const timetableQuery = this.db.collection('student_timetables')
        .where('studentId', '==', studentId)
        .where('versionId', '==', targetVersionId)
        .limit(1);

      const timetableDocs = await transaction.get(timetableQuery);

      // === 2단계: 쓰기 ===

      if (!timetableDocs.empty) {
        // 기존 시간표에 수업 추가
        const timetableDoc = timetableDocs.docs[0];
        const timetableData = timetableDoc.data();

        const classSectionIds = timetableData.classSectionIds || [];

        if (classSectionIds.includes(classSectionId)) {
          throw new Error('이미 등록된 수업입니다.');
        }

        transaction.update(timetableDoc.ref, {
          classSectionIds: [...classSectionIds, classSectionId],
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        // ✅ 수정: 새 시간표 생성 (자동 생성 ID 사용)
        const newTimetableRef = this.db.collection('student_timetables').doc();
        transaction.set(newTimetableRef, {
          id: newTimetableRef.id,
          studentId,
          versionId: targetVersionId,
          classSectionIds: [classSectionId],
          notes: '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      // 수업의 현재 학생 수 증가
      transaction.update(classSectionRef, {
        currentStudents: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
  } catch (error) {
    console.error('학생 추가 실패:', error);
    throw error;
  }
}

// 수업에서 학생 제거
async removeStudentFromClass(
  classSectionId: string,
  studentId: string,
  versionId?: string  // ✅ 추가
): Promise<void> {
  try {
    await this.runTransaction(async (transaction) => {
      // === 1단계: 읽기 ===

      // 수업 존재 확인
      const classSectionRef = this.db.collection('class_sections').doc(classSectionId);
      const classSectionDoc = await transaction.get(classSectionRef);

      if (!classSectionDoc.exists) {
        throw new Error('수업을 찾을 수 없습니다.');
      }

      // ✅ 수정: 버전 결정
      let targetVersionId = versionId;
      if (!targetVersionId) {
        const versionService = new TimetableVersionService();
        const activeVersion = await versionService.getActiveVersion();
        if (!activeVersion) {
          throw new Error('활성 시간표 버전이 없습니다.');
        }
        targetVersionId = activeVersion.id;
      }

      // ✅ 수정: studentId + versionId로 시간표 조회
      const timetableQuery = this.db.collection('student_timetables')
        .where('studentId', '==', studentId)
        .where('versionId', '==', targetVersionId)
        .limit(1);

      const timetableDocs = await transaction.get(timetableQuery);

      if (timetableDocs.empty) {
        throw new Error('학생 시간표를 찾을 수 없습니다.');
      }

      const timetableDoc = timetableDocs.docs[0];
      const timetableData = timetableDoc.data();
      const classSectionIds = timetableData.classSectionIds || [];

      if (!classSectionIds.includes(classSectionId)) {
        throw new Error('등록되지 않은 수업입니다.');
      }

      // === 2단계: 쓰기 ===

      const updatedClassSectionIds = classSectionIds.filter((id: string) => id !== classSectionId);

      if (updatedClassSectionIds.length === 0) {
        // ✅ 수정: 수업이 하나도 없어도 문서는 유지 (빈 시간표 존재 허용)
        transaction.update(timetableDoc.ref, {
          classSectionIds: [],
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        transaction.update(timetableDoc.ref, {
          classSectionIds: updatedClassSectionIds,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      // 수업의 현재 학생 수 감소
      transaction.update(classSectionRef, {
        currentStudents: admin.firestore.FieldValue.increment(-1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
  } catch (error) {
    console.error('학생 제거 실패:', error);
    throw error;
  }
}

// 수업에 등록된 학생 목록 조회
async getEnrolledStudents(
  classSectionId: string,
  versionId?: string  // ✅ 추가
): Promise<Student[]> {
  try {
    // ✅ 수정: 버전 결정
    let targetVersionId = versionId;
    if (!targetVersionId) {
      const versionService = new TimetableVersionService();
      const activeVersion = await versionService.getActiveVersion();
      if (!activeVersion) {
        return [];
      }
      targetVersionId = activeVersion.id;
    }

    // ✅ 수정: versionId + array-contains 쿼리
    const studentTimetableQuery = this.db.collection('student_timetables')
      .where('versionId', '==', targetVersionId)
      .where('classSectionIds', 'array-contains', classSectionId);

    const studentTimetableDocs = await studentTimetableQuery.get();

    if (studentTimetableDocs.empty) {
      return [];
    }

    // 학생 ID 목록 추출
    const studentIds = studentTimetableDocs.docs.map(doc => doc.data().studentId);

    if (studentIds.length === 0) {
      return [];
    }

    // 학생 상세 정보 조회 (in 쿼리 10개 제한 고려)
    const students: Student[] = [];
    const chunkSize = 10;

    for (let i = 0; i < studentIds.length; i += chunkSize) {
      const chunk = studentIds.slice(i, i + chunkSize);
      const studentsQuery = this.db.collection('students')
        .where(admin.firestore.FieldPath.documentId(), 'in', chunk);

      const studentsDocs = await studentsQuery.get();
      studentsDocs.forEach(doc => {
        students.push({ id: doc.id, ...doc.data() } as Student);
      });
    }

    return students;
  } catch (error) {
    console.error('등록된 학생 목록 조회 실패:', error);
    throw new Error(`등록된 학생 목록 조회 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}
```

**변경 사항:**
1. ✅ 모든 메서드에 `versionId` 파라미터 추가 (선택적)
2. ✅ 기본값: 활성 버전 자동 조회
3. ✅ `doc(studentId)` → `where('studentId', '==', ...).where('versionId', '==', ...)` 쿼리로 변경
4. ✅ 새 문서 생성 시 자동 생성 ID 사용
5. ✅ 빈 시간표도 문서 유지 (삭제하지 않음)

**Firestore 인덱스 추가 필요:**
```json
{
  "collectionGroup": "student_timetables",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "studentId", "order": "ASCENDING" },
    { "fieldPath": "versionId", "order": "ASCENDING" }
  ]
},
{
  "collectionGroup": "student_timetables",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "versionId", "order": "ASCENDING" },
    { "fieldPath": "classSectionIds", "arrayConfig": "CONTAINS" }
  ]
}
```

---

#### 📍 **위치 6: ClassSectionController.ts 수정 필요**

Controller에서도 versionId 파라미터를 받아 Service로 전달해야 합니다.

**✅ 수정된 코드:**

```typescript
// functions/src/controllers/ClassSectionController.ts

export class ClassSectionController {
  // ... 기존 코드 ...

  // 수업에 학생 추가
  async addStudent(req: Request, res: Response): Promise<void> {
    try {
      const { classSectionId, studentId } = req.params;
      const { versionId } = req.body;  // ✅ 추가

      await this.classSectionService.addStudentToClass(
        classSectionId,
        studentId,
        versionId  // ✅ 전달
      );

      res.json({
        success: true,
        message: '학생이 수업에 추가되었습니다.'
      });
    } catch (error) {
      console.error('학생 추가 오류:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '학생 추가 중 오류가 발생했습니다.'
      });
    }
  }

  // 수업에서 학생 제거
  async removeStudent(req: Request, res: Response): Promise<void> {
    try {
      const { classSectionId, studentId } = req.params;
      const { versionId } = req.body;  // ✅ 추가

      await this.classSectionService.removeStudentFromClass(
        classSectionId,
        studentId,
        versionId  // ✅ 전달
      );

      res.json({
        success: true,
        message: '학생이 수업에서 제거되었습니다.'
      });
    } catch (error) {
      console.error('학생 제거 오류:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '학생 제거 중 오류가 발생했습니다.'
      });
    }
  }

  // 수업에 등록된 학생 목록 조회
  async getEnrolledStudents(req: Request, res: Response): Promise<void> {
    try {
      const { classSectionId } = req.params;
      const { versionId } = req.query;  // ✅ 추가 (쿼리 파라미터)

      const students = await this.classSectionService.getEnrolledStudents(
        classSectionId,
        versionId as string | undefined  // ✅ 전달
      );

      res.json({
        success: true,
        data: students,
        count: students.length
      });
    } catch (error) {
      console.error('등록 학생 목록 조회 오류:', error);
      res.status(500).json({
        success: false,
        message: '등록 학생 목록 조회 중 오류가 발생했습니다.'
      });
    }
  }

  // 수업 삭제 (계층적)
  async deleteClassSectionHierarchically(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { versionId, deleteFromAllVersions } = req.query;  // ✅ 추가

      const result = await this.classSectionService.deleteClassSectionHierarchically(
        id,
        {
          versionId: versionId as string | undefined,
          deleteFromAllVersions: deleteFromAllVersions === 'true'
        }
      );

      res.json(result);
    } catch (error) {
      console.error('수업 계층적 삭제 오류:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : '수업 계층적 삭제 중 오류가 발생했습니다.'
      });
    }
  }
}
```

---

### 2️⃣ StudentService.ts 수정 (3개 메서드)

#### 📍 **위치 1: deleteStudentHierarchically() - 라인 42-116**

**현재 코드:**
```typescript
async deleteStudentHierarchically(studentId: string): Promise<{...}> {
  return this.runTransaction(async (transaction) => {
    // ❌ 문제: 한 버전의 시간표만 삭제
    const timetableRef = this.db.collection('student_timetables').doc(studentId);
    const timetableDoc = await transaction.get(timetableRef);
    if (timetableDoc.exists) {
      transaction.delete(timetableRef);
      timetableDeleted = true;
    }
    // 다른 버전의 시간표는 고아 데이터로 남음
  });
}
```

**✅ 수정된 코드:**
```typescript
async deleteStudentHierarchically(studentId: string): Promise<{
  success: boolean;
  deletedRecords: {
    attendanceRecords: number;
    seatAssignments: number;
    studentSummary: boolean;
    timetables: number;  // ✅ 수정: 복수형으로 변경
    student: boolean;
  };
  message: string;
}> {
  try {
    const result = await this.runTransaction(async (transaction) => {
      let attendanceDeleted = 0;
      let seatAssignmentDeleted = 0;
      let studentSummaryDeleted = false;
      let timetablesDeleted = 0;  // ✅ 수정: 카운터로 변경
      let studentDeleted = false;

      // 1단계: 출석 기록 삭제
      const attendanceQuery = this.db.collection('attendance_records')
                                     .where('studentId', '==', studentId);
      const attendanceDocs = await transaction.get(attendanceQuery);
      attendanceDeleted = attendanceDocs.size;
      attendanceDocs.forEach(doc => transaction.delete(doc.ref));

      // 2단계: 좌석 배정 삭제
      const seatQuery = this.db.collection('seat_assignments')
                               .where('studentId', '==', studentId);
      const seatDocs = await transaction.get(seatQuery);
      seatAssignmentDeleted = seatDocs.size;
      seatDocs.forEach(doc => transaction.delete(doc.ref));

      // 3단계: 학생 요약 정보 삭제
      const summaryRef = this.db.collection('student_summaries').doc(studentId);
      const summaryDoc = await transaction.get(summaryRef);
      if (summaryDoc.exists) {
        transaction.delete(summaryRef);
        studentSummaryDeleted = true;
      }

      // 4단계: 학생 시간표 삭제 (✅ 수정: 모든 버전 삭제)
      const timetablesQuery = this.db.collection('student_timetables')
                                     .where('studentId', '==', studentId);
      const timetableDocs = await transaction.get(timetablesQuery);
      timetablesDeleted = timetableDocs.size;
      timetableDocs.forEach(doc => transaction.delete(doc.ref));

      // 5단계: 학생 삭제
      const studentRef = this.db.collection('students').doc(studentId);
      const studentDoc = await transaction.get(studentRef);
      if (studentDoc.exists) {
        transaction.delete(studentRef);
        studentDeleted = true;
      }

      return {
        attendanceDeleted,
        seatAssignmentDeleted,
        studentSummaryDeleted,
        timetablesDeleted,
        studentDeleted
      };
    });

    return {
      success: true,
      deletedRecords: {
        attendanceRecords: result.attendanceDeleted,
        seatAssignments: result.seatAssignmentDeleted,
        studentSummary: result.studentSummaryDeleted,
        timetables: result.timetablesDeleted,  // ✅ 수정
        student: result.studentDeleted
      },
      message: `학생과 관련 데이터가 모두 삭제되었습니다 (시간표 ${result.timetablesDeleted}개 포함).`
    };
  } catch (error) {
    console.error('학생 계층적 삭제 실패:', error);
    throw new Error(`학생 계층적 삭제 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
}
```

**변경 사항:**
1. ✅ `.doc(studentId)` → `.where('studentId', '==', studentId)` 쿼리로 변경
2. ✅ 모든 버전의 시간표를 조회하여 삭제
3. ✅ 반환 타입 수정: `timetable: boolean` → `timetables: number`

---

#### 📍 **위치 2-3: getStudentDependencies() - 라인 280-310**

**현재 코드:**
```typescript
async getStudentDependencies(studentId: string): Promise<StudentDependencies> {
  // ❌ 문제: 한 버전의 시간표만 확인
  const timetableDoc = await this.db.collection('student_timetables').doc(studentId).get();
  const hasTimetable = timetableDoc.exists;

  // ... 다른 의존성 확인 ...

  return {
    hasTimetable,  // 부정확
    // ...
  };
}
```

**✅ 수정된 코드:**
```typescript
async getStudentDependencies(studentId: string): Promise<StudentDependencies> {
  try {
    // ✅ 수정: 모든 버전의 시간표 개수 확인
    const timetablesQuery = this.db.collection('student_timetables')
                                   .where('studentId', '==', studentId);
    const timetableDocs = await timetablesQuery.get();
    const timetableCount = timetableDocs.size;

    // 출석 기록 확인
    const attendanceQuery = this.db.collection('attendance_records')
                                   .where('studentId', '==', studentId);
    const attendanceDocs = await attendanceQuery.get();
    const attendanceCount = attendanceDocs.size;

    // 좌석 배정 확인
    const seatQuery = this.db.collection('seat_assignments')
                             .where('studentId', '==', studentId);
    const seatDocs = await seatQuery.get();
    const seatAssignmentCount = seatDocs.size;

    // 학생 요약 정보 확인
    const summaryDoc = await this.db.collection('student_summaries').doc(studentId).get();
    const hasSummary = summaryDoc.exists;

    return {
      hasTimetable: timetableCount > 0,
      timetableCount,  // ✅ 추가: 시간표 개수
      hasAttendanceRecords: attendanceCount > 0,
      attendanceCount,
      hasSeatAssignments: seatAssignmentCount > 0,
      seatAssignmentCount,
      hasSummary,
      totalRelatedRecords: timetableCount + attendanceCount + seatAssignmentCount + (hasSummary ? 1 : 0)
    };
  } catch (error) {
    console.error('학생 의존성 확인 실패:', error);
    throw new Error('학생 의존성 확인 중 오류가 발생했습니다.');
  }
}
```

**변경 사항:**
1. ✅ `.doc(studentId)` → `.where('studentId', '==', studentId)` 쿼리로 변경
2. ✅ `timetableCount` 필드 추가
3. ✅ `totalRelatedRecords`에 모든 버전의 시간표 포함

**타입 정의 수정 필요:**
```typescript
// shared/types/student.types.ts
export interface StudentDependencies {
  hasTimetable: boolean
  timetableCount: number  // ✅ 추가
  hasAttendanceRecords: boolean
  attendanceCount: number
  hasSeatAssignments: boolean
  seatAssignmentCount: number
  hasSummary: boolean
  totalRelatedRecords: number
}
```

---

### 3️⃣ TeacherService.ts 수정 (2개 위치)

#### 📍 **위치 1-2: deleteTeacherHierarchically(), getTeacherDependencies() - 라인 160, 263**

**✅ 수정된 코드:**

```typescript
// functions/src/services/TeacherService.ts

async deleteTeacherHierarchically(teacherId: string): Promise<{...}> {
  return this.runTransaction(async (transaction) => {
    // ... 수업 삭제 로직 ...

    // ✅ 수정: 영향받는 학생 시간표 업데이트 (모든 버전)
    const studentTimetableQuery = this.db.collection('student_timetables');
    const studentTimetableDocs = await transaction.get(studentTimetableQuery);

    let studentTimetablesUpdated = 0;

    for (const doc of studentTimetableDocs.docs) {
      const timetableData = doc.data();
      if (timetableData.classSectionIds && Array.isArray(timetableData.classSectionIds)) {
        // 삭제될 수업들이 포함되어 있는지 확인
        const updatedClassSectionIds = timetableData.classSectionIds.filter(
          (id: string) => !affectedClassSectionIds.includes(id)
        );

        if (updatedClassSectionIds.length !== timetableData.classSectionIds.length) {
          transaction.update(doc.ref, {
            classSectionIds: updatedClassSectionIds,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          studentTimetablesUpdated++;
        }
      }
    }

    // ... 나머지 로직 ...
  });
}

private async getAffectedStudentCountByTeacherId(teacherId: string): Promise<number> {
  try {
    // 해당 교사의 모든 수업 조회
    const classSections = await this.searchClassSections({ teacherId });
    const classSectionIds = classSections.map(cs => cs.id);

    if (classSectionIds.length === 0) {
      return 0;
    }

    // ✅ 수정: 모든 버전의 시간표에서 영향받는 학생 조회
    const studentTimetableQuery = this.db.collection('student_timetables');
    const studentTimetables = await this.search(studentTimetableQuery);

    // 고유한 학생 ID 추출
    const affectedStudentIds = new Set<string>();

    studentTimetables.forEach(timetable => {
      if (timetable.classSectionIds && Array.isArray(timetable.classSectionIds)) {
        const hasAffectedClass = timetable.classSectionIds.some(
          (id: string) => classSectionIds.includes(id)
        );
        if (hasAffectedClass) {
          affectedStudentIds.add(timetable.studentId);
        }
      }
    });

    return affectedStudentIds.size;
  } catch (error) {
    console.error('영향받는 학생 수 조회 실패:', error);
    return 0;
  }
}
```

**참고:**
- TeacherService는 모든 버전을 처리하는 것이 맞습니다 (교사 삭제 시 모든 버전의 수업이 삭제됨)
- 별도 versionId 파라미터 불필요
- 중복 학생 카운트 방지를 위해 Set 사용

---

### 4️⃣ ClassroomService.ts 수정 (2개 위치)

ClassroomService도 TeacherService와 동일한 패턴으로 수정합니다.

**✅ 수정 방법:**
```typescript
// functions/src/services/ClassroomService.ts

// TeacherService와 동일한 패턴으로 수정
// - deleteClassroomHierarchically(): 모든 버전의 시간표 업데이트
// - getAffectedStudentCountByClassroomId(): Set으로 고유 학생 카운트
```

---

### 5️⃣ StudentTimetableService.ts 수정 (1개 메서드)

#### 📍 **위치: getStudentTimetableByStudentId() - 라인 32-39**

이 메서드는 계획서의 "StudentTimetableService.ts (수정)" 섹션에 이미 포함되어 있습니다. 해당 섹션을 참고하세요.

**핵심 변경사항:**
```typescript
// 기존 메서드는 활성 버전을 자동으로 조회하도록 수정
async getStudentTimetableByStudentId(studentId: string): Promise<StudentTimetable | null> {
  const versionService = new TimetableVersionService();
  const activeVersion = await versionService.getActiveVersion();

  if (!activeVersion) {
    throw new Error('No active timetable version found');
  }

  return this.getStudentTimetableByStudentIdAndVersion(studentId, activeVersion.id);
}

// 새로운 메서드 추가
async getStudentTimetableByStudentIdAndVersion(
  studentId: string,
  versionId: string
): Promise<StudentTimetable | null> {
  const query = this.db.collection(this.collectionName)
    .where('studentId', '==', studentId)
    .where('versionId', '==', versionId)
    .limit(1);

  const timetables = await this.search<StudentTimetable>(query);
  return timetables.length > 0 ? timetables[0] : null;
}
```

---

### 6️⃣ 프론트엔드 API 수정 (3개 메서드)

#### 📍 **위치: frontend/src/services/api.ts - 라인 207-233**

**현재 코드:**
```typescript
async getStudentTimetable(studentId: string): Promise<ApiResponse<StudentTimetableResponse['data']>> {
  return this.request(API_ENDPOINTS.STUDENT_TIMETABLES.GET_BY_STUDENT(studentId));
}

async addClassToStudentTimetable(studentId: string, classSectionId: string) {
  return this.request(
    API_ENDPOINTS.STUDENT_TIMETABLES.ADD_CLASS(studentId),
    { method: 'POST', body: JSON.stringify({ classSectionId }) }
  );
}

async removeClassFromStudentTimetable(studentId: string, classSectionId: string) {
  return this.request(
    API_ENDPOINTS.STUDENT_TIMETABLES.REMOVE_CLASS(studentId),
    { method: 'POST', body: JSON.stringify({ classSectionId }) }
  );
}
```

**✅ 수정된 코드:**
```typescript
// ===== 학생 시간표 관리 API =====

// ✅ 수정: versionId 파라미터 추가 (선택적)
async getStudentTimetable(
  studentId: string,
  versionId?: string
): Promise<ApiResponse<StudentTimetableResponse['data']>> {
  if (versionId) {
    // 특정 버전 조회
    return this.request(
      API_ENDPOINTS.STUDENT_TIMETABLES.GET_BY_STUDENT_AND_VERSION(studentId, versionId)
    );
  } else {
    // 활성 버전 조회 (기존 엔드포인트, 백엔드가 활성 버전 반환)
    return this.request(
      API_ENDPOINTS.STUDENT_TIMETABLES.GET_BY_STUDENT(studentId)
    );
  }
}

// ✅ 수정: versionId 파라미터 추가 (선택적)
async addClassToStudentTimetable(
  studentId: string,
  classSectionId: string,
  versionId?: string
): Promise<ApiResponse<StudentTimetableResponse['data']>> {
  if (versionId) {
    // 특정 버전에 추가
    return this.request(
      API_ENDPOINTS.STUDENT_TIMETABLES.ADD_CLASS_BY_VERSION(studentId, versionId),
      {
        method: 'POST',
        body: JSON.stringify({ classSectionId })
      }
    );
  } else {
    // 활성 버전에 추가 (기존 엔드포인트)
    return this.request(
      API_ENDPOINTS.STUDENT_TIMETABLES.ADD_CLASS(studentId),
      {
        method: 'POST',
        body: JSON.stringify({ classSectionId })
      }
    );
  }
}

// ✅ 수정: versionId 파라미터 추가 (선택적)
async removeClassFromStudentTimetable(
  studentId: string,
  classSectionId: string,
  versionId?: string
): Promise<ApiResponse<StudentTimetableResponse['data']>> {
  if (versionId) {
    // 특정 버전에서 제거
    return this.request(
      API_ENDPOINTS.STUDENT_TIMETABLES.REMOVE_CLASS_BY_VERSION(studentId, versionId),
      {
        method: 'POST',
        body: JSON.stringify({ classSectionId })
      }
    );
  } else {
    // 활성 버전에서 제거 (기존 엔드포인트)
    return this.request(
      API_ENDPOINTS.STUDENT_TIMETABLES.REMOVE_CLASS(studentId),
      {
        method: 'POST',
        body: JSON.stringify({ classSectionId })
      }
    );
  }
}
```

**변경 사항:**
1. ✅ 모든 메서드에 `versionId?: string` 파라미터 추가
2. ✅ versionId가 있으면 버전별 엔드포인트 사용
3. ✅ versionId가 없으면 기존 엔드포인트 사용 (하위 호환성)
4. ✅ 백엔드 엔드포인트 상수는 "⚠️ 프로젝트 적합성 검증" 섹션에 이미 정의됨

---

### 7️⃣ 프론트엔드 컴포넌트 수정 (14개 파일)

#### 핵심 수정 전략

모든 시간표 관련 컴포넌트에 **버전 선택 기능**을 통합해야 합니다.

**수정 우선순위:**
1. 🔴 **필수**: `useStudentTimetable.ts` (Hook)
2. 🔴 **필수**: `TimetableEditModal.tsx` (시간표 편집)
3. 🔴 **필수**: `SchedulePage.tsx` (시간표 페이지)
4. 🟡 **중간**: `BulkTimetableDownloadModal.tsx` (대량 다운로드)
5. 🟢 **낮음**: 기타 10개 파일

---

#### 📍 **파일 1: useStudentTimetable.ts 수정**

**✅ 수정된 코드:**

```typescript
// frontend/src/features/schedule/hooks/useStudentTimetable.ts

import { useState, useCallback, useEffect } from 'react'
import type { Student } from '@shared/types'
import type { TimetableData, StudentTimetableResponse } from '../types/timetable.types'
import { apiService } from '../../../services/api'
import { useTimetableVersion } from '../../../contexts/TimetableVersionContext'  // ✅ 추가

const createEmptyTimetableData = (): TimetableData => {
  return {
    classSections: [],
    conflicts: [],
    metadata: {
      totalClasses: 0,
      totalStudents: 0,
      totalTeachers: 0
    }
  }
}

interface UseStudentTimetableReturn {
  timetableData: TimetableData
  isLoading: boolean
  error: string | null
  loadTimetable: (student: Student, versionId?: string) => Promise<void>  // ✅ 수정
  clearError: () => void
}

export const useStudentTimetable = (): UseStudentTimetableReturn => {
  const [timetableData, setTimetableData] = useState<TimetableData>(createEmptyTimetableData())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ 추가: 버전 컨텍스트 사용
  const { selectedVersion, activeVersion } = useTimetableVersion()

  // ✅ 수정: versionId 파라미터 추가
  const loadTimetable = useCallback(async (student: Student, versionId?: string) => {
    if (!student) {
      setTimetableData(createEmptyTimetableData())
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // ✅ 수정: versionId 결정 (우선순위: 인자 > selectedVersion > activeVersion)
      const targetVersionId = versionId || selectedVersion?.id || activeVersion?.id

      if (!targetVersionId) {
        console.warn('⚠️ 활성 시간표 버전이 없습니다.')
        setTimetableData(createEmptyTimetableData())
        setError('활성 시간표 버전이 없습니다. 관리자에게 문의하세요.')
        return
      }

      console.log(`📚 ${student.name}의 시간표 로드 시작 (버전: ${targetVersionId})...`)

      // ✅ 수정: versionId 전달
      const response = await apiService.getStudentTimetable(student.id, targetVersionId)

      if (response.success && response.data) {
        console.log('✅ 시간표 데이터 로드 성공:', response.data)

        const timetableData: TimetableData = {
          classSections: response.data.classSections || [],
          conflicts: [],
          metadata: {
            totalClasses: response.data.classSections?.length || 0,
            totalStudents: 1,
            totalTeachers: 0
          }
        }

        setTimetableData(timetableData)
        console.log(`📚 ${student.name}의 시간표 로드 완료`, {
          classCount: response.data.classSections?.length || 0,
          versionId: targetVersionId
        })

      } else {
        // 시간표가 없는 경우 - 빈 시간표로 처리
        if (response.message?.includes('not found') ||
            response.message?.includes('Student timetable not found') ||
            response.message?.includes('Resource not found')) {
          console.log(`📚 ${student.name}의 시간표가 없습니다 (버전: ${targetVersionId}). 빈 시간표를 표시합니다.`)
          setTimetableData(createEmptyTimetableData())
          setError(null)
        } else {
          const errorMessage = response.message || '시간표를 불러오는데 실패했습니다.'
          setError(errorMessage)
          console.error('❌ 시간표 로드 실패:', errorMessage)
          setTimetableData(createEmptyTimetableData())
        }
      }

    } catch (err) {
      const errorMessage = '시간표를 불러오는 중 오류가 발생했습니다.'
      setError(errorMessage)
      console.error('❌ 시간표 로드 오류:', err)
      setTimetableData(createEmptyTimetableData())
    } finally {
      setIsLoading(false)
    }
  }, [selectedVersion, activeVersion])  // ✅ 수정: 의존성 배열에 추가

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    timetableData,
    isLoading,
    error,
    loadTimetable,
    clearError
  }
}
```

**변경 사항:**
1. ✅ `useTimetableVersion` 컨텍스트 사용
2. ✅ `loadTimetable`에 `versionId` 파라미터 추가
3. ✅ 버전 우선순위: 인자 > selectedVersion > activeVersion
4. ✅ 버전이 없으면 에러 표시
5. ✅ `apiService.getStudentTimetable`에 versionId 전달

---

#### 📍 **파일 2: TimetableEditModal.tsx 수정**

**✅ 수정된 코드:**

```typescript
// frontend/src/features/schedule/components/TimetableEditModal.tsx

import { useTimetableVersion } from '../../../contexts/TimetableVersionContext'  // ✅ 추가
import { TimetableVersionSelector } from '../../../components/TimetableVersionSelector'  // ✅ 추가

export const TimetableEditModal: React.FC<TimetableEditModalProps> = ({
  student,
  visible,
  onClose
}) => {
  const { timetableData, loadTimetable, isLoading } = useStudentTimetable()
  const { selectedVersion } = useTimetableVersion()  // ✅ 추가

  // ✅ 수정: 버전 변경 시 시간표 재로드
  useEffect(() => {
    if (visible && student && selectedVersion) {
      loadTimetable(student, selectedVersion.id)
    }
  }, [visible, student, selectedVersion, loadTimetable])

  // ✅ 수정: 수업 추가 시 versionId 전달
  const handleAddClass = async (classSectionId: string) => {
    if (!student || !selectedVersion) return

    try {
      await apiService.addClassToStudentTimetable(
        student.id,
        classSectionId,
        selectedVersion.id  // ✅ 추가
      )
      // 시간표 재로드
      await loadTimetable(student, selectedVersion.id)
    } catch (error) {
      console.error('수업 추가 실패:', error)
    }
  }

  // ✅ 수정: 수업 제거 시 versionId 전달
  const handleRemoveClass = async (classSectionId: string) => {
    if (!student || !selectedVersion) return

    try {
      await apiService.removeClassFromStudentTimetable(
        student.id,
        classSectionId,
        selectedVersion.id  // ✅ 추가
      )
      // 시간표 재로드
      await loadTimetable(student, selectedVersion.id)
    } catch (error) {
      console.error('수업 제거 실패:', error)
    }
  }

  return (
    <Modal visible={visible} onCancel={onClose} width={1200}>
      <div className="timetable-edit-modal">
        {/* ✅ 추가: 버전 선택기 */}
        <div className="modal-header">
          <h2>{student?.name}의 시간표 편집</h2>
          <TimetableVersionSelector />
        </div>

        {/* 기존 시간표 UI */}
        <div className="timetable-content">
          {/* ... */}
        </div>
      </div>
    </Modal>
  )
}
```

**변경 사항:**
1. ✅ `TimetableVersionSelector` 컴포넌트 추가
2. ✅ `selectedVersion` 변경 시 자동 재로드
3. ✅ 수업 추가/제거 시 `versionId` 전달

---

#### 📍 **파일 3: SchedulePage.tsx 수정**

**✅ 수정된 코드:**

```typescript
// frontend/src/features/schedule/pages/SchedulePage.tsx

import { TimetableVersionSelector } from '../../../components/TimetableVersionSelector'  // ✅ 추가
import { useTimetableVersion } from '../../../contexts/TimetableVersionContext'  // ✅ 추가

export const SchedulePage: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const { timetableData, loadTimetable, isLoading } = useStudentTimetable()
  const { selectedVersion } = useTimetableVersion()  // ✅ 추가

  // ✅ 수정: 버전 변경 시 시간표 재로드
  useEffect(() => {
    if (selectedStudent && selectedVersion) {
      loadTimetable(selectedStudent, selectedVersion.id)
    }
  }, [selectedStudent, selectedVersion, loadTimetable])

  return (
    <div className="schedule-page">
      <div className="page-header">
        <h1>시간표 관리</h1>
        {/* ✅ 추가: 버전 선택기 */}
        <TimetableVersionSelector />
      </div>

      <div className="page-content">
        {/* 학생 선택기 */}
        <StudentSelector
          onSelect={setSelectedStudent}
          selected={selectedStudent}
        />

        {/* 시간표 표시 */}
        {selectedStudent && (
          <div className="timetable-container">
            <h2>
              {selectedStudent.name}의 시간표
              {selectedVersion && (
                <span className="version-badge">
                  {selectedVersion.displayName}
                </span>
              )}
            </h2>
            <TimetableGrid data={timetableData} />
          </div>
        )}
      </div>
    </div>
  )
}
```

**변경 사항:**
1. ✅ 페이지 헤더에 `TimetableVersionSelector` 추가
2. ✅ `selectedVersion` 변경 시 자동 재로드
3. ✅ 현재 보고 있는 버전 표시

---

#### 📍 **파일 4-14: 나머지 컴포넌트 수정 가이드**

나머지 10개 파일도 동일한 패턴으로 수정합니다:

**수정 체크리스트:**
- [ ] `useTimetableVersion` 훅 import 및 사용
- [ ] API 호출 시 `selectedVersion.id` 전달
- [ ] 버전 변경 시 데이터 재로드 (useEffect)
- [ ] UI에 현재 버전 표시 (선택적)

**파일 목록:**
1. `BulkTimetableDownloadModal.tsx` - 대량 다운로드 시 버전 선택
2. `bulkTimetableImageGenerator.ts` - 이미지 생성 시 버전 정보 포함
3. `TimetableLoadingModal.tsx` - 로딩 시 버전 표시
4. `AddStudentPage.tsx` - 학생 추가 시 기본 버전 설정
5. `ClassModals.tsx` - 수업 모달에서 버전 고려
6. `DeleteConfirmationModal.tsx` - 삭제 확인 시 버전 정보 표시
7. `timetableTransformers.ts` - 데이터 변환 시 버전 필드 유지
8. `timetableService.ts` - 서비스 레이어에 versionId 전달
9. `index.ts` (hooks) - 훅 export
10. `index.ts` (components) - 컴포넌트 export

---

### 8️⃣ 데이터베이스 구조 변경

#### 문서 ID 구조 변경

**현재:**
```
student_timetables/
  {studentId}/  ← studentId가 문서 ID
    studentId: "abc123"
    classSectionIds: [...]
```

**변경 후:**
```
student_timetables/
  {autoGeneratedId}/  ← Firestore 자동 생성 ID
    id: "timetable_xyz"
    studentId: "abc123"
    versionId: "version1"
    classSectionIds: [...]
```

**마이그레이션 스크립트 수정 필요:**

계획서의 "데이터 마이그레이션" 섹션에 이미 Batch 처리가 포함되어 있지만, 문서 ID 변경 로직을 명확히 해야 합니다.

**✅ 수정된 마이그레이션 스크립트:**

```typescript
// migration/migrate-to-version-system.ts

async function migrateStudentTimetables() {
  const db = admin.firestore()
  const BATCH_SIZE = 500

  // 1단계: 기본 버전 생성
  const defaultVersionRef = db.collection('timetable_versions').doc()
  await defaultVersionRef.set({
    id: defaultVersionRef.id,
    name: 'default',
    displayName: '기본 시간표',
    startDate: admin.firestore.Timestamp.fromDate(new Date('2024-01-01')),
    endDate: admin.firestore.Timestamp.fromDate(new Date('2024-12-31')),
    isActive: true,
    description: '마이그레이션으로 생성된 기본 시간표',
    order: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  })

  console.log(`✅ 기본 버전 생성 완료: ${defaultVersionRef.id}`)

  // 2단계: 기존 시간표 조회
  const oldTimetablesSnapshot = await db.collection('student_timetables').get()
  console.log(`📊 마이그레이션 대상: ${oldTimetablesSnapshot.size}개 시간표`)

  if (oldTimetablesSnapshot.empty) {
    console.log('⚠️ 마이그레이션할 시간표가 없습니다.')
    return
  }

  // 3단계: 기존 데이터를 새 구조로 변환
  const oldTimetables = oldTimetablesSnapshot.docs.map(doc => ({
    oldDocId: doc.id,  // ✅ 기존 문서 ID 저장 (나중에 삭제용)
    data: doc.data()
  }))

  // 4단계: Batch 처리로 새 문서 생성
  let createdCount = 0
  const docsToDelete: string[] = []

  for (let i = 0; i < oldTimetables.length; i += BATCH_SIZE) {
    const batch = db.batch()
    const chunk = oldTimetables.slice(i, i + BATCH_SIZE)

    for (const oldTimetable of chunk) {
      // ✅ 새 문서 생성 (자동 생성 ID)
      const newDocRef = db.collection('student_timetables').doc()

      batch.set(newDocRef, {
        id: newDocRef.id,
        studentId: oldTimetable.data.studentId,
        versionId: defaultVersionRef.id,  // ✅ 기본 버전 할당
        classSectionIds: oldTimetable.data.classSectionIds || [],
        notes: oldTimetable.data.notes || '',
        createdAt: oldTimetable.data.createdAt || admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      })

      // ✅ 삭제할 문서 ID 목록에 추가
      docsToDelete.push(oldTimetable.oldDocId)
    }

    await batch.commit()
    createdCount += chunk.length
    console.log(`✅ 배치 ${Math.floor(i / BATCH_SIZE) + 1} 완료 (${chunk.length}개 생성)`)
  }

  console.log(`✅ 새 시간표 생성 완료: ${createdCount}개`)

  // 5단계: 기존 문서 삭제 (Batch 처리)
  console.log(`🗑️ 기존 문서 삭제 시작 (${docsToDelete.length}개)...`)

  for (let i = 0; i < docsToDelete.length; i += BATCH_SIZE) {
    const batch = db.batch()
    const chunk = docsToDelete.slice(i, i + BATCH_SIZE)

    for (const docId of chunk) {
      const docRef = db.collection('student_timetables').doc(docId)
      batch.delete(docRef)
    }

    await batch.commit()
    console.log(`✅ 배치 ${Math.floor(i / BATCH_SIZE) + 1} 삭제 완료 (${chunk.length}개)`)
  }

  console.log(`✅ 마이그레이션 완료!`)
  console.log(`📊 통계:`)
  console.log(`  - 생성된 시간표: ${createdCount}개`)
  console.log(`  - 삭제된 시간표: ${docsToDelete.length}개`)
  console.log(`  - 기본 버전 ID: ${defaultVersionRef.id}`)
}
```

**변경 사항:**
1. ✅ 새 문서는 자동 생성 ID 사용
2. ✅ 기존 문서 ID를 추적하여 나중에 삭제
3. ✅ Batch 처리로 성능 최적화
4. ✅ 생성과 삭제를 분리하여 안전성 확보

---

### 9️⃣ Firestore 인덱스 설정

계획서의 "⚠️ 프로젝트 적합성 검증" 섹션에 이미 포함되어 있지만, 위에서 추가된 쿼리를 위한 인덱스를 추가합니다.

**✅ 최종 firestore.indexes.json:**

```json
{
  "indexes": [
    {
      "collectionGroup": "student_timetables",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "studentId", "order": "ASCENDING" },
        { "fieldPath": "versionId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "student_timetables",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "versionId", "order": "ASCENDING" },
        { "fieldPath": "classSectionIds", "arrayConfig": "CONTAINS" }
      ]
    },
    {
      "collectionGroup": "student_timetables",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "classSectionIds", "arrayConfig": "CONTAINS" },
        { "fieldPath": "versionId", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "timetable_versions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isActive", "order": "ASCENDING" },
        { "fieldPath": "order", "order": "ASCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

### 🎯 수정 작업 순서

**Phase 1: 백엔드 Service 수정 (1주)**
1. TimetableVersionService 구현 (신규)
2. StudentTimetableService 수정
3. ClassSectionService 수정 (6개 메서드)
4. StudentService 수정 (3개 메서드)
5. TeacherService 수정 (2개 위치)
6. ClassroomService 수정 (2개 위치)

**Phase 2: 백엔드 Controller/Routes 수정 (3일)**
1. TimetableVersionController 구현 (신규)
2. StudentTimetableController 수정
3. ClassSectionController 수정
4. Routes 파일 수정 및 등록

**Phase 3: 프론트엔드 API 수정 (2일)**
1. api.ts 수정 (3개 메서드)
2. API_ENDPOINTS 상수 추가

**Phase 4: 프론트엔드 컴포넌트 수정 (1주)**
1. TimetableVersionContext 구현 (신규)
2. TimetableVersionSelector 구현 (신규)
3. useStudentTimetable 수정
4. TimetableEditModal 수정
5. SchedulePage 수정
6. 나머지 11개 파일 수정

**Phase 5: 데이터 마이그레이션 및 테스트 (3일)**
1. 마이그레이션 스크립트 실행
2. Firestore 인덱스 배포
3. 통합 테스트

**총 예상 기간: 2.5주**

---

## ⚠️ 구현 시 주의사항 및 오류 방지

계획서대로 구현 시 발생할 수 있는 **5가지 주요 오류**와 해결 방법입니다.

---

### 🔴 주의사항 1: 트랜잭션 내 비동기 Service 호출 금지 (치명적)

#### 문제 코드

앞서 제시한 코드 중 **트랜잭션 내에서 TimetableVersionService를 호출하는 부분**은 오류 발생 위험이 있습니다:

```typescript
// ❌ 잘못된 예: 트랜잭션 내에서 다른 Service 호출
await this.runTransaction(async (transaction) => {
  // ...
  const versionService = new TimetableVersionService();
  const activeVersion = await versionService.getActiveVersion();  // ❌ 데드락 발생 가능
  if (activeVersion) {
    studentTimetableQuery = studentTimetableQuery.where('versionId', '==', activeVersion.id);
  }
  // ...
});
```

#### 원인
- **Firestore 트랜잭션 제약**: 트랜잭션 내에서는 모든 읽기가 쓰기보다 먼저 수행되어야 함
- `versionService.getActiveVersion()`은 내부적으로 Firestore 쿼리를 실행
- 이미 시작된 트랜잭션 컨텍스트에서 새로운 쿼리를 실행하면 **데드락** 발생 가능

#### ✅ 올바른 수정 방법

**트랜잭션 시작 전에 버전 조회:**

```typescript
async deleteClassSectionHierarchically(
  classSectionId: string,
  options?: { versionId?: string; deleteFromAllVersions?: boolean }
): Promise<{...}> {
  try {
    // ✅ 트랜잭션 시작 전에 버전 조회
    let targetVersionId: string | undefined = options?.versionId;

    if (!targetVersionId && !options?.deleteFromAllVersions) {
      const versionService = new TimetableVersionService();
      const activeVersion = await versionService.getActiveVersion();
      if (activeVersion) {
        targetVersionId = activeVersion.id;
      }
    }

    // 트랜잭션 시작 (이미 조회된 versionId 사용)
    const result = await this.runTransaction(async (transaction) => {
      let studentTimetableQuery: admin.firestore.Query = this.db.collection('student_timetables');

      // ✅ 이미 조회된 versionId 사용 (추가 쿼리 없음)
      if (targetVersionId) {
        studentTimetableQuery = studentTimetableQuery.where('versionId', '==', targetVersionId);
      }

      const studentTimetableDocs = await transaction.get(studentTimetableQuery);
      // ... 나머지 로직
    });

    return result;
  } catch (error) {
    // ...
  }
}
```

#### 영향받는 메서드 (모두 수정 필요)
1. `ClassSectionService.deleteClassSectionHierarchically()`
2. `ClassSectionService.getAffectedStudentCountByClassSectionId()`
3. `ClassSectionService.addStudentToClass()`
4. `ClassSectionService.removeStudentFromClass()`
5. `ClassSectionService.getEnrolledStudents()`

---

### 🔴 주의사항 2: 순환 의존성 방지

#### 문제
```
ClassSectionService
  └─> TimetableVersionService (getActiveVersion 호출)
        └─> StudentTimetableService (import 시)
              └─> ClassSectionService (순환 발생)
```

#### ✅ 해결 방법

**TimetableVersionService는 다른 Service를 import하지 않고 독립적으로 구현:**

```typescript
// ✅ 좋은 예: TimetableVersionService.ts
import * as admin from 'firebase-admin';
import { BaseService } from './BaseService';
import type { TimetableVersion } from '@shared/types';

export class TimetableVersionService extends BaseService {
  constructor() {
    super('timetable_versions');
  }

  async getActiveVersion(): Promise<TimetableVersion | null> {
    const query = this.db.collection(this.collectionName)
      .where('isActive', '==', true)
      .limit(1);

    const versions = await this.search<TimetableVersion>(query);
    return versions.length > 0 ? versions[0] : null;
  }

  // ❌ 다른 Service import 금지 (순환 의존 발생)
  // private studentTimetableService: StudentTimetableService;  // 절대 금지!

  // ✅ 필요하면 Firestore 쿼리를 직접 작성
  async bulkInitializeTimetables(versionId: string): Promise<number> {
    // StudentTimetableService를 import하지 않고 직접 쿼리
    const studentsSnapshot = await this.db.collection('students').get();
    // ...
  }
}
```

---

### 🔴 주의사항 3: API 엔드포인트 상수 추가 필수

#### 문제
계획서에서 사용하는 새로운 엔드포인트가 `shared/constants/api.constants.ts`에 없음

**현재 누락된 엔드포인트:**
- `GET_BY_STUDENT_AND_VERSION(studentId, versionId)`
- `ADD_CLASS_BY_VERSION(studentId, versionId)`
- `REMOVE_CLASS_BY_VERSION(studentId, versionId)`
- `TIMETABLE_VERSIONS.*` (전체 섹션 누락)

#### ✅ 추가 필요한 코드

**`shared/constants/api.constants.ts` 파일 수정:**

```typescript
export const API_ENDPOINTS = {
  // ... 기존 엔드포인트 ...

  // 학생 시간표 관리 API (수정)
  STUDENT_TIMETABLES: {
    // ... 기존 엔드포인트 ...

    // ✅ 추가 필요
    GET_BY_STUDENT_AND_VERSION: (studentId: string, versionId: string) =>
      `/api/student-timetables/student/${studentId}/version/${versionId}`,
    ADD_CLASS_BY_VERSION: (studentId: string, versionId: string) =>
      `/api/student-timetables/student/${studentId}/version/${versionId}/add-class`,
    REMOVE_CLASS_BY_VERSION: (studentId: string, versionId: string) =>
      `/api/student-timetables/student/${studentId}/version/${versionId}/remove-class`
  },

  // ✅ 새로운 섹션 추가
  TIMETABLE_VERSIONS: {
    // GET /api/timetable-versions - 모든 버전 조회
    GET_ALL: '/api/timetable-versions',
    // GET /api/timetable-versions/:id - 특정 버전 조회
    GET_BY_ID: (id: string) => `/api/timetable-versions/${id}`,
    // POST /api/timetable-versions - 버전 생성
    CREATE: '/api/timetable-versions',
    // PUT /api/timetable-versions/:id - 버전 수정
    UPDATE: (id: string) => `/api/timetable-versions/${id}`,
    // DELETE /api/timetable-versions/:id - 버전 삭제
    DELETE: (id: string) => `/api/timetable-versions/${id}`,
    // GET /api/timetable-versions/active - 활성 버전 조회
    GET_ACTIVE: '/api/timetable-versions/active',
    // POST /api/timetable-versions/:id/activate - 버전 활성화
    ACTIVATE: (id: string) => `/api/timetable-versions/${id}/activate`,
    // GET /api/timetable-versions/sorted - 정렬된 버전 목록
    GET_ALL_SORTED: '/api/timetable-versions/sorted',
    // POST /api/timetable-versions/:id/bulk-initialize - 일괄 초기화
    BULK_INITIALIZE: (versionId: string) => `/api/timetable-versions/${versionId}/bulk-initialize`,
    // POST /api/timetable-versions/:id/copy - 버전 복사
    COPY: (sourceId: string) => `/api/timetable-versions/${sourceId}/copy`,
    // GET /api/timetable-versions/:id/stats - 버전 통계
    GET_STATS: (versionId: string) => `/api/timetable-versions/${versionId}/stats`
  },

  // ... 나머지 엔드포인트 ...
};
```

---

### 🟡 주의사항 4: 타입 정의 수정

#### 문제
`StudentDependencies` 타입에 `timetableCount` 필드 누락

#### ✅ 수정 필요

**`shared/types/student.types.ts` 파일 수정:**

```typescript
export interface StudentDependencies {
  hasTimetable: boolean
  timetableCount: number  // ✅ 추가 필요
  hasAttendanceRecords: boolean
  attendanceCount: number
  hasSeatAssignments: boolean
  seatAssignmentCount: number
  hasSummary: boolean
  totalRelatedRecords: number
}
```

---

### 🟢 주의사항 5: 프론트엔드 컴포넌트 구현 순서

#### 문제
다른 컴포넌트가 의존하는 기반 컴포넌트를 먼저 구현해야 함

#### ✅ 올바른 구현 순서

```
1. TimetableVersionContext 구현 (신규)
   ↓
2. TimetableVersionSelector 구현 (신규)
   ↓
3. useStudentTimetable 수정 (Context 사용)
   ↓
4. 나머지 컴포넌트 수정
```

**순서를 지키지 않으면 import 오류 발생:**
```typescript
// ❌ TimetableVersionContext가 없는데 import 시도
import { useTimetableVersion } from '../../../contexts/TimetableVersionContext'
// Error: Cannot find module '../../../contexts/TimetableVersionContext'
```

---

## 🎯 수정된 구현 순서

**Phase 0: 기반 작업 (1일) - 🆕 추가**
1. ✅ `shared/constants/api.constants.ts`에 `TIMETABLE_VERSIONS` 섹션 추가
2. ✅ `shared/constants/api.constants.ts`에 `STUDENT_TIMETABLES` 버전별 엔드포인트 추가
3. ✅ `shared/types/student.types.ts`에 `timetableCount` 필드 추가
4. ✅ Firestore 인덱스 설정 파일 준비 (`firestore.indexes.json`)

**Phase 1: 백엔드 Service 수정 (1주)**
1. ✅ TimetableVersionService 구현 (독립적으로, 다른 Service import 금지)
2. ✅ StudentTimetableService 수정
3. ✅ ClassSectionService 수정 (6개 메서드, 트랜잭션 밖에서 버전 조회)
4. ✅ StudentService 수정 (3개 메서드)
5. ✅ TeacherService 수정 (2개 위치)
6. ✅ ClassroomService 수정 (2개 위치)

**Phase 2: 백엔드 Controller/Routes 수정 (3일)**
1. ✅ TimetableVersionController 구현 (신규)
2. ✅ StudentTimetableController 수정
3. ✅ ClassSectionController 수정
4. ✅ Routes 파일 수정 및 등록

**Phase 3: 프론트엔드 API 수정 (2일)**
1. ✅ api.ts 수정 (3개 메서드, 새로운 엔드포인트 사용)
2. ✅ timetableService.ts 수정 (있는 경우)

**Phase 4: 프론트엔드 컴포넌트 수정 (1주)**
1. ✅ TimetableVersionContext 구현 (신규, 우선순위 1)
2. ✅ TimetableVersionSelector 구현 (신규, 우선순위 2)
3. ✅ useStudentTimetable 수정 (Context 사용, 우선순위 3)
4. ✅ TimetableEditModal 수정
5. ✅ SchedulePage 수정
6. ✅ 나머지 11개 파일 수정

**Phase 5: 데이터 마이그레이션 및 테스트 (3일)**
1. ✅ 마이그레이션 스크립트 실행
2. ✅ Firestore 인덱스 배포 (`firebase deploy --only firestore:indexes`)
3. ✅ 통합 테스트 (트랜잭션 동작 특히 주의)

**총 예상 기간: 3주 (Phase 0 추가로 0.5주 증가)**

---

## 📋 구현 전 체크리스트

구현을 시작하기 전에 다음 항목을 확인하세요:

- [ ] Phase 0이 완료되었는가? (API 엔드포인트, 타입 정의)
- [ ] TimetableVersionService가 독립적으로 구현되었는가?
- [ ] 트랜잭션 내에서 다른 Service를 호출하지 않는가?
- [ ] 프론트엔드 기반 컴포넌트(Context, Selector)가 먼저 구현되었는가?
- [ ] Firestore 인덱스 설정이 준비되었는가?
- [ ] 마이그레이션 스크립트가 Batch 처리를 사용하는가?

---

## 참고 자료

- [Firestore 복합 인덱스 문서](https://firebase.google.com/docs/firestore/query-data/indexing)
- [React Context API 문서](https://react.dev/reference/react/useContext)
- [Ant Design 컴포넌트 문서](https://ant.design/components/overview)
- [프로젝트 CLAUDE.md](./CLAUDE.md) - 프로젝트 구조 및 규칙

---

**문서 작성일**: 2025-01-17
**최종 수정일**: 2025-01-17 (구현 시 주의사항 및 오류 방지 가이드 추가)
**작성자**: Claude Code
