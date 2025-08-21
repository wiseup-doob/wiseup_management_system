# WiseUp Management System - Frontend

## 개요

WiseUp Management System의 프론트엔드는 React + TypeScript 기반으로 구축된 현대적인 웹 애플리케이션입니다. 출석 관리, 좌석 배정, 학생 관리 등의 기능을 제공하며, 백엔드 API와 연동하여 실시간 데이터 처리가 가능합니다.

## 기술 스택

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **State Management**: React Hooks (useState, useCallback)
- **Styling**: CSS Modules + Tailwind CSS
- **API Client**: Fetch API
- **Package Manager**: npm

## 프로젝트 구조

```
frontend/
├── src/
│   ├── components/           # 공통 컴포넌트
│   │   ├── base/            # 기본 UI 컴포넌트
│   │   ├── business/        # 비즈니스 로직 컴포넌트
│   │   ├── buttons/         # 버튼 컴포넌트
│   │   ├── labels/          # 라벨 컴포넌트
│   │   ├── Layout/          # 레이아웃 컴포넌트
│   │   └── SearchInput/     # 검색 입력 컴포넌트
│   ├── config/              # 설정 파일
│   ├── constants/           # 상수 정의
│   ├── contexts/            # React Context
│   ├── features/            # 기능별 모듈
│   │   ├── attendance/      # 출석 관리 기능
│   │   ├── auth/            # 인증 기능
│   │   ├── class/           # 수업 관리 기능
│   │   ├── grades/          # 성적 관리 기능
│   │   ├── home/            # 홈 기능
│   │   ├── learning/        # 학습 관리 기능
│   │   ├── students/        # 학생 관리 기능
│   │   └── timetable/       # 시간표 관리 기능
│   ├── hooks/               # 커스텀 훅
│   ├── lib/                 # 라이브러리
│   ├── routes/              # 라우팅 설정
│   ├── services/            # API 서비스
│   ├── store/               # 상태 관리
│   ├── styles/              # 전역 스타일
│   ├── types/               # 타입 정의
│   └── utils/               # 유틸리티 함수
├── public/                  # 정적 파일
├── package.json             # 의존성 정의
├── tsconfig.json            # TypeScript 설정
└── vite.config.ts           # Vite 설정
```

## 핵심 아키텍처

### 1. 컴포넌트 기반 구조

프론트엔드는 재사용 가능한 컴포넌트들로 구성되어 있습니다:

- **Base Components**: `BaseWidget`, `BaseButton`, `BaseCalendar` 등 기본 UI 컴포넌트
- **Business Components**: `StudentInfoPanel`, `SeatGrid` 등 비즈니스 로직이 포함된 컴포넌트
- **Layout Components**: `Layout`, `Grid`, `MainContent` 등 레이아웃 관련 컴포넌트

### 2. Feature-based 모듈화

각 기능은 독립적인 모듈로 구성되어 있습니다:

```
features/attendance/
├── components/              # 출석 관련 컴포넌트
├── hooks/                   # 출석 관련 커스텀 훅
├── pages/                   # 출석 관련 페이지
├── slice/                   # Redux 슬라이스 (사용하지 않음)
└── types/                   # 출석 관련 타입 정의
```

### 3. Custom Hooks 패턴

비즈니스 로직을 커스텀 훅으로 분리하여 재사용성과 테스트 가능성을 높였습니다:

- `useAttendance`: 출석 데이터 상태 관리
- `useAttendanceData`: 출석 데이터 로딩 및 관리
- `useAttendanceActions`: 출석 관련 액션 처리
- `useAttendanceEditing`: 편집 모드 상태 관리
- `useAttendanceHealth`: 좌석 데이터 헬스체크

## 데이터 흐름

### 1. 데이터 로딩 흐름

```
1. 컴포넌트 마운트
   ↓
2. useAttendanceData.fetchData() 호출
   ↓
3. API 서비스를 통한 데이터 요청
   ↓
4. 백엔드에서 데이터 응답
   ↓
5. 데이터 변환 및 상태 업데이트
   ↓
6. UI 렌더링
```

### 2. 상태 관리 흐름

```
Local State (useState)
    ↓
Custom Hooks (useAttendance, useAttendanceData)
    ↓
API Service (apiService)
    ↓
Backend API
```

### 3. 사용자 액션 흐름

```
User Action (클릭, 입력 등)
    ↓
Event Handler
    ↓
Custom Hook Function
    ↓
API Service Call
    ↓
State Update
    ↓
UI Re-render
```

## 주요 기능별 구현

### 1. 출석 관리 (Attendance)

#### 컴포넌트 구조
- `AttendancePage`: 메인 페이지
- `AttendanceHeader`: 헤더 및 컨트롤
- `AttendanceSearchSection`: 검색 및 학생 선택
- `AttendanceSeatingSection`: 좌석 배치도

#### 주요 기능
- **좌석 배정**: 학생을 특정 좌석에 배정
- **좌석 해제**: 좌석에서 학생 배정 해제
- **좌석 교환**: 두 좌석의 학생 위치 교환
- **헬스체크**: 좌석 데이터 무결성 검사
- **자동 복구**: 데이터 문제 자동 해결

