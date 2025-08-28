# 📅 TimetableWidget 30분 단위 고정 및 물리적 크기 최적화 계획서

## 🎯 **프로젝트 개요**
`TimetableWidget`에서 **기존 `timeInterval` prop을 30분으로 고정**하고, 시간표 한 칸의 물리적 세로 크기를 **60px에서 30px로 절반으로 줄여** 더 조밀하고 정확한 시간표를 구현합니다.

## 🔍 **현재 문제점 분석**

### **1. timeInterval prop을 30분으로 고정**
```typescript
// ❌ 현재: timeInterval = 60 기본값 사용
const fullTimeSlots = useMemo(() => {
  for (let minutes = startMinutes; minutes < endMinutes; minutes += timeInterval) {
    // timeInterval = 60으로 고정되어 있음
  }
}, [startHour, endHour, timeInterval])

// ✅ 목표: timeInterval = 30으로 고정
```

### **2. 물리적 크기 최적화 필요**
```typescript
// ❌ 현재: 60px 고정 높이 (너무 큼)
height: `calc(${spanRows} * 60px - 4px)`

// ✅ 목표: 30px로 절반 크기 (더 조밀하고 정확)
height: `calc(${spanRows} * 30px - 4px)`
```

## 🏗️ **수정 구조 및 계획**

### **Phase 1: timeInterval을 30분으로 고정 및 상수 정의**
1. **`constants/timetable.constants.ts` 생성**
   ```typescript
   // timeInterval을 30분으로 고정하는 상수 정의
   export const TIMETABLE_CONSTANTS = {
     TIME_INTERVAL: 30,           // 30분 단위 고정
     SLOT_HEIGHT: 30,             // 30px (기존 60px의 절반)
     SLOT_HEIGHT_PX: '30px',      // CSS용 문자열
     SLOT_HEIGHT_CALC: 'calc(30px - 4px)' // 실제 셀 높이
   } as const
   
   // timeInterval prop은 여전히 존재하지만 기본값을 30으로 변경
   ```

2. **`types/timetable.types.ts` 수정**
   ```typescript
   // 기존 TimetableClass 인터페이스는 유지
   export interface TimetableClass {
     id: string
     name: string
     teacherName: string
     classroomName: string
     startTime: string        // "09:00" 형태
     endTime: string          // "10:00" 형태
     duration: number         // 분 단위
     startSlotIndex: number   // 30분 단위 기준 (고정)
     endSlotIndex: number     // 30분 단위 기준 (고정)
     color: string
     status: 'active' | 'inactive' | 'cancelled'
     isOutOfRange?: boolean
   }
   
   // 더 이상 TimeSlotInfo 불필요 (30분 단위 고정으로 단순화)
   ```

### **Phase 2: 30분 단위 고정 및 단순화된 계산 함수**
1. **`utils/timeCalculations.ts` 생성** (30분 단위 고정)
   ```typescript
   import { TIMETABLE_CONSTANTS } from '../constants/timetable.constants'
   
   export const timeCalculations = {
     // 기존 함수들 (timetableTransformers.ts에서 이미 구현됨)
     timeToMinutes: (time: string): number => {
       const [hours, minutes] = time.split(':').map(Number)
       return hours * 60 + minutes
     },
     
     minutesToTime: (minutes: number): string => {
       const hours = Math.floor(minutes / 60)
       const mins = minutes % 60
       return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
     },
     
     // ✅ 30분 단위 고정 슬롯 인덱스 계산
     calculateSlotIndex: (time: string, startHour: number): number => {
       const minutes = timeCalculations.timeToMinutes(time)
       const startMinutes = startHour * 60
       return Math.floor((minutes - startMinutes) / TIMETABLE_CONSTANTS.TIME_INTERVAL) // 30분 고정
     },
     
     // ✅ 30분 단위 고정 높이 계산 (단순화)
     calculateHeight: (startTime: string, endTime: string, startHour: number): number => {
       const startSlotIndex = timeCalculations.calculateSlotIndex(startTime, startHour)
       const endSlotIndex = timeCalculations.calculateSlotIndex(endTime, startHour)
       const spanRows = Math.max(1, endSlotIndex - startSlotIndex + 1)
       
       // 30px 고정 높이로 계산
       return spanRows * TIMETABLE_CONSTANTS.SLOT_HEIGHT
     }
   }
   ```

### **Phase 3: TimetableWidget.tsx 30분 단위 고정 및 물리적 크기 최적화**

