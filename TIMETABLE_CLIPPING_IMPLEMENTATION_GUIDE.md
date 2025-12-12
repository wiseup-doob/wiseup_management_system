# 시간표 클리핑(Clipping) 구현 가이드

## 📋 개요

시간표의 `startHour`와 `endHour` 범위를 벗어나는 수업을 자동으로 클리핑(잘라내기)하여 시간표 범위 내에서 표시하는 기능 구현 가이드입니다.

### 문제 상황
- 블록0 (08:30-10:00) 수업 생성 시
- 시간표는 09:00부터 시작 (`startHour=9`)
- 슬롯 인덱스가 음수 (-1)가 되어 헤더 영역 침범

### 해결 방법
- 원본 시간 (08:30-10:00) 유지
- 렌더링 시간 (09:00-10:00)으로 클리핑
- 셀 내부에 원본 시간 표시 (별도 아이콘/경고 없이 시간만 표시)
- 사용자가 시간 표시를 보고 클리핑 여부를 자연스럽게 인지

### 🚨 중요: 데이터 오염 방지 (v2.0 추가)

**Phase 6은 필수입니다!** onClick 핸들러에서 원본 시간을 복원하지 않으면, 사용자가 수정 모달에서 저장 시 클리핑된 시간이 DB에 영구 저장되어 원본 시간이 손실됩니다.

**예시:**
```
원본 DB: 08:30-10:00 (90분)
  ↓
클리핑 표시: 09:00-10:00 (60분, 렌더링용)
  ↓
사용자 클릭 → 모달 열림
  ↓
❌ Phase 6 미적용: 모달에 09:00-10:00 표시
   → 저장 시 DB에 09:00-10:00 영구 저장 (원본 08:30 손실!)
  ↓
✅ Phase 6 적용: 모달에 08:30-10:00 표시
   → 저장 시 DB에 08:30-10:00 유지 (원본 보존!)
```

**필수 수정 파일 (Phase 6):**
- `ClassDetailPanel.tsx` - handleClassClick
- `TeacherDetailPanel.tsx` - handleTimetableClassClick
- `SchedulePage.tsx` - handleClassClick

---

## 🎯 구현 목표

### ✅ 달성할 것
1. **자동 범위 보정**: startHour/endHour 범위 밖 수업 자동 클리핑
2. **음수 인덱스 방지**: 항상 유효한 슬롯 인덱스 보장
3. **정보 보존**: 원본 시간 데이터 유지
4. **자연스러운 표시**: 원본 시간을 셀에 표시 (별도 UI 요소 없이)

### ❌ 변경하지 않을 것
- 기존 `startHour=9` 설정 유지
- 6개 파일의 TimetableWidget Props 변경 없음
- 백엔드 API 변경 없음

---

## 📐 구현 단계

## Phase 1: 타입 정의 확장

### 파일: `frontend/src/components/business/timetable/types/timetable.types.ts`

**수정 위치**: Line 21-40 (TimetableClass 인터페이스)

```typescript
// 요일별 수업 정보
export interface TimetableClass {
  id: string
  name: string
  teacherName: string
  classroomName: string

  // ===== 기존 필드 =====
  startTime: string        // 클리핑된 시작 시간 (렌더링용)
  endTime: string          // 클리핑된 종료 시간 (렌더링용)
  duration: number

  // ===== 🆕 새로운 필드 추가 =====
  originalStartTime?: string  // 원본 시작 시간 (표시용)
  originalEndTime?: string    // 원본 종료 시간 (표시용)
  isClipped?: boolean         // 클리핑 여부 플래그

  // 기존 필드들
  startSlotIndex: number
  endSlotIndex: number
  color: string
  status: 'active' | 'inactive' | 'cancelled'
  isOutOfRange?: boolean
  layoutInfo?: {
    width: string
    left: string
    zIndex: number
    isOverlapped: boolean
  }
}
```

**변경 사항:**
- `originalStartTime`: 원본 시작 시간 (예: "08:30")
- `originalEndTime`: 원본 종료 시간 (예: "10:00")
- `isClipped`: 클리핑 발생 여부 (예: true)

