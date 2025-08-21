# 🕐 시간표 위젯 구현 계획

## 📋 프로젝트 개요
현재 백엔드 API를 활용하여 프론트엔드에서 데이터를 가공하고, 재사용 가능한 시간표 위젯을 구현합니다.

## 🎯 구현 목표
1. **재사용 가능한 컴포넌트**: `components/business/timetable`에 시간표 위젯 구현
2. **백엔드 API 활용**: 기존 백엔드 메서드들을 사용하여 데이터 수집
3. **프론트엔드 데이터 가공**: 백엔드에서 받은 데이터를 프론트엔드에서 가공
4. **동적 셀 생성**: startTime과 endTime 차이에 따른 동적 셀 크기 조정

## 🏗️ 아키텍처 설계

### **1. 디렉토리 구조**
```
frontend/src/components/business/timetable/
├── TimetableWidget.tsx          # 메인 시간표 위젯 컴포넌트
├── TimetableWidget.css          # 시간표 스타일
├── TimetableCell.tsx            # 개별 시간표 셀 컴포넌트
├── TimetableCell.css            # 셀 스타일
├── TimetableHeader.tsx          # 요일 헤더 컴포넌트
├── TimetableHeader.css          # 헤더 스타일
├── TimetableTimeColumn.tsx      # 시간 열 컴포넌트
├── TimetableTimeColumn.css      # 시간 열 스타일
├── types/
│   └── timetable.types.ts       # 시간표 관련 타입 정의
├── hooks/
│   └── useTimetable.ts          # 시간표 데이터 관리 훅
├── utils/
│   └── timetable.utils.ts       # 시간표 유틸리티 함수
└── index.ts                     # 컴포넌트 export
```

### **2. 컴포넌트 계층 구조**
```
TimetableWidget (메인 컨테이너)
├── TimetableHeader (요일 헤더)
├── TimetableTimeColumn (시간 열)
└── TimetableGrid (시간표 그리드)
    └── TimetableCell[] (개별 셀들)
```

## 🔧 기술적 구현 계획

### **Phase 1: 기본 구조 및 타입 정의**

#### **1.1 타입 정의 (`types/timetable.types.ts`)**
```typescript
// 시간표 기본 타입
export interface TimetableTimeSlot {
  id: string
  startTime: string
  endTime: string
  duration: number // 분 단위
}

// 요일별 수업 정보
export interface TimetableClass {
  id: string
  name: string
  teacherName: string
  classroomName: string
  startTime: string
  endTime: string
  duration: number
  color?: string
  status: 'active' | 'inactive' | 'conflict'
}

// 요일별 수업 그룹
export interface DaySchedule {
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  classes: TimetableClass[]
}

// 모든 요일을 포함하는 완전한 일정 배열
export interface CompleteWeekSchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

// 시간표 그리드 데이터
export interface TimetableGrid {
  timeSlots: TimetableTimeSlot[]
  daySchedules: DaySchedule[]
  conflicts: Array<{
    day: string
    time: string
    classes: TimetableClass[]
  }>
}
```

#### **1.2 유틸리티 함수 (`utils/timetable.utils.ts`)**
```typescript
// 시간 문자열을 분 단위로 변환
export const timeToMinutes = (time: string): number

// 분 단위를 시간 문자열로 변환
export const minutesToTime = (minutes: number): string

// 두 시간 사이의 차이 계산 (분 단위)
export const calculateTimeDifference = (startTime: string, endTime: string): number

// 시간대별 셀 높이 계산 (CSS grid-row-span 기반)
export const calculateCellHeight = (startTime: string, endTime: string, timeInterval: number): number

// 시간대별 셀 위치 계산 (CSS grid-row 기반)
export const calculateCellPosition = (time: string, startHour: number, timeInterval: number): number

// 요일별 수업 그룹화 (reduce 기반으로 올바른 그룹화)
export const groupClassesByDay = (classes: any[]): DaySchedule[]

// 모든 요일을 포함하는 완전한 주간 일정 생성 (빈 요일도 포함)
export const createCompleteWeekSchedule = (classes: any[]): CompleteWeekSchedule

// 특정 요일의 일정이 비어있는지 확인
export const isDayEmpty = (daySchedule: DaySchedule): boolean

// 시간 충돌 검증
export const detectTimeConflicts = (daySchedules: DaySchedule[]): Array<{...}>

// CSS Grid 행 수 동적 계산
export const calculateGridRowCount = (startHour: number, endHour: number, timeInterval: number): number

// CSS Grid 스타일 동적 생성
export const generateGridStyles = (startHour: number, endHour: number, timeInterval: number): React.CSSProperties
```