#### **3.1 timeInterval 기본값을 30분으로 변경**
```typescript
// ❌ 현재: timeInterval = 60 기본값
export const TimetableWidget: React.FC<TimetableWidgetProps> = ({
  data,
  startHour = 9,
  endHour = 23,
  timeInterval = 60,  // 현재 60분 기본값
  // ...
}) => {

// ✅ 목표: timeInterval = 30 기본값으로 변경
export const TimetableWidget: React.FC<TimetableWidgetProps> = ({
  data,
  startHour = 9,
  endHour = 23,
  timeInterval = 30,  // 30분 기본값으로 변경
  // ...
}) => {

// fullTimeSlots는 기존 로직 유지 (timeInterval prop 사용)
const fullTimeSlots = useMemo(() => {
  const slots: { time: string }[] = []
  const startMinutes = startHour * 60
  const endMinutes = endHour * 60
  for (let minutes = startMinutes; minutes < endMinutes; minutes += timeInterval) {
    // ... 기존 로직 유지
  }
  return slots
}, [startHour, endHour, timeInterval]) // timeInterval 의존성 유지
```

#### **3.2 수업 셀 위치 계산 로직은 기존 유지**
```typescript
// ✅ 기존 calculateClassPosition 함수는 그대로 유지
const calculateClassPosition = useCallback((cls: TimetableClass, dayIndex: number) => {
  const startRow = cls.startSlotIndex + 2 // +2는 헤더 행
  const spanRows = Math.max(1, cls.endSlotIndex - cls.startSlotIndex + 1)
  const column = dayIndex + 2 // +2는 시간 컬럼
  
  return {
    gridRow: `${startRow} / span ${spanRows}`,
    gridColumn: column
  }
}, [])

// ✅ 기존 로직이 이미 올바르게 작동함 (변경 불필요)
```

#### **3.3 수업 셀 렌더링 로직에서 60px를 30px로 변경**
```typescript
// ❌ 현재: 하드코딩된 60px 높이
{processedClasses
  .filter(cls => {
    return cls.startSlotIndex === timeIndex
  })
  .map((cls, classIndex) => {
    const spanRows = Math.max(1, cls.endSlotIndex - cls.startSlotIndex + 1)
    
    return (
      <div
        key={`${cls.id}-${classIndex}`}
        className={`timetable-class-cell ${showConflicts && cls.layoutInfo?.isOverlapped ? 'conflict' : ''}`}
        style={{
          position: 'absolute',
          top: '2px',
          left: cls.layoutInfo ? `${cls.layoutInfo.left}` : '0',
          right: cls.layoutInfo ? 'auto' : '0',
          width: cls.layoutInfo ? cls.layoutInfo.width : '100%',
          // ❌ 현재: 60px 고정
          height: `calc(${spanRows} * 60px - 4px)`,
          backgroundColor: cls.color || 'var(--timetable-accent-color)',
          zIndex: cls.layoutInfo?.zIndex || 20,
          cursor: onClassClick ? 'pointer' : 'default'
        }}
        onClick={() => onClassClick?.(cls)}
      >
        <div className="class-name">{cls.name}</div>
        <div className="class-time">
          <div className="time-start">{cls.startTime}</div>
          <div className="time-separator">~</div>
          <div className="time-end">{cls.endTime}</div>
        </div>
      </div>
    )
  })}

// ✅ 목표: 30px로 변경
height: `calc(${spanRows} * 30px - 4px)`,
```

### **Phase 4: CSS 변수 시스템 30px 고정**
1. **`TimetableWidget.css` 수정**
   ```css
   .timetable-widget {
     --timetable-columns: 8;           /* 요일 + 시간 컬럼 */
     --timetable-rows: var(--dynamic-rows);
     --timetable-time-interval: 30px;  /* 30px 고정 */
     --timetable-cell-height: 30px;    /* 30px 고정 */
   }
   
   .timetable-class-cell {
     /* 기존 고정 높이 제거 */
     /* height: 60px; → 제거 */
     
     /* 새로운 30px 고정 높이 적용 */
     min-height: var(--timetable-cell-height);
   }
   ```

2. **JavaScript에서 CSS 변수 고정 설정** (기존 `gridStyle` 수정)
   ```typescript
   const gridStyle = useMemo(() => {
     return {
       '--timetable-columns': DAYS.length + 1, // +1은 시간 컬럼
       '--timetable-rows': fullTimeSlots.length,
       '--timetable-time-interval': TIMETABLE_CONSTANTS.SLOT_HEIGHT_PX, // ✅ 30px 고정
       '--dynamic-rows': fullTimeSlots.length
     } as React.CSSProperties
   }, [fullTimeSlots.length]) // timeInterval 의존성 제거
   ```