---

## Phase 2: 클리핑 로직 구현

### 파일: `frontend/src/components/business/timetable/hooks/useTimetable.ts`

### 2.1 클리핑 유틸리티 함수 추가

**추가 위치**: Line 27 (transformBackendData 함수 위)

```typescript
// ===== 🆕 시간 클리핑 유틸리티 함수 =====
const clipTimeToRange = (
  startTime: string,
  endTime: string,
  startHour: number,
  endHour: number
): {
  clippedStartTime: string
  clippedEndTime: string
  originalStartTime: string
  originalEndTime: string
  isClipped: boolean
  shouldDisplay: boolean
} => {
  // 🆕 예외 처리: timeCalculations가 외부 의존성이므로 방어 코드 추가
  const actualStartMinutes = timeCalculations.timeToMinutes(startTime)
  const actualEndMinutes = timeCalculations.timeToMinutes(endTime)

  // 🆕 NaN 체크: 잘못된 시간 포맷 처리
  if (isNaN(actualStartMinutes) || isNaN(actualEndMinutes)) {
    console.error('❌ Invalid time format:', { startTime, endTime })
    return {
      clippedStartTime: '09:00',
      clippedEndTime: '09:00',
      originalStartTime: startTime,
      originalEndTime: endTime,
      isClipped: true,
      shouldDisplay: false
    }
  }

  // 🆕 시간 순서 검증: endTime이 startTime보다 빠른 경우
  if (actualEndMinutes <= actualStartMinutes) {
    console.error('❌ Invalid time range (end <= start):', { startTime, endTime })
    return {
      clippedStartTime: startTime,
      clippedEndTime: startTime,
      originalStartTime: startTime,
      originalEndTime: endTime,
      isClipped: true,
      shouldDisplay: false
    }
  }

  const startHourMinutes = startHour * 60
  const endHourMinutes = endHour * 60

  // 클리핑 수행
  const clippedStartMinutes = Math.max(actualStartMinutes, startHourMinutes)
  const clippedEndMinutes = Math.min(actualEndMinutes, endHourMinutes)

  // 클리핑 후 duration 계산
  const clippedDuration = clippedEndMinutes - clippedStartMinutes

  // duration이 0 이하면 표시하지 않음 (완전히 범위 밖)
  const shouldDisplay = clippedDuration > 0

  // 클리핑 여부 판단
  const isClipped =
    actualStartMinutes < startHourMinutes ||
    actualEndMinutes > endHourMinutes

  return {
    clippedStartTime: timeCalculations.minutesToTime(clippedStartMinutes),
    clippedEndTime: timeCalculations.minutesToTime(clippedEndMinutes),
    originalStartTime: startTime,
    originalEndTime: endTime,
    isClipped,
    shouldDisplay
  }
}
```

**⚠️ 중요 개선사항:**
1. **NaN 검증**: 잘못된 시간 포맷 (예: "abc:def") 처리
2. **시간 순서 검증**: endTime이 startTime보다 빠른 경우 감지
3. **안전한 폴백**: 예외 발생 시 shouldDisplay=false로 수업 미표시

### 2.2 transformBackendData 함수 수정

**수정 위치**: Line 43-67 (첫 번째 schedule.forEach)

**기존 코드:**
```typescript
const timetableClass = {
  id: section.id,
  name: section.name,
  teacherName: section.teacher?.name || '',
  classroomName: section.classroom?.name || '',
  startTime: schedule.startTime || '09:00',
  endTime: schedule.endTime || '10:00',
  duration: timeCalculations.timeToMinutes(schedule.endTime || '10:00') -
           timeCalculations.timeToMinutes(schedule.startTime || '09:00'),
  color: section.color || '#3498db',
  status: 'active'
}

console.log('🔍 Created timetable class:', timetableClass)
acc[day].push(timetableClass)
```

