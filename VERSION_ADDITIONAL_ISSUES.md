# 버전별 수업/선생님 관리 - 추가 구현 이슈 분석

> VERSION_IMPLEMENTATION_ISSUES.md에 이어서 추가로 발견된 문제점들

## 🚨 심각도 높음 (Critical)

### 9. ClassPage - TimetableVersionContext 미통합
**위치:** `frontend/src/features/class/pages/ClassPage.tsx:1-100`

**문제:**
- 수업 관리 페이지(`ClassPage`)가 `TimetableVersionContext`를 사용하지 않음
- 버전 선택 UI가 없어 사용자가 어떤 버전의 수업을 보고 있는지 알 수 없음
- `fetchClasses()`가 versionId 없이 호출됨 (line 41, 48)

**영향:**
- 수업 관리 페이지 전체가 작동하지 않음 (400 Bad Request)
- 사용자가 버전을 선택할 방법이 없음

**해결방안:**
```typescript
import { useTimetableVersion } from '../../../contexts/TimetableVersionContext'
import { TimetableVersionSelector } from '../../../components/TimetableVersionSelector'

function ClassPage() {
  const { selectedVersion } = useTimetableVersion()

  // 버전 선택 시 수업 목록 새로고침
  useEffect(() => {
    if (selectedVersion) {
      dispatch(fetchClasses(selectedVersion.id))
    }
  }, [selectedVersion])

  // UI에 버전 선택 드롭다운 추가
  return (
    <div>
      <TimetableVersionSelector />
      {/* ... 기존 UI */}
    </div>
  )
}
```

---

### 10. TimetableEditModal - getClassSectionsWithDetails() versionId 누락
**위치:** `frontend/src/features/schedule/components/TimetableEditModal.tsx:107`

**문제:**
```typescript
const [classesResponse, timetableResponse] = await Promise.all([
  apiService.getClassSectionsWithDetails(), // ❌ versionId 없이 호출
  apiService.getStudentTimetableByVersion(studentId, selectedVersion.id)
])
```

**영향:**
- 시간표 편집 모달에서 수업 목록을 불러올 수 없음
- 백엔드가 versionId 필수로 변경되면 400 에러 발생
- 학생 시간표에 수업을 추가할 수 없음

**해결방안:**
```typescript
// API 메서드 수정 필요
const [classesResponse, timetableResponse] = await Promise.all([
  apiService.getClassSectionsByVersion(selectedVersion.id),  // ✅ versionId 포함
  apiService.getStudentTimetableByVersion(studentId, selectedVersion.id)
])
```

**추가 수정 필요:**
- `api.ts`에 `getClassSectionsByVersion(versionId: string)` 메서드 추가
- 또는 `getClassSectionsWithDetails(versionId?: string)` 파라미터 추가

---

### 11. ClassDetailModal - getClassSectionWithDetailsById() versionId 검증 누락
**위치:** `frontend/src/components/business/ClassDetailModal/ClassDetailModal.tsx:151`

**문제:**
```typescript
const [detailsResponse, studentsResponse] = await Promise.allSettled([
  apiService.getClassSectionWithDetailsById(classSectionId),  // ❌ versionId 검증 없음
  apiService.getEnrolledStudents(classSectionId)
])
```

**시나리오:**
1. 사용자가 "2024-여름학기" 버전 선택
2. 수업 목록에서 `class_001_v2` (여름학기 수업) 클릭
3. 모달 열림
4. 백엔드에서 `class_001_v2`의 `teacherId`를 조회
5. 해당 teacher가 다른 버전에 속해있으면 조회 실패
6. **Teacher not found 에러 발생**

**영향:**
- 수업 상세 정보가 정상적으로 표시되지 않음
- 교사 정보, 강의실 정보 누락

**해결방안:**
```typescript
// 백엔드에서 이미 versionId가 포함된 데이터를 반환하므로
// 프론트엔드에서 추가 검증은 불필요할 수 있음
// 단, 백엔드가 JOIN 방식으로 teacher/classroom 조회 시 versionId 필터 필요

// 백엔드: getClassSectionWithDetailsById
async getClassSectionWithDetailsById(id: string): Promise<ClassSectionWithDetails> {
  const classSection = await this.getById(id)

  // ✅ 같은 버전의 teacher/classroom만 조회
  const teacher = await this.teacherService.getByIdAndVersion(
    classSection.teacherId,
    classSection.versionId  // ✅ versionId 검증
  )

  const classroom = await this.classroomService.getByIdAndVersion(
    classSection.classroomId,
    classSection.versionId
  )

  return { ...classSection, teacher, classroom }
}
```

---

### 12. useTimetableData Hook - getClassSections() versionId 누락
**위치:** `frontend/src/components/business/timetable/hooks/useTimetableData.ts:16`

**문제:**
```typescript
const fetchTimetableData = useCallback(async () => {
  try {
    const response = await apiService.getClassSections()  // ❌ versionId 없음
    // ...
  }
}, [])
```

**영향:**
- 시간표 위젯이 모든 버전의 수업을 혼합해서 표시
- 버전 간 수업 시간 충돌
- 잘못된 시간표 렌더링

