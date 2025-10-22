# 수업과 선생님 버전별 관리 시스템 구현 계획 (활성 버전 기반)

## 📋 목차
1. [현재 상황 분석](#현재-상황-분석)
2. [구현 목표](#구현-목표)
3. [설계 방안](#설계-방안)
4. [데이터베이스 스키마 변경](#데이터베이스-스키마-변경)
5. [구현 단계](#구현-단계)
6. [예상 작업 시간](#예상-작업-시간)

---

## 현재 상황 분석

### 현재 데이터 구조
```
✅ StudentTimetable: versionId 필드 있음 (버전별 관리 중)
❌ ClassSection (수업): versionId 필드 없음 (모든 버전 공유)
❌ Teacher (선생님): versionId 필드 없음 (모든 버전 공유)
```

### 문제점
1. **수업 관리 문제**
   - 학기별로 수업이 변경되어도 기존 데이터를 수정해야 함
   - 이전 학기 수업 정보 유지 불가
   - 수업 개설/폐강 이력 관리 불가

2. **선생님 관리 문제**
   - 학기별 담당 교사 변경 이력 관리 불가
   - 퇴사한 선생님 정보가 모든 학기에 영향

3. **데이터 일관성 문제**
   - 학생 시간표는 버전별인데 수업/선생님은 공유되어 불일치

---

## 구현 목표

### 핵심 목표
1. **수업(ClassSection)에 `versionId` 추가** - 학기별 수업 관리
2. **선생님(Teacher)에 `versionId` 추가** - 학기별 선생님 정보 관리
3. **활성 버전 자동 사용** - 모든 페이지에서 활성 버전 자동 적용
4. **백엔드 중심 버전 관리** - 프론트엔드 코드 변경 최소화

### 핵심 변경사항 (간소화)
- ❌ **모든 페이지에 버전 선택 드롭다운 추가** (기존 계획)
- ✅ **모든 페이지에서 활성 버전(isActive=true) 자동 사용** (새 계획)
- ✅ **versionId 파라미터 생략 시 백엔드가 자동으로 활성 버전 조회**
- ✅ **버전 전환은 시간표 버전 관리 페이지에서만 가능**

### 기대 효과
- ✅ **UI 단순화** - 버전 선택 드롭다운 불필요
- ✅ **사용자 경험 개선** - 혼란 없음 (항상 활성 버전만 보임)
- ✅ **코드 간소화** - TimetableVersionContext 통합 불필요
- ✅ **일관성** - 모든 페이지가 같은 버전 기준으로 동작
- ✅ **학기별 수업 개설/폐강 관리**
- ✅ **학기별 담당 교사 변경 이력 완벽 보존**
- ✅ **이전 학기 데이터 완전 보존**

---

## 설계 방안

### 활성 버전 기반 관리 (채택)

**개념:**
- 모든 엔티티(학생 시간표, 수업, 선생님)가 `versionId`를 가짐
- 한 번에 하나의 버전만 활성화(`isActive=true`)
- **모든 API 호출 시 versionId 생략 가능 → 백엔드가 자동으로 활성 버전 사용**
- 버전 전환은 시간표 버전 관리 페이지에서만 가능

**장점:**
- ✅ **프론트엔드 코드 변경 최소화** - 기존 API 호출 그대로 사용
- ✅ **UI 단순화** - 버전 선택 UI 불필요
- ✅ **사용자 혼란 감소** - 항상 현재 활성 버전만 표시
- ✅ **완벽한 학기별 데이터 격리**
- ✅ **이력 관리 용이**

**단점:**
- 데이터 중복 (같은 선생님이 여러 버전에 존재)
- 저장 공간 증가 (미미함)

**작동 방식:**
```typescript
// 프론트엔드 - 기존 코드 그대로 사용 가능
const classes = await apiService.getClassSections()  // versionId 생략

// 백엔드 - 자동으로 활성 버전 사용
async getClassSections(versionId?: string): Promise<ClassSection[]> {
  if (!versionId) {
    // 활성 버전 자동 조회
    const activeVersion = await this.timetableVersionService.getActiveVersion()
    versionId = activeVersion.id
  }

  return this.db.collection('classSections')
    .where('versionId', '==', versionId)
    .get()
}
```

---

## 데이터베이스 스키마 변경

### 1. ClassSection (수업) 스키마 변경

**변경 전:**
```typescript
interface ClassSection {
  id: string
  name: string
  courseId: string
  teacherId: string
  classroomId: string
  schedule: ClassSchedule[]
  maxStudents: number
  currentStudents?: number
  status: 'active' | 'inactive' | 'completed'
  // versionId 없음 ❌
}
```

**변경 후:**
```typescript
interface ClassSection {
  id: string
  versionId: string  // ✅ 추가
  name: string
  courseId: string
  teacherId: string
  classroomId: string
  schedule: ClassSchedule[]
  maxStudents: number
  currentStudents?: number
  status: 'active' | 'inactive' | 'completed'
}
```

### 2. Teacher (선생님) 스키마 변경

**변경 전:**
```typescript
interface Teacher {
  id: string
  name: string
  email?: string
  phone?: string
  subjects?: SubjectType[]
  // versionId 없음 ❌
}
```

**변경 후:**
```typescript
interface Teacher {
  id: string
  versionId: string  // ✅ 추가
  name: string
  email?: string
  phone?: string
  subjects?: SubjectType[]
}
```

### 3. Firestore 컬렉션 인덱스

**추가할 인덱스:**
```
class_sections:
  - versionId (ASC) + status (ASC)
  - versionId (ASC) + teacherId (ASC)
  - versionId (ASC) + courseId (ASC)

teachers:
  - versionId (ASC)
```

---

## 구현 단계

### Phase 1: 타입 정의 수정 (30분)

#### 파일 목록
- `shared/types/class-section.types.ts`
- `shared/types/teacher.types.ts`

#### 작업 내용
1. **ClassSection 타입 수정**
   ```typescript
   export interface ClassSection extends BaseEntity {
     id: string
     versionId: string  // 추가
     // ... 기존 필드
   }

   export interface CreateClassSectionRequest {
     versionId?: string  // 추가 (선택사항 - 없으면 활성 버전 사용)
     // ... 기존 필드
   }

   export interface ClassSectionSearchParams {
     versionId?: string  // 추가 (선택사항)
     // ... 기존 필드
   }
   ```

2. **Teacher 타입 수정**
   ```typescript
   export interface Teacher extends BaseEntity {
     id: string
     versionId: string  // 추가
     // ... 기존 필드
   }

   export interface CreateTeacherRequest {
     versionId?: string  // 추가 (선택사항 - 없으면 활성 버전 사용)
     // ... 기존 필드
   }

   export interface TeacherSearchParams {
     versionId?: string  // 추가 (선택사항)
     // ... 기존 필드
   }
   ```

3. **shared 모듈 빌드**
   ```bash
   cd shared && npx tsc
   ```

---

### Phase 2: 백엔드 서비스 레이어 수정 (2.5시간)

#### 2.1 TimetableVersionService - 활성 버전 조회 메서드 추가

**파일:** `functions/src/services/TimetableVersionService.ts`

**추가 메서드:**
```typescript
/**
 * 활성 버전 조회
 * @returns 활성화된 버전 (isActive=true)
 * @throws Error - 활성 버전이 없는 경우
 */
async getActiveVersion(): Promise<TimetableVersion> {
  const versions = await this.getAllVersions()
  const activeVersion = versions.find(v => v.isActive)

  if (!activeVersion) {
    throw new Error('No active timetable version found')
  }

  return activeVersion
}
```

#### 2.2 ClassSectionService 수정

**파일:** `functions/src/services/ClassSectionService.ts`

**수정 내용:**

1. **수업 생성 시 versionId 자동 설정**
   ```typescript
   async createClassSection(data: CreateClassSectionRequest): Promise<string> {
     // versionId가 없으면 활성 버전 사용
     let versionId = data.versionId
     if (!versionId) {
       const activeVersion = await this.timetableVersionService.getActiveVersion()
       versionId = activeVersion.id
     }

     const classSectionData: Omit<ClassSection, 'id'> = {
       ...data,
       versionId: versionId,  // ✅ 활성 버전 또는 제공된 버전
       // ... 기존 로직
     }

     return this.create(classSectionData)
   }
   ```

2. **검색 메서드에 활성 버전 자동 적용**
   ```typescript
   async searchClassSections(params: ClassSectionSearchParams): Promise<ClassSection[]> {
     // versionId가 없으면 활성 버전 사용
     let versionId = params.versionId
     if (!versionId) {
       const activeVersion = await this.timetableVersionService.getActiveVersion()
       versionId = activeVersion.id
     }

     let query: admin.firestore.Query = this.db.collection(this.collectionName)
       .where('versionId', '==', versionId)  // ✅ 항상 버전 필터 적용

     // 기존 필터들...
     if (params.teacherId) {
       query = query.where('teacherId', '==', params.teacherId)
     }

     return this.search<ClassSection>(query)
   }
   ```

3. **모든 수업 조회 메서드 수정**
   ```typescript
   async getAllClassSections(versionId?: string): Promise<ClassSection[]> {
     // versionId가 없으면 활성 버전 사용
     if (!versionId) {
       const activeVersion = await this.timetableVersionService.getActiveVersion()
       versionId = activeVersion.id
     }

     return this.db.collection(this.collectionName)
       .where('versionId', '==', versionId)
       .get()
   }
   ```

4. **🆕 상세 정보 포함 조회 메서드 추가** (문제점 #2 해결)
   ```typescript
   /**
    * 수업 목록을 상세 정보(Course, Teacher, Classroom)와 함께 조회
    * @param versionId 버전 ID (없으면 활성 버전 사용)
    * @returns 상세 정보가 포함된 수업 목록
    */
   async getClassSectionsWithDetails(versionId?: string): Promise<ClassSectionWithDetails[]> {
     // versionId가 없으면 활성 버전 사용
     if (!versionId) {
       const activeVersion = await this.timetableVersionService.getActiveVersion()
       versionId = activeVersion.id
     }

     const classSections = await this.getAllClassSections(versionId)

     // 각 수업에 대해 Course, Teacher, Classroom 조회
     const results = await Promise.all(
       classSections.map(async (cs) => {
         const [course, teacher, classroom] = await Promise.all([
           this.courseService.getById(cs.courseId),
           // ✅ 같은 버전의 teacher만 조회 (버전 검증)
           this.teacherService.getByIdAndVersion(cs.teacherId, versionId!),
           this.classroomService.getById(cs.classroomId)
         ])

         return { ...cs, course, teacher, classroom }
       })
     )

     return results
   }
   ```

#### 2.3 TeacherService 수정

**파일:** `functions/src/services/TeacherService.ts`

**수정 내용:** (ClassSectionService와 동일한 패턴)

1. **선생님 생성 시 versionId 자동 설정**
2. **검색 메서드에 활성 버전 자동 적용**
3. **모든 선생님 조회 메서드 수정**

```typescript
async createTeacher(data: CreateTeacherRequest): Promise<string> {
  let versionId = data.versionId
  if (!versionId) {
    const activeVersion = await this.timetableVersionService.getActiveVersion()
    versionId = activeVersion.id
  }

  const teacherData: Omit<Teacher, 'id'> = {
    ...data,
    versionId: versionId,
    // ... 기존 로직
  }

  return this.create(teacherData)
}

async getAllTeachers(versionId?: string): Promise<Teacher[]> {
  if (!versionId) {
    const activeVersion = await this.timetableVersionService.getActiveVersion()
    versionId = activeVersion.id
  }

  return this.db.collection(this.collectionName)
    .where('versionId', '==', versionId)
    .get()
}

/**
 * 🆕 버전 검증 포함 선생님 조회 (문제점 #3 해결)
 * @param id 선생님 ID
 * @param versionId 버전 ID
 * @returns 같은 버전의 선생님, 버전 불일치 시 null
 */
async getByIdAndVersion(id: string, versionId: string): Promise<Teacher | null> {
  const teacher = await this.getById<Teacher>(id)

  if (!teacher || teacher.versionId !== versionId) {
    return null
  }

  return teacher
}
```

---

### Phase 3: 백엔드 API 엔드포인트 수정 (1.5시간)

#### 3.1 ClassSectionController 수정

**파일:** `functions/src/controllers/ClassSectionController.ts`

**핵심 변경사항:**
- 모든 API에서 versionId를 선택사항으로 받음
- versionId가 없으면 서비스 레이어에서 자동으로 활성 버전 사용

**수정 내용:**

```typescript
// GET /api/class-section - 모든 수업 조회
async getAllClassSections(req: Request, res: Response): Promise<void> {
  try {
    // versionId는 선택사항 (없으면 활성 버전 사용)
    const versionId = req.query.versionId as string | undefined

    const classSections = await this.classSectionService.getAllClassSections(versionId)

    res.status(200).json({
      success: true,
      data: classSections,
      meta: {
        count: classSections.length
      }
    })
  } catch (error) {
    console.error('Error fetching class sections:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}

// POST /api/class-section - 수업 생성
async createClassSection(req: Request, res: Response): Promise<void> {
  try {
    const data: CreateClassSectionRequest = req.body
    // versionId는 선택사항 - 서비스 레이어에서 처리

    const id = await this.classSectionService.createClassSection(data)

    res.status(201).json({
      success: true,
      data: { id },
      message: 'Class section created successfully'
    })
  } catch (error) {
    // ... 에러 처리
  }
}

// GET /api/class-section - 수업 검색
async searchClassSections(req: Request, res: Response): Promise<void> {
  try {
    const params: ClassSectionSearchParams = {
      versionId: req.query.versionId as string | undefined,  // 선택사항
      teacherId: req.query.teacherId as string,
      courseId: req.query.courseId as string,
      status: req.query.status as any
    }

    const classSections = await this.classSectionService.searchClassSections(params)

    res.status(200).json({
      success: true,
      data: classSections
    })
  } catch (error) {
    // ... 에러 처리
  }
}

// 🆕 GET /api/class-sections/with-details - 상세 정보 포함 수업 조회 (문제점 #2 해결)
async getClassSectionsWithDetails(req: Request, res: Response): Promise<void> {
  try {
    // versionId는 선택사항 (없으면 활성 버전 사용)
    const versionId = req.query.versionId as string | undefined

    const classSections = await this.classSectionService.getClassSectionsWithDetails(versionId)

    res.status(200).json({
      success: true,
      data: classSections,
      meta: {
        count: classSections.length
      }
    })
  } catch (error) {
    console.error('Error fetching class sections with details:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
```

#### 3.2 TeacherController 수정

**파일:** `functions/src/controllers/TeacherController.ts`

**수정 내용:** (ClassSectionController와 동일한 패턴)

```typescript
// GET /api/teachers - 모든 선생님 조회
async getAllTeachers(req: Request, res: Response): Promise<void> {
  try {
    const versionId = req.query.versionId as string | undefined

    const teachers = await this.teacherService.getAllTeachers(versionId)

    res.status(200).json({
      success: true,
      data: teachers
    })
  } catch (error) {
    // ... 에러 처리
  }
}

// POST /api/teachers - 선생님 생성
async createTeacher(req: Request, res: Response): Promise<void> {
  try {
    const data: CreateTeacherRequest = req.body

    const id = await this.teacherService.createTeacher(data)

    res.status(201).json({
      success: true,
      data: { id },
      message: 'Teacher created successfully'
    })
  } catch (error) {
    // ... 에러 처리
  }
}
```

---

### Phase 4: 버전 관리 기능 확장 (2.5시간)

#### 4.1 TimetableVersionService - 수업/선생님 복사 로직 추가

**파일:** `functions/src/services/TimetableVersionService.ts`

**수정 내용:**

```typescript
/**
 * 🔄 버전 복사 - 수정된 순서 (문제점 #1 해결)
 *
 * 복사 순서가 중요합니다:
 * 1. 선생님 복사 → teacherIdMap 생성
 * 2. 수업 복사 → classIdMap 생성 (teacherIdMap 사용)
 * 3. 학생 시간표 복사 (classIdMap 사용)
 *
 * ❌ 잘못된 순서: 학생 시간표 → 선생님 → 수업
 *    (학생 시간표의 classSectionIds가 아직 존재하지 않는 수업 ID 참조)
 *
 * ✅ 올바른 순서: 선생님 → 수업 → 학생 시간표
 *    (ID 매핑을 사용하여 참조 무결성 유지)
 */
async copyVersion(
  sourceVersionId: string,
  targetData: CreateTimetableVersionRequest
): Promise<string> {
  // 1. 새 버전 생성
  const newVersionId = await this.createVersion(targetData)

  const db = admin.firestore()
  const BATCH_SIZE = 500

  // ✅ 2. 선생님 복사 (teacherIdMap 반환)
  const teacherIdMap = await this.copyTeachers(sourceVersionId, newVersionId, db, BATCH_SIZE)

  // ✅ 3. 수업 복사 (teacherIdMap 사용, classIdMap 반환)
  const classIdMap = await this.copyClassSections(sourceVersionId, newVersionId, teacherIdMap, db, BATCH_SIZE)

  // ✅ 4. 학생 시간표 복사 (classIdMap 사용)
  await this.copyStudentTimetables(sourceVersionId, newVersionId, classIdMap, db, BATCH_SIZE)

  return newVersionId
}

// 선생님 복사 메서드 (ID 매핑 반환)
private async copyTeachers(
  sourceVersionId: string,
  targetVersionId: string,
  db: admin.firestore.Firestore,
  batchSize: number
): Promise<Map<string, string>> {
  console.log(`👨‍🏫 선생님 복사 시작: ${sourceVersionId} → ${targetVersionId}`)

  const sourceTeachersSnapshot = await db
    .collection('teachers')
    .where('versionId', '==', sourceVersionId)
    .get()

  const teacherIdMap = new Map<string, string>()  // 기존 ID → 새 ID 매핑
  const batches: admin.firestore.WriteBatch[] = []
  let currentBatch = db.batch()
  let operationCount = 0
  let copiedCount = 0

  sourceTeachersSnapshot.docs.forEach((doc) => {
    const sourceTeacher = doc.data()
    const oldTeacherId = doc.id
    const newTeacherRef = db.collection('teachers').doc()
    const newTeacherId = newTeacherRef.id

    // ID 매핑 저장
    teacherIdMap.set(oldTeacherId, newTeacherId)

    currentBatch.set(newTeacherRef, {
      ...sourceTeacher,
      versionId: targetVersionId,
      createAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    operationCount++
    copiedCount++

    if (operationCount >= batchSize) {
      batches.push(currentBatch)
      currentBatch = db.batch()
      operationCount = 0
    }
  })

  if (operationCount > 0) {
    batches.push(currentBatch)
  }

  await Promise.all(batches.map(batch => batch.commit()))
  console.log(`✅ ${copiedCount}명 선생님 복사 완료 (ID 매핑: ${teacherIdMap.size}개)`)

  return teacherIdMap
}

// 🔄 수업 복사 메서드 (teacherIdMap 사용, classIdMap 반환) - 문제점 #1 해결
private async copyClassSections(
  sourceVersionId: string,
  targetVersionId: string,
  teacherIdMap: Map<string, string>,
  db: admin.firestore.Firestore,
  batchSize: number
): Promise<Map<string, string>> {  // ✅ 반환 타입 변경
  console.log(`📚 수업 복사 시작: ${sourceVersionId} → ${targetVersionId}`)

  const sourceClassSectionsSnapshot = await db
    .collection('class_sections')
    .where('versionId', '==', sourceVersionId)
    .get()

  const classIdMap = new Map<string, string>()  // ✅ classIdMap 생성
  const batches: admin.firestore.WriteBatch[] = []
  let currentBatch = db.batch()
  let operationCount = 0
  let copiedCount = 0

  sourceClassSectionsSnapshot.docs.forEach((doc) => {
    const sourceClassSection = doc.data()
    const oldClassId = doc.id  // ✅ 기존 ID 저장
    const newClassSectionRef = db.collection('class_sections').doc()
    const newClassId = newClassSectionRef.id  // ✅ 새 ID 저장

    // ✅ classIdMap에 매핑 추가
    classIdMap.set(oldClassId, newClassId)

    // ✅ teacherId 변환 (같은 버전의 선생님 ID로 매핑)
    const newTeacherId = teacherIdMap.get(sourceClassSection.teacherId) || sourceClassSection.teacherId

    currentBatch.set(newClassSectionRef, {
      ...sourceClassSection,
      versionId: targetVersionId,
      teacherId: newTeacherId,  // ✅ 변환된 ID 사용
      createAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    operationCount++
    copiedCount++

    if (operationCount >= batchSize) {
      batches.push(currentBatch)
      currentBatch = db.batch()
      operationCount = 0
    }
  })

  if (operationCount > 0) {
    batches.push(currentBatch)
  }

  await Promise.all(batches.map(batch => batch.commit()))
  console.log(`✅ ${copiedCount}개 수업 복사 완료 (ID 매핑: ${classIdMap.size}개)`)

  return classIdMap  // ✅ classIdMap 반환
}

// 🔄 학생 시간표 복사 메서드 (classIdMap 사용) - 문제점 #1 해결
private async copyStudentTimetables(
  sourceVersionId: string,
  targetVersionId: string,
  classIdMap: Map<string, string>,  // ✅ 파라미터 추가
  db: admin.firestore.Firestore,
  batchSize: number
): Promise<void> {
  console.log(`📝 학생 시간표 복사 시작: ${sourceVersionId} → ${targetVersionId}`)

  const sourceTimetablesSnapshot = await db
    .collection('student_timetables')
    .where('versionId', '==', sourceVersionId)
    .get()

  const batches: admin.firestore.WriteBatch[] = []
  let currentBatch = db.batch()
  let operationCount = 0
  let copiedCount = 0

  sourceTimetablesSnapshot.docs.forEach((doc) => {
    const sourceTimetable = doc.data()
    const newTimetableRef = db.collection('student_timetables').doc()

    // ✅ classSectionIds 변환 (새 버전의 수업 ID로 매핑)
    const newClassSectionIds = sourceTimetable.classSectionIds
      ? sourceTimetable.classSectionIds.map(
          (oldId: string) => classIdMap.get(oldId) || oldId
        )
      : []

    currentBatch.set(newTimetableRef, {
      ...sourceTimetable,
      versionId: targetVersionId,
      classSectionIds: newClassSectionIds,  // ✅ 변환된 ID 사용
      createAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    })

    operationCount++
    copiedCount++

    if (operationCount >= batchSize) {
      batches.push(currentBatch)
      currentBatch = db.batch()
      operationCount = 0
    }
  })

  if (operationCount > 0) {
    batches.push(currentBatch)
  }

  await Promise.all(batches.map(batch => batch.commit()))
  console.log(`✅ ${copiedCount}개 학생 시간표 복사 완료`)
}
```

---

### Phase 5: 프론트엔드 수정 (1시간)

> **핵심**: 프론트엔드는 거의 수정 불필요. 기존 API 호출 그대로 사용 가능.
> **개선사항**: 버전 활성화 시 페이지 새로고침 대신 이벤트 기반 갱신 (문제점 #5 해결)

#### 5.1 API 서비스 수정 (선택사항)

**파일:** `frontend/src/services/api.ts`

**변경 없음** - 기존 메서드 그대로 사용:
```typescript
// 기존 메서드 그대로 사용 가능 (백엔드가 자동으로 활성 버전 사용)
async getClassSections(): Promise<ApiResponse<ClassSection[]>> {
  return this.request<ClassSection[]>(API_ENDPOINTS.CLASS_SECTIONS.GET_ALL)
}

async getClassSectionsWithDetails(): Promise<ApiResponse<any[]>> {
  return this.request<any[]>('/api/class-sections/with-details')
}

async getTeachers(): Promise<ApiResponse<Teacher[]>> {
  return this.request<Teacher[]>(API_ENDPOINTS.TEACHERS.GET_ALL)
}

// 수업/선생님 생성 시에도 versionId 생략 가능 (백엔드가 활성 버전 사용)
async createClassSection(data: CreateClassSectionRequest): Promise<ApiResponse<{ id: string }>> {
  return this.request<{ id: string }>(API_ENDPOINTS.CLASS_SECTIONS, {
    method: 'POST',
    body: JSON.stringify(data)  // versionId 없어도 OK
  })
}
```

#### 5.2 프론트엔드 페이지 수정

**변경 없음** - 모든 기존 페이지 그대로 동작:
- `ClassPage.tsx` - 수정 불필요
- `StudentsPage.tsx` - 수정 불필요
- `TimetableEditModal.tsx` - 수정 불필요
- 기타 모든 페이지 - 수정 불필요

**이유**: 백엔드가 자동으로 활성 버전의 데이터를 반환하므로 프론트엔드는 기존 코드 그대로 사용 가능.

#### 5.3 🔄 버전 전환 시 이벤트 기반 갱신 (문제점 #5 해결)

**파일:** `frontend/src/contexts/TimetableVersionContext.tsx`

**수정 내용:**
```typescript
/**
 * 버전 활성화 - 이벤트 기반 갱신 (페이지 새로고침 없음)
 *
 * 문제점: window.location.reload()는 다음 문제를 발생시킵니다:
 * - 사용자 작업 내용 손실
 * - UX 저하 (로딩 시간)
 * - 폼 입력 중 데이터 손실
 *
 * 해결: 커스텀 이벤트를 발생시켜 각 페이지가 자동으로 데이터를 새로고침
 */
const activateVersion = async (versionId: string) => {
  try {
    await apiService.activateTimetableVersion(versionId)

    // 목록 새로고침
    const response = await apiService.getTimetableVersions()
    if (response.success && response.data) {
      setVersions(response.data)

      const newActiveVersion = response.data.find(v => v.isActive)
      setActiveVersion(newActiveVersion || null)

      if (newActiveVersion) {
        setSelectedVersion(newActiveVersion)
      }

      // ✅ 페이지 새로고침 대신 이벤트 발생
      window.dispatchEvent(new CustomEvent('activeVersionChanged', {
        detail: { version: newActiveVersion }
      }))

      console.log('✅ 활성 버전 변경:', newActiveVersion?.displayName)
    }
  } catch (error) {
    console.error('Failed to activate version:', error)
    throw error
  }
}
```

**각 페이지에서 이벤트 리스닝 (예시):**
```typescript
// ClassPage.tsx, StudentsPage.tsx 등
useEffect(() => {
  const handleVersionChange = () => {
    console.log('🔄 활성 버전이 변경되었습니다. 데이터를 다시 로드합니다.')
    // 데이터 다시 로드
    loadClasses()
  }

  window.addEventListener('activeVersionChanged', handleVersionChange)
  return () => window.removeEventListener('activeVersionChanged', handleVersionChange)
}, [loadClasses])
```

**장점:**
- ✅ 사용자 작업 내용 유지
- ✅ 빠른 전환 (네트워크 요청만)
- ✅ 부드러운 UX
- ✅ 필요한 페이지만 갱신

---

### Phase 6: 데이터 마이그레이션 (1.5시간)

> **통합 방식**: 기존 시간표 버전 관리 페이지의 "데이터 마이그레이션" 기능을 확장하여 학생 시간표뿐만 아니라 수업/선생님도 함께 마이그레이션합니다.
> **⚠️ 중요**: 서비스 레이어 우회하여 직접 Firestore 접근 (문제점 #2, #4 해결)

#### 6.1 마이그레이션 API 엔드포인트 수정

**파일:** `functions/src/controllers/TimetableVersionController.ts`

**1. 🔄 마이그레이션 상태 확인 API 수정 (직접 Firestore 접근):**

```typescript
/**
 * GET /api/timetable-versions/migration/status
 *
 * 문제점: 서비스 레이어가 자동으로 활성 버전 필터링
 * - getAllClassSections()를 호출하면 versionId가 있는 데이터만 반환
 * - versionId 없는 데이터(마이그레이션 대상)를 찾을 수 없음
 *
 * 해결: Firestore에 직접 접근하여 필터 없이 전체 데이터 조회
 */
async checkMigrationStatus(req: Request, res: Response): Promise<void> {
  try {
    const db = admin.firestore()

    // ✅ 직접 Firestore 접근 (서비스 레이어 우회)
    const [timetablesSnapshot, classesSnapshot, teachersSnapshot] = await Promise.all([
      db.collection('student_timetables').get(),
      db.collection('class_sections').get(),
      db.collection('teachers').get()
    ])

    // 데이터 변환
    const allTimetables = timetablesSnapshot.docs.map(doc => doc.data())
    const allClasses = classesSnapshot.docs.map(doc => doc.data())
    const allTeachers = teachersSnapshot.docs.map(doc => doc.data())

    // versionId 유무로 분류
    const timetablesWithVersion = allTimetables.filter((t: any) => t.versionId)
    const timetablesWithoutVersion = allTimetables.filter((t: any) => !t.versionId)

    const classesWithVersion = allClasses.filter((c: any) => c.versionId)
    const classesWithoutVersion = allClasses.filter((c: any) => !c.versionId)

    const teachersWithVersion = allTeachers.filter((t: any) => t.versionId)
    const teachersWithoutVersion = allTeachers.filter((t: any) => !t.versionId)

    res.status(200).json({
      success: true,
      data: {
        timetables: {
          total: allTimetables.length,
          migrated: timetablesWithVersion.length,
          unmigrated: timetablesWithoutVersion.length
        },
        classes: {
          total: allClasses.length,
          migrated: classesWithVersion.length,
          unmigrated: classesWithoutVersion.length
        },
        teachers: {
          total: allTeachers.length,
          migrated: teachersWithVersion.length,
          unmigrated: teachersWithoutVersion.length
        }
      }
    })
  } catch (error) {
    console.error('Error checking migration status:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
```

**2. 🔄 마이그레이션 실행 API 수정 (직접 Firestore 접근):**

```typescript
/**
 * POST /api/timetable-versions/migration/:versionId
 *
 * 문제점: 서비스 레이어 메서드가 활성 버전 필터링
 * - 마이그레이션 전 활성 버전이 없을 수 있음 (첫 마이그레이션)
 * - getAllClassSections() 호출 시 에러 발생
 *
 * 해결: Firestore에 직접 접근하여 전체 데이터 조회 및 업데이트
 */
async migrateTimetables(req: Request, res: Response): Promise<void> {
  try {
    const { versionId } = req.params

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

    // ✅ 1. 학생 시간표 마이그레이션 (직접 Firestore 접근)
    const timetablesSnapshot = await db.collection('student_timetables').get()
    const timetablesToMigrate = timetablesSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((t: any) => !t.versionId)

    let timetableCount = 0
    for (let i = 0; i < timetablesToMigrate.length; i += BATCH_SIZE) {
      const batch = db.batch()
      const chunk = timetablesToMigrate.slice(i, i + BATCH_SIZE)

      for (const timetable of chunk) {
        const docRef = db.collection('student_timetables').doc(timetable.id)
        batch.update(docRef, {
          versionId: versionId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
        timetableCount++
      }

      await batch.commit()
      console.log(`✅ 시간표 배치 ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length}개`)
    }

    // ✅ 2. 수업 마이그레이션 (직접 Firestore 접근)
    const classesSnapshot = await db.collection('class_sections').get()
    const classesToMigrate = classesSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((c: any) => !c.versionId)

    let classCount = 0
    for (let i = 0; i < classesToMigrate.length; i += BATCH_SIZE) {
      const batch = db.batch()
      const chunk = classesToMigrate.slice(i, i + BATCH_SIZE)

      for (const classSection of chunk) {
        const docRef = db.collection('class_sections').doc(classSection.id)
        batch.update(docRef, {
          versionId: versionId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
        classCount++
      }

      await batch.commit()
      console.log(`✅ 수업 배치 ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length}개`)
    }

    // ✅ 3. 선생님 마이그레이션 (직접 Firestore 접근)
    const teachersSnapshot = await db.collection('teachers').get()
    const teachersToMigrate = teachersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((t: any) => !t.versionId)

    let teacherCount = 0
    for (let i = 0; i < teachersToMigrate.length; i += BATCH_SIZE) {
      const batch = db.batch()
      const chunk = teachersToMigrate.slice(i, i + BATCH_SIZE)

      for (const teacher of chunk) {
        const docRef = db.collection('teachers').doc(teacher.id)
        batch.update(docRef, {
          versionId: versionId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
        teacherCount++
      }

      await batch.commit()
      console.log(`✅ 선생님 배치 ${Math.floor(i / BATCH_SIZE) + 1}: ${chunk.length}명`)
    }

    console.log(`✅ 전체 마이그레이션 완료:`)
    console.log(`  - 학생 시간표: ${timetableCount}개`)
    console.log(`  - 수업: ${classCount}개`)
    console.log(`  - 선생님: ${teacherCount}명`)

    res.status(200).json({
      success: true,
      message: `Successfully migrated to version "${version.name}"`,
      data: {
        timetablesMigrated: timetableCount,
        classesMigrated: classCount,
        teachersMigrated: teacherCount,
        versionId,
        versionName: version.name
      }
    })
  } catch (error) {
    console.error('Error migrating data:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
```

#### 6.2 프론트엔드 마이그레이션 UI 수정

**파일:** `frontend/src/features/admin/pages/TimetableVersionManagementPage.tsx`

**1. 상태 타입 수정:**

```typescript
const [migrationStats, setMigrationStats] = useState<{
  timetables: { total: number; migrated: number; unmigrated: number }
  classes: { total: number; migrated: number; unmigrated: number }
  teachers: { total: number; migrated: number; unmigrated: number }
} | null>(null)
```

**2. 마이그레이션 상태 확인 수정:**

```typescript
const checkMigrationStatus = async () => {
  try {
    console.log('🔍 마이그레이션 상태 확인 시작...')
    const response = await apiService.checkMigrationStatus()

    if (response.success && response.data) {
      const stats = {
        timetables: {
          total: response.data.timetables?.total || 0,
          migrated: response.data.timetables?.migrated || 0,
          unmigrated: response.data.timetables?.unmigrated || 0
        },
        classes: {
          total: response.data.classes?.total || 0,
          migrated: response.data.classes?.migrated || 0,
          unmigrated: response.data.classes?.unmigrated || 0
        },
        teachers: {
          total: response.data.teachers?.total || 0,
          migrated: response.data.teachers?.migrated || 0,
          unmigrated: response.data.teachers?.unmigrated || 0
        }
      }
      console.log('✅ 마이그레이션 상태:', stats)
      setMigrationStats(stats)
    }
  } catch (error) {
    console.error('❌ 마이그레이션 상태 확인 실패:', error)
    message.error('마이그레이션 상태를 확인할 수 없습니다.')
  }
}
```

**3. 마이그레이션 모달 UI 수정:**

```tsx
<Modal
  title="데이터 마이그레이션"
  open={isMigrationModalOpen}
  onCancel={() => setIsMigrationModalOpen(false)}
  footer={null}
  width={700}
>
  <div style={{ marginBottom: '24px' }}>
    <p style={{ marginBottom: '16px' }}>
      versionId가 없는 데이터를 선택한 버전으로 마이그레이션합니다.
    </p>

    {migrationStats && (
      <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
        <h4 style={{ marginBottom: '12px' }}>📊 마이그레이션 대상</h4>

        {/* 학생 시간표 */}
        <div style={{ marginBottom: '8px' }}>
          <strong>학생 시간표:</strong>
          <span style={{ marginLeft: '8px' }}>
            전체 {migrationStats.timetables.total}개 중
            <span style={{ color: '#52c41a', marginLeft: '4px' }}>
              완료 {migrationStats.timetables.migrated}개
            </span>,
            <span style={{ color: '#ff4d4f', marginLeft: '4px' }}>
              미완료 {migrationStats.timetables.unmigrated}개
            </span>
          </span>
        </div>

        {/* 수업 */}
        <div style={{ marginBottom: '8px' }}>
          <strong>수업:</strong>
          <span style={{ marginLeft: '8px' }}>
            전체 {migrationStats.classes.total}개 중
            <span style={{ color: '#52c41a', marginLeft: '4px' }}>
              완료 {migrationStats.classes.migrated}개
            </span>,
            <span style={{ color: '#ff4d4f', marginLeft: '4px' }}>
              미완료 {migrationStats.classes.unmigrated}개
            </span>
          </span>
        </div>

        {/* 선생님 */}
        <div>
          <strong>선생님:</strong>
          <span style={{ marginLeft: '8px' }}>
            전체 {migrationStats.teachers.total}명 중
            <span style={{ color: '#52c41a', marginLeft: '4px' }}>
              완료 {migrationStats.teachers.migrated}명
            </span>,
            <span style={{ color: '#ff4d4f', marginLeft: '4px' }}>
              미완료 {migrationStats.teachers.unmigrated}명
            </span>
          </span>
        </div>
      </div>
    )}
  </div>

  <div style={{ marginBottom: '16px' }}>
    <h4>마이그레이션할 버전 선택:</h4>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflow: 'auto' }}>
      {versions.map(version => (
        <Button
          key={version.id}
          type={version.isActive ? 'primary' : 'default'}
          onClick={() => handleMigrationConfirm(version)}
          block
        >
          {version.displayName}
          {version.isActive && <Tag color="green" style={{ marginLeft: 8 }}>활성</Tag>}
        </Button>
      ))}
    </div>
  </div>
</Modal>
```

---

### Phase 7: 테스트 및 검증 (1.5시간)

#### 7.1 단위 테스트

**테스트 항목:**
1. ✅ TimetableVersionService.getActiveVersion() - 활성 버전 조회
2. ✅ ClassSectionService - versionId 자동 설정
3. ✅ TeacherService - versionId 자동 설정
4. ✅ 버전 복사 시 수업/선생님 복사 및 ID 매핑

#### 7.2 통합 테스트

**테스트 시나리오:**

1. **활성 버전 자동 사용 테스트**
   ```
   1. 프론트엔드에서 versionId 없이 수업 목록 조회
   2. 백엔드가 활성 버전의 수업만 반환하는지 확인
   3. 프론트엔드에서 versionId 없이 수업 생성
   4. 활성 버전에 수업이 추가되는지 확인
   ```

2. **버전 전환 테스트**
   ```
   1. 시간표 버전 관리 페이지에서 다른 버전 활성화
   2. 페이지 새로고침 후 새 활성 버전의 데이터 표시 확인
   3. 수업 관리 페이지에서 새 버전의 수업만 표시되는지 확인
   ```

3. **데이터 마이그레이션 테스트**
   ```
   1. versionId 없는 기존 수업/선생님 확인
   2. 활성 버전으로 마이그레이션 실행
   3. 모든 데이터에 versionId가 추가되었는지 확인
   ```

4. **버전 복사 테스트**
   ```
   1. "2024-봄학기"를 복사하여 "2024-여름학기" 생성
   2. 선생님이 먼저 복사되고 ID 매핑이 생성되는지 확인
   3. 수업이 복사되고 teacherId가 올바르게 변환되는지 확인
   4. 학생 시간표가 복사되는지 확인
   ```

#### 7.3 검증 체크리스트

- [ ] 타입 정의가 올바르게 수정되었는가?
- [ ] 백엔드 API가 versionId를 자동으로 처리하는가?
- [ ] 활성 버전이 없을 때 적절한 에러가 발생하는가?
- [ ] 버전 복사 시 모든 데이터가 복사되는가?
- [ ] 버전 복사 시 teacherId가 올바르게 매핑되는가?
- [ ] 마이그레이션이 정상 동작하는가?
- [ ] 프론트엔드 기존 코드가 수정 없이 동작하는가?
- [ ] 버전 전환 시 모든 페이지가 새 버전 데이터를 표시하는가?
- [ ] 학생 시간표와 수업의 버전 일관성이 유지되는가?

---

## 예상 작업 시간

| Phase | 작업 내용 | 원래 예상 | 수정 후 | 변경 이유 |
|-------|----------|---------|---------|---------|
| 1 | 타입 정의 수정 | 30분 | 30분 | - |
| 2 | 백엔드 서비스 레이어 | 2시간 | **2.5시간** | getClassSectionsWithDetails, getByIdAndVersion 추가 |
| 3 | 백엔드 API 엔드포인트 | 1시간 | **1.5시간** | getClassSectionsWithDetails 엔드포인트 추가 |
| 4 | 버전 관리 기능 확장 | 2시간 | **2.5시간** | copyStudentTimetables classIdMap 파라미터 추가 |
| 5 | 프론트엔드 수정 | 0.5시간 | **1시간** | 이벤트 기반 갱신으로 변경 |
| 6 | 데이터 마이그레이션 | 1시간 | **1.5시간** | 직접 Firestore 접근 로직 추가 |
| 7 | 테스트 및 검증 | 1.5시간 | 1.5시간 | - |
| **총계** | | **8.5시간** | **10.5시간** | **+2시간** |

**최종 계획 비교:**
- 초기 계획 (버전 선택 UI): 11.5시간
- 활성 버전 자동 (원래): 8.5시간
- 활성 버전 자동 (문제점 해결 후): **10.5시간**
- **절감 시간**: 1시간 (11.5시간 → 10.5시간)

---

## 주의사항

### 1. 활성 버전 필수
- **항상 하나의 활성 버전(`isActive=true`)이 존재해야 함**
- 활성 버전이 없으면 모든 API가 실패
- 시스템 초기화 시 기본 활성 버전 생성 필요
- **✅ 마이그레이션**: 직접 Firestore 접근하므로 활성 버전 없어도 OK

### 2. 버전 전환 영향
- 버전을 활성화하면 모든 사용자에게 즉시 영향
- 버전 전환은 관리자만 가능하도록 권한 제어 필요

### 3. 데이터 일관성
- **학생 시간표의 classSectionIds는 같은 버전의 수업 ID만 포함해야 함**
- **✅ 버전 복사 순서 준수**: 선생님 → 수업 → 학생 시간표
- **✅ ID 매핑**: teacherIdMap, classIdMap을 사용하여 참조 무결성 유지

### 4. 마이그레이션 순서
```
1. 백엔드 코드 배포
2. 활성 버전 확인 또는 생성
3. 수업/선생님 마이그레이션 실행
4. 데이터 검증
5. 프론트엔드 배포 (변경 없어도 확인)
```

### 5. 롤백 계획
- 마이그레이션 전 Firestore 백업
- 문제 발생 시 versionId 필드만 제거하면 이전 상태로 복구 가능

### 6. 성능 고려사항
- Firestore 인덱스 생성 필수
- 버전별 조회 시 복합 인덱스 필요
- 대량 데이터 복사 시 Batch 처리 (500개씩)

---

## 🎯 해결된 문제점 요약

### 문제점 분석 (ACTIVE_VERSION_PLAN_REVIEW.md)
1. ✅ **버전 복사 순서** - 선생님 → 수업 → 학생 시간표 (classIdMap 사용)
2. ✅ **마이그레이션 API** - 직접 Firestore 접근
3. ✅ **getClassSectionsWithDetails()** - 메서드 및 엔드포인트 추가
4. ✅ **마이그레이션 전 활성 버전 부재** - 직접 Firestore 접근으로 해결
5. ✅ **페이지 새로고침** - 이벤트 기반 갱신으로 변경
6. ℹ️ **Classroom 버전 관리** - 현재 계획 유지 (물리적 공간)

---

## 구현 후 기대 효과

### 1. 사용자 경험
- ✅ **UI 단순화** - 버전 선택 UI 불필요, 혼란 감소
- ✅ **즉시 사용 가능** - 항상 현재 활성 버전으로 자동 작동
- ✅ **버전 전환 용이** - 관리자가 한 번 활성화하면 모든 사용자에게 적용
- ✅ **부드러운 전환** - 페이지 새로고침 없이 이벤트 기반 갱신

### 2. 데이터 관리
- ✅ **학기별 수업 개설/폐강 이력 완벽 보존**
- ✅ **학기별 담당 교사 변경 이력 관리**
- ✅ **학생-수업-선생님 데이터 일관성 보장**

### 3. 개발 효율성
- ✅ **프론트엔드 코드 변경 최소화** - 기존 코드 대부분 재사용
- ✅ **백엔드 중심 관리** - 버전 로직이 서비스 레이어에 집중
- ✅ **유지보수 용이** - 버전 관련 로직이 명확하게 분리

### 4. 운영 효율성
- ✅ **새 학기 시작 시 기존 데이터 복사로 빠른 준비**
- ✅ **이전 학기 데이터 조회 가능**
- ✅ **학기별 통계 및 분석 가능**

---

## 다음 단계

구현 완료 후 고려할 추가 기능:
1. **버전 간 수업 비교 기능** - 학기별 수업 변경사항 확인
2. **버전별 통계 대시보드** - 학기별 수업 수, 학생 수 등
3. **자동 버전 활성화** - 날짜 기반 자동 학기 전환
4. **버전 아카이브** - 오래된 버전 읽기 전용 보관

---

## 문의 및 지원

구현 중 문제 발생 시:
1. 각 Phase별로 단계적 진행
2. 각 단계 완료 후 테스트 수행
3. 문제 발생 시 이전 단계로 롤백 가능