**수정 후:**
```typescript
// 🆕 클리핑 로직 적용
const clippingResult = clipTimeToRange(
  schedule.startTime || '09:00',
  schedule.endTime || '10:00',
  startHour,
  endHour
)

// 🆕 표시 불가능한 수업 필터링 (완전히 범위 밖)
if (!clippingResult.shouldDisplay) {
  console.warn('⚠️ 수업이 시간표 범위를 완전히 벗어났습니다:', {
    name: section.name,
    originalTime: `${schedule.startTime} ~ ${schedule.endTime}`,
    timetableRange: `${startHour}:00 ~ ${endHour}:00`
  })
  return // 이 수업은 추가하지 않음
}

// 🆕 클리핑된 duration 계산
const clippedDuration =
  timeCalculations.timeToMinutes(clippingResult.clippedEndTime) -
  timeCalculations.timeToMinutes(clippingResult.clippedStartTime)

const timetableClass = {
  id: section.id,
  name: section.name,
  teacherName: section.teacher?.name || '',
  classroomName: section.classroom?.name || '',

  // 🆕 클리핑된 시간 (렌더링용)
  startTime: clippingResult.clippedStartTime,
  endTime: clippingResult.clippedEndTime,
  duration: clippedDuration,

  // 🆕 원본 시간 (표시용)
  originalStartTime: clippingResult.isClipped ? clippingResult.originalStartTime : undefined,
  originalEndTime: clippingResult.isClipped ? clippingResult.originalEndTime : undefined,
  isClipped: clippingResult.isClipped,

  color: section.color || '#3498db',
  status: 'active'
}

// 🆕 클리핑 로그 추가
if (clippingResult.isClipped) {
  console.log('✂️ 수업 시간이 클리핑되었습니다:', {
    name: section.name,
    original: `${clippingResult.originalStartTime} ~ ${clippingResult.originalEndTime}`,
    clipped: `${clippingResult.clippedStartTime} ~ ${clippingResult.clippedEndTime}`
  })
}

console.log('🔍 Created timetable class:', timetableClass)
acc[day].push(timetableClass)
```

### 2.3 useTimetable 함수에 startHour/endHour 전달

**수정 위치**: Line 257-263

**기존 코드:**
```typescript
export const useTimetable = (rawData: any[] = [], options?: {
  startHour?: number
  endHour?: number
}) => {
  const { startHour = 9, endHour = 23 } = options || {}
```

**수정 후:**
```typescript
export const useTimetable = (rawData: any[] = [], options?: {
  startHour?: number
  endHour?: number
}) => {
  const { startHour = 9, endHour = 23 } = options || {}

  const timetableGrid = useMemo(() => {
    if (!rawData || rawData.length === 0) {
      return null
    }

    // ... (기존 코드)

    // 🆕 transformBackendData에 startHour, endHour 전달
    const groupedByDay = transformBackendData(classSections, startHour, endHour)
```

**transformBackendData 함수 시그니처 변경:**
```typescript
// Line 29
const transformBackendData = (
  classSections: any[],
  startHour: number,    // 🆕 추가
  endHour: number       // 🆕 추가
): Record<string, TimetableClass[]> => {
```

### 2.4 파싱된 스케줄에도 동일 적용

**수정 위치**: Line 73-95 (JSON.parse 경로)

동일한 클리핑 로직을 적용:
```typescript
const clippingResult = clipTimeToRange(
  schedule.startTime || '09:00',
  schedule.endTime || '10:00',
  startHour,
  endHour
)

if (!clippingResult.shouldDisplay) {
  console.warn('⚠️ 수업이 시간표 범위를 완전히 벗어났습니다:', { /* ... */ })
  return
}

// ... (위와 동일한 timetableClass 생성 로직)
```

---

## Phase 3: UI 표시 업데이트

### 파일: `frontend/src/components/business/timetable/TimetableCell.tsx`

### 3.1 원본 시간 표시 추가

**수정 위치**: Line 42-60

