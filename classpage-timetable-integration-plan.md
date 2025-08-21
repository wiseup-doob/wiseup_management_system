# ClassPage.tsx TimetableWidget 통합 구현 계획

## 📋 **프로젝트 개요**

### **목표**
`ClassPage.tsx`에서 수업을 클릭했을 때 상세 정보의 "수업 일정" 부분에 `TimetableWidget`을 사용하여 요일과 시작/끝 시간을 시각적으로 표시하는 구조 구현

### **현재 상태**
- ✅ `TimetableWidget` 컴포넌트 구현 완료
- ✅ `useTimetable` 훅 구현 완료
- ✅ 기본적인 데이터 변환 함수 구현
- ⚠️ 데이터 변환 로직 개선 필요
- ⚠️ CSS 스타일링 부족
- ⚠️ 에러 처리 및 fallback UI 미완성

---

## 🔍 **현재 상황 분석**

### **1. 데이터 구조 현황**

#### **Class.schedule 데이터**
```typescript
// 현재 구조
interface Class {
  schedule: string; // JSON 문자열로 저장된 일정 정보
}

// 파싱 후 구조
interface ClassSchedule {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}
```

#### **현재 구현된 변환 함수**
```typescript
// frontend/src/features/class/pages/ClassPage.tsx (약 430번째 줄)
const transformClassForTimetable = useCallback((classItem: Class) => {
  // schedule 문자열을 ClassSchedule[] 배열로 파싱
  // TimetableWidget용 데이터로 변환
}, [parseScheduleString])
```

### **2. TimetableWidget 통합 현황**

#### **현재 구현된 부분**
```typescript
// 457번째 줄 근처 - useTimetable 훅 사용
const timetableData = useTimetable(
  selectedClass ? transformClassForTimetable(selectedClass) || [] : [],
  { startHour: 9, endHour: 23, timeInterval: 30 }
)

// 800번째 줄 근처 - TimetableWidget 렌더링
<TimetableWidget 
  data={timetableData.timetableGrid}
  startHour={9}
  endHour={23}
  timeInterval={30}
  showConflicts={true}
  showEmptySlots={true}
  showTimeLabels={true}
  onClassClick={(classData) => {
    console.log('시간표에서 수업 클릭:', classData)
  }}
  className="class-timetable-widget"
/>
```

---

## 🎯 **구현 방향 및 수정 계획**

### **핵심 목표**
1. **데이터 변환 로직 개선**: `Class.schedule` → `TimetableWidget` 데이터 형식
2. **UI 통합 완성**: 상세 정보 패널에 시간표 위젯 완벽 통합
3. **사용자 경험 향상**: 로딩 상태, 에러 처리, 빈 데이터 처리
4. **반응형 디자인**: 다양한 화면 크기에 맞는 시간표 표시

---

## 📝 **단계별 구현 계획**

### **Phase 1: 아키텍처 개선 및 데이터 변환 로직 이전**

#### **1.1 데이터 변환 로직을 `useTimetable` 훅으로 이전**
**위치**: `frontend/src/components/business/timetable/hooks/useTimetable.ts`

**현재 문제점**:
- `ClassPage.tsx`에서 데이터 변환 로직이 복잡하게 구현됨
- 컴포넌트와 비즈니스 로직이 혼재되어 관심사 분리 부족
- `transformClassForTimetable` 함수가 컴포넌트에 불필요한 복잡성 추가

**개선 방향**:
```typescript
// useTimetable.ts - 훅이 원시 Class 객체를 직접 받아서 처리
export const useTimetable = (
  classItem: Class | null,
  options: TimetableOptions
) => {
  const timetableGrid = useMemo(() => {
    // 1. 데이터가 없으면 즉시 빈 그리드 반환
    if (!classItem || !classItem.schedule) {
      return createEmptyGrid(options); 
    }

    let schedules: ClassSchedule[];
    try {
      // 2. 파싱 및 검증 로직을 훅 내부에서 처리
      schedules = parseAndValidateSchedule(classItem.schedule);
    } catch (error) {
      console.error("Schedule parsing error:", error);
      return createEmptyGrid(options); // 파싱 실패 시에도 빈 그리드 반환
    }

    // 3. 파싱된 데이터를 TimetableWidget이 사용할 형식으로 변환
    const timetableInputData = schedules.map(schedule => ({
      ...classItem, // 수업 기본 정보
      ...schedule,  // 파싱된 시간 정보
      id: `${classItem.id}-${schedule.dayOfWeek}` // 고유 ID 생성
    }));

    // 4. 기존 로직을 활용하여 최종 그리드 데이터 생성
    const daySchedules = transformBackendData(timetableInputData);
    const conflicts = detectTimeConflicts(daySchedules);
    // ...

    return { ... };
  }, [classItem, options]); // selectedClass가 바뀔 때만 재계산

  return { timetableGrid };
};
```

