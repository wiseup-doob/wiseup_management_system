# 활성 버전 기반 계획 검토 및 문제점 분석

> VERSION_BASED_CLASS_TEACHER_PLAN.md (활성 버전 기반)의 구현 가능성 검토

## ✅ 해결되는 문제점

### 1. 프론트엔드 코드 변경 최소화 ✅
**기존 이슈**: VERSION_ADDITIONAL_ISSUES.md의 이슈 #9, #10
- ClassPage의 TimetableVersionContext 통합 불필요
- TimetableEditModal의 versionId 파라미터 추가 불필요
- **백엔드가 자동으로 활성 버전 사용**

### 2. API 호출 코드 그대로 사용 가능 ✅
**기존 이슈**: VERSION_ADDITIONAL_ISSUES.md의 이슈 #13
- `apiService.getClassSections()` - versionId 생략 가능
- `apiService.getTeachers()` - versionId 생략 가능
- **백엔드에서 자동으로 활성 버전 필터링**

### 3. UI 복잡도 감소 ✅
**기존 이슈**: VERSION_ADDITIONAL_ISSUES.md의 전체
- 버전 선택 드롭다운 불필요
- 사용자 혼란 감소
- **항상 활성 버전만 표시**

---

## ⚠️ 여전히 존재하는 문제점

### 문제 1: getAllClassSections() 메서드 호출 시 무한 루프 위험 ⚠️

**위치**: `functions/src/services/ClassSectionService.ts`

**계획서 코드**:
```typescript
async getAllClassSections(versionId?: string): Promise<ClassSection[]> {
  if (!versionId) {
    const activeVersion = await this.timetableVersionService.getActiveVersion()
    versionId = activeVersion.id
  }

  return this.db.collection(this.collectionName)
    .where('versionId', '==', versionId)
    .get()
}
```

**문제**:
- `checkMigrationStatus()` API가 `getAllClassSections()`를 versionId 없이 호출 (VERSION_BASED_CLASS_TEACHER_PLAN.md:724)
- 마이그레이션 전에는 versionId가 없는 데이터 확인이 목적
- **하지만 getAllClassSections()가 자동으로 활성 버전 필터링하면 versionId 없는 데이터를 찾을 수 없음**

**영향**:
```typescript
// Phase 6: 마이그레이션 상태 확인 (계획서 line 723-726)
const allClassSections = await this.classSectionService.getAllClassSections()
const classesWithVersion = allClassSections.filter((c: any) => c.versionId)
const classesWithoutVersion = allClassSections.filter((c: any) => !c.versionId)
// ❌ classesWithoutVersion는 항상 빈 배열 (활성 버전 필터링 때문)
```

**해결방안**:
```typescript
// 옵션 1: 마이그레이션 전용 메서드 추가
async getAllClassSectionsWithoutFilter(): Promise<ClassSection[]> {
  return this.db.collection(this.collectionName).get()
}

// 옵션 2: 특별한 플래그로 필터 우회
async getAllClassSections(versionId?: string, skipFilter = false): Promise<ClassSection[]> {
  if (skipFilter) {
    return this.db.collection(this.collectionName).get()
  }

  if (!versionId) {
    const activeVersion = await this.timetableVersionService.getActiveVersion()
    versionId = activeVersion.id
  }

  return this.db.collection(this.collectionName)
    .where('versionId', '==', versionId)
    .get()
}

// 옵션 3: 마이그레이션 API에서 직접 Firestore 접근
async checkMigrationStatus(req: Request, res: Response): Promise<void> {
  const db = admin.firestore()

  // 직접 Firestore 접근 (서비스 레이어 우회)
  const allClassSectionsSnapshot = await db.collection('class_sections').get()
  const allClassSections = allClassSectionsSnapshot.docs.map(doc => doc.data())

  const classesWithVersion = allClassSections.filter((c: any) => c.versionId)
  const classesWithoutVersion = allClassSections.filter((c: any) => !c.versionId)
}
```