**기존 코드:**
```typescript
<div className="cell-content">
  {/* 수업 이름 */}
  <div className="class-name">{classData.name}</div>

  {/* 시작 시간 */}
  <div className="time-start">{classData.startTime}</div>

  {/* 구분선 */}
  <div className="time-separator">~</div>

  {/* 끝 시간 */}
  <div className="time-end">{classData.endTime}</div>

  {/* 선생 이름 */}
  <div className="teacher-name">{classData.teacherName}</div>

  {/* 강의실 */}
  <div className="classroom-name">{classData.classroomName}</div>
</div>
```

**수정 후:**
```typescript
<div className="cell-content">
  {/* 수업 이름 */}
  <div className="class-name">{classData.name}</div>

  {/* 시작 시간 - 원본 시간 우선 표시 */}
  <div className="time-start">
    {classData.originalStartTime || classData.startTime}
  </div>

  {/* 구분선 */}
  <div className="time-separator">~</div>

  {/* 끝 시간 - 원본 시간 우선 표시 */}
  <div className="time-end">
    {classData.originalEndTime || classData.endTime}
  </div>

  {/* 선생 이름 */}
  <div className="teacher-name">{classData.teacherName}</div>

  {/* 강의실 */}
  <div className="classroom-name">{classData.classroomName}</div>
</div>
```

**변경 사항:**
- 클리핑 경고 아이콘 (⚠️) 제거
- 클리핑 정보 텍스트 제거
- 시간만 원본으로 표시하여 사용자가 자연스럽게 인지하도록 함

### 3.2 툴팁 메시지 (변경 없음)

**수정 위치**: Line 40

**기존 코드:**
```typescript
title={`${classData.name} - ${classData.teacherName} (${classData.classroomName})`}
```

**수정 후:**
```typescript
// 변경 없음 - 기존 툴팁 유지
title={`${classData.name} - ${classData.teacherName} (${classData.classroomName})`}
```

**이유:** 시간 표시만으로 충분하므로 툴팁에 추가 정보 불필요

---

## Phase 4: CSS 스타일 추가 (생략)

**Phase 4는 생략합니다.**

클리핑 관련 시각적 표시 요소(아이콘, 점선 테두리, 그라디언트 등)를 추가하지 않으므로, CSS 수정이 필요하지 않습니다.

사용자는 **셀 내부의 시간 표시만으로** 클리핑 여부를 자연스럽게 인지할 수 있습니다.

**예시:**
- 셀이 09:00 슬롯에 위치
- 내부 시간 표시: "08:30 ~ 10:00"
- 사용자: "아, 이 수업은 08:30부터 시작하는구나" (자연스러운 인지)

---

## Phase 5: TimetableCell 클래스명 추가 (생략)

**Phase 5는 생략합니다.**

CSS 클래스 추가가 필요 없으므로, TimetableCell의 className도 수정하지 않습니다.

기존 코드 그대로 유지:
```typescript
<div
  className={`timetable-cell ${getStatusClass(classData.status)} ${className}`}
  onClick={handleClick}
```

---

## Phase 6: onClick 핸들러 데이터 복원 (🚨 중요!)

> **⚠️ 데이터 오염 방지 필수 작업**
>
> 클리핑된 시간(startTime/endTime)을 수정 모달에 그대로 전달하면, 사용자가 저장 시 DB에 클리핑된 시간이 영구적으로 저장되어 **원본 시간이 손실**됩니다!
>
> 예시:
> - 원본: 08:30-10:00 (90분)
> - 클리핑됨: 09:00-10:00 (60분)
> - 사용자가 모달에서 저장 → DB에 09:00-10:00로 저장 ❌
> - 원본 08:30 시간 영구 손실! ❌

### 6.1 ClassDetailPanel.tsx - handleClassClick 수정

**파일**: `frontend/src/features/class/components/ClassDetailPanel.tsx`

**수정 위치**: Line 34-38

**기존 코드:**
```typescript
const handleClassClick = useCallback((classData: any) => {
  console.log('📚 수업 클릭됨:', classData)
  setSelectedClassId(classData.id)
  setIsClassDetailModalOpen(true)
}, [])
```