### **Phase 2: 개별 컴포넌트 구현**

#### **2.1 시간 열 컴포넌트 (`TimetableTimeColumn.tsx`)**
```typescript
interface TimetableTimeColumnProps {
  timeSlots: TimetableTimeSlot[]
  className?: string
}

// 9:00 ~ 23:00 시간대를 30분 또는 1시간 간격으로 표시
// 각 시간대의 높이를 CSS Grid로 계산
```

#### **2.2 요일 헤더 컴포넌트 (`TimetableHeader.tsx`)**
```typescript
interface TimetableHeaderProps {
  days: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>
  className?: string
}

// 월, 화, 수, 목, 금, 토, 일 요일 헤더 표시
// 한국어 요일명으로 표시
```

#### **2.3 개별 셀 컴포넌트 (`TimetableCell.tsx`)**
```typescript
interface TimetableCellProps {
  classData: TimetableClass
  className?: string
  onClick?: (classData: TimetableClass) => void
}

// 수업 정보를 표시하는 셀
// startTime과 endTime 차이에 따른 높이 자동 조정
// CSS Grid의 grid-row-span 활용
```

### **Phase 3: 메인 위젯 컴포넌트**

#### **3.1 메인 위젯 (`TimetableWidget.tsx`)**
```typescript
interface TimetableWidgetProps {
  // 데이터 소스 (백엔드 API에서 받은 데이터)
  data?: any[]
  
  // 시간대 설정
  startHour?: number // 기본값: 9
  endHour?: number   // 기본값: 23
  timeInterval?: number // 기본값: 30 (분)
  
  // 스타일링
  className?: string
  theme?: 'light' | 'dark'
  
  // 이벤트 핸들러
  onClassClick?: (classData: TimetableClass) => void
  onTimeSlotClick?: (timeSlot: TimetableTimeSlot) => void
  
  // 표시 옵션
  showConflicts?: boolean
  showEmptySlots?: boolean
  showTimeLabels?: boolean
}
```

#### **3.2 CSS Grid 레이아웃 (동적 생성)**
```css
.timetable-grid {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr); /* 시간열 + 7요일 */
  /* grid-template-rows는 동적으로 계산하여 적용 */
  gap: 1px;
  border: 1px solid #e0e0e0;
}

.time-column {
  grid-column: 1;
  grid-row: 2 / -1;
}

.day-header {
  grid-row: 1;
}

.timetable-cell {
  /* grid-row와 grid-row-span을 동적으로 계산하여 적용 */
  /* grid-row: 시작 위치 */
  /* grid-row-span: 셀 높이 (시간 차이에 따라) */
}

/* CSS 변수를 활용한 동적 스타일링 */
.timetable-grid {
  --grid-row-count: 28; /* 기본값, JavaScript에서 동적 계산 */
  --grid-row-height: 30px;
  grid-template-rows: 50px repeat(var(--grid-row-count), var(--grid-row-height));
}
```

### **Phase 4: 데이터 관리 훅**

#### **4.1 시간표 데이터 관리 (`hooks/useTimetable.ts`)**
```typescript
export const useTimetable = (rawData: any[], options?: {
  startHour?: number
  endHour?: number
  timeInterval?: number
}) => {
  // 원시 데이터를 입력받아 최종 TimetableGrid 객체를 반환
  const timetableGrid = useMemo(() => {
    // 1. 시간대 생성
    const timeSlots = generateTimeSlots(options)
    
    // 2. 백엔드 데이터를 프론트엔드 형식으로 변환 (모든 요일 포함)
    const completeWeekSchedule = transformBackendData(rawData)
    
    // 3. UI 렌더링을 위한 배열 형태로 변환
    const daySchedules = transformToArrayForUI(completeWeekSchedule)
    
    // 3. 시간 충돌 검증
    const conflicts = detectTimeConflicts(daySchedules)
    
    // 4. CSS Grid 스타일 동적 생성
    const gridStyles = generateGridStyles(
      options?.startHour || 9,
      options?.endHour || 23,
      options?.timeInterval || 30
    )
    
    return {
      timeSlots,
      daySchedules,
      completeWeekSchedule, // 완전한 주간 일정도 포함
      conflicts,
      gridStyles
    }
  }, [rawData, options])
  
  return { timetableGrid }
}
```

## 📊 백엔드 API 활용 계획