**권장**: 옵션 3 (마이그레이션 API에서 직접 Firestore 접근)
- 마이그레이션은 일회성 작업
- 서비스 레이어 메서드에 복잡한 플래그 추가 불필요
- 명확한 의도 표현

---

### 문제 2: getClassSectionsWithDetails() 메서드 미정의 ⚠️

**위치**: `frontend/src/services/api.ts:679`, `TimetableEditModal.tsx:107`

**현재 상황**:
- `getClassSectionsWithDetails()`는 상세 정보(Course, Teacher, Classroom) 포함
- 계획서에는 이 메서드의 수정 방법이 명시되지 않음

**문제**:
```typescript
// 프론트엔드 (TimetableEditModal.tsx:107)
apiService.getClassSectionsWithDetails()  // versionId 없이 호출

// 백엔드는 어떻게 처리?
// 1. 활성 버전 자동 적용? → 백엔드 라우트/컨트롤러 수정 필요
// 2. 그대로 전체 조회? → 버전 격리 실패
```

**영향**:
- 시간표 편집 모달에서 모든 버전의 수업이 혼합 표시
- 또는 백엔드 수정 누락 시 버전 필터링 실패

**해결방안**:
```typescript
// 백엔드: ClassSectionController에 새 메서드 추가
async getClassSectionsWithDetails(req: Request, res: Response): Promise<void> {
  try {
    // versionId 선택사항 (없으면 활성 버전 사용)
    const versionId = req.query.versionId as string | undefined

    let effectiveVersionId = versionId
    if (!effectiveVersionId) {
      const activeVersion = await this.versionService.getActiveVersion()
      effectiveVersionId = activeVersion.id
    }

    // 버전 필터링 적용하여 조회
    const classSections = await this.classSectionService.getClassSectionsWithDetails(effectiveVersionId)

    res.status(200).json({
      success: true,
      data: classSections
    })
  } catch (error) {
    // ... 에러 처리
  }
}

// 백엔드: ClassSectionService
async getClassSectionsWithDetails(versionId: string): Promise<ClassSectionWithDetails[]> {
  const classSections = await this.getAllClassSections(versionId)

  // 각 수업에 대해 Course, Teacher, Classroom 조회
  const results = await Promise.all(
    classSections.map(async (cs) => {
      const [course, teacher, classroom] = await Promise.all([
        this.courseService.getById(cs.courseId),
        this.teacherService.getByIdAndVersion(cs.teacherId, versionId),  // ✅ 같은 버전의 teacher
        this.classroomService.getById(cs.classroomId)
      ])

      return { ...cs, course, teacher, classroom }
    })
  )

  return results
}
```

**권장**:
1. 백엔드 `/api/class-sections/with-details` 라우트에 활성 버전 자동 적용 추가
2. `ClassSectionService.getClassSectionsWithDetails(versionId)` 메서드 추가
3. Teacher 조회 시 versionId 검증 추가

---

### 문제 3: 마이그레이션 전 활성 버전 부재 시 에러 🚨

**위치**: Phase 6 - 데이터 마이그레이션

**시나리오**:
```
1. 시스템에 아직 활성 버전이 없는 상태
2. 관리자가 첫 버전 생성 및 활성화
3. 마이그레이션 실행
4. ❌ 마이그레이션 중 getActiveVersion() 호출 시 에러 발생
```

**문제 코드**:
```typescript
// 마이그레이션 전 모든 수업 조회 필요
const allClassSections = await this.classSectionService.getAllClassSections()
// ↓ getAllClassSections()가 내부적으로 getActiveVersion() 호출
// ↓ 마이그레이션 전에는 versionId가 없어서 활성 버전도 없을 수 있음
// ❌ Error: No active timetable version found
```