**수정 후:**
```typescript
const handleClassClick = useCallback((classData: any) => {
  console.log('📚 수업 클릭됨:', classData)

  // 🆕 클리핑된 데이터를 원본 시간으로 복원
  const restoredClassData = {
    ...classData,
    // originalStartTime이 있으면 원본 시간 사용, 없으면 현재 시간 유지
    startTime: classData.originalStartTime || classData.startTime,
    endTime: classData.originalEndTime || classData.endTime,
    // duration 재계산 (원본 시간 기준)
    duration: classData.originalStartTime && classData.originalEndTime
      ? timeCalculations.timeToMinutes(classData.originalEndTime) -
        timeCalculations.timeToMinutes(classData.originalStartTime)
      : classData.duration
  }

  console.log('🔄 원본 시간 복원:', {
    클리핑됨: `${classData.startTime}~${classData.endTime}`,
    원본: `${restoredClassData.startTime}~${restoredClassData.endTime}`
  })

  setSelectedClassId(restoredClassData.id)
  setIsClassDetailModalOpen(true)
  // ⚠️ 주의: 모달이 classData를 직접 참조하지 않도록 확인 필요
}, [])
```

**⚠️ 추가 확인 필요:**
- ClassDetailModal이 어떻게 classData를 받는지 확인
- selectedClassId만 전달하는지, classData 객체 전체를 전달하는지 확인
- 만약 classData 객체를 전달한다면, 상태로 restoredClassData를 저장해야 함

### 6.2 TeacherDetailPanel.tsx - handleTimetableClassClick 수정

**파일**: `frontend/src/features/class/components/TeacherDetailPanel.tsx`

**수정 위치**: Line 195

**동일한 방식으로 수정:**
```typescript
const handleTimetableClassClick = useCallback((classData: any) => {
  // 🆕 클리핑된 데이터를 원본 시간으로 복원
  const restoredClassData = {
    ...classData,
    startTime: classData.originalStartTime || classData.startTime,
    endTime: classData.originalEndTime || classData.endTime,
    duration: classData.originalStartTime && classData.originalEndTime
      ? timeCalculations.timeToMinutes(classData.originalEndTime) -
        timeCalculations.timeToMinutes(classData.originalStartTime)
      : classData.duration
  }

  setSelectedClassSection(restoredClassData)
  setIsEditModalOpen(true)
}, [])
```

### 6.3 SchedulePage.tsx - handleClassClick 수정

**파일**: `frontend/src/features/schedule/pages/SchedulePage.tsx`

**수정 위치**: Line 369

**동일한 방식으로 수정:**
```typescript
const handleClassClick = useCallback((classData: any) => {
  console.log('🎯 시간표 수업 클릭:', classData)

  // 🆕 클리핑된 데이터를 원본 시간으로 복원
  const restoredClassData = {
    ...classData,
    startTime: classData.originalStartTime || classData.startTime,
    endTime: classData.originalEndTime || classData.endTime,
    duration: classData.originalStartTime && classData.originalEndTime
      ? timeCalculations.timeToMinutes(classData.originalEndTime) -
        timeCalculations.timeToMinutes(classData.originalStartTime)
      : classData.duration
  }

  setSelectedClass(restoredClassData)
  setIsClassDetailModalOpen(true)
}, [])
```

### 6.4 Drag & Drop 고려사항 (선택적)

**문제 시나리오:**
- 08:30-10:00 수업 (원본 90분)
- 클리핑되어 09:00-10:00 (60분)으로 표시됨
- 사용자가 이 수업을 12:00 슬롯으로 드래그
- **질문**: 새 위치에서 60분짜리? 90분짜리?

**권장 솔루션:**

TimetableWidget에 드래그 시작 로직이 있다면:

```typescript
const handleDragStart = (classData: TimetableClass) => {
  const dragItem = {
    ...classData,
    // 🆕 드래그 시 원본 duration 전달
    duration: classData.originalStartTime && classData.originalEndTime
      ? timeCalculations.timeToMinutes(classData.originalEndTime) -
        timeCalculations.timeToMinutes(classData.originalStartTime)
      : classData.duration
  }

  // 드래그 아이템으로 dragItem 사용
}
```