### **1. 사용할 백엔드 메서드들**
```typescript
// 기존 백엔드 API 활용
import { apiService } from '../../../services/api'

// 1. 수업 섹션 조회
const classSections = await apiService.getClassSections()

// 2. 특정 수업 섹션 조회
const classSection = await apiService.getClassSectionById(id)

// 3. 수업 검색
const searchResults = await apiService.searchClassSections(params)

// 4. 수업 통계
const statistics = await apiService.getClassSectionStatistics()
```

### **2. 데이터 변환 로직 (개선된 버전 - 모든 요일 포함)**
```typescript
// 백엔드 데이터 → 프론트엔드 형식 변환 (reduce 기반 올바른 그룹화)
const transformBackendData = (classSections: any[]): CompleteWeekSchedule => {
  // 1단계: 요일별로 수업들을 그룹화
  const groupedByDay = classSections.reduce((acc, section) => {
    const day = section.schedule?.dayOfWeek || 'monday'
    
    if (!acc[day]) {
      acc[day] = []
    }
    
    acc[day].push({
      id: section.id,
      name: section.name,
      teacherName: section.teacherName,
      classroomName: section.classroomName,
      startTime: section.schedule?.startTime || '09:00',
      endTime: section.schedule?.endTime || '10:00',
      duration: calculateTimeDifference(
        section.schedule?.startTime || '09:00',
        section.schedule?.endTime || '10:00'
      ),
      color: generateRandomColor(),
      status: 'active'
    })
    
    return acc
  }, {} as Record<string, TimetableClass[]>)
  
  // 2단계: 모든 요일을 포함하는 완전한 주간 일정 생성 (빈 요일도 포함)
  const allDays: Array<keyof CompleteWeekSchedule> = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ]
  
  return allDays.reduce((acc, day) => {
    acc[day] = {
      dayOfWeek: day,
      classes: groupedByDay[day] || [] // 데이터가 없으면 빈 배열
    }
    return acc
  }, {} as CompleteWeekSchedule)
}

// UI 렌더링을 위한 배열 형태로 변환 (필요시)
const transformToArrayForUI = (completeSchedule: CompleteWeekSchedule): DaySchedule[] => {
  return Object.values(completeSchedule)
}
```

## 🎨 UI/UX 설계

### **1. 시각적 요소**
- **색상 체계**: 각 수업마다 고유한 색상 할당
- **충돌 표시**: 시간 충돌 시 빨간색 테두리와 경고 아이콘
- **호버 효과**: 마우스 오버 시 수업 상세 정보 툴팁
- **반응형 디자인**: 모바일과 데스크톱 모두 지원

### **2. 인터랙션**
- **클릭 이벤트**: 수업 셀 클릭 시 상세 정보 모달
- **드래그 앤 드롭**: 향후 수업 시간 변경 기능 (선택사항)
- **키보드 네비게이션**: Tab 키로 셀 간 이동

## 🚀 구현 단계별 계획

### **Week 1: 기본 구조 및 타입**
- [ ] 디렉토리 구조 생성
- [ ] 타입 정의 완성
- [ ] 기본 유틸리티 함수 구현
- [ ] 시간대 생성 로직 구현

### **Week 2: 개별 컴포넌트**
- [ ] TimetableTimeColumn 컴포넌트 구현
- [ ] TimetableHeader 컴포넌트 구현
- [ ] TimetableCell 컴포넌트 구현
- [ ] 기본 스타일링 적용

### **Week 3: 메인 위젯 및 통합**
- [ ] TimetableWidget 메인 컴포넌트 구현
- [ ] CSS Grid 레이아웃 완성
- [ ] useTimetable 훅 구현
- [ ] 백엔드 데이터 연동

### **Week 4: 테스트 및 최적화**
- [ ] 컴포넌트 테스트
- [ ] 성능 최적화
- [ ] 반응형 디자인 적용
- [ ] 문서화 및 예제 작성

## 🔍 품질 보증

### **1. 테스트 계획**
- **단위 테스트**: 각 컴포넌트별 기능 테스트
- **통합 테스트**: 전체 시간표 위젯 동작 테스트
- **성능 테스트**: 대용량 데이터 처리 성능 테스트
- **데이터 변환 테스트**: reduce 기반 그룹화 로직 검증
- **CSS Grid 동적 생성 테스트**: 다양한 시간 설정에 따른 그리드 생성 검증

### **2. 접근성**
- **키보드 네비게이션**: Tab, Enter, Space 키 지원
- **스크린 리더**: ARIA 라벨 및 역할 정의
- **색상 대비**: WCAG 2.1 AA 기준 준수

