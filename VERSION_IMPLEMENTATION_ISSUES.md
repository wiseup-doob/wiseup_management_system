# 버전별 수업/선생님 관리 구현 시 예상 에러 지점 분석

## 🚨 심각도 높음 (Critical)

### 1. 수업 목록 조회 API - 버전 필터 누락
**위치:** `frontend/src/features/class/slice/classSlice.ts:102-108`

**문제:**
```typescript
export const fetchClasses = createAsyncThunk(
  'class/fetchClasses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getClassSectionsWithDetails()  // ❌ versionId 없이 호출
      return response.data
    } catch (error) {
      return rejectWithValue('수업 목록 조회 실패')
    }
  }
)
```

**영향:**
- 수업 관리 페이지가 로드될 때 `versionId` 없이 모든 수업을 조회 시도
- 백엔드에서 `versionId` 필수 검증 추가 시 **400 Bad Request 에러 발생**
- 수업 목록이 전혀 표시되지 않음

**해결방안:**
```typescript
// 옵션 1: versionId를 파라미터로 받도록 수정
export const fetchClasses = createAsyncThunk(
  'class/fetchClasses',
  async (versionId: string | undefined, { rejectWithValue }) => {
    try {
      if (!versionId) {
        // 활성 버전 조회
        const activeVersion = await apiService.getActiveTimetableVersion()
        versionId = activeVersion.data.id
      }
      const response = await apiService.getClassSectionsByVersion(versionId)
      return response.data
    } catch (error) {
      return rejectWithValue('수업 목록 조회 실패')
    }
  }
)

// 옵션 2: TimetableVersionContext와 통합
// useClass 훅에서 selectedVersion을 의존성으로 사용
```

---

### 2. 수업 생성 시 versionId 누락
**위치:** `frontend/src/features/class/hooks/useClass.ts:86-95`

**문제:**
```typescript
const handleAddClass = useCallback(async (classData: ClassFormDataWithIds) => {
  try {
    await dispatch(createClass(classData)).unwrap()  // ❌ versionId 없음
    dispatch(fetchClasses())
  } catch (error) {
    console.error('수업 생성 실패:', error)
    throw error
  }
}, [dispatch])
```

**영향:**
- 수업 생성 시 `versionId` 필드 누락
- 백엔드에서 **400 Bad Request: versionId is required** 에러 발생
- 수업 생성 불가

**해결방안:**
```typescript
const handleAddClass = useCallback(async (classData: ClassFormDataWithIds) => {
  if (!selectedVersion) {
    throw new Error('버전을 선택해주세요')
  }

  try {
    await dispatch(createClass({
      ...classData,
      versionId: selectedVersion.id  // ✅ versionId 추가
    })).unwrap()
    dispatch(fetchClasses(selectedVersion.id))
  } catch (error) {
    console.error('수업 생성 실패:', error)
    throw error
  }
}, [dispatch, selectedVersion])
```

---

### 3. 시간표 편집 모달 - 버전 간 수업 참조 문제
**위치:** `frontend/src/features/schedule/components/TimetableEditModal.tsx:768-790`

**문제:**
```typescript
// 현재 학생이 수강 중인 수업 ID들
const currentClassIds = originalTimetableData?.classSections?.map((cls: any) => cls.id) || []

// 새로 추가하려는 수업 ID들
const newClassIds = localTimetableData?.classSections?.map((cls: any) => cls.id) || []
```

**시나리오:**
1. 학생 A가 2024-봄학기 버전의 "수학 A반" (id: `class_001_v1`) 수강
2. 2024-여름학기 버전 활성화
3. 2024-여름학기 버전의 "수학 A반" (id: `class_001_v2`)은 **다른 ID**
4. 학생 A의 시간표를 편집하면 `class_001_v1`이 여전히 참조됨
5. **버전 불일치로 인한 수업 정보 조회 실패**

**영향:**
- 시간표에서 수업 정보가 표시되지 않음 (`Course not found`, `Teacher not found`)
- 학생이 다른 버전의 수업을 수강하는 잘못된 상태 발생

**해결방안:**
```typescript
// 옵션 1: 버전 변경 시 학생 시간표도 자동 변환
// - 기존 버전의 수업명/코스를 기반으로 새 버전의 수업 자동 매칭
// - 매칭 실패 시 해당 수업 제거

// 옵션 2: 버전 간 수업 매핑 테이블 구축
// - sourceClassId → targetClassId 매핑 저장
// - 버전 복사 시 매핑 정보도 함께 생성

// 옵션 3: UI에서 명시적으로 경고 표시
if (classSection.versionId !== selectedVersion.id) {
  // 경고: 이 수업은 다른 버전의 수업입니다
  // 시간표 편집 시 자동으로 제거됨
}
```

---

## ⚠️ 심각도 중간 (High)

### 4. 선생님 정보 조회 - versionId 필터 누락
**위치:** `frontend/src/services/timetableService.ts`

**문제:**
- 선생님 목록 조회 시 버전 필터링 없이 전체 선생님 조회
- 다른 버전의 선생님이 드롭다운에 표시될 수 있음