**해결방안**:
```typescript
// 마이그레이션 API는 직접 Firestore 접근으로 수정 (문제 1의 해결방안과 동일)
async migrateTimetables(req: Request, res: Response): Promise<void> {
  const { versionId } = req.params
  const db = admin.firestore()

  // 1. 버전 존재 여부 확인
  const version = await this.versionService.getVersionById(versionId)
  if (!version) {
    res.status(404).json({ success: false, error: 'Version not found' })
    return
  }

  // 2. 직접 Firestore 접근 (서비스 레이어 우회)
  const allClassSectionsSnapshot = await db.collection('class_sections').get()
  const classesToMigrate = allClassSectionsSnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter((c: any) => !c.versionId)

  // 3. 배치 업데이트
  // ...
}
```

---

### 문제 4: Teacher/Classroom도 버전별로 관리해야 하는가? 🤔

**현재 계획**:
- ✅ Teacher: versionId 추가 (학기별 선생님 정보 관리)
- ❌ Classroom: versionId 없음

**잠재적 문제**:
```typescript
// 수업 생성 시
const classSection = {
  versionId: 'v1',
  teacherId: 'teacher_v1',  // ✅ 같은 버전
  classroomId: 'classroom_001',  // ❌ 버전 없음 - 모든 버전 공유
}

// 시나리오 1: Classroom이 삭제된 경우
// - 2024-봄학기: classroom_001 사용 중
// - 관리자가 classroom_001 삭제
// - 2024-봄학기 수업 조회 시 classroom 정보 조회 실패

// 시나리오 2: Classroom 정보가 변경된 경우
// - 2024-봄학기: classroom_001 (수용 인원 30명)
// - 2024-여름학기: classroom_001 (수용 인원 50명으로 변경)
// - 2024-봄학기 조회 시 잘못된 수용 인원 표시
```

**해결방안**:
```typescript
// 옵션 1: Classroom도 버전별로 관리
interface Classroom {
  id: string
  versionId: string  // 추가
  name: string
  capacity: number
}

// 옵션 2: Classroom은 변경되지 않는다고 가정 (현재 계획)
// - Classroom은 물리적 공간이므로 버전과 무관
// - 단, Classroom 삭제 시 참조 무결성 검증 필요
```

**권장**: 옵션 2 (현재 계획 유지)
- Classroom은 물리적 공간으로 버전과 무관
- Classroom 삭제 시 해당 classroom을 사용하는 수업 확인 필요
- 필요 시 나중에 버전별 관리로 확장 가능

---

### 문제 5: 버전 복사 시 학생 시간표의 classSectionIds 매핑 누락 🚨

**위치**: Phase 4 - copyVersion()

**계획서 코드**:
```typescript
async copyVersion(sourceVersionId, targetData): Promise<string> {
  // 1. 새 버전 생성
  const newVersionId = await this.createVersion(targetData)

  // 2. 학생 시간표 복사
  await this.copyStudentTimetables(sourceVersionId, newVersionId, db, BATCH_SIZE)

  // 3. 선생님 복사 (ID 매핑 생성)
  const teacherIdMap = await this.copyTeachers(sourceVersionId, newVersionId, db, BATCH_SIZE)

  // 4. 수업 복사 (teacherIdMap 사용)
  await this.copyClassSections(sourceVersionId, newVersionId, teacherIdMap, db, BATCH_SIZE)

  return newVersionId
}
```

**문제**:
- 학생 시간표를 먼저 복사 (step 2)
- 수업을 나중에 복사 (step 4)
- **학생 시간표의 classSectionIds는 복사 시점에 아직 존재하지 않는 수업 ID를 참조**

**시나리오**:
```
원본 버전 (v1):
- 수업: class_001 (수학)
- 학생 시간표: { studentId: 's1', classSectionIds: ['class_001'] }

복사 과정:
1. 학생 시간표 복사 → { studentId: 's1', classSectionIds: ['class_001'], versionId: 'v2' }
   ❌ class_001은 v1의 수업 ID인데 v2 시간표가 참조
2. 수업 복사 → class_002 (수학, v2)
   ✅ 새 ID 생성됨

결과:
- v2 학생 시간표가 v1의 수업 ID(class_001)를 참조
- v2의 수업(class_002)은 참조되지 않음
- ❌ 데이터 일관성 깨짐
```

