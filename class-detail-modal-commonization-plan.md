# ClassDetailModal 공통화 계획

## 📋 개요
현재 `schedule` 기능에만 있는 `ClassDetailModal`을 `ClassDetailPanel`과 `TeacherDetailPanel`에서도 재사용할 수 있도록 공통 컴포넌트로 이동시키는 계획입니다.

## 🎯 목표
- 수업 상세 정보 모달을 여러 페이지에서 재사용
- 일관된 사용자 경험 제공
- 코드 중복 제거 및 유지보수성 향상

## 📁 현재 구조
```
frontend/src/features/schedule/components/
├── ClassDetailModal.tsx
└── ClassDetailModal.css
```

## 🏗️ 1단계: 컴포넌트 위치 이동

### 이동할 위치
```
frontend/src/components/business/ClassDetailModal/
├── ClassDetailModal.tsx
├── ClassDetailModal.css
└── index.ts
```

### 이동 이유
- `schedule` 기능에 특화된 것이 아니라 수업 상세 정보를 보여주는 범용 컴포넌트
- `components/business/` 폴더는 비즈니스 로직이 있는 재사용 가능한 컴포넌트들이 위치
- 다른 기능들(`class`, `schedule` 등)에서도 사용할 수 있도록 공통 영역으로 이동

## 🔧 2단계: Props 인터페이스 확장

### 현재 Props
```typescript
interface ClassDetailModalProps {
  isOpen: boolean
  onClose: () => void
  classSectionId: string | null
  onColorSaved?: () => void
}
```

### 확장된 Props
```typescript
interface ClassDetailModalProps {
  isOpen: boolean
  onClose: () => void
  classSectionId: string | null
  onColorSaved?: () => void
  // 새로운 옵션들
  showColorPicker?: boolean  // 색상 선택기 표시 여부
  showStudentList?: boolean  // 학생 목록 표시 여부
}
```

## 🔗 3단계: 사용처별 연결

### 3-1. SchedulePage에서 사용
**현재 위치**: `frontend/src/features/schedule/pages/SchedulePage.tsx`
**변경사항**:
- Import 경로 변경: `../../../components/business/ClassDetailModal`
- Props 설정:
  ```typescript
  <ClassDetailModal
    isOpen={isClassDetailModalOpen}
    onClose={handleCloseClassDetailModal}
    classSectionId={selectedClassId}
    onColorSaved={handleColorSaved}
    showColorPicker={true}
    showStudentList={true}
  />
  ```

### 3-2. ClassDetailPanel에서 사용
**위치**: `frontend/src/features/class/components/ClassDetailPanel.tsx`
**추가할 기능**:
- 수업 클릭 시 `ClassDetailModal` 열기
- 모달 상태 관리 추가
- 색상 저장 후 수업 목록 새로고침 콜백 구현
- Props 설정:
  ```typescript
  <ClassDetailModal
    isOpen={isClassDetailModalOpen}
    onClose={handleCloseClassDetailModal}
    classSectionId={selectedClassId}
    onColorSaved={handleClassColorSaved}
    showColorPicker={true}
    showStudentList={true}
  />
  ```

### 3-3. TeacherDetailPanel에서 사용
**위치**: `frontend/src/features/class/components/TeacherDetailPanel.tsx`
**추가할 기능**:
- 시간표의 수업 클릭 시 `ClassDetailModal` 열기
- 색상 저장 후 선생님 수업 목록 새로고침 콜백 구현
- Props 설정:
  ```typescript
  <ClassDetailModal
    isOpen={isClassDetailModalOpen}
    onClose={handleCloseClassDetailModal}
    classSectionId={selectedClassId}
    onColorSaved={handleTeacherClassColorSaved}
    showColorPicker={false}
    showStudentList={true}
  />
  ```

## 🎨 4단계: CSS 스타일 정리

### 스타일 구조
- **공통 스타일**: `ClassDetailModal.css`에 유지
- **기능별 스타일**: 조건부로 적용
- **다크모드 지원**: 기존 다크모드 스타일 유지

### CSS 클래스 정리
```css
/* 기본 모달 스타일 */
.class-detail-modal-overlay { }
.class-detail-modal-container { }

/* 조건부 스타일 */
.color-picker-section { }
.students-list-section { }

/* 다크모드 */
@media (prefers-color-scheme: dark) { }
```

## 🔄 5단계: 상태 관리 개선

### 현재 방식
- 각 페이지에서 개별적으로 모달 상태 관리
- 중복된 상태 관리 로직

### 개선된 방식
- `ClassDetailModal` 내부에서 자체 상태 관리
- 외부에서는 `isOpen`, `classSectionId`만 전달
- 모달 내부에서 데이터 로딩 및 에러 처리

### 새로고침 콜백 구현 예시

#### ClassDetailPanel에서:
```typescript
// 색상 저장 후 수업 목록 새로고침 콜백
const handleClassColorSaved = useCallback(() => {
  console.log('🎨 수업 색상 저장됨, 수업 목록 새로고침')
  // 수업 목록 새로고침
  dispatch(fetchClasses())
}, [dispatch])

// 모달 상태 관리
const [isClassDetailModalOpen, setIsClassDetailModalOpen] = useState(false)
const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

// 수업 클릭 핸들러
const handleClassClick = useCallback((classData: any) => {
  setSelectedClassId(classData.id)
  setIsClassDetailModalOpen(true)
}, [])

// 모달 닫기 핸들러
const handleCloseClassDetailModal = useCallback(() => {
  setIsClassDetailModalOpen(false)
  setSelectedClassId(null)
}, [])
```