#### 편집 모드
- **제거 모드**: 좌석 클릭 시 학생 제거
- **이동 모드**: 좌석 간 학생 이동/교환
- **추가 모드**: 새로운 좌석에 학생 배정

### 2. 학생 관리 (Students)

#### 주요 기능
- 학생 정보 조회/수정
- 학생 검색 및 필터링
- 학생별 출석 기록 관리

### 3. 시간표 관리 (Timetable)

#### 주요 기능
- 시간표 생성 및 편집
- 수업 블록 관리
- 시간대별 수업 배정

## API 통신

### 1. API 서비스 구조

```typescript
class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>>
  
  // 학생 관리
  async getStudents(): Promise<ApiResponse<Student[]>>
  async createStudent(data: CreateStudentRequest): Promise<ApiResponse<Student>>
  
  // 출석 관리
  async getAttendanceRecords(params?: AttendanceSearchParams): Promise<ApiResponse<AttendanceRecord[]>>
  async updateStudentAttendance(studentId: string, status: AttendanceStatus): Promise<ApiResponse<void>>
  
  // 좌석 관리
  async getSeats(): Promise<ApiResponse<Seat[]>>
  async assignStudentToSeat(seatId: string, studentId: string): Promise<ApiResponse<void>>
}
```

### 2. 에러 처리

중앙화된 에러 처리 시스템을 사용합니다:

```typescript
// shared/utils/error.utils.ts
export class AppError extends Error {
  public readonly type: ErrorType
  public readonly code: string
  public readonly statusCode: number
  public readonly details?: any
}

export function normalizeError(error: any, requestId?: string): AppError
export function logError(error: AppError, context?: any): void
```

### 3. 응답 형식

모든 API 응답은 일관된 형식을 따릅니다:

```typescript
interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  meta?: {
    timestamp?: string
    version?: string
    requestId?: string
    count?: number
  }
}
```

## 상태 관리

### 1. Local State

React의 `useState`와 `useCallback`을 사용하여 컴포넌트별 상태를 관리합니다:

```typescript
const [seats, setSeats] = useState<Seat[]>([])
const [students, setStudents] = useState<Student[]>([])
const [currentMode, setCurrentMode] = useState<'view' | 'edit'>('view')

const updateSeats = useCallback((newSeats: Seat[]) => {
  setSeats(newSeats)
}, [])
```

### 2. Custom Hooks

비즈니스 로직을 커스텀 훅으로 캡슐화합니다:

```typescript
export const useAttendance = (): UseAttendanceReturn => {
  const [seats, setSeats] = useState<Seat[]>([])
  const [students, setStudents] = useState<Student[]>([])
  
  const updateSeats = useCallback((newSeats: Seat[]) => {
    setSeats(newSeats)
  }, [])
  
  return { seats, students, updateSeats }
}
```

## 타입 시스템

### 1. 공통 타입

`shared/types/` 폴더에서 공통 타입을 정의합니다:

```typescript
// common.types.ts
export type AttendanceStatus = 'present' | 'dismissed' | 'unauthorized_absent' | 'authorized_absent' | 'not_enrolled'
export type DateString = string // "2024-01-15"
export type TimeString = string // "09:30"
export type DateTimeString = string // ISO 8601 형식

// database.types.ts
export interface Student extends StudentBasicInfo {
  currentStatus: StudentCurrentStatus
}

export interface Seat extends BaseEntity {
  seatId: SeatId
  seatNumber: number
  row: number
  col: number
  status: AttendanceStatus
}
```

### 2. 컴포넌트별 타입

각 기능별로 필요한 타입을 정의합니다:

```typescript
// attendance.types.ts
export interface SeatWithStudent extends Seat {
  currentAssignment?: SeatAssignmentResponse
  studentId?: string
  studentName?: string
}

export interface SeatHealthStatus {
  status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY'
  totalSeats: number
  assignedSeats: number
  mismatchedSeats: number
  issues: Array<{
    seatId: string
    type: 'MISMATCH' | 'ORPHANED' | 'DUPLICATE'
    description: string
  }>
  lastChecked: string
}
```

## 스타일링

### 1. CSS Modules

컴포넌트별로 스타일을 분리하여 관리합니다:

```css
/* AttendanceHeader.css */
.attendance-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.edit-mode-indicator {
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid;
}
```

### 2. Tailwind CSS

유틸리티 클래스를 사용하여 빠른 스타일링을 지원합니다:

```tsx
<button className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
  새로고침
</button>
```

## 라우팅

### 1. 라우트 설정

```typescript
// routes/paths.ts
export const PATHS = {
  HOME: '/',
  ATTENDANCE: '/attendance',
  STUDENTS: '/students',
  TIMETABLE: '/timetable',
  GRADES: '/grades',
  LEARNING: '/learning'
} as const

// routes/routerConfig.tsx
const router = createBrowserRouter([
  {
    path: PATHS.HOME,
    element: <Layout />,
    children: [
      { path: PATHS.ATTENDANCE, element: <AttendancePage /> },
      { path: PATHS.STUDENTS, element: <StudentsPage /> },
      { path: PATHS.TIMETABLE, element: <TimetablePage /> }
    ]
  }
])
```