**해결방안**:
```typescript
async copyVersion(sourceVersionId, targetData): Promise<string> {
  const newVersionId = await this.createVersion(targetData)
  const db = admin.firestore()
  const BATCH_SIZE = 500

  // 1. 선생님 복사 (ID 매핑 생성)
  const teacherIdMap = await this.copyTeachers(sourceVersionId, newVersionId, db, BATCH_SIZE)

  // 2. 수업 복사 (teacherIdMap 사용, classIdMap 반환)
  const classIdMap = await this.copyClassSections(sourceVersionId, newVersionId, teacherIdMap, db, BATCH_SIZE)

  // 3. 학생 시간표 복사 (classIdMap 사용하여 ID 변환)
  await this.copyStudentTimetables(sourceVersionId, newVersionId, classIdMap, db, BATCH_SIZE)

  return newVersionId
}

// copyClassSections 수정: classIdMap 반환
private async copyClassSections(
  sourceVersionId: string,
  targetVersionId: string,
  teacherIdMap: Map<string, string>,
  db: admin.firestore.Firestore,
  batchSize: number
): Promise<Map<string, string>> {  // ✅ 반환 타입 추가
  const classIdMap = new Map<string, string>()

  sourceClassSectionsSnapshot.docs.forEach((doc) => {
    const oldClassId = doc.id
    const newClassSectionRef = db.collection('class_sections').doc()
    const newClassId = newClassSectionRef.id

    // ID 매핑 저장
    classIdMap.set(oldClassId, newClassId)

    // ... 복사 로직
  })

  return classIdMap  // ✅ 반환
}

// copyStudentTimetables 수정: classIdMap 사용
private async copyStudentTimetables(
  sourceVersionId: string,
  targetVersionId: string,
  classIdMap: Map<string, string>,  // ✅ 파라미터 추가
  db: admin.firestore.Firestore,
  batchSize: number
): Promise<void> {
  sourceTimatablesSnapshot.docs.forEach((doc) => {
    const sourceTimetable = doc.data()

    // ✅ classSectionIds 변환
    const newClassSectionIds = sourceTimetable.classSectionIds.map(
      (oldId: string) => classIdMap.get(oldId) || oldId
    )

    currentBatch.set(newTimetableRef, {
      ...sourceTimetable,
      versionId: targetVersionId,
      classSectionIds: newClassSectionIds,  // ✅ 변환된 ID 사용
      // ...
    })
  })
}
```

**권장**: 복사 순서 변경 (선생님 → 수업 → 학생 시간표)

---

### 문제 6: 버전 활성화 시 페이지 새로고침으로 인한 UX 저하 ⚠️

**위치**: Phase 5 - TimetableVersionContext.tsx

**계획서 코드**:
```typescript
const activateVersion = async (versionId: string) => {
  // ...

  // ✅ 페이지 새로고침으로 모든 데이터 갱신
  window.location.reload()
}
```

**문제**:
- 페이지 전체 새로고침으로 인한 UX 저하
- 사용자가 작업 중이던 내용 손실 가능
- 로딩 시간 증가

**더 나은 방안**:
```typescript
// 옵션 1: 이벤트 기반 갱신 (추천)
const activateVersion = async (versionId: string) => {
  await apiService.activateTimetableVersion(versionId)

  const response = await apiService.getTimetableVersions()
  if (response.success && response.data) {
    setVersions(response.data)
    const newActiveVersion = response.data.find(v => v.isActive)
    setActiveVersion(newActiveVersion || null)
    setSelectedVersion(newActiveVersion)

    // ✅ 커스텀 이벤트 발생 (새로고침 없이)
    window.dispatchEvent(new CustomEvent('activeVersionChanged', {
      detail: { version: newActiveVersion }
    }))
  }
}

// 각 페이지에서 이벤트 리스닝
useEffect(() => {
  const handleVersionChange = () => {
    // 데이터 다시 로드
    loadData()
  }

  window.addEventListener('activeVersionChanged', handleVersionChange)
  return () => window.removeEventListener('activeVersionChanged', handleVersionChange)
}, [])

// 옵션 2: React Query 사용 (가장 우아함)
// - 자동 캐시 무효화
// - 자동 리페칭
// - 낙관적 업데이트
```