#### **1.2 데이터 검증 로직 추가**
**목표**: 파싱된 데이터의 유효성 검증 및 오류 처리

**구현 내용**:
- `schedule` 문자열 형식 검증
- `dayOfWeek`, `startTime`, `endTime` 값 검증
- 잘못된 데이터 형식 시 기본값 또는 오류 메시지 표시

### **Phase 2: ClassPage.tsx에서 useTimetable 훅 사용 방식 변경**

#### **2.1 컴포넌트 코드 단순화**
**현재 문제점**:
- `transformClassForTimetable` 함수가 컴포넌트에 불필요한 복잡성 추가
- 데이터 변환 로직이 컴포넌트와 비즈니스 로직에 혼재
- 컴포넌트의 책임이 너무 많음

**개선 방향**:
```typescript
// ClassPage.tsx - 훅에 selectedClass를 직접 전달
const { timetableGrid, isLoading: isTimetableLoading } = useTimetable(
  selectedClass, // 원시 데이터 전달
  { startHour: 9, endHour: 23, timeInterval: 30 }
);

// 별도의 transform 함수 불필요 -> 삭제
// const transformClassForTimetable = useCallback(...) 
```

#### **2.2 조건부 렌더링 로직 구현**
**구현 내용**:
```typescript
// 데이터 상태에 따른 조건부 렌더링
<div className="timetable-section">
  <h3>수업 일정</h3>
  <div className="timetable-container">
    {isLoading ? ( // 데이터 fetching 로딩
      <TimetableSkeleton /> 
    ) : timetableGrid.daySchedules.length === 0 ? (
      <EmptyTimetableState /> // 빈 일정 안내 UI
    ) : (
      <TimetableWidget 
        // useTimetable 훅이 생성한 그리드 데이터를 그대로 전달
        gridData={timetableGrid}
        // ...props
      />
    )}
  </div>
</div>
```

### **Phase 3: Skeleton UI 및 Empty State UI 구현**

#### **3.1 TimetableSkeleton 컴포넌트 구현**
**위치**: `frontend/src/components/business/timetable/components/TimetableSkeleton.tsx`

**구현 내용**:
```typescript
// 시간표 형태를 가진 스켈레톤 UI
export const TimetableSkeleton = () => {
  return (
    <div className="timetable-skeleton">
      {/* 요일 헤더 스켈레톤 */}
      <div className="skeleton-header">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="skeleton-day-header" />
        ))}
      </div>
      
      {/* 시간대별 행 스켈레톤 */}
      <div className="skeleton-time-column">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="skeleton-time-slot" />
        ))}
      </div>
      
      {/* 그리드 셀 스켈레톤 */}
      <div className="skeleton-grid">
        {Array.from({ length: 7 * 28 }).map((_, i) => (
          <div key={i} className="skeleton-cell" />
        ))}
      </div>
    </div>
  );
};
```

#### **3.2 EmptyTimetableState 컴포넌트 구현**
**위치**: `frontend/src/components/business/timetable/components/EmptyTimetableState.tsx`

**구현 내용**:
```typescript
// 빈 일정 상태를 시각적으로 표현하는 컴포넌트
export const EmptyTimetableState = () => {
  return (
    <div className="empty-timetable-state">
      <div className="empty-icon">📅</div>
      <h4>등록된 일정이 없습니다</h4>
      <p>수업 편집 화면에서 일정을 추가해 보세요.</p>
      <div className="empty-actions">
        <Button variant="secondary" size="sm">
          일정 추가하기
        </Button>
      </div>
    </div>
  );
};
```

#### **3.3 CSS 스타일링 개선**
**위치**: `frontend/src/features/class/pages/ClassPage.css`