**대안:**
- 드래그 앤 드롭은 별도 이슈로 처리
- 현재는 클리핑된 duration 유지 (사용자 혼란 가능성 낮음)

---

## 🧪 테스트 시나리오

### 시나리오 1: 블록0 (08:30-10:00) - 부분 클리핑

**입력:**
```typescript
{ startTime: '08:30', endTime: '10:00' }
```

**예상 결과:**
```typescript
{
  originalStartTime: '08:30',
  originalEndTime: '10:00',
  startTime: '09:00',      // ← 클리핑됨
  endTime: '10:00',
  duration: 60,            // 60분으로 축소
  isClipped: true,
  shouldDisplay: true
}
```

**UI 표시:**
- 9:00 슬롯부터 시작
- 높이: 60px (2슬롯)
- 셀 내부: "08:30 ~ 10:00" (원본 시간만 표시)
- 별도 아이콘이나 경고 표시 없음

---

### 시나리오 2: 블록7 (20:30-22:00) - 정상 범위

**입력:**
```typescript
{ startTime: '20:30', endTime: '22:00' }
```

**예상 결과:**
```typescript
{
  originalStartTime: undefined,
  originalEndTime: undefined,
  startTime: '20:30',
  endTime: '22:00',
  duration: 90,
  isClipped: false,
  shouldDisplay: true
}
```

**UI 표시:**
- 20:30 슬롯부터 시작
- 높이: 90px (3슬롯)
- 셀 내부: "20:30 ~ 22:00"
- 클리핑 표시 없음

---

### 시나리오 3: 23:00-24:00 수업 - endHour 초과

**입력:**
```typescript
{ startTime: '23:00', endTime: '24:00' }  // endHour=23 초과
```

**예상 결과:**
```typescript
{
  originalStartTime: '23:00',
  originalEndTime: '24:00',
  startTime: '23:00',
  endTime: '23:00',        // ← 클리핑됨
  duration: 0,             // ← 0분!
  isClipped: true,
  shouldDisplay: false     // ← 표시 안 함
}
```

**UI 표시:**
- 렌더링되지 않음
- 콘솔 경고: "⚠️ 수업이 시간표 범위를 완전히 벗어났습니다"

---

### 시나리오 4: 08:00-08:30 수업 - 완전 범위 밖

**입력:**
```typescript
{ startTime: '08:00', endTime: '08:30' }  // 전체가 startHour 이전
```

**예상 결과:**
```typescript
{
  startTime: '09:00',
  endTime: '09:00',
  duration: 0,
  isClipped: true,
  shouldDisplay: false
}
```

**UI 표시:**
- 렌더링되지 않음
- 콘솔 경고 출력

---

## 📋 체크리스트

### Phase 1: 타입 정의
- [ ] `TimetableClass` 인터페이스에 3개 필드 추가
  - [ ] `originalStartTime?: string`
  - [ ] `originalEndTime?: string`
  - [ ] `isClipped?: boolean`

### Phase 2: 클리핑 로직
- [ ] `clipTimeToRange` 유틸리티 함수 구현
  - [ ] NaN 검증 로직 추가
  - [ ] 시간 순서 검증 로직 추가
  - [ ] 안전한 폴백 처리
- [ ] `transformBackendData`에 클리핑 로직 적용
  - [ ] 첫 번째 schedule.forEach (Line 43-67)
  - [ ] 두 번째 schedule.forEach (Line 73-95)
- [ ] `transformBackendData` 시그니처에 `startHour`, `endHour` 추가
- [ ] `useTimetable`에서 `transformBackendData` 호출 시 파라미터 전달
- [ ] 콘솔 로그 추가 (클리핑 정보, 범위 밖 경고)