**권장**: 옵션 1 (커스텀 이벤트)
- 기존 코드 구조 유지
- 새로고침 없이 데이터 갱신
- 사용자 작업 내용 유지

---

## 📋 수정된 구현 순서

### Phase 2 수정: 백엔드 서비스 레이어
```typescript
// 1. TimetableVersionService.getActiveVersion() - 동일

// 2. ClassSectionService 수정
async getAllClassSections(versionId?: string): Promise<ClassSection[]> {
  if (!versionId) {
    const activeVersion = await this.timetableVersionService.getActiveVersion()
    versionId = activeVersion.id
  }

  return this.db.collection(this.collectionName)
    .where('versionId', '==', versionId)
    .get()
}

// ✅ 추가: 상세 정보 포함 조회
async getClassSectionsWithDetails(versionId?: string): Promise<ClassSectionWithDetails[]> {
  if (!versionId) {
    const activeVersion = await this.timetableVersionService.getActiveVersion()
    versionId = activeVersion.id
  }

  const classSections = await this.getAllClassSections(versionId)

  // ✅ 같은 버전의 teacher 조회
  const results = await Promise.all(
    classSections.map(async (cs) => {
      const [course, teacher, classroom] = await Promise.all([
        this.courseService.getById(cs.courseId),
        this.teacherService.getByIdAndVersion(cs.teacherId, versionId!),
        this.classroomService.getById(cs.classroomId)
      ])

      return { ...cs, course, teacher, classroom }
    })
  )

  return results
}

// ✅ 추가: 버전 검증 포함 조회
async getByIdAndVersion(id: string, versionId: string): Promise<Teacher | null> {
  const teacher = await this.getById<Teacher>(id)

  if (!teacher || teacher.versionId !== versionId) {
    return null
  }

  return teacher
}
```