**구현 내용**:
```css
.timetable-container {
  /* 시간표 컨테이너 전체 스타일링 */
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.timetable-section {
  /* 수업 일정 섹션 전체 스타일링 */
  margin-top: 24px;
}

.class-timetable-widget {
  /* TimetableWidget 컴포넌트 스타일링 */
  width: 100%;
  min-height: 400px;
}

/* 스켈레톤 UI 스타일링 */
.timetable-skeleton {
  display: grid;
  grid-template-columns: 80px 1fr;
  grid-template-rows: 50px 1fr;
  gap: 1px;
  background: #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

/* 빈 상태 UI 스타일링 */
.empty-timetable-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
```

#### **3.2 반응형 디자인 구현**
**목표**: 다양한 화면 크기에 맞는 시간표 표시

**구현 내용**:
- 모바일: 세로 스크롤 가능한 시간표
- 태블릿: 중간 크기 시간표
- 데스크톱: 전체 너비 활용 시간표

### **Phase 4: 고도화 기능 및 성능 최적화**

#### **4.1 CSS 변수 및 컨테이너 쿼리 도입**
**구현 내용**:
```css
/* CSS 변수를 활용한 테마 시스템 */
:root {
  --timetable-primary-color: #007bff;
  --timetable-secondary-color: #6c757d;
  --timetable-border-color: #dee2e6;
  --timetable-background: #ffffff;
  --timetable-text-color: #212529;
}

/* 컨테이너 쿼리를 활용한 반응형 디자인 */
@container (max-width: 600px) {
  .timetable-widget {
    grid-template-columns: 60px 1fr;
    font-size: 12px;
  }
}
```

#### **4.2 고급 상호작용 기능**
**구현 내용**:
- **툴팁 시스템**: 시간대별 수업 정보를 마우스 호버 시 표시
- **클릭 이벤트**: 시간표에서 수업 클릭 시 상세 정보 모달 표시
- **키보드 네비게이션**: Tab, Arrow keys를 이용한 시간표 탐색
- **드래그 앤 드롭**: 수업 일정 시간 변경 기능 (향후 확장)

#### **4.3 코드 스플리팅 및 성능 최적화**
**구현 내용**:
```typescript
// React.lazy를 이용한 TimetableWidget 코드 스플리팅
const TimetableWidget = React.lazy(() => import('./TimetableWidget'));

// Suspense를 이용한 로딩 처리
<Suspense fallback={<TimetableSkeleton />}>
  <TimetableWidget {...props} />
</Suspense>
```

#### **4.4 접근성 개선 및 테마 시스템**
**구현 내용**:
- **ARIA 레이블**: 스크린 리더를 위한 적절한 레이블 및 역할 정의
- **색상 대비**: WCAG 가이드라인 준수
- **다크 모드**: CSS 변수를 활용한 테마 전환 시스템
- **고대비 모드**: 시각 장애인을 위한 고대비 색상 지원

---

## 🛠️ **수정이 필요한 파일들**

### **1. 주요 수정 파일**
- **`frontend/src/features/class/pages/ClassPage.tsx`**
  - `transformClassForTimetable` 함수 개선
  - `TimetableWidget` 데이터 전달 로직 개선
  - 조건부 렌더링 로직 추가
  - 에러 처리 로직 구현

### **2. 스타일링 파일**
- **`frontend/src/features/class/pages/ClassPage.css`**
  - 시간표 관련 CSS 클래스 추가
  - 반응형 디자인 스타일링
  - 로딩 상태 및 에러 상태 스타일링

---

## 🔧 **구현 시 고려사항**

### **1. 데이터 일관성**
- `Class.schedule`의 실제 데이터 구조 확인 필요
- 백엔드 API 응답과 프론트엔드 파싱 로직 일치 확인
- 데이터 형식 변경 시 하위 호환성 유지

### **2. 성능 최적화**
- `useCallback`과 `useMemo`를 사용한 불필요한 재계산 방지
- `selectedClass` 변경 시에만 시간표 데이터 재계산
- 대용량 데이터 처리 시 가상화(virtualization) 고려

### **3. 접근성(Accessibility)**
- ARIA 레이블 및 역할 정의
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 색상 대비 및 가독성 확보

### **4. 브라우저 호환성**
- 최신 브라우저 지원 (Chrome, Firefox, Safari, Edge)
- 모바일 브라우저 최적화
- CSS Grid 및 Flexbox 지원 확인

---

## 📊 **성공 지표**