### Phase 3: UI 표시
- [ ] `TimetableCell.tsx`에 원본 시간 표시
  - [ ] `time-start`에 `originalStartTime || startTime` 표시
  - [ ] `time-end`에 `originalEndTime || endTime` 표시

### Phase 4: CSS 스타일 (생략)
- 추가 CSS 작업 불필요

### Phase 5: TimetableCell 클래스명 추가 (생략)
- className 수정 불필요

### Phase 6: onClick 핸들러 수정 (🚨 중요!)
- [ ] `ClassDetailPanel.tsx` - handleClassClick 수정
  - [ ] 원본 시간 복원 로직 추가
  - [ ] duration 재계산 로직 추가
  - [ ] 콘솔 로그 추가
- [ ] `TeacherDetailPanel.tsx` - handleTimetableClassClick 수정
  - [ ] 원본 시간 복원 로직 추가
  - [ ] duration 재계산 로직 추가
- [ ] `SchedulePage.tsx` - handleClassClick 수정
  - [ ] 원본 시간 복원 로직 추가
  - [ ] duration 재계산 로직 추가
- [ ] (선택적) Drag & Drop 로직 확인
  - [ ] 드래그 시 원본 duration 전달 여부 확인
  - [ ] 필요 시 handleDragStart 수정

### Phase 7: 테스트
- [ ] 블록0 (08:30-10:00) 테스트
- [ ] 정상 범위 수업 테스트
- [ ] endHour 초과 수업 테스트
- [ ] 완전 범위 밖 수업 테스트
- [ ] 브라우저 콘솔 로그 확인
- [ ] **수업 클릭 → 모달 열기 → 시간 확인** (원본 시간 복원 테스트)
- [ ] **모달에서 수업 수정 → 저장 → DB 확인** (데이터 오염 방지 테스트)
- [ ] (선택적) 드래그 앤 드롭 테스트

---

## 🚀 배포 전 확인사항

### 1. 빌드 테스트
```bash
cd frontend
npm run build
```

### 2. 타입 체크
```bash
cd frontend
npx tsc --noEmit
```

### 3. 린트 체크
```bash
cd frontend
npm run lint
```

### 4. 기능 테스트
- [ ] 블록0 수업 생성 후 시간표 확인
- [ ] 원본 시간 표시 확인 (08:30-10:00이 표시되는지)
- [ ] 셀 위치 확인 (09:00 슬롯에 렌더링되는지)
- [ ] 콘솔 로그 확인

### 5. 호환성 확인
- [ ] 기존 9시 이후 수업 정상 표시
- [ ] 겹침 처리 정상 작동
- [ ] 드래그 앤 드롭 정상 작동
- [ ] 시간표 다운로드 정상 작동

---

## 📊 예상 효과

### ✅ 개선 사항
1. **음수 슬롯 인덱스 방지** → 헤더 침범 문제 해결
2. **startHour 변경 불필요** → 6개 파일 수정 회피
3. **자동 범위 보정** → 사용자 편의성 증가
4. **정보 보존** → 원본 시간 손실 없음 (Phase 6 데이터 복원)
5. **자연스러운 UI** → 시간 표시만으로 클리핑 인지 (별도 아이콘/경고 없음)
6. **데이터 오염 방지** → 모달에 원본 시간 전달 (Phase 6)
7. **예외 처리 강화** → NaN, 잘못된 시간 포맷 안전 처리
8. **미니멀한 구현** → CSS 추가 없이 깔끔한 UI 유지

### ⚠️ 주의 사항
1. **Duration 불일치** (실제 90분 → 표시 60분)
   - 셀 내부 시간은 원본(08:30-10:00) 표시
   - 렌더링 높이는 클리핑된 시간(09:00-10:00) 기준
   - 사용자 혼란 가능성 있음
2. **완전 범위 밖 수업 미표시** (08:00-08:30 등)
   - 콘솔 경고 출력
   - 시간표에 렌더링되지 않음
3. **Drag & Drop 동작** (선택 사항)
   - 기본: 클리핑된 duration으로 이동
   - 권장: 원본 duration으로 이동 (Phase 6.4 참조)