**해결방안:**
```typescript
export const useTimetableData = (versionId?: string) => {
  const fetchTimetableData = useCallback(async () => {
    if (!versionId) {
      console.warn('versionId is required')
      return
    }

    try {
      const response = await apiService.getClassSectionsByVersion(versionId)  // ✅
      // ...
    }
  }, [versionId])

  // ...
}
```

---

## ⚠️ 심각도 중간 (High)

### 13. API Service - 버전 기반 조회 메서드 부족
**위치:** `frontend/src/services/api.ts:674-691`

**문제:**
- `getClassSections()` - versionId 파라미터 없음
- `getClassSectionsWithDetails()` - versionId 파라미터 없음
- `getTeachers()` - versionId 파라미터 없음 (line 853)

**영향:**
- 프론트엔드에서 버전 필터링을 하려고 해도 API가 지원하지 않음

**해결방안:**
```typescript
// api.ts에 새 메서드 추가
async getClassSectionsByVersion(versionId: string): Promise<ApiResponse<ClassSection[]>> {
  return this.request<ClassSection[]>(`${API_ENDPOINTS.CLASS_SECTIONS.GET_ALL}?versionId=${versionId}`)
}

async getClassSectionsWithDetailsByVersion(versionId: string): Promise<ApiResponse<any[]>> {
  return this.request<any[]>(`/api/class-sections/with-details?versionId=${versionId}`)
}

async getTeachersByVersion(versionId: string): Promise<ApiResponse<Teacher[]>> {
  return this.request<Teacher[]>(`${API_ENDPOINTS.TEACHERS.GET_ALL}?versionId=${versionId}`)
}
```

---

### 14. ClassPage - SearchClassSections versionId 누락
**위치:** `frontend/src/features/class/pages/ClassPage.tsx:39`

**문제:**
```typescript
const handleSearchChange = useCallback((value: string) => {
  dispatch(setSearchTerm(value))
  if (value.trim()) {
    dispatch(searchClasses({ name: value.trim() }))  // ❌ versionId 누락
  } else {
    dispatch(fetchClasses())  // ❌ versionId 누락
  }
}, [dispatch])
```

**영향:**
- 수업 검색 시 모든 버전의 수업이 검색됨
- 다른 버전의 수업이 검색 결과에 섞임

**해결방안:**
```typescript
const handleSearchChange = useCallback((value: string) => {
  if (!selectedVersion) return

  dispatch(setSearchTerm(value))
  if (value.trim()) {
    dispatch(searchClasses({
      name: value.trim(),
      versionId: selectedVersion.id  // ✅
    }))
  } else {
    dispatch(fetchClasses(selectedVersion.id))  // ✅
  }
}, [dispatch, selectedVersion])
```

---

### 15. StudentsPage - Teacher 조회 시 versionId 누락
**위치:** `frontend/src/features/students/pages/StudentsPage.tsx` (교사 목록 로드)

**문제:**
- StudentsPage가 교사 목록을 조회할 때 (line 59 - `teachers` state)
- `apiService.getTeachers()` 호출 시 versionId 없음
- 드롭다운에 모든 버전의 교사가 표시됨

**영향:**
- 학생 정보 입력/수정 시 다른 버전의 교사를 선택할 수 있음
- 데이터 일관성 문제

**해결방안:**
```typescript
// StudentsPage에서 교사 목록 로드 시
const { selectedVersion } = useTimetableVersion()

useEffect(() => {
  if (selectedVersion) {
    loadTeachers(selectedVersion.id)
  }
}, [selectedVersion])

const loadTeachers = async (versionId: string) => {
  const response = await apiService.getTeachersByVersion(versionId)
  setTeachers(response.data)
}
```

---

## ℹ️ 심각도 낮음 (Medium)

### 16. AddClassPage / EditClassPage - versionId 전달 필요
**위치:** `frontend/src/features/class/pages/AddClassPage.tsx`, `EditClassPage.tsx`

**문제:**
- 수업 추가/편집 페이지에서 versionId를 어떻게 전달할지 명확하지 않음
- Form 컴포넌트가 versionId를 받지 않음

**영향:**
- 수업 생성/수정 시 versionId 누락 가능

**해결방안:**
```typescript
// AddClassPage.tsx
import { useTimetableVersion } from '../../../contexts/TimetableVersionContext'

function AddClassPage() {
  const { selectedVersion } = useTimetableVersion()

  const handleSubmit = async (formData: ClassFormData) => {
    if (!selectedVersion) {
      message.error('버전을 선택해주세요')
      return
    }

    await apiService.createClassSection({
      ...formData,
      versionId: selectedVersion.id  // ✅
    })
  }

  return (
    <div>
      <TimetableVersionSelector />
      <ClassForm onSubmit={handleSubmit} />
    </div>
  )
}
```

---

## 📋 추가 수정 필요 컴포넌트 목록