### **기능적 요구사항**
- ✅ 수업 클릭 시 상세 정보 표시
- ✅ 시간표 위젯을 통한 일정 시각화
- ✅ 요일별, 시간대별 수업 배치
- ✅ 빈 일정 처리 및 안내 메시지

### **성능 요구사항**
- 🎯 시간표 렌더링 시간 < 200ms
- 🎯 데이터 변환 시간 < 100ms
- 🎯 메모리 사용량 최적화

### **사용성 요구사항**
- 🎯 직관적인 시간표 표시
- 🎯 반응형 디자인으로 모든 디바이스 지원
- 🎯 접근성 가이드라인 준수

---

## 🚀 **구현 우선순위 (재조정)**

### **High Priority (Phase 1-2)**
1. **데이터 변환 로직을 `useTimetable` 훅으로 이전 (아키텍처 개선)**
2. `ClassPage.tsx`에서 `useTimetable` 훅 사용 방식 변경
3. 기본적인 로딩 / 빈 상태 / 에러 상태에 대한 조건부 렌더링 구현

### **Medium Priority (Phase 3)**
1. **Skeleton UI** 및 구체적인 **Empty State UI** 컴포넌트 구현
2. 기본 CSS 스타일링 및 반응형 디자인 적용 (Flexbox/Grid 활용)
3. 데이터 구조 개선 (JSON 문자열 → 객체 배열) 고려

### **Low Priority (Phase 4)**
1. CSS 변수 및 컨테이너 쿼리 도입
2. 툴팁, 클릭 이벤트 등 고급 상호작용 기능 추가
3. `React.lazy()`를 이용한 `TimetableWidget` 코드 스플리팅 (성능 최적화)
4. 접근성 개선 및 테마 시스템 구축

---

## 📝 **구현 체크리스트**

### **Phase 1: 아키텍처 개선**
- [ ] `useTimetable` 훅에 데이터 변환 로직 이전
- [ ] `ClassPage.tsx`에서 `transformClassForTimetable` 함수 제거
- [ ] 훅이 `Class` 객체를 직접 받도록 수정
- [ ] 파싱 오류 처리 및 빈 그리드 생성 로직 구현

### **Phase 2: 컴포넌트 통합**
- [ ] `ClassPage.tsx`에서 `useTimetable` 훅 사용 방식 변경
- [ ] 조건부 렌더링 로직 구현 (로딩/빈 상태/데이터 표시)
- [ ] `TimetableWidget`에 올바른 데이터 전달

### **Phase 3: UI 컴포넌트 구현**
- [ ] `TimetableSkeleton` 컴포넌트 구현
- [ ] `EmptyTimetableState` 컴포넌트 구현
- [ ] 기본 CSS 스타일링 및 반응형 디자인 적용
- [ ] 데이터 구조 개선 (JSON 문자열 → 객체 배열) 고려

### **Phase 4: 고도화 기능**
- [ ] CSS 변수 및 컨테이너 쿼리 도입
- [ ] 툴팁, 클릭 이벤트 등 고급 상호작용 기능 추가
- [ ] `React.lazy()`를 이용한 코드 스플리팅
- [ ] 접근성 개선 및 테마 시스템 구축

---

## 🔍 **테스트 계획**

### **단위 테스트**
- `transformClassForTimetable` 함수 테스트
- 데이터 파싱 로직 테스트
- 오류 처리 로직 테스트

### **통합 테스트**
- `ClassPage`와 `TimetableWidget` 통합 테스트
- 데이터 흐름 테스트
- UI 렌더링 테스트

### **사용자 테스트**
- 다양한 데이터 형식에 대한 테스트
- 반응형 디자인 테스트
- 접근성 테스트

---

## 📚 **참고 자료**

### **기술 문서**
- React Hooks 공식 문서
- CSS Grid 레이아웃 가이드
- TypeScript 타입 시스템 가이드

### **디자인 가이드라인**
- Material Design 시간표 컴포넌트
- Accessibility (WCAG) 가이드라인
- 반응형 디자인 패턴

---

## 🎯 **결론**

이 계획을 통해 `ClassPage.tsx`에 `TimetableWidget`을 완벽하게 통합하여, 사용자가 수업을 클릭했을 때 해당 수업의 일정을 시각적으로 명확하게 확인할 수 있는 시스템을 구축할 수 있습니다.

구현은 단계별로 진행하여 각 단계마다 테스트하고 검증하면서 안정적인 시스템을 만들어 나갈 예정입니다.