3. **기존 CSS 변수와의 통합** (timetableTransformers.ts에서 생성된 gridStyles 활용)
   ```typescript
   // 기존 data.gridStyles와 통합
   const finalGridStyle = useMemo(() => {
     const baseStyle = {
       '--timetable-columns': DAYS.length + 1,
       '--timetable-rows': fullTimeSlots.length,
       '--timetable-time-interval': TIMETABLE_CONSTANTS.SLOT_HEIGHT_PX, // 30px 고정
       '--dynamic-rows': fullTimeSlots.length
     }
     
     // timetableTransformers.ts에서 생성된 gridStyles와 병합
     return { ...baseStyle, ...data?.gridStyles } as React.CSSProperties
   }, [fullTimeSlots.length, data?.gridStyles]) // timeInterval 의존성 제거
   ```

### **Phase 5: 겹치는 수업 처리 로직 30분 단위 고정**
1. **`detectRealTimeOverlaps` 함수 수정** (30분 단위 고정)
   ```typescript
   // ✅ 30분 단위 고정으로 단순화
   const detectRealTimeOverlaps = (
     classes: TimetableClass[]
     // timeInterval 매개변수 제거 (30분 고정)
   ): TimetableClass[][] => {
     const overlaps: TimetableClass[][] = []
     const processed = new Set<string>()
     
     classes.forEach((cls1) => {
       if (processed.has(cls1.id)) return
       
       // 30분 단위 기준으로 겹침 감지
       const start1 = timeCalculations.timeToMinutes(cls1.startTime)
       const end1 = timeCalculations.timeToMinutes(cls1.endTime)
       
       const group = [cls1]
       
       classes.forEach((cls2) => {
         if (cls1.id === cls2.id || processed.has(cls2.id)) return
         
         const start2 = timeCalculations.timeToMinutes(cls2.startTime)
         const end2 = timeCalculations.timeToMinutes(cls2.endTime)
         
         // ✅ 30분 단위 기준으로 겹침 감지
         if (start1 < end2 && start2 < end1) {
           group.push(cls2)
           processed.add(cls2.id)
         }
       })
       
       if (group.length > 1) {
         overlaps.push(group)
         group.forEach(cls => processed.add(cls.id))
       } else {
         processed.add(cls1.id)
       }
     })
     
     return overlaps
   }
   ```

2. **`processOverlappingClasses` 함수 수정**
   ```typescript
   const processOverlappingClasses = (
     classes: TimetableClass[]
     // timeInterval 매개변수 제거 (30분 고정)
   ): (TimetableClass & { layoutInfo?: any })[] => {
     const allOverlaps = detectRealTimeOverlaps(classes) // timeInterval 인자 제거
     const layoutMap = new Map<string, any>()
     
     allOverlaps.forEach((group) => {
       group.forEach((cls, index) => {
         layoutMap.set(cls.id, {
           width: `${Math.floor(100 / group.length)}%`,
           left: `${Math.floor((index * 100) / group.length)}%`,
           zIndex: 20 + index,
           isOverlapped: true
         })
       })
     })
     
     return classes.map(cls => ({
       ...cls,
       layoutInfo: layoutMap.get(cls.id) || { 
         width: '100%', 
         left: '0%', 
         zIndex: 20, 
         isOverlapped: false 
       }
     }))
   }
   ```

### **Phase 6: 기존 코드와의 통합 및 호환성 보장**

1. **`timetableTransformers.ts` 수정** ✅
   ```typescript
   // ✅ timeInterval 인자는 유지하되, 호출 시 30을 전달하도록 수정
   export const transformClassSectionToTimetableClass = (
     classSection: ClassSectionWithSchedule,
     startHour: number,
     timeInterval: number  // 인자는 유지 (호환성)
   ): TimetableClass[] => {
     return classSection.schedule.map((schedule, index) => {
       // ✅ timeInterval을 사용하여 슬롯 인덱스 계산 (30분 전달 예정)
       const startSlotIndex = calculateSlotIndex(schedule.startTime, startHour, timeInterval)
       const endSlotIndex = calculateSlotIndex(schedule.endTime, startHour, timeInterval)
       
       return {
         id: `${classSection.id}-${index}`,
         name: classSection.name,
         teacherName: classSection.teacher?.name || '',
         classroomName: classSection.classroom?.name || '',
         startTime: schedule.startTime,
         endTime: schedule.endTime,
         duration: timeToMinutes(schedule.endTime) - timeToMinutes(schedule.startTime),
         startSlotIndex,  // ✅ timeInterval 기준으로 계산됨
         endSlotIndex,    // ✅ timeInterval 기준으로 계산됨
         color: classSection.color || generateClassColor(classSection.name),
         status: 'active'
       }
     })
   }
   
   // ✅ groupClassesByDay 함수도 timeInterval 인자 유지
   export const groupClassesByDay = (
     classSections: ClassSectionWithSchedule[],
     startHour: number,
     timeInterval: number  // 인자 유지 (호환성)
   ): DaySchedule[] => {
     // ... 기존 로직 유지, 호출 시 30을 전달하도록 수정
   }
   ```

