# WiseUp Management System

교육 관리 시스템의 풀스택 애플리케이션입니다. React 19 + TypeScript + Vite 프론트엔드와 Firebase Functions + Firestore 백엔드로 구축되었습니다.

## 📋 목차

- [프로젝트 개요](#-프로젝트-개요)
- [주요 기능](#-주요-기능)
- [기술 스택](#️-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [개발 환경 설정](#-개발-환경-설정)
- [아키텍처](#-아키텍처)
- [개발 가이드](#-개발-가이드)
- [배포](#-배포)
- [문서](#-문서)

---

## 🎯 프로젝트 개요

WiseUp Management System은 온라인 학원을 위한 종합 관리 시스템입니다. 학생, 교사, 수업, 출석, 시간표, 성적 등을 효율적으로 관리할 수 있는 SPA(Single Page Application)입니다.

### 핵심 특징

- ✅ **실시간 데이터 동기화**: Firestore를 활용한 실시간 업데이트
- ✅ **버전 기반 시간표 관리**: 학기별/기간별 시간표 버전 관리
- ✅ **드래그 앤 드롭 UI**: React DnD를 활용한 직관적인 시간표 편집
- ✅ **대량 다운로드 최적화**: 50명 이상 시간표를 71초 내 다운로드
- ✅ **반응형 디자인**: 모바일/태블릿/데스크톱 지원
- ✅ **JWT 인증**: 보안 강화된 사용자 인증 시스템

---

## 🚀 주요 기능

### 1. 학생 관리
- 학생 등록/수정/삭제
- 학생 검색 및 필터링
- 학생별 시간표 관리
- 학생-부모 관계 관리

### 2. 출석 관리
- 실시간 출석 체크
- 좌석 배치 및 시각화
- 출석 통계 및 분석
- 출석 이력 조회

### 3. 시간표 관리
- **버전 기반 시간표**: 학기별/기간별 시간표 버전 관리
- **드래그 앤 드롭**: 직관적인 시간표 편집
- **자동 겹침 감지**: 시간 충돌 자동 탐지
- **대량 다운로드**: 전체 학생 시간표 ZIP 다운로드 (최적화됨)
- **이미지/PDF 생성**: html2canvas 기반 고화질 이미지 생성

### 4. 수업 관리
- 수업(ClassSection) 생성/수정/삭제
- 수업별 색상 관리
- 교사-수업 배정
- 학생-수업 등록

### 5. 성적 관리
- 시험 성적 입력
- 성적 통계 및 분석
- 성적표 생성

### 6. 교사 관리
- 교사 등록/수정/삭제
- 교사별 담당 수업 관리
- 교사 스케줄 조회

---

## 🛠️ 기술 스택

### 프론트엔드
| 카테고리 | 기술 | 버전 |
|---------|------|------|
| **프레임워크** | React | 19.1.0 |
| **언어** | TypeScript | 5.9.2 |
| **빌드 도구** | Vite | 7.0.4 |
| **상태 관리** | Redux Toolkit | 2.8.2 |
| **UI 라이브러리** | Ant Design | 5.26.7 |
| **라우팅** | React Router DOM | 7.7.1 |
| **드래그앤드롭** | React DnD | 16.0.1 |
| **HTTP 클라이언트** | Axios | 1.11.0 |
| **이미지 캡쳐** | html2canvas | 1.4.1 |
| **ZIP 생성** | JSZip | 3.10.1 |
| **날짜 처리** | Day.js | 1.11.13 |
| **스타일링** | CSS3 + CSS Variables | - |
| **린팅** | ESLint + TypeScript ESLint | 9.30.1 |

### 백엔드
| 카테고리 | 기술 | 버전 |
|---------|------|------|
| **런타임** | Node.js | 20 |
| **프레임워크** | Express.js | 4.18.2 |
| **플랫폼** | Firebase Functions | 6.4.0 |
| **데이터베이스** | Firestore | - |
| **언어** | TypeScript | 4.9.0 |
| **인증** | JWT + bcrypt | - |
| **관리 SDK** | firebase-admin | 11.8.0 |

### 인프라
- **호스팅**: Firebase Hosting
- **Functions**: Firebase Functions (asia-northeast3)
- **데이터베이스**: Firestore
- **인증**: Firebase Auth
- **스토리지**: Firebase Storage

---

## 🏗️ 프로젝트 구조

```
wiseUp_management_system_online_academy/
├── frontend/                     # React 프론트엔드
│   ├── src/
│   │   ├── features/            # 기능별 모듈 (Feature-based Architecture)
│   │   │   ├── attendance/      # 출석 관리
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── pages/
│   │   │   │   ├── slice/       # Redux slice
│   │   │   │   └── types/
│   │   │   ├── auth/            # 인증
│   │   │   ├── class/           # 수업 관리
│   │   │   ├── grades/          # 성적 관리
│   │   │   ├── schedule/        # 시간표 관리
│   │   │   ├── students/        # 학생 관리
│   │   │   ├── home/            # 홈
│   │   │   ├── learning/        # 학습 관리
│   │   │   └── admin/           # 관리자
│   │   ├── components/          # 공통 컴포넌트
│   │   │   ├── business/        # 비즈니스 컴포넌트
│   │   │   │   ├── timetable/   # 시간표 위젯
│   │   │   │   │   ├── components/  # TimetableDownloadModal, BulkDownloadModal
│   │   │   │   │   ├── hooks/       # useTimetable
│   │   │   │   │   ├── types/       # 타입 정의
│   │   │   │   │   ├── utils/       # 이미지 생성 유틸
│   │   │   │   │   └── TimetableWidget.tsx
│   │   │   │   ├── attendance/  # 출석 컴포넌트
│   │   │   │   ├── studentInfo/ # 학생 정보 패널
│   │   │   │   └── ClassDetailModal/
│   │   │   └── common/          # 공통 UI 컴포넌트
│   │   ├── contexts/            # React Context
│   │   │   ├── AppContext.tsx
│   │   │   └── TimetableVersionContext.tsx
│   │   ├── hooks/               # 공통 훅
│   │   ├── services/            # API 서비스
│   │   │   └── api.ts           # axios 기반 API 클라이언트
│   │   ├── store/               # Redux store 설정
│   │   ├── routes/              # 라우팅 설정
│   │   ├── config/              # 설정 파일
│   │   ├── constants/           # 상수 정의
│   │   ├── types/               # 공통 타입
│   │   ├── Layout/              # 레이아웃 컴포넌트
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── .env                     # 프로덕션 환경변수
│   ├── .env.test                # 테스트 환경변수
│   ├── .env.local               # 로컬 환경변수
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── functions/                   # Firebase Functions 백엔드
│   ├── src/
│   │   ├── controllers/         # HTTP 요청/응답 처리
│   │   ├── services/            # 비즈니스 로직
│   │   ├── routes/              # API 라우트 정의
│   │   ├── types/               # 타입 정의
│   │   ├── config/              # 설정
│   │   │   └── firebase.ts
│   │   └── index.ts             # Express 서버 진입점
│   ├── lib/                     # 컴파일된 JavaScript
│   ├── scripts/
│   │   └── post-build.js        # 빌드 후처리 스크립트
│   ├── package.json
│   └── tsconfig.json
├── shared/                      # 공유 모듈
│   ├── types/                   # 공유 타입 정의
│   ├── constants/               # 공유 상수
│   ├── utils/                   # 공유 유틸리티
│   ├── index.ts
│   ├── package.json
│   └── tsconfig.json
├── firebase.json                # Firebase 설정
├── .firebaserc                  # Firebase 프로젝트 설정
├── dev.sh                       # 개발 환경 시작 스크립트
├── deploy.sh                    # 배포 스크립트
├── package.json                 # 루트 의존성
├── tsconfig.json                # 루트 TypeScript 설정 (path mappings)
├── CLAUDE.md                    # Claude Code 가이드
└── README.md                    # 본 문서
```

### 주요 디렉토리 설명

#### Frontend
- **`features/`**: 기능별로 구조화된 모듈 (Redux slice, hooks, components, pages, types)
- **`components/business/`**: 도메인 특화 컴포넌트 (timetable, attendance, studentInfo 등)
- **`services/api.ts`**: Axios 기반 API 클라이언트 (모든 백엔드 API 호출)
- **`store/`**: Redux store 설정 및 rootReducer

#### Backend
- **`controllers/`**: HTTP 요청을 받아 Service를 호출하고 응답 반환
- **`services/`**: 비즈니스 로직과 Firestore 데이터 접근
- **`routes/`**: Express 라우터 정의

#### Shared
- **`@wiseup/shared`**: 프론트엔드와 백엔드가 공유하는 타입, 상수, 유틸리티
- 빌드 순서: shared → functions → frontend

---

## 🚀 개발 환경 설정

### 필수 요구사항
- **Node.js**: 20.x 이상
- **npm**: 9.0.0 이상
- **Firebase CLI**: 최신 버전
```bash
npm install -g firebase-tools
```

### 1. 프로젝트 클론 및 의존성 설치

```bash
# 저장소 클론
git clone <repository-url>
cd wiseUp_management_system_online_academy

# 루트 의존성 설치
npm install

# 프론트엔드 의존성 설치
cd frontend && npm install && cd ..

# 백엔드 의존성 설치
cd functions && npm install && cd ..

# Shared 모듈 의존성 설치
cd shared && npm install && cd ..
```

### 2. 환경 변수 설정

#### 프론트엔드 환경 변수

**`.env`** (프로덕션):
```env
VITE_API_BASE_URL=https://[REGION]-[PROJECT_ID].cloudfunctions.net/api
VITE_FIREBASE_PROJECT_ID=[PROJECT_ID]
VITE_ENVIRONMENT=production
```

**`.env.test`** (테스트):
```env
VITE_API_BASE_URL=https://[REGION]-[TEST_PROJECT_ID].cloudfunctions.net/api
VITE_FIREBASE_PROJECT_ID=[TEST_PROJECT_ID]
VITE_ENVIRONMENT=test
```

**`.env.local`** (로컬 개발):
```env
VITE_API_BASE_URL=http://localhost:5001/[PROJECT_ID]/us-central1/wiseupApi/api
VITE_FIREBASE_PROJECT_ID=[PROJECT_ID]
VITE_ENVIRONMENT=local
```

**참고:**
- 실제 환경 변수 파일은 보안상 `.gitignore`에 포함되어 있습니다
- 프로젝트 관리자에게 실제 환경 변수 값을 요청하세요
- Firebase 프로젝트 ID와 리전은 Firebase Console에서 확인 가능합니다

#### 백엔드 환경 변수

Functions는 환경 변수로 `JWT_SECRET` 필요 (dev.sh에서 자동 설정됨)
- 프로덕션/테스트 환경에서는 Firebase Functions 환경 변수로 설정 필요

### 3. 개발 서버 실행

#### 방법 1: 자동 스크립트 (권장)

```bash
./dev.sh
```

**`dev.sh` 스크립트가 자동으로 수행하는 작업:**
1. 기존 프로세스 종료 (포트: 5001, 4001, 4002, 4400-4502, 8080, 9099, 5173, 3000, 4173)
2. Shared 모듈 빌드
3. Frontend 빌드
4. Backend 빌드
5. Firebase Emulators 시작 (백그라운드)
   - Functions: localhost:5001
   - Firestore: localhost:8080
   - Emulator UI: localhost:4001
6. 헬스 체크 (Functions, Firestore, Emulator UI)
7. 샘플 데이터 초기화 (`POST /api/initialization/all`)
8. Frontend 개발 서버 시작 (localhost:5173)

로그는 `firebase-emulator.log`에 저장됩니다.

#### 방법 2: 수동 실행

```bash
# 터미널 1: Shared 빌드 (변경 시마다)
cd shared && npx tsc

# 터미널 2: Backend
cd functions && npm run serve

# 터미널 3: Frontend
cd frontend && npm run dev
```

### 4. 접속 주소

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001/wiseupmanagementsystem/us-central1/wiseupApi/api
- **Firestore Emulator**: http://localhost:8080
- **Emulator UI**: http://localhost:4001

---

## 🎨 아키텍처

### Frontend Architecture

#### Feature-based Structure
각 feature는 독립적인 모듈로 구성:
```
features/schedule/
├── components/       # UI 컴포넌트
├── hooks/           # 커스텀 훅
├── pages/           # 페이지 컴포넌트
├── slice/           # Redux slice (state, actions, reducers)
├── types/           # TypeScript 타입
└── utils/           # 유틸리티 함수
```

#### State Management
- **Redux Toolkit**: 전역 상태 관리
  - `attendanceSlice`: 출석 관리
  - `classSlice`: 수업 관리
  - `gradesSlice`: 성적 관리
  - `studentSlice`: 학생 관리
  - `authSlice`: 인증 상태
- **Context API**: UI 상태 관리
  - `AppContext`: 사이드바, 현재 페이지 등
  - `TimetableVersionContext`: 활성 시간표 버전

#### Component Hierarchy
```
App
├── Layout
│   ├── Sidebar
│   └── MainContent
│       ├── HomePage
│       ├── AttendancePage
│       │   ├── AttendanceHeader
│       │   ├── AttendanceSearchSection
│       │   └── AttendanceSeatingSection
│       ├── SchedulePage
│       │   ├── TimetableWidget
│       │   ├── TimetableEditModal
│       │   ├── TimetableDownloadModal
│       │   └── BulkTimetableDownloadModal
│       ├── StudentsPage
│       ├── GradesPage
│       └── ClassPage
└── Routes
```

### Backend Architecture

#### Service Layer Pattern
```
Controller → Service → Firestore
```

**예시: 학생 등록**
```typescript
// 1. Controller: HTTP 요청 받기
StudentController.createStudent(req, res)

// 2. Service: 비즈니스 로직 처리
StudentService.createStudent(studentData)

// 3. Firestore: 데이터 저장
await db.collection('students').add(studentData)
```

#### API Structure
```
/api
├── /students              # 학생 관리
├── /teachers              # 교사 관리
├── /class-sections        # 수업 관리
├── /attendance            # 출석 관리
├── /student-timetables    # 학생 시간표
├── /timetable-versions    # 시간표 버전
├── /courses               # 과목 관리
├── /classrooms            # 교실 관리
├── /seats                 # 좌석 관리
├── /seat-assignments      # 좌석 배정
├── /student-summaries     # 학생 요약 정보
├── /parents               # 부모 관리
├── /colors                # 색상 팔레트
└── /initialization        # 테스트 데이터 초기화 (Emulator only)
```

### Database Design (Firestore)

#### Collections
- **students**: 학생 정보
- **teachers**: 교사 정보
- **classSections**: 수업 정보
- **courses**: 과목 정보
- **classrooms**: 교실 정보
- **attendance**: 출석 기록
- **studentTimetables**: 학생별 시간표
- **timetableVersions**: 시간표 버전
- **seats**: 좌석 정보
- **seatAssignments**: 좌석 배정
- **parents**: 부모 정보
- **colors**: 색상 팔레트

#### Version-based Data Isolation
모든 데이터는 `versionId`로 격리됩니다:
```typescript
// ClassSection
{
  id: string,
  name: string,
  versionId: string,  // 중요!
  teacherId: string,
  courseId: string,
  // ...
}

// StudentTimetable
{
  studentId: string,
  versionId: string,  // 중요!
  classSectionIds: string[],  // 같은 version의 수업들만
  // ...
}
```

**버전 시스템의 주요 원칙:**
1. 각 entity는 특정 version에 속함
2. 버전 간 데이터는 격리됨
3. 활성 버전(isActive: true)은 하나만 존재
4. versionId 없이 쿼리하면 자동으로 활성 버전 사용

자세한 내용은 [timetable-version-system-plan.md](timetable-version-system-plan.md) 참조

---

## 📖 개발 가이드

### Frontend 개발

#### 1. 새로운 Feature 추가

```bash
# Feature 디렉토리 생성
mkdir -p frontend/src/features/myfeature/{components,hooks,pages,slice,types,utils}
```

**파일 구조:**
```typescript
// features/myfeature/slice/myfeatureSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const fetchData = createAsyncThunk(
  'myfeature/fetchData',
  async () => {
    const response = await apiService.getData()
    return response.data
  }
)

const myfeatureSlice = createSlice({
  name: 'myfeature',
  initialState: { /* ... */ },
  reducers: { /* ... */ },
  extraReducers: (builder) => { /* ... */ }
})

export default myfeatureSlice.reducer
```

#### 2. API 호출

```typescript
// services/api.ts에 메서드 추가
class ApiService {
  async getMyData(id: string): Promise<ApiResponse<MyData>> {
    return this.request(`/my-endpoint/${id}`, {
      method: 'GET'
    })
  }
}

// Feature에서 사용
import { apiService } from '@services/api'

const data = await apiService.getMyData('123')
```

#### 3. 버전 기반 데이터 로드

```typescript
// 1. 활성 버전 가져오기
const versionResponse = await apiService.getActiveTimetableVersion()
const activeVersionId = versionResponse.data.id

// 2. 버전별 데이터 쿼리
const classes = await apiService.getClassSections(activeVersionId)
```

### Backend 개발

#### 1. 새로운 API 엔드포인트 추가

**Controller 생성:**
```typescript
// functions/src/controllers/MyController.ts
export class MyController {
  constructor(private myService: MyService) {}

  async getData(req: Request, res: Response): Promise<void> {
    try {
      const versionId = req.query.versionId as string | undefined
      const data = await this.myService.getData(versionId)
      res.status(200).json({ success: true, data })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  }
}
```

**Service 생성:**
```typescript
// functions/src/services/MyService.ts
export class MyService {
  constructor(private db: Firestore) {}

  async getData(versionId?: string): Promise<MyData[]> {
    // 버전 자동 폴백
    let targetVersionId = versionId
    if (!targetVersionId) {
      const activeVersion = await this.versionService.getActiveVersion()
      targetVersionId = activeVersion.id
    }

    const snapshot = await this.db
      .collection('myCollection')
      .where('versionId', '==', targetVersionId)
      .get()

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }
}
```

**Route 등록:**
```typescript
// functions/src/routes/myRoutes.ts
const router = Router()
const controller = new MyController(new MyService(db))

router.get('/', controller.getData.bind(controller))

export default router
```

**index.ts에 마운트:**
```typescript
// functions/src/index.ts
import myRoutes from './routes/myRoutes'

app.use('/api/my-endpoint', myRoutes)
```

#### 2. 버전 기반 쿼리 패턴

```typescript
// ❌ 잘못된 방법
const classes = await db.collection('classSections').get()

// ✅ 올바른 방법
const classes = await db
  .collection('classSections')
  .where('versionId', '==', versionId)
  .get()
```

### Shared Module

공통 타입이나 상수를 추가할 때:

```typescript
// shared/types/myTypes.ts
export interface MyType {
  id: string
  name: string
}

// shared/index.ts에서 export
export * from './types/myTypes'

// 프론트엔드/백엔드에서 사용
import { MyType } from '@wiseup/shared'
```

**중요:** Shared 수정 후 반드시 빌드:
```bash
cd shared && npx tsc
```

---

## 🔧 빌드 및 배포

### 빌드 명령어

```bash
# Shared 모듈 빌드
cd shared && npx tsc

# Frontend 빌드
cd frontend
npm run build              # 프로덕션 빌드 (.env 사용)
npm run build:test         # 테스트 빌드 (.env.test 사용)
npm run build:local        # 로컬 빌드 (.env.local 사용)

# Backend 빌드
cd functions
npm run build              # TypeScript 컴파일 + 후처리
```

**빌드 순서 (중요!):**
1. Shared (`cd shared && npx tsc`)
2. Functions (`cd functions && npm run build`)
3. Frontend (`cd frontend && npm run build`)

### 배포 스크립트 (권장)

```bash
./deploy.sh
```

**`deploy.sh` 인터랙티브 배포 과정:**
1. Firebase 프로젝트 선택 (production / test)
2. 기존 빌드 파일 정리
3. Shared → Frontend → Functions 순서대로 빌드
4. 배포 타입 선택:
   - Full deployment (hosting + functions)
   - Hosting only
   - Functions only
5. Firebase 배포 실행

### 수동 배포

```bash
# Firebase 프로젝트 선택
firebase use production  # 또는 test

# 전체 배포
firebase deploy

# Hosting만 배포
firebase deploy --only hosting

# Functions만 배포
firebase deploy --only functions
```

### 환경별 배포

**프로덕션:**
```bash
firebase use production
cd frontend && npm run build  # .env 사용
cd ../functions && npm run build
firebase deploy
```

**테스트:**
```bash
firebase use test
cd frontend && npm run build:test  # .env.test 사용
cd ../functions && npm run build
firebase deploy
```

---

## 📚 문서

### 주요 문서
- **[CLAUDE.md](CLAUDE.md)**: Claude Code를 위한 프로젝트 가이드 (가장 중요!)
- **[database_structure.md](database_structure.md)**: Firestore 데이터베이스 스키마
- **[FIRESTORE_INDEXES.md](FIRESTORE_INDEXES.md)**: 필수 Firestore 인덱스

### 아키텍처 문서
- **[timetable-version-system-plan.md](timetable-version-system-plan.md)**: 시간표 버전 시스템 상세 설계
- **[VERSION_BASED_CLASS_TEACHER_PLAN.md](VERSION_BASED_CLASS_TEACHER_PLAN.md)**: 수업/교사 버전 관리
- **[ACTIVE_VERSION_PLAN_REVIEW.md](ACTIVE_VERSION_PLAN_REVIEW.md)**: 활성 버전 구현 리뷰

### 구현 문서
- **[EDIT_MODAL_IMPLEMENTATION_PLAN.md](EDIT_MODAL_IMPLEMENTATION_PLAN.md)**: 모달 다이얼로그 구현 패턴
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)**: 전체 구현 요약
- **[STUDENT_ENROLLMENT_VERSION_FIX.md](STUDENT_ENROLLMENT_VERSION_FIX.md)**: 학생 등록 버전 마이그레이션

### 최적화 문서
- **[BULK_TIMETABLE_DOWNLOAD_OPTIMIZATION_PLAN.md](BULK_TIMETABLE_DOWNLOAD_OPTIMIZATION_PLAN.md)**: 대량 시간표 다운로드 최적화
- **[TIMETABLE_RENDER_COMPLETE_CALLBACK_PLAN.md](TIMETABLE_RENDER_COMPLETE_CALLBACK_PLAN.md)**: 시간표 렌더링 콜백 구현

### 기타 계획 문서
- classpage-timetable-integration-plan.md
- schedule-page-implementation-plan.md
- class-section-color-implementation-plan.md
- class-detail-modal-commonization-plan.md
- VERSION_IMPLEMENTATION_ISSUES.md
- VERSION_ADDITIONAL_ISSUES.md
- OPTIMIZATION_PLAN_VERIFICATION.md

---

## 🐛 트러블슈팅

### 포트 충돌
```bash
# dev.sh가 자동으로 처리하지만, 수동으로 죽이려면:
lsof -ti:5173 | xargs kill -9  # Frontend
lsof -ti:5001 | xargs kill -9  # Functions
lsof -ti:8080 | xargs kill -9  # Firestore
```

### 빌드 에러

**"Module not found" 에러:**
```bash
# Shared 모듈 재빌드
cd shared && npx tsc

# node_modules 재설치
rm -rf node_modules package-lock.json
npm install
```

**TypeScript 컴파일 에러:**
```bash
# 각 프로젝트에서 타입 체크
cd frontend && npx tsc --noEmit
cd ../functions && npx tsc --noEmit
```

### Firebase Emulator 문제

```bash
# Emulator 데이터 초기화
firebase emulators:start --import=./emulator-data --export-on-exit

# Emulator 완전 재시작
pkill -f firebase
./dev.sh
```

### 시간표 캡쳐 이슈

**빈 시간표가 캡쳐되는 경우:**
- 최신 코드에는 `onRenderComplete` 콜백이 구현되어 있음
- 렌더링 완료 후 캡쳐하도록 수정됨
- 자세한 내용: [TIMETABLE_RENDER_COMPLETE_CALLBACK_PLAN.md](TIMETABLE_RENDER_COMPLETE_CALLBACK_PLAN.md)

---

## 📋 코딩 컨벤션

### TypeScript
- **인터페이스**: PascalCase (`StudentData`, `ApiResponse`)
- **타입**: PascalCase (`RequestType`, `ResponseStatus`)
- **변수/함수**: camelCase (`fetchStudents`, `activeVersionId`)
- **상수**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **파일명**: kebab-case (`student-service.ts`, `api-config.ts`)

### React 컴포넌트
- **컴포넌트**: PascalCase (`StudentTable.tsx`, `TimetableWidget.tsx`)
- **Props 인터페이스**: `{ComponentName}Props` (`StudentTableProps`)
- **Hook**: `use` prefix (`useStudents`, `useTimetable`)

### CSS
- **클래스명**: kebab-case (`.timetable-widget`, `.student-table`)
- **BEM 방법론**: `.block__element--modifier`

### Git Commit
```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 수정
style: 코드 포맷팅
refactor: 코드 리팩토링
test: 테스트 코드
chore: 빌드/설정 변경
```

---

## 🤝 기여 가이드

1. Feature branch 생성: `git checkout -b feature/my-feature`
2. 변경사항 커밋: `git commit -m 'feat: add some feature'`
3. Branch에 Push: `git push origin feature/my-feature`
4. Pull Request 생성

---

## 📞 연락처

프로젝트 관련 문의사항은 이슈를 등록해주세요.

---

## 📜 라이센스

본 프로젝트는 비공개 프로젝트입니다.

---

## 🎉 최근 업데이트

### 2025-01-07
- ✅ 시간표 렌더링 완료 콜백 구현 (`onRenderComplete`)
- ✅ 대량 시간표 다운로드 최적화 (195s → 71s, 50명 기준)
- ✅ 시간표 캡쳐 안정성 개선 (실패율 30% → ~0%)
- ✅ README.md 전면 개편 (프로젝트 구조, 개발 가이드 추가)

### 2024 Q4
- ✅ 버전 기반 시간표 시스템 구현
- ✅ 드래그 앤 드롭 시간표 편집
- ✅ 출석 관리 시스템 구축
- ✅ Redux Toolkit 상태 관리 도입
- ✅ Ant Design UI 라이브러리 적용

---

**Built with ❤️ by WiseUp Team**