#### TeacherDetailPanel에서:
```typescript
// 색상 저장 후 선생님 수업 목록 새로고침 콜백
const handleTeacherClassColorSaved = useCallback(() => {
  console.log('🎨 수업 색상 저장됨, 선생님 수업 목록 새로고침')
  // 선생님 수업 목록 새로고침 (props로 받은 onRefreshClasses 호출)
  onRefreshClasses?.()
}, [onRefreshClasses])

// 모달 상태 관리
const [isClassDetailModalOpen, setIsClassDetailModalOpen] = useState(false)
const [selectedClassId, setSelectedClassId] = useState<string | null>(null)

// 시간표 수업 클릭 핸들러
const handleTimetableClassClick = useCallback((classData: any) => {
  setSelectedClassId(classData.id)
  setIsClassDetailModalOpen(true)
}, [])

// 모달 닫기 핸들러
const handleCloseClassDetailModal = useCallback(() => {
  setIsClassDetailModalOpen(false)
  setSelectedClassId(null)
}, [])
```

## 📝 6단계: Import 경로 업데이트

### 변경할 파일들
1. `frontend/src/features/schedule/pages/SchedulePage.tsx`
2. `frontend/src/features/class/components/ClassDetailPanel.tsx`
3. `frontend/src/features/class/components/TeacherDetailPanel.tsx`

### 새로운 Import
```typescript
// 기존
import { ClassDetailModal } from '../components/ClassDetailModal'

// 변경 후
import { ClassDetailModal } from '../../../components/business/ClassDetailModal'
```

## 🧪 7단계: 테스트 및 검증

### 테스트 항목
- [ ] 각 사용처에서 모달이 정상 작동하는지 확인
- [ ] 색상 변경 기능이 모든 곳에서 작동하는지 확인
- [ ] 학생 목록이 정상 표시되는지 확인
- [ ] 모달 닫기/열기가 정상 작동하는지 확인
- [ ] Props 옵션에 따라 UI가 올바르게 표시되는지 확인
- [ ] 색상 저장 후 각 사용처에서 새로고침이 정상 작동하는지 확인

### 검증 방법
1. **SchedulePage**: 
   - 기존 기능이 그대로 작동하는지 확인
   - 색상 저장 후 시간표가 새로고침되는지 확인
2. **ClassDetailPanel**: 
   - 수업 클릭 시 모달이 열리는지 확인
   - 색상 저장 후 수업 목록이 새로고침되는지 확인
3. **TeacherDetailPanel**: 
   - 시간표 수업 클릭 시 모달이 열리는지 확인
   - 색상 저장 후 선생님 수업 목록이 새로고침되는지 확인

## ✅ 장점

### 1. 코드 재사용성
- 한 번 구현한 모달을 여러 곳에서 사용
- 중복 코드 제거

### 2. 일관된 UX
- 모든 곳에서 동일한 수업 상세 정보 표시
- 사용자 경험 통일

### 3. 유지보수성
- 한 곳에서 수정하면 모든 곳에 반영
- 버그 수정 시 모든 사용처에 자동 적용

### 4. 확장성
- 새로운 기능 추가 시 모든 사용처에 자동 적용
- Props 옵션으로 기능 제어 가능

## ⚠️ 주의사항

### 1. Props 복잡성
- 사용처별로 다른 옵션을 지원해야 함
- Props 인터페이스가 복잡해질 수 있음

### 2. 의존성 관리
- 공통 컴포넌트로 이동하면서 의존성 정리 필요
- 순환 의존성 방지

### 3. 스타일 충돌
- 다른 페이지의 스타일과 충돌하지 않도록 주의
- CSS 클래스명 충돌 방지

## 🚀 구현 순서

1. **1단계**: 컴포넌트 파일 이동 및 폴더 구조 생성
2. **2단계**: Props 인터페이스 확장
3. **3단계**: CSS 스타일 정리
4. **4단계**: SchedulePage에서 Import 경로 변경 및 테스트
5. **5단계**: ClassDetailPanel에 모달 추가
6. **6단계**: TeacherDetailPanel에 모달 추가
7. **7단계**: 전체 테스트 및 검증

## 📊 예상 효과

- **코드 중복 제거**: 약 200-300줄의 중복 코드 제거
- **유지보수성 향상**: 모달 관련 수정 시 한 곳에서만 작업
- **사용자 경험 개선**: 일관된 모달 UI/UX 제공
- **개발 효율성**: 새로운 페이지에서 모달 재사용 가능
- **실시간 동기화**: 모든 사용처에서 색상 변경 시 즉시 반영
- **일관된 새로고침**: 각 사용처에서 적절한 데이터 새로고침

---

**작성일**: 2024년 12월 19일  
**작성자**: AI Assistant  
**상태**: 계획 단계 (구현 대기)