### Phase 3 수정: 백엔드 API 엔드포인트
```typescript
// ClassSectionController에 추가
async getClassSectionsWithDetails(req: Request, res: Response): Promise<void> {
  try {
    const versionId = req.query.versionId as string | undefined

    const classSections = await this.classSectionService.getClassSectionsWithDetails(versionId)

    res.status(200).json({
      success: true,
      data: classSections
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

### Phase 4 수정: 버전 복사 순서 변경
```typescript
async copyVersion(sourceVersionId, targetData): Promise<string> {
  const newVersionId = await this.createVersion(targetData)
  const db = admin.firestore()
  const BATCH_SIZE = 500

  // ✅ 순서 변경
  // 1. 선생님 복사 (teacherIdMap 반환)
  const teacherIdMap = await this.copyTeachers(sourceVersionId, newVersionId, db, BATCH_SIZE)

  // 2. 수업 복사 (classIdMap 반환)
  const classIdMap = await this.copyClassSections(sourceVersionId, newVersionId, teacherIdMap, db, BATCH_SIZE)

  // 3. 학생 시간표 복사 (classIdMap 사용)
  await this.copyStudentTimetables(sourceVersionId, newVersionId, classIdMap, db, BATCH_SIZE)

  return newVersionId
}
```

### Phase 5 수정: 버전 활성화 UX 개선
```typescript
// TimetableVersionContext.tsx
const activateVersion = async (versionId: string) => {
  try {
    await apiService.activateTimetableVersion(versionId)

    const response = await apiService.getTimetableVersions()
    if (response.success && response.data) {
      setVersions(response.data)
      const newActiveVersion = response.data.find(v => v.isActive)
      setActiveVersion(newActiveVersion || null)
      setSelectedVersion(newActiveVersion)

      // ✅ 새로고침 대신 이벤트 발생
      window.dispatchEvent(new CustomEvent('activeVersionChanged', {
        detail: { version: newActiveVersion }
      }))
    }
  } catch (error) {
    console.error('Failed to activate version:', error)
    throw error
  }
}
```

### Phase 6 수정: 마이그레이션 API - 직접 Firestore 접근
```typescript
async checkMigrationStatus(req: Request, res: Response): Promise<void> {
  try {
    const db = admin.firestore()

    // ✅ 직접 Firestore 접근 (서비스 레이어 우회)
    const [timetablesSnapshot, classesSnapshot, teachersSnapshot] = await Promise.all([
      db.collection('student_timetables').get(),
      db.collection('class_sections').get(),
      db.collection('teachers').get()
    ])

    const allTimetables = timetablesSnapshot.docs.map(doc => doc.data())
    const allClasses = classesSnapshot.docs.map(doc => doc.data())
    const allTeachers = teachersSnapshot.docs.map(doc => doc.data())

    res.status(200).json({
      success: true,
      data: {
        timetables: {
          total: allTimetables.length,
          migrated: allTimetables.filter((t: any) => t.versionId).length,
          unmigrated: allTimetables.filter((t: any) => !t.versionId).length
        },
        classes: {
          total: allClasses.length,
          migrated: allClasses.filter((c: any) => c.versionId).length,
          unmigrated: allClasses.filter((c: any) => !c.versionId).length
        },
        teachers: {
          total: allTeachers.length,
          migrated: allTeachers.filter((t: any) => t.versionId).length,
          unmigrated: allTeachers.filter((t: any) => !t.versionId).length
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

async migrateTimetables(req: Request, res: Response): Promise<void> {
  // 동일하게 직접 Firestore 접근
  // ...
}
```

---

## ✅ 최종 체크리스트

### 필수 수정 사항
- [ ] **ClassSectionService.getClassSectionsWithDetails(versionId)** 메서드 추가
- [ ] **TeacherService.getByIdAndVersion(id, versionId)** 메서드 추가
- [ ] **ClassSectionController.getClassSectionsWithDetails()** 엔드포인트 추가
- [ ] **copyVersion() 순서 변경**: 선생님 → 수업 → 학생 시간표
- [ ] **copyClassSections() 반환 타입 변경**: classIdMap 반환
- [ ] **copyStudentTimetables() 파라미터 추가**: classIdMap 사용
- [ ] **마이그레이션 API**: 직접 Firestore 접근으로 수정
- [ ] **버전 활성화**: 페이지 새로고침 → 이벤트 기반 갱신

### 선택 수정 사항
- [ ] Classroom 버전별 관리 (현재는 불필요)
- [ ] React Query 도입 (더 우아한 데이터 관리)

---

## 💡 결론

**활성 버전 기반 계획은 실현 가능하지만, 6개의 중요한 문제점이 있습니다:**

1. ⚠️ **마이그레이션 API 수정 필요** (직접 Firestore 접근)
2. ⚠️ **getClassSectionsWithDetails() 메서드 추가 필요**
3. 🚨 **버전 복사 순서 변경 필수** (학생 시간표 ID 매핑)
4. 🤔 Classroom 버전 관리 여부 결정
5. ⚠️ 버전 활성화 UX 개선 (새로고침 → 이벤트)
6. 🚨 Teacher 버전 검증 메서드 추가

**이 문제들을 해결하면 계획대로 구현 가능합니다.**

**예상 추가 시간**: +1.5시간 (총 10시간)

**수정된 Phase별 시간**:
- Phase 2: 2시간 → 2.5시간 (getClassSectionsWithDetails 추가)
- Phase 4: 2시간 → 2.5시간 (ID 매핑 순서 수정)
- Phase 5: 0.5시간 → 1시간 (이벤트 기반 갱신)
- Phase 6: 1시간 → 1.5시간 (직접 Firestore 접근)