**해결방안:**
```typescript
// 선생님 조회 시 versionId 파라미터 추가
const teachers = await apiService.getTeachersByVersion(selectedVersion.id)
```

---

### 5. 수업 수정 시 versionId 변경 방지 필요
**위치:** 백엔드 `UpdateClassSectionRequest`

**문제:**
- 수업 수정 API에서 `versionId`를 변경할 수 있으면 데이터 일관성 문제 발생

**해결방안:**
```typescript
// 백엔드 수정 API에서 versionId 변경 차단
async updateClassSection(req: Request, res: Response): Promise<void> {
  const { id } = req.params
  const data: UpdateClassSectionRequest = req.body

  // versionId 변경 시도 차단
  if (data.versionId) {
    res.status(400).json({
      success: false,
      error: 'Cannot change versionId of existing class section'
    })
    return
  }

  // ... 나머지 로직
}
```

---

### 6. 마이그레이션 후 기존 API 호출 문제
**위치:** 전체 프론트엔드

**문제:**
- 마이그레이션 완료 후에도 기존 코드가 `versionId` 없이 API 호출
- 모든 API가 404 또는 400 에러 반환

**해결방안:**
```typescript
// 단계적 마이그레이션 전략
// 1단계: 백엔드에서 versionId 선택적(optional)으로 처리
async searchClassSections(params: ClassSectionSearchParams): Promise<ClassSection[]> {
  let query: admin.firestore.Query = this.db.collection(this.collectionName)

  // versionId가 있으면 필터링, 없으면 전체 조회 (하위 호환성)
  if (params.versionId) {
    query = query.where('versionId', '==', params.versionId)
  }

  return this.search<ClassSection>(query)
}

// 2단계: 프론트엔드 수정 완료 후 versionId 필수로 변경
```

---

## ℹ️ 심각도 낮음 (Medium)

### 7. 수업 삭제 시 학생 시간표 정리
**위치:** 백엔드 `ClassSectionController.deleteClassSection`

**문제:**
- 수업 삭제 시 해당 수업을 참조하는 학생 시간표의 `classSectionIds`가 정리되지 않음
- 존재하지 않는 수업 ID 참조

**해결방안:**
```typescript
// 수업 삭제 시 연관된 학생 시간표 정리
async deleteClassSection(req: Request, res: Response): Promise<void> {
  const { id } = req.params

  // 1. 이 수업을 참조하는 학생 시간표 조회
  const allTimetables = await this.studentTimetableService.getAllStudentTimetables()
  const affectedTimetables = allTimetables.filter(t =>
    t.classSectionIds.includes(id)
  )

  // 2. 학생 시간표에서 수업 ID 제거
  for (const timetable of affectedTimetables) {
    const updatedClassSectionIds = timetable.classSectionIds.filter(cid => cid !== id)
    await this.studentTimetableService.updateStudentTimetable(timetable.id, {
      classSectionIds: updatedClassSectionIds
    })
  }

  // 3. 수업 삭제
  await this.classSectionService.deleteClassSection(id)

  res.status(200).json({
    success: true,
    message: `Class section deleted and removed from ${affectedTimetables.length} student timetables`
  })
}
```

---

### 8. 버전 복사 시 수업 간 의존성 문제
**위치:** `TimetableVersionService.copyVersion`

**문제:**
- 수업이 특정 교실(classroom), 선생님(teacher)을 참조
- 선생님도 버전별로 관리되면 **버전 간 ID가 달라짐**
- 복사된 수업이 잘못된 선생님 ID 참조

**예시:**
```
2024-봄학기:
  - 선생님: teacher_001 (김철수)
  - 수업: class_001 (teacherId: teacher_001)

2024-여름학기 복사:
  - 선생님: teacher_002 (김철수 복사본) ← 새 ID
  - 수업: class_002 (teacherId: teacher_001) ← ❌ 잘못된 참조
```

**해결방안:**
```typescript
async copyVersion(...): Promise<string> {
  // 1. 선생님 복사 및 ID 매핑 생성
  const teacherIdMap = new Map<string, string>()
  for (const teacher of sourceTeachers) {
    const newTeacherId = await this.copyTeacher(teacher, targetVersionId)
    teacherIdMap.set(teacher.id, newTeacherId)  // 기존 ID → 새 ID 매핑
  }

  // 2. 수업 복사 시 선생님 ID 변환
  for (const classSection of sourceClassSections) {
    const newTeacherId = teacherIdMap.get(classSection.teacherId)
    await this.copyClassSection({
      ...classSection,
      teacherId: newTeacherId,  // ✅ 변환된 ID 사용
      versionId: targetVersionId
    })
  }

  // 3. 학생 시간표는 classSectionIds만 복사 (수업 ID는 나중에 매칭)
}
```

---

## 📋 구현 권장 순서 (versionId 필수 - 마이그레이션 기반)

> ⚠️ **전략**: 하위 호환성을 유지하지 않고 바로 versionId 필수 적용합니다.