### TimetableVersionContext 통합 필요
1. ✅ `SchedulePage.tsx` - 이미 통합됨
2. ❌ `ClassPage.tsx` - **필수**
3. ❌ `AddClassPage.tsx` - **필수**
4. ❌ `EditClassPage.tsx` - **필수**
5. ❌ `StudentsPage.tsx` (교사 선택 드롭다운에만)
6. ❌ `AttendancePage.tsx` (수업 필터링에만)

### versionId 파라미터 추가 필요 API
1. ✅ `getStudentTimetableByVersion(studentId, versionId)` - 이미 구현됨
2. ❌ `getClassSectionsByVersion(versionId)` - **필수**
3. ❌ `getClassSectionsWithDetailsByVersion(versionId)` - **필수**
4. ❌ `getTeachersByVersion(versionId)` - **필수**
5. ❌ `searchClassSections(params)` - params에 versionId 추가 **필수**

### versionId 검증 필요 Hook
1. ❌ `useClass.ts` - handleAddClass, fetchClasses
2. ❌ `useTimetableData.ts` - fetchTimetableData
3. ✅ `SchedulePage.tsx` - loadTimetable (이미 검증 있음)

---

## 🔍 백엔드 추가 검증 필요 사항

### Teacher Service
```typescript
// 같은 버전의 teacher만 조회
async getByIdAndVersion(id: string, versionId: string): Promise<Teacher> {
  const teacher = await this.getById(id)

  if (teacher.versionId !== versionId) {
    throw new Error(`Teacher ${id} does not belong to version ${versionId}`)
  }

  return teacher
}
```

### ClassSection Service
```typescript
// 수업의 teacher/classroom이 같은 버전인지 검증
async validateClassSectionReferences(classSection: ClassSection): Promise<void> {
  const teacher = await this.teacherService.getById(classSection.teacherId)
  const classroom = await this.classroomService.getById(classSection.classroomId)

  if (teacher.versionId !== classSection.versionId) {
    throw new Error('Teacher must belong to the same version')
  }

  if (classroom.versionId !== classSection.versionId) {
    throw new Error('Classroom must belong to the same version')
  }
}
```

---

## 💡 우선순위 및 구현 순서

### Phase 1: API Layer (백엔드 + 프론트엔드 api.ts)
1. ✅ 백엔드에 versionId 필터링 로직 추가
2. ✅ 프론트엔드 api.ts에 버전 기반 메서드 추가
3. ✅ 타입 정의에 versionId 필드 추가

### Phase 2: Core Pages (필수 기능)
1. ❌ ClassPage - TimetableVersionContext 통합 (**최우선**)
2. ❌ AddClassPage / EditClassPage - versionId 포함
3. ❌ TimetableEditModal - getClassSectionsWithDetailsByVersion 사용

### Phase 3: Supporting Features
1. ❌ ClassDetailModal - 버전 검증
2. ❌ useTimetableData - versionId 파라미터
3. ❌ StudentsPage - Teacher 조회 시 버전 필터

### Phase 4: Testing & Validation
1. ❌ 모든 수업 관리 기능 테스트
2. ❌ 버전 전환 시 데이터 격리 확인
3. ❌ 교사/강의실 참조 무결성 검증

---

## 📊 예상 수정 파일 통계

- **백엔드**: 약 5-7개 파일
  - `class-section.service.ts`
  - `teacher.service.ts`
  - `class-section.controller.ts`
  - `teacher.controller.ts`
  - Routes 파일들

- **프론트엔드**: 약 12-15개 파일
  - `api.ts` (1개)
  - Pages (4개): ClassPage, AddClassPage, EditClassPage, StudentsPage
  - Components (3개): TimetableEditModal, ClassDetailModal, useTimetableData
  - Slices (2개): classSlice.ts, teacherSlice (if exists)
  - Hooks (2개): useClass.ts, useTeacher (if exists)
  - Types (2개): class-section.types.ts, teacher.types.ts

- **총 예상 수정 파일**: **17-22개**

---

## ⏱️ 예상 작업 시간 (추가)

- VERSION_BASED_CLASS_TEACHER_PLAN.md: **11.5시간**
- 위 추가 이슈 수정: **+4시간**
- **총 예상 시간: 약 15.5시간**

### 세부 추가 시간
- API 메서드 추가 (프론트엔드): 0.5시간
- ClassPage 수정: 1시간
- TimetableEditModal 수정: 0.5시간
- ClassDetailModal 수정: 0.5시간
- useTimetableData 수정: 0.5시간
- AddClassPage/EditClassPage 수정: 1시간

---

## 🎯 결론

VERSION_IMPLEMENTATION_ISSUES.md에서 식별한 8개 이슈 외에 **추가로 8개의 중요한 이슈**가 발견되었습니다.

특히:
1. **ClassPage가 TimetableVersionContext를 전혀 사용하지 않음** (Critical)
2. **API Service에 버전 기반 조회 메서드가 없음** (Critical)
3. **TimetableEditModal이 versionId 없이 수업 조회** (Critical)

이 3가지가 해결되지 않으면 버전 기반 수업 관리가 완전히 작동하지 않습니다.

권장: **VERSION_IMPLEMENTATION_ISSUES.md의 구현 순서에 따라 진행하되, 위 3가지 이슈를 최우선으로 수정**