### **3. 브라우저 호환성**
- **모던 브라우저**: Chrome, Firefox, Safari, Edge 최신 버전
- **CSS Grid**: IE11 이하 버전은 Flexbox 폴백 제공
- **CSS 변수**: CSS Custom Properties 지원 확인

## 📝 사용 예시

### **1. 기본 사용법 (개선된 버전)**
```typescript
import { TimetableWidget } from '@/components/business/timetable'

function ClassPage() {
  const [timetableData, setTimetableData] = useState([])
  
  return (
    <TimetableWidget
      data={timetableData}
      startHour={9}
      endHour={23}
      timeInterval={30}
      onClassClick={(classData) => console.log('수업 클릭:', classData)}
      showConflicts={true}
      showEmptySlots={false}
    />
  )
}

// TimetableWidget 내부 구현 (간소화됨)
function TimetableWidget({ data, ...options }) {
  // useTimetable 훅이 모든 데이터 가공을 처리
  const { timetableGrid } = useTimetable(data, options)
  
  // 위젯은 렌더링만 담당
  return (
    <div className="timetable-widget" style={timetableGrid.gridStyles}>
      {/* 시간표 렌더링 로직 */}
    </div>
  )
}
```

### **2. 커스터마이징**
```typescript
<TimetableWidget
  data={customData}
  theme="dark"
  className="custom-timetable"
  startHour={8}
  endHour={22}
  timeInterval={60}
  onTimeSlotClick={(timeSlot) => handleTimeSlotClick(timeSlot)}
/>
```

## 🎯 성공 지표

### **1. 기능적 요구사항**
- [ ] 9:00~23:00 시간대 표시 (동적 설정 가능)
- [ ] 월~일 요일 헤더 표시 (항상 모든 요일 표시, 데이터 없어도 UI 일관성 유지)
- [ ] 동적 셀 크기 조정 (startTime-endTime 차이 기반)
- [ ] 시간 충돌 감지 및 표시
- [ ] 반응형 디자인
- [ ] CSS Grid 동적 생성 (props 기반)
- [ ] 빈 요일 처리 (데이터가 없는 요일도 빈 열로 표시)

### **2. 성능 요구사항**
- [ ] 100개 수업 데이터 처리 시 렌더링 시간 < 100ms
- [ ] 메모리 사용량 < 50MB
- [ ] 부드러운 스크롤 및 확대/축소
- [ ] 데이터 변환 로직 최적화 (reduce 기반)

### **3. 사용성 요구사항**
- [ ] 직관적인 UI/UX
- [ ] 접근성 가이드라인 준수
- [ ] 모바일 친화적 인터페이스
- [ ] 유연한 시간 설정 (startHour, endHour, timeInterval)

### **4. 아키텍처 요구사항**
- [ ] 재사용 가능한 컴포넌트 설계
- [ ] 명확한 책임 분리 (훅 vs 컴포넌트)
- [ ] 타입 안전성 보장
- [ ] 확장 가능한 구조
- [ ] UI 일관성 보장 (모든 요일 항상 표시)

---

이 계획을 기반으로 단계별로 구현을 진행하면 체계적이고 재사용 가능한 시간표 위젯을 만들 수 있을 것입니다.

---

## 🔄 **주요 개선사항 요약**

### **1. 데이터 변환 로직 개선**
- ❌ **기존**: `map` 기반으로 각 수업마다 별도 `DaySchedule` 생성
- ✅ **개선**: `reduce` 기반으로 요일별로 올바르게 그룹화

### **2. CSS Grid 동적 생성**
- ❌ **기존**: 고정된 `grid-template-rows` 값
- ✅ **개선**: props 기반으로 동적 계산 및 CSS 변수 활용

### **3. 요일별 데이터 처리**
- ❌ **기존**: 데이터가 있는 요일만 표시
- ✅ **개선**: 모든 요일을 항상 표시하여 UI 일관성 유지

### **3. useTimetable 훅 역할 구체화**
- ❌ **기존**: 데이터 가공 함수들을 반환
- ✅ **개선**: 원시 데이터를 입력받아 최종 `TimetableGrid` 객체 반환

### **4. 컴포넌트 책임 분리**
- ❌ **기존**: 위젯이 데이터 가공과 렌더링을 모두 담당
- ✅ **개선**: 훅은 데이터 가공, 위젯은 렌더링만 담당

### **5. UI 일관성 보장**
- ❌ **기존**: 데이터가 없는 요일은 표시되지 않음
- ✅ **개선**: 모든 요일을 항상 표시하여 사용자 경험 향상

이러한 개선사항들로 인해 더욱 견고하고 유연하며 유지보수하기 쉬운 시간표 위젯이 될 것입니다.