### 1단계: 백엔드 전체 수정 (versionId 필수)
```typescript
// ✅ 모든 생성 API에서 versionId 필수 검증
async createClassSection(data: CreateClassSectionRequest): Promise<string> {
  if (!data.versionId) {
    throw new Error('versionId is required')
  }
  // ...
}

async createTeacher(data: CreateTeacherRequest): Promise<string> {
  if (!data.versionId) {
    throw new Error('versionId is required')
  }
  // ...
}

// ✅ 모든 조회 API에서 versionId 필수 검증
async searchClassSections(params: ClassSectionSearchParams): Promise<ClassSection[]> {
  if (!params.versionId) {
    throw new Error('versionId is required for searching class sections')
  }

  const query = this.db.collection(this.collectionName)
    .where('versionId', '==', params.versionId)

  return this.search<ClassSection>(query)
}
```

### 2단계: 프론트엔드 전체 수정
```typescript
// ✅ 모든 수업/선생님 관리 페이지에 TimetableVersionContext 추가
import { useTimetableVersion } from '../../../contexts/TimetableVersionContext'

function ClassManagementPage() {
  const { selectedVersion } = useTimetableVersion()

  useEffect(() => {
    if (!selectedVersion) {
      message.warning('시간표 버전을 선택해주세요')
      return
    }
    // 버전 선택 시에만 데이터 로드
    loadClasses(selectedVersion.id)
  }, [selectedVersion])

  const handleAddClass = async (classData) => {
    if (!selectedVersion) {
      message.error('버전을 먼저 선택해주세요')
      return
    }

    await apiService.createClassSection({
      ...classData,
      versionId: selectedVersion.id  // ✅ versionId 필수
    })
  }
}
```

### 3단계: 마이그레이션 실행 (한 번에 모든 데이터)
```bash
# 순서:
# 1. 백엔드 배포
# 2. 시간표 버전 관리 페이지에서 마이그레이션 실행
#    - 학생 시간표에 versionId 추가
#    - 수업에 versionId 추가
#    - 선생님에 versionId 추가
# 3. 프론트엔드 배포
# 4. 전체 기능 테스트
```

**마이그레이션 검증:**
```typescript
// 마이그레이션 상태 확인 API 호출
GET /api/timetable-versions/migration/status

// 응답:
{
  "timetables": { "total": 100, "migrated": 100, "unmigrated": 0 },
  "classes": { "total": 50, "migrated": 50, "unmigrated": 0 },
  "teachers": { "total": 10, "migrated": 10, "unmigrated": 0 }
}

// ✅ unmigrated가 모두 0이면 성공
```

### 4단계: 배포 및 최종 검증
```typescript
// 1. 백엔드 배포 완료
// 2. 마이그레이션 완료 확인
// 3. 프론트엔드 배포
// 4. 모든 기능 정상 동작 확인
```

---

## 🔍 테스트 체크리스트

### 마이그레이션 전 (백엔드만 배포)
- [ ] 마이그레이션 상태 확인 API 정상 동작
- [ ] 마이그레이션 실행 버튼 표시

### 마이그레이션 실행
- [ ] 학생 시간표에 versionId 추가 완료
- [ ] 수업에 versionId 추가 완료
- [ ] 선생님에 versionId 추가 완료
- [ ] unmigrated 카운트가 모두 0

### 프론트엔드 배포 후
- [ ] 수업 관리 페이지에서 버전 선택 가능
- [ ] 선택된 버전의 수업만 표시
- [ ] 수업 생성 시 올바른 버전 ID 포함
- [ ] 버전 변경 시 수업 목록 즉시 업데이트
- [ ] 선생님 관리 페이지도 동일하게 동작
- [ ] 시간표 편집 정상 동작
- [ ] 버전 복사 정상 동작

---

## 💡 결론 및 권장사항

### 필수 수정 사항 (모두 구현 필요)
1. ✅ **백엔드 - versionId 필수 검증** (모든 생성/조회 API)
2. ✅ **프론트엔드 - TimetableVersionContext 통합** (모든 관리 페이지)
3. ✅ **프론트엔드 - API 호출 시 versionId 포함**
4. ✅ **버전 복사 시 ID 매핑 로직** (teacherId 변환)
5. ✅ **수업 삭제 시 학생 시간표 정리**

### 구현 순서 (중단 시간 최소화)
1. **백엔드 수정 및 배포** (versionId 필수 적용)
2. **마이그레이션 실행** (기존 데이터에 versionId 추가)
3. **프론트엔드 수정 및 배포** (TimetableVersionContext 통합)
4. **전체 테스트 및 검증**

### 예상 중단 시간
- **백엔드 배포 → 프론트엔드 배포 사이**: 약 10-30분
- **이 시간 동안 수업/선생님 관리 기능 사용 불가**
- **시간표 조회는 가능 (학생 시간표는 이미 versionId 있음)**

이 방식으로 진행하면 **명확한 데이터 구조**와 **깔끔한 코드**를 얻을 수 있습니다.
