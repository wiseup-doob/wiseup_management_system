# 학생 추가/삭제 오류 개선 계획 (버전 시스템 통합)

> 이 문서는 `VERSION_IMPLEMENTATION_ISSUES.md`, `VERSION_ADDITIONAL_ISSUES.md`, `VERSION_BASED_CLASS_TEACHER_PLAN.md`를 기반으로 작성되었습니다.
>
> **✅ 검증 완료**: 현재 프로젝트 코드와 호환성 확인됨 (2025-10-17)
> - Backend 버전 시스템 이미 구현됨
> - `ClassSection`에 `versionId` 필드 존재
> - Phase 2 (10.5시간) 생략 가능 → **총 2.5시간으로 단축**

## 📋 목차
1. [코드 검증 결과](#코드-검증-결과)
2. [문제 분석](#문제-분석)
3. [근본 원인](#근본-원인)
4. [개선 방안 (2단계)](#개선-방안-2단계)
5. [구현 순서](#구현-순서)
6. [예상 작업 시간](#예상-작업-시간)

---

## 코드 검증 결과

### ✅ Backend 이미 구현됨

**확인된 구현:**
1. ✅ `ClassSection`에 `versionId` 필드 존재 (`shared/types/class-section.types.ts:16`)
2. ✅ `addStudentToClass(versionId?: string)` 파라미터 지원 (`ClassSectionService.ts:760`)
3. ✅ `removeStudentFromClass(versionId?: string)` 파라미터 지원 (`ClassSectionService.ts:853`)
4. ✅ Backend가 활성 버전 자동 조회 (line 765-770, 858-863)
5. ✅ `TimetableVersionService.getActiveVersion()` 존재 (`TimetableVersionService.ts:40`)
6. ✅ API 엔드포인트 정의됨 (`shared/constants/api.constants.ts:160-164`)

**결론:** Phase 2 (버전 시스템 완성) 생략 가능! 🎉

### ⚠️ 수정 필요 사항

**API 메서드 이름:**
- Frontend: `getActiveTimetableVersion()` (실제 코드)
- 계획서: `getActiveVersion()` (수정 필요)

**작업 시간:**
- 원래 계획: 13시간 (Phase 1 + Phase 2 + Phase 3)
- 수정 후: **2시간 45분** (Phase 1 + Phase 2)
- **10시간 15분 절감!**

### ⚠️ 추가 발견 사항 (코드 재검증)

**Controller 수정 필요:**
- ❌ Backend Controller가 `versionId`를 Service에 전달하지 않음 (`ClassSectionController.ts:381`)
- ❌ Controller가 query parameter를 읽지 않음
- ✅ **해결:** Phase 1에 Controller 수정 추가 (15분 추가)

---

## 문제 분석

### 현재 상황

**학생 추가/삭제 흐름:**
```
1. 수업 관리 페이지에서 수업 선택
2. "학생 추가" 버튼 클릭 → AddStudentPage 모달 열림
3. 학생 선택 후 "등록" 클릭
4. apiService.addStudentToClass(classSectionId, studentId) 호출
5. Backend: ClassSectionService.addStudentToClass() 실행
```

**오류 발생 시나리오:**

#### 시나리오 1: 학생 추가 시 버전 불일치
```
1. 활성 버전: 2024-여름학기 (versionId: v2)
2. 학생 A는 2024-봄학기 시간표 document 보유 (versionId: v1)
3. 관리자가 2024-여름학기 수업에 학생 A 추가 시도
4. Backend: student_timetables WHERE studentId=A AND versionId=v2 조회
5. 결과: 조회 실패 (학생은 v1 시간표만 가짐)
6. Backend: 새로운 v2 시간표 document 생성
7. 학생 A가 이제 2개의 시간표 document 보유 (v1, v2)
```

**문제점:**
- 학생이 여러 버전의 시간표 document를 가지게 됨
- 데이터 중복 및 불일치

#### 시나리오 2: 학생 삭제 시 버전 불일치
```
1. 활성 버전: 2024-여름학기 (versionId: v2)
2. 학생 A는 2024-봄학기 시간표만 보유 (versionId: v1)
3. getEnrolledStudents()는 v2로 필터링 → 학생 A가 목록에 표시됨 ❌ (실제로는 안 보여야 함)
4. 관리자가 삭제 버튼 클릭
5. Backend: student_timetables WHERE studentId=A AND versionId=v2 조회
6. 결과: 조회 실패
7. 에러 발생: "학생 시간표를 찾을 수 없습니다."
```

**문제점:**
- 학생이 목록에 표시되지만 삭제 불가
- 사용자에게 혼란 초래

#### 시나리오 3: `classSectionIds` 배열 데이터 불일치
```
1. 학생 A의 시간표 (versionId: v1):
   classSectionIds: ['class_001_v1', 'class_002_v1']
2. 2024-여름학기로 버전 변경 (versionId: v2)
3. 학생 A의 시간표는 그대로 v1
4. getEnrolledStudents(class_003_v2)를 호출하면:
   - v2 시간표를 가진 학생만 조회됨
   - 학생 A는 조회 안 됨 (정상)
5. 하지만 학생 A를 v2 수업에 추가하면:
   - 새로운 v2 시간표 생성 또는
   - v1 시간표에 class_003_v2 추가 (버전 불일치!)
```

**문제점:**
- `classSectionIds` 배열에 여러 버전의 수업 ID가 섞임
- 데이터 무결성 위반

---

## 근본 원인

### 1. 버전 시스템 미완성
- **현재 상태:**
  - ✅ `StudentTimetable`: `versionId` 필드 있음
  - ❌ `ClassSection`: `versionId` 필드 **없음**
  - ❌ `Teacher`: `versionId` 필드 **없음**

- **영향:**
  - 수업은 모든 버전에 공유됨
  - 학생 시간표는 버전별로 관리됨
  - **데이터 구조 불일치**

### 2. Frontend에서 `versionId` 전달 안 함

**AddStudentPage.tsx:**
```typescript
// Line 132: 학생 추가
await apiService.addStudentToClass(classData.id, studentId)  // ❌ versionId 없음

// Line 169: 학생 삭제
await apiService.removeStudentFromClass(classData.id, studentId)  // ❌ versionId 없음
```

**영향:**
- Backend가 활성 버전을 자동 조회하지만 명시적이지 않음
- Frontend와 Backend의 버전 인식이 다를 수 있음

### 3. 버전 전환 시 학생 데이터 마이그레이션 없음

**문제:**
- 버전이 변경되어도 학생의 `student_timetables` document는 자동 업데이트 안 됨
- 이전 버전의 데이터가 그대로 남아있음

**예시:**
```
2024-봄학기 (v1) → 학생 A: student_timetables (versionId: v1)
2024-여름학기 (v2) 활성화 → 학생 A: 여전히 v1 시간표만 보유
```

### 4. `getEnrolledStudents()` API의 한계

**현재 로직:**
```typescript
// ClassSectionService.ts:929
async getEnrolledStudents(classSectionId: string, versionId?: string) {
  const studentTimetableQuery = this.db.collection('student_timetables')
    .where('classSectionIds', 'array-contains', classSectionId)
    .where('versionId', '==', targetVersionId)
}
```

**문제점:**
1. `classSectionIds` 배열에 해당 수업 ID가 포함되어 있고
2. `versionId`가 일치하는 학생만 조회

**시나리오:**
- 수업 `class_001`이 v1에도 v2에도 존재 (같은 ID)
- 학생 A는 v1 시간표에 `class_001` 포함
- `getEnrolledStudents('class_001', 'v2')` 호출 시:
  - 학생 A는 조회 안 됨 (versionId가 v1이므로)
  - 하지만 실제로는 같은 수업을 듣고 있음 (ID 동일)

**근본 원인:**
- **수업에 `versionId`가 없어서 버전 구분이 불가능**
- 같은 수업 ID가 여러 버전에 존재할 수 있음

---

## 개선 방안 (2단계)

> **Phase 2 (버전 시스템 완성) 생략**: Backend가 이미 구현되어 있어 불필요

### Phase 1: 즉시 적용 (긴급 수정) - 30분

**목표:** 현재 상태에서 오류 최소화

#### 1.1 Frontend - 명시적 `versionId` 전달

**파일:** `frontend/src/services/api.ts`

**수정:**
```typescript
// 학생 추가 API
async addStudentToClass(
  classSectionId: string,
  studentId: string,
  versionId?: string  // ✅ 파라미터 추가
): Promise<ApiResponse<any>> {
  const endpoint = versionId
    ? `${API_ENDPOINTS.CLASS_SECTIONS.ADD_STUDENT(classSectionId, studentId)}?versionId=${versionId}`
    : API_ENDPOINTS.CLASS_SECTIONS.ADD_STUDENT(classSectionId, studentId)

  return this.request(endpoint, {
    method: 'POST',
    body: JSON.stringify({ studentId, versionId })  // ✅ body에도 포함
  })
}

// 학생 삭제 API
async removeStudentFromClass(
  classSectionId: string,
  studentId: string,
  versionId?: string  // ✅ 파라미터 추가
): Promise<ApiResponse<any>> {
  const endpoint = versionId
    ? `${API_ENDPOINTS.CLASS_SECTIONS.REMOVE_STUDENT(classSectionId, studentId)}?versionId=${versionId}`
    : API_ENDPOINTS.CLASS_SECTIONS.REMOVE_STUDENT(classSectionId, studentId)

  return this.request(endpoint, {
    method: 'DELETE'
  })
}

// 수강 인원 조회 API
async getEnrolledStudents(
  classSectionId: string,
  versionId?: string  // ✅ 파라미터 추가
): Promise<ApiResponse<Student[]>> {
  const endpoint = versionId
    ? `${API_ENDPOINTS.CLASS_SECTIONS.GET_ENROLLED_STUDENTS(classSectionId)}?versionId=${versionId}`
    : API_ENDPOINTS.CLASS_SECTIONS.GET_ENROLLED_STUDENTS(classSectionId)

  return this.request(endpoint)
}
```

#### 1.2 Frontend - AddStudentPage에서 활성 버전 조회

**파일:** `frontend/src/features/class/pages/AddStudentPage.tsx`

**수정:**
```typescript
function AddStudentPage({ isOpen, onClose, classData, onStudentAdded }: AddStudentPageProps) {
  // ✅ 활성 버전 상태 추가
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null)

  // ✅ 컴포넌트 마운트 시 활성 버전 조회
  useEffect(() => {
    const loadActiveVersion = async () => {
      try {
        const response = await apiService.getActiveTimetableVersion()  // ✅ 실제 API 메서드명
        if (response.success && response.data) {
          setActiveVersionId(response.data.id)
          console.log('✅ 활성 버전:', response.data.displayName)
        }
      } catch (error) {
        console.error('❌ 활성 버전 조회 실패:', error)
      }
    }

    if (isOpen) {
      loadActiveVersion()
    }
  }, [isOpen])

  // ✅ 등록된 학생 목록 로드 - versionId 전달
  const loadEnrolledStudents = useCallback(async () => {
    if (!activeVersionId) return

    try {
      setIsLoadingEnrolled(true)
      const response = await apiService.getEnrolledStudents(classData.id, activeVersionId)  // ✅
      if (response.success && response.data) {
        setEnrolledStudents(response.data)
      }
    } catch (error) {
      setEnrolledStudents([])
    } finally {
      setIsLoadingEnrolled(false)
    }
  }, [classData.id, activeVersionId])  // ✅ 의존성 추가

  // ✅ 학생 추가 - versionId 전달
  const handleAddStudents = useCallback(async () => {
    if (!activeVersionId) {
      setError('활성 버전을 찾을 수 없습니다. 시간표 버전을 먼저 설정해주세요.')
      return
    }

    // ... 기존 로직

    for (const studentId of studentIds) {
      await apiService.addStudentToClass(classData.id, studentId, activeVersionId)  // ✅
    }

    // ... 기존 로직
  }, [selectedStudents, classData.id, activeVersionId, onStudentAdded, onClose, loadEnrolledStudents, loadStudents])

  // ✅ 학생 삭제 - versionId 전달
  const handleRemoveStudent = useCallback(async (studentId: string) => {
    if (!activeVersionId) {
      setError('활성 버전을 찾을 수 없습니다.')
      return
    }

    try {
      setIsRemoving(true)
      const response = await apiService.removeStudentFromClass(
        classData.id,
        studentId,
        activeVersionId  // ✅
      )
      // ... 기존 로직
    } catch (error) {
      setError('학생 제거에 실패했습니다.')
    } finally {
      setIsRemoving(false)
    }
  }, [classData.id, activeVersionId, loadStudents])
}
```

#### 1.3 Frontend - ClassDetailPanel에서도 동일 적용

**파일:** `frontend/src/features/class/components/ClassDetailPanel.tsx`

**수정:**
```typescript
export function ClassDetailPanel({ selectedClass, isLoading, onRefreshClasses }: ClassDetailPanelProps) {
  // ✅ 활성 버전 상태 추가
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null)

  // ✅ 컴포넌트 마운트 시 활성 버전 조회
  useEffect(() => {
    const loadActiveVersion = async () => {
      try {
        const response = await apiService.getActiveTimetableVersion()  // ✅ 실제 API 메서드명
        if (response.success && response.data) {
          setActiveVersionId(response.data.id)
        }
      } catch (error) {
        console.error('❌ 활성 버전 조회 실패:', error)
      }
    }
    loadActiveVersion()
  }, [])

  // ✅ 수강 인원 데이터 가져오기 - versionId 전달
  const fetchEnrolledStudents = useCallback(async (classSectionId: string) => {
    if (!activeVersionId) return

    setIsLoadingStudents(true)
    setStudentsError(null)
    try {
      const response = await apiService.getEnrolledStudents(classSectionId, activeVersionId)  // ✅
      if (response.success && response.data) {
        setEnrolledStudents(response.data)
      }
    } catch (error) {
      setStudentsError('학생 목록을 불러오는데 실패했습니다.')
    } finally {
      setIsLoadingStudents(false)
    }
  }, [activeVersionId])  // ✅ 의존성 추가

  // selectedClass가 변경될 때 수강 인원 데이터 로딩
  useEffect(() => {
    if (selectedClass?.id && activeVersionId) {  // ✅ activeVersionId 체크 추가
      fetchEnrolledStudents(selectedClass.id)
    } else {
      setEnrolledStudents([])
      setStudentsError(null)
    }
  }, [selectedClass?.id, activeVersionId, fetchEnrolledStudents])  // ✅ 의존성 추가
}
```

#### 1.4 Backend - 에러 메시지 개선

**파일:** `functions/src/services/ClassSectionService.ts`

**수정:**
```typescript
// Line 853: removeStudentFromClass
async removeStudentFromClass(classSectionId: string, studentId: string, versionId?: string): Promise<void> {
  // ... 버전 결정 로직

  const timetableQuery = this.db.collection('student_timetables')
    .where('studentId', '==', studentId)
    .where('versionId', '==', targetVersionId)
    .limit(1)
  const timetableSnapshot = await transaction.get(timetableQuery)

  if (timetableSnapshot.empty) {
    // ✅ 개선된 에러 메시지

    // 다른 버전의 시간표가 있는지 확인
    const anyVersionQuery = this.db.collection('student_timetables')
      .where('studentId', '==', studentId)
      .limit(1)
    const anyVersionSnapshot = await anyVersionQuery.get()

    if (!anyVersionSnapshot.empty) {
      const otherVersionId = anyVersionSnapshot.docs[0].data().versionId
      const versionService = new TimetableVersionService()
      const otherVersion = await versionService.getVersionById(otherVersionId)

      throw new Error(
        `학생은 다른 버전(${otherVersion?.displayName || otherVersionId})의 시간표를 가지고 있습니다. ` +
        `현재 활성 버전은 ${targetVersionId}입니다. ` +
        `시간표 버전 관리 페이지에서 학생 데이터를 마이그레이션해주세요.`
      )
    }

    throw new Error('학생 시간표를 찾을 수 없습니다.')
  }

  // ... 나머지 로직
}
```

**장점:**
- 사용자에게 명확한 오류 원인 제공
- 해결 방법 제시 (마이그레이션)

#### 1.5 Backend Controller - query parameter 처리 추가

**파일:** `functions/src/controllers/ClassSectionController.ts`

**문제:**
- 현재 Controller가 `versionId`를 Service에 전달하지 않음
- query parameter를 읽지 않음

**수정 1: addStudentToClass**
```typescript
async addStudentToClass(req: Request, res: Response): Promise<void> {
  try {
    const { id: classSectionId, studentId } = req.params;
    const versionId = req.query.versionId as string | undefined;  // ✅ 추가

    // 필수 파라미터 검증
    if (!classSectionId || !studentId) {
      res.status(400).json({
        success: false,
        message: '수업 ID와 학생 ID가 필요합니다.'
      });
      return;
    }

    await this.classSectionService.addStudentToClass(classSectionId, studentId, versionId);  // ✅ versionId 전달

    res.json({
      success: true,
      message: '학생이 수업에 성공적으로 추가되었습니다.'
    });
  } catch (error) {
    console.error('학생 추가 오류:', error);
    res.status(500).json({
      success: false,
      message: '학생 추가 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
}
```

**수정 2: removeStudentFromClass**
```typescript
async removeStudentFromClass(req: Request, res: Response): Promise<void> {
  try {
    const { id: classSectionId, studentId } = req.params;
    const versionId = req.query.versionId as string | undefined;  // ✅ 추가

    // 필수 파라미터 검증
    if (!classSectionId || !studentId) {
      res.status(400).json({
        success: false,
        message: '수업 ID와 학생 ID가 필요합니다.'
      });
      return;
    }

    await this.classSectionService.removeStudentFromClass(classSectionId, studentId, versionId);  // ✅ versionId 전달

    res.json({
      success: true,
      message: '학생이 수업에서 성공적으로 제거되었습니다.'
    });
  } catch (error) {
    console.error('학생 제거 오류:', error);
    res.status(500).json({
      success: false,
      message: '학생 제거 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
}
```

**수정 3: getEnrolledStudents**
```typescript
async getEnrolledStudents(req: Request, res: Response): Promise<void> {
  try {
    const { id: classSectionId } = req.params;
    const versionId = req.query.versionId as string | undefined;  // ✅ 추가

    // 필수 파라미터 검증
    if (!classSectionId) {
      res.status(400).json({
        success: false,
        message: '수업 ID가 필요합니다.'
      });
      return;
    }

    const enrolledStudents = await this.classSectionService.getEnrolledStudents(classSectionId, versionId);  // ✅ versionId 전달

    res.json({
      success: true,
      data: enrolledStudents
    });
  } catch (error) {
    console.error('등록된 학생 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '등록된 학생 목록 조회 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류'
    });
  }
}
```

**중요:**
- query parameter는 선택사항 (`versionId?: string`)
- 전달되지 않으면 Service에서 활성 버전 자동 조회
- 하위 호환성 유지

---

### Phase 2: 장기 개선 (자동 마이그레이션) - 추가 2시간

> **Phase 2 (버전 시스템 완성)은 생략**: Backend가 이미 구현되어 있음

**목표:** 버전 전환 시 학생 데이터 자동 마이그레이션

#### 2.1 버전 활성화 시 학생 시간표 자동 처리

**파일:** `functions/src/services/TimetableVersionService.ts`

**새로운 메서드 추가:**
```typescript
/**
 * 버전 활성화 + 학생 시간표 자동 마이그레이션
 *
 * 로직:
 * 1. 새 버전 활성화
 * 2. 모든 학생의 시간표를 새 버전으로 자동 전환
 * 3. classSectionIds 배열 정리 (새 버전 수업만 유지)
 */
async activateVersionWithMigration(versionId: string): Promise<void> {
  const db = admin.firestore()

  // 1. 버전 활성화
  await this.activateVersion(versionId)

  // 2. 모든 학생 시간표 조회
  const allTimetablesSnapshot = await db.collection('student_timetables').get()

  // 3. 버전별 시간표 그룹화
  const timetablesByVersion = new Map<string, any[]>()
  allTimetablesSnapshot.docs.forEach(doc => {
    const data = { id: doc.id, ...doc.data() }
    const ver = data.versionId || 'no_version'

    if (!timetablesByVersion.has(ver)) {
      timetablesByVersion.set(ver, [])
    }
    timetablesByVersion.get(ver)!.push(data)
  })

  // 4. 이전 버전의 시간표를 새 버전으로 마이그레이션
  for (const [oldVersionId, timetables] of timetablesByVersion.entries()) {
    if (oldVersionId === versionId) continue  // 이미 새 버전이면 스킵

    console.log(`🔄 버전 ${oldVersionId} → ${versionId} 마이그레이션: ${timetables.length}개`)

    // 5. 수업 ID 매핑 생성 (이전 버전 수업 → 새 버전 수업)
    const classIdMap = await this.buildClassIdMapping(oldVersionId, versionId)

    // 6. 학생별 시간표 업데이트
    const BATCH_SIZE = 500
    for (let i = 0; i < timetables.length; i += BATCH_SIZE) {
      const batch = db.batch()
      const chunk = timetables.slice(i, i + BATCH_SIZE)

      for (const timetable of chunk) {
        // classSectionIds 변환
        const newClassSectionIds = (timetable.classSectionIds || [])
          .map((oldId: string) => classIdMap.get(oldId))
          .filter(Boolean)  // 매핑되지 않은 ID 제거

        const docRef = db.collection('student_timetables').doc(timetable.id)
        batch.update(docRef, {
          versionId: versionId,
          classSectionIds: newClassSectionIds,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        })
      }

      await batch.commit()
    }
  }

  console.log('✅ 학생 시간표 자동 마이그레이션 완료')
}

/**
 * 수업 ID 매핑 생성
 *
 * 전략:
 * - 수업명(name)이 같으면 같은 수업으로 간주
 * - 이전 버전 수업 ID → 새 버전 수업 ID 매핑
 */
private async buildClassIdMapping(
  oldVersionId: string,
  newVersionId: string
): Promise<Map<string, string>> {
  const db = admin.firestore()

  // 이전 버전 수업 조회
  const oldClassesSnapshot = await db.collection('class_sections')
    .where('versionId', '==', oldVersionId)
    .get()

  // 새 버전 수업 조회
  const newClassesSnapshot = await db.collection('class_sections')
    .where('versionId', '==', newVersionId)
    .get()

  // 수업명으로 인덱싱
  const newClassesByName = new Map<string, string>()
  newClassesSnapshot.docs.forEach(doc => {
    const data = doc.data()
    newClassesByName.set(data.name, doc.id)
  })

  // ID 매핑 생성
  const classIdMap = new Map<string, string>()
  oldClassesSnapshot.docs.forEach(doc => {
    const oldData = doc.data()
    const newClassId = newClassesByName.get(oldData.name)

    if (newClassId) {
      classIdMap.set(doc.id, newClassId)
      console.log(`  ✅ 매핑: ${oldData.name} (${doc.id} → ${newClassId})`)
    } else {
      console.log(`  ⚠️ 매핑 실패: ${oldData.name} (${doc.id}) - 새 버전에 없음`)
    }
  })

  return classIdMap
}
```

#### 2.2 Frontend - 버전 활성화 API 호출 수정

**파일:** `frontend/src/contexts/TimetableVersionContext.tsx`

**수정:**
```typescript
const activateVersion = async (versionId: string) => {
  try {
    // ✅ 자동 마이그레이션이 포함된 활성화 API 호출
    await apiService.activateVersionWithMigration(versionId)

    // 목록 새로고침
    const response = await apiService.getTimetableVersions()
    if (response.success && response.data) {
      setVersions(response.data)
      const newActiveVersion = response.data.find(v => v.isActive)
      setActiveVersion(newActiveVersion || null)

      if (newActiveVersion) {
        setSelectedVersion(newActiveVersion)
      }

      // 페이지 새로고침 대신 이벤트 발생
      window.dispatchEvent(new CustomEvent('activeVersionChanged', {
        detail: { version: newActiveVersion }
      }))

      message.success('버전이 활성화되었습니다. 학생 시간표가 자동으로 마이그레이션되었습니다.')
    }
  } catch (error) {
    console.error('Failed to activate version:', error)
    message.error('버전 활성화에 실패했습니다.')
    throw error
  }
}
```

**장점:**
- ✅ 사용자가 수동으로 마이그레이션할 필요 없음
- ✅ 버전 전환 시 자동으로 모든 학생 데이터 업데이트
- ✅ `classSectionIds` 배열 자동 정리
- ✅ 데이터 일관성 보장

---

## 구현 순서

### Step 1: Phase 1 구현 (즉시) - 45분

**수정 파일:**
1. ✅ `frontend/src/services/api.ts` - `versionId` 파라미터 추가 (15분)
2. ✅ `frontend/src/features/class/pages/AddStudentPage.tsx` - 활성 버전 조회 및 전달 (10분)
3. ✅ `frontend/src/features/class/components/ClassDetailPanel.tsx` - 활성 버전 조회 및 전달 (5분)
4. ✅ `functions/src/services/ClassSectionService.ts` - 에러 메시지 개선 (5분)
5. ✅ `functions/src/controllers/ClassSectionController.ts` - query parameter 처리 추가 (10분) **← 신규 추가**

**테스트 항목:**
- [ ] Frontend에서 `versionId`가 query parameter로 전달되는가?
- [ ] Controller가 query parameter를 읽고 Service에 전달하는가?
- [ ] Service에서 `versionId`를 정상적으로 처리하는가?
- [ ] 학생 추가 시 `versionId`가 명시적으로 전달되는가?
- [ ] 학생 삭제 시 `versionId`가 명시적으로 전달되는가?
- [ ] 버전 불일치 시 명확한 에러 메시지가 표시되는가?
- [ ] 활성 버전이 없을 때 적절한 에러가 발생하는가?

### Step 2: Phase 2 구현 (장기) - 2시간

**수정 파일:**
1. ✅ `functions/src/services/TimetableVersionService.ts` - `activateVersionWithMigration()` 및 `buildClassIdMapping()` 구현
2. ✅ `frontend/src/contexts/TimetableVersionContext.tsx` - API 호출 수정

**테스트 항목:**
- [ ] 버전 활성화 시 모든 학생 시간표가 자동 마이그레이션되는가?
- [ ] `classSectionIds`가 올바르게 변환되는가?
- [ ] 매핑되지 않는 수업은 제거되는가?
- [ ] 성능 문제가 없는가? (대량 데이터 처리)

---

## 예상 작업 시간

| Phase | 작업 내용 | 예상 시간 | 담당 |
|-------|----------|----------|------|
| Phase 1 | 즉시 적용 (긴급 수정) | 45분 | Frontend + Backend |
| ~~Phase 2~~ | ~~버전 시스템 완성~~ | ~~10.5시간~~ | ~~생략 (이미 구현됨)~~ |
| Phase 2 | 자동 마이그레이션 | 2시간 | Backend |
| **총계** | | **2시간 45분** | |

**세부 시간:**
- Phase 1.1: Frontend API 수정 (15분)
- Phase 1.2: AddStudentPage 수정 (10분)
- Phase 1.3: ClassDetailPanel 수정 (5분)
- Phase 1.4: Backend Service 에러 메시지 개선 (5분)
- Phase 1.5: Backend Controller query parameter 처리 (10분) **← 신규 추가**
- ~~Phase 2: VERSION_BASED_CLASS_TEACHER_PLAN.md (10.5시간)~~ ← **생략**
- Phase 2.1: 자동 마이그레이션 로직 (1.5시간)
- Phase 2.2: Frontend 통합 (30분)

**절감 시간: 10시간 15분** 🎉

---

## 주의사항

### 1. Phase 1 적용 시
- ⚠️ **활성 버전이 없으면 오류 발생**
- 시스템에 최소 1개의 활성 버전이 있어야 함
- 배포 전에 활성 버전 확인 필수

### 2. Phase 2 적용 시 (자동 마이그레이션)
- ⚠️ **성능 고려 필요**
- 학생 수가 많으면 마이그레이션 시간 증가
- Batch 처리 (500개씩) 필수
- 마이그레이션 중 사용자에게 로딩 표시

### 3. 데이터 일관성
- `classSectionIds` 배열은 항상 같은 버전의 수업 ID만 포함해야 함
- 버전 전환 시 자동 정리 필요
- 수동 마이그레이션 시 검증 로직 추가 권장

### 4. Backend가 이미 구현됨
- ⚠️ **ClassSection에 versionId가 이미 존재**
- 기존 데이터에 versionId가 없을 수 있음
- 마이그레이션 필요 여부 확인 필수

### 5. Controller 수정 필수
- ⚠️ **Controller가 versionId를 Service에 전달하지 않으면 작동 안 함**
- query parameter 처리 로직 필수
- Phase 1.5 반드시 구현해야 함

---

## 예상 효과

### Phase 1 적용 후
- ✅ 버전 불일치 오류가 명확한 메시지와 함께 표시됨
- ✅ 사용자가 문제 원인과 해결 방법을 알 수 있음
- ✅ Frontend-Backend 간 버전 인식 일치
- ✅ **Backend가 이미 구현되어 있어 학생 추가/삭제 오류 해결됨**

### Phase 2 적용 후
- ✅ 버전 전환 시 사용자 개입 불필요
- ✅ 완전 자동화된 데이터 관리
- ✅ 사용자 경험 대폭 개선
- ✅ 데이터 정합성 자동 유지

---

## 롤백 계획

### Phase 1 롤백
- Frontend 코드만 이전 버전으로 복구
- Backend는 하위 호환성 유지 (versionId 선택사항)
- 영향 최소

### Phase 2 롤백
- 자동 마이그레이션 기능만 비활성화
- 기존 수동 마이그레이션으로 복귀
- 데이터는 그대로 유지

---

## 참고 문서

1. `VERSION_IMPLEMENTATION_ISSUES.md` - 버전 시스템 구현 이슈
2. `VERSION_ADDITIONAL_ISSUES.md` - 추가 이슈 분석
3. `VERSION_BASED_CLASS_TEACHER_PLAN.md` - 버전 시스템 구현 계획

---

## 문의 및 지원

구현 중 문제 발생 시:
1. 각 Phase별로 단계적 진행
2. 각 단계 완료 후 테스트 수행
3. 문제 발생 시 이전 단계로 롤백 가능