2. **`TimetableWidget.tsx`에서 기존 함수 호출 수정**
   ```typescript
   // ✅ 30분 단위 고정으로 단순화
   const processedDaySchedules = useMemo(() => {
     return DAYS.map(day => {
       const daySchedule = data?.daySchedules?.find(d => d.dayOfWeek === day)
       const classes = daySchedule?.classes || []
       return {
         day,
         classes: processOverlappingClasses(classes) // timeInterval 불필요 (30분 고정)
       }
     })
   }, [data?.daySchedules]) // timeInterval 의존성 제거
   ```

## 🎨 **UI/UX 개선 사항**

### **1. 동적 높이 표시**
- `timeInterval` 변경 시 실시간으로 수업 셀 높이 조정
- 시각적 피드백으로 사용자에게 변경 사항 명확히 표시

### **2. 반응형 레이아웃**
- 다양한 `timeInterval` 값에 대한 최적화된 레이아웃
- 모바일과 데스크톱에서 모두 적절한 표시

### **3. 성능 최적화**
- 불필요한 재계산 방지
- `useMemo`와 `useCallback`을 활용한 최적화

## 🧪 **테스트 시나리오**

### **기본 기능 테스트**
- [ ] `timeInterval = 30` (30분 단위)
- [ ] `timeInterval = 60` (1시간 단위, 기존 동작)

### **수업 셀 테스트**
- [ ] 30분 수업이 1개 슬롯에 정확히 표시
- [ ] 1시간 수업이 2개 슬롯에 정확히 표시
- [ ] 1.5시간 수업이 3개 슬롯에 정확히 표시

### **겹침 처리 테스트**
- [ ] 30분 단위에서 겹치는 수업 정확 감지
- [ ] 레이아웃 정보 정확 계산
- [ ] 시각적 겹침 표시 정상 작동

### **성능 테스트**
- [ ] 큰 시간표에서 렌더링 성능
- [ ] `timeInterval` 변경 시 응답 속도
- [ ] 메모리 사용량 모니터링

## 📋 **구현 우선순위**

### **High Priority (필수)**
- [ ] `constants/timetable.constants.ts` 생성 (30분 단위 고정 상수)
- [ ] `TimetableWidget.tsx`의 `timeInterval` 기본값을 60 → 30으로 변경
- [ ] `TimetableWidget.tsx`의 하드코딩된 `60px` 높이를 `30px`로 변경
- [ ] `timetableTransformers.ts` 호출 시 `timeInterval = 30` 전달하도록 수정
- [ ] CSS 변수 시스템을 30px 고정으로 설정

### **Medium Priority (권장)**
- [ ] `detectRealTimeOverlaps`와 `processOverlappingClasses` 함수는 기존 로직 유지 (변경 불필요)
- [ ] 성능 최적화 및 에러 처리 강화

### **Low Priority (향후)**
- [ ] 15분 단위 지원 (30분의 절반)
- [ ] 사용자 정의 시간 단위
- [ ] 시간 단위별 최적화된 레이아웃

## 🚀 **예상 결과**

### **timeInterval을 30분으로 고정하여 단순화**
- `timeInterval` 기본값을 30분으로 변경하여 **더 정확한 시간표 표시**
- 30분 단위로 고정되어 **일관된 시간표 표시**
- 물리적 크기 절반으로 줄여 **더 조밀하고 정확한 시간표**

### **사용자 경험 향상**
- 직관적인 30분 단위 시간표 표시
- 시간대와 수업 셀 위치가 **완벽하게 일치**
- 더 많은 시간대를 화면에 표시 가능

### **코드 유지보수성**
- 하드코딩된 60px 값 제거
- 30px 고정 상수로 중앙화
- 단순화된 구조로 버그 발생 가능성 감소

---

**예상 개발 기간**: 0.5일  
**예상 개발 난이도**: ⭐☆☆☆☆ (매우 쉬움)  
**주요 기술**: React Hooks, TypeScript, CSS Variables, 30분 단위 고정