---

## 🔍 디버깅 가이드

### 콘솔 로그 확인

**클리핑 발생 시:**
```
✂️ 수업 시간이 클리핑되었습니다: {
  name: "수학A",
  original: "08:30 ~ 10:00",
  clipped: "09:00 ~ 10:00"
}
```

**범위 밖 수업:**
```
⚠️ 수업이 시간표 범위를 완전히 벗어났습니다: {
  name: "조회",
  originalTime: "08:00 ~ 08:30",
  timetableRange: "9:00 ~ 23:00"
}
```

### 문제 해결

**1. 원본 시간이 표시되지 않음**
- `originalStartTime`, `originalEndTime` 값 확인
- 조건부 렌더링 로직 확인: `classData.originalStartTime || classData.startTime`

**2. duration이 0인 수업이 표시됨**
- `shouldDisplay` 체크 로직 확인
- 필터링 조건 확인

**3. 🚨 모달에서 클리핑된 시간이 표시됨 (데이터 오염)**
- onClick 핸들러에서 원본 시간 복원 확인
- 콘솔 로그 확인: "🔄 원본 시간 복원"
- restoredClassData 객체가 모달에 전달되는지 확인
- 모달이 classData 객체를 받는지, ID만 받는지 확인

**4. NaN 오류 발생**
- `clipTimeToRange`의 NaN 체크 로직 확인
- 잘못된 시간 포맷 입력 여부 확인
- 콘솔 에러: "❌ Invalid time format" 확인

**5. 수업이 완전히 사라짐**
- `shouldDisplay: false` 체크
- 콘솔 경고: "⚠️ 수업이 시간표 범위를 완전히 벗어났습니다"
- startTime/endTime이 startHour/endHour 범위 내에 있는지 확인

---

## 📚 참고 자료

### 관련 파일
- `timetable.types.ts` - 타입 정의
- `useTimetable.ts` - 데이터 변환 로직
- `timeCalculations.ts` - 시간 계산 유틸리티
- `TimetableCell.tsx` - 셀 렌더링 컴포넌트
- `TimetableWidget.tsx` - 메인 시간표 위젯

### 기존 문서
- `TIME_BLOCK_TEMPLATE_IMPLEMENTATION_PLAN.md` - 블록 템플릿 구현 계획
- `timetable-version-system-plan.md` - 시간표 버전 시스템

---

## 📝 변경 이력

### v2.1 (2025-11-28) - 미니멀 버전
- **UI 간소화**: 클리핑 아이콘, 경고 표시, 점선 테두리 등 모든 시각적 요소 제거
- **자연스러운 표시**: 원본 시간만 표시하여 사용자가 자연스럽게 인지
- **Phase 4, 5 생략**: CSS 추가 작업 불필요
- **미니멀 구현**: 최소한의 코드 변경으로 문제 해결

### v2.0 (2025-11-28)
- **Phase 6 추가**: onClick 핸들러 데이터 복원 (데이터 오염 방지)
  - ClassDetailPanel.tsx 수정 가이드
  - TeacherDetailPanel.tsx 수정 가이드
  - SchedulePage.tsx 수정 가이드
  - Drag & Drop 고려사항
- **Phase 2.1 개선**: clipTimeToRange 예외 처리
  - NaN 검증 로직 추가
  - 시간 순서 검증 로직 추가
- **체크리스트 업데이트**: Phase 6, Phase 7 항목 추가
- **디버깅 가이드 확장**: Phase 6 관련 문제 해결 추가

### v1.0 (2025-11-28)
- 초기 버전: Phase 1-5 구현 가이드
- 기본 클리핑 로직 및 UI 표시

---

**문서 버전**: 2.1 (미니멀 버전)
**작성일**: 2025-11-28
**최종 수정일**: 2025-11-28
**작성자**: Claude Code
**검토자**: Expert Feedback (데이터 오염, Drag & Drop, 예외 처리)
**변경 사항**: UI 간소화 - 시각적 표시 요소 제거, 원본 시간만 표시