## 개발 환경 설정

### 1. 환경 변수

```bash
# .env.local
VITE_API_BASE_URL=https://us-central1-wiseupmanagementsystem-a6189.cloudfunctions.net/wiseupApi
VITE_APP_ENV=development
```

### 2. 개발 서버 실행

```bash
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
npm run lint         # ESLint 실행
npm run type-check   # TypeScript 타입 체크
```

## 테스트

### 1. 테스트 구조

```typescript
// __tests__/components/AttendanceHeader.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { AttendanceHeader } from '../AttendanceHeader'

describe('AttendanceHeader', () => {
  it('편집 모드 버튼을 클릭하면 편집 모드로 전환된다', () => {
    const mockOnEnterEditMode = jest.fn()
    render(<AttendanceHeader onEnterEditMode={mockOnEnterEditMode} />)
    
    const editButton = screen.getByText('편집 모드')
    fireEvent.click(editButton)
    
    expect(mockOnEnterEditMode).toHaveBeenCalled()
  })
})
```

## 배포

### 1. 빌드 프로세스

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [hash].png
└── favicon.ico
```

### 2. 배포 환경

- **개발**: Vite Dev Server (localhost:5173)
- **스테이징**: Firebase Hosting
- **프로덕션**: Firebase Hosting + CDN

## 성능 최적화

### 1. 코드 분할

```typescript
// 동적 임포트를 통한 코드 분할
const AttendancePage = lazy(() => import('../features/attendance/pages/AttendancePage'))
const StudentsPage = lazy(() => import('../features/students/pages/StudentsPage'))
```

### 2. 메모이제이션

```typescript
// useCallback을 통한 함수 메모이제이션
const updateSeats = useCallback((newSeats: Seat[]) => {
  setSeats(newSeats)
}, [])

// useMemo를 통한 계산 결과 메모이제이션
const filteredStudents = useMemo(() => {
  return students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  )
}, [students, searchTerm])
```

## 보안

### 1. 인증

```typescript
// ProtectedRoute 컴포넌트를 통한 라우트 보호
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}
```

### 2. 입력 검증

```typescript
// API 요청 전 데이터 검증
const validateStudentData = (data: CreateStudentRequest): boolean => {
  if (!data.name || data.name.trim().length === 0) {
    return false
  }
  if (!data.grade || !data.className) {
    return false
  }
  return true
}
```

## 모니터링 및 로깅

### 1. 에러 로깅

```typescript
// 중앙화된 에러 로깅
export const logError = (error: AppError, context?: any): void => {
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      requestId: error.requestId
    },
    context: context || {}
  }
  
  console.error('🚨 Application Error:', logData)
  // 실제 프로덕션에서는 로깅 서비스로 전송
}
```

### 2. 성능 모니터링

```typescript
// API 응답 시간 모니터링
const startTime = performance.now()
const response = await apiService.getStudents()
const endTime = performance.now()

console.log(`API 응답 시간: ${endTime - startTime}ms`)
```

## 향후 개선 계획

### 1. 상태 관리 개선
- Redux Toolkit 도입 검토
- React Query 도입 검토

### 2. 성능 최적화
- Virtual Scrolling 도입
- Service Worker를 통한 오프라인 지원

### 3. 테스트 커버리지 향상
- E2E 테스트 도입
- 테스트 커버리지 80% 이상 달성

### 4. 접근성 개선
- ARIA 라벨 추가
- 키보드 네비게이션 지원
- 스크린 리더 호환성 향상

## 문제 해결

### 1. 일반적인 문제

**Q: 컴포넌트가 리렌더링되지 않는다**
A: `useCallback`과 `useMemo`를 사용하여 불필요한 리렌더링을 방지하세요.

**Q: API 호출이 실패한다**
A: 네트워크 상태와 백엔드 서버 상태를 확인하고, 에러 로그를 확인하세요.

**Q: 타입 에러가 발생한다**
A: `shared/types/` 폴더의 타입 정의를 확인하고, 백엔드 데이터 구조와 일치하는지 확인하세요.

### 2. 디버깅 팁

```typescript
// 개발 환경에서 상세 로깅 활성화
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Debug Info:', { seats, students, currentMode })
}

// React DevTools 사용
// Chrome DevTools의 React 탭에서 컴포넌트 상태 확인
```

## 결론

WiseUp Management System의 프론트엔드는 현대적인 React 패턴과 TypeScript를 활용하여 구축되었습니다. 컴포넌트 기반 아키텍처, 커스텀 훅 패턴, 타입 안전성을 통해 유지보수성과 확장성을 확보했습니다. 백엔드와의 원활한 통신을 통해 실시간 데이터 처리가 가능하며, 사용자 친화적인 인터페이스를 제공합니다.
