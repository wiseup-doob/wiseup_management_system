# WiseUp Management System

교육 관리 시스템의 풀스택 애플리케이션입니다. React + TypeScript + Vite 프론트엔드와 Firebase Functions + Firestore 백엔드로 구축되었습니다.

## 🏗️ 전체 프로젝트 구조

```
wiseUp_management_system/
├── frontend/                  # 프론트엔드 (React + TypeScript + Vite)
│   └── src/
│       ├── Layout/            # 레이아웃 컴포넌트
│       ├── components/        # 재사용 가능한 UI 컴포넌트
│       ├── pages/            # 페이지 컴포넌트들
│       ├── hooks/            # 커스텀 훅
│       ├── contexts/         # React Context
│       ├── routes/           # 라우팅 설정
│       ├── img/              # 이미지 파일들
│       ├── config/           # 설정 파일들
│       ├── lib/              # 유틸리티 라이브러리
│       ├── assets/           # 정적 자산
│       ├── App.tsx           # 메인 앱 컴포넌트
│       ├── main.tsx          # 앱 진입점
│       └── index.css         # 전역 스타일
├── functions/                # 백엔드 (Firebase Functions)
│   ├── src/
│   │   ├── modules/          # 도메인별 모듈
│   │   │   ├── auth/         # 인증 모듈
│   │   │   ├── users/        # 사용자 관리
│   │   │   ├── student/      # 학생 관리
│   │   │   ├── teacher/      # 선생님 관리
│   │   │   ├── class/        # 반 관리
│   │   │   ├── subjects/     # 과목 관리
│   │   │   ├── attendance/   # 출석 관리
│   │   │   ├── parents/      # 부모 관리
│   │   │   ├── roles/        # 역할 관리
│   │   │   ├── user_roles/   # 사용자-역할 관계
│   │   │   ├── teacher_subjects/ # 선생님-과목 관계
│   │   │   ├── class_students/   # 반-학생 관계
│   │   │   └── schedules/    # 일정 관리
│   │   ├── common/           # 공통 모듈
│   │   │   ├── firestore.types.ts # Firestore 타입 정의
│   │   │   ├── wiseup_system_db_ver3.sql # 데이터베이스 스키마
│   │   │   ├── batch-query.ts # 배치 쿼리 유틸리티
│   │   │   ├── errors.ts     # 에러 정의
│   │   │   ├── asyncWrap.ts  # 비동기 래퍼
│   │   │   ├── errorHandler.ts # 에러 핸들러
│   │   │   └── validator.ts  # 유효성 검사
│   │   ├── config/           # 설정
│   │   │   └── firebase.ts   # Firebase 설정
│   │   └── index.ts          # 메인 진입점
│   ├── lib/                  # 컴파일된 JavaScript
│   ├── package.json          # 백엔드 의존성
│   └── tsconfig.json         # TypeScript 설정
├── firebase.json             # Firebase 설정
├── .firebaserc               # Firebase 프로젝트 설정
├── package.json              # 루트 의존성 (cors, express)
├── dev.sh                    # 개발 스크립트
└── firestore-debug.log       # Firestore 디버그 로그
```

## 🎯 프론트엔드 구조

### Widget 기반 상속 시스템

```
Widget (기본 컴포넌트)
├── Button (Widget 상속)
│   ├── SidebarButton (Button 상속)
│   └── IconButton (Button 상속)
└── Label (Widget 상속)
```

### 각 컴포넌트의 역할

#### 1. **Widget** (기본 컴포넌트)
- 모든 UI 컴포넌트의 공통 기능 제공
- **25개 이벤트 지원**: 마우스(11개), 키보드(2개), 포커스(2개), 드래그(6개), 터치(3개)
- 접근성 속성 (role, aria-label 등)
- 상태 관리 (hovered, focused, pressed, dragging, disabled)
- 기본 스타일링
- **드래그 앤 드롭 지원** (`draggable` 속성)
- **모바일 터치 이벤트 지원**

#### 2. **Button** (Widget 상속)
- Widget의 모든 기능을 상속받고 버튼 특화 기능 추가
- `variant`: 'primary' | 'secondary' | 'danger' | 'ghost'
- `size`: 'small' | 'medium' | 'large'
- 버튼 전용 스타일링

#### 3. **SidebarButton** (Button 상속)
- Button의 모든 기능을 상속받고 사이드바 특화 기능 추가
- `icon` 속성
- `isActive` 상태
- 사이드바 전용 스타일링

#### 4. **IconButton** (Button 상속)
- Button의 모든 기능을 상속받고 아이콘 특화 기능 추가
- `icon` 속성
- `alt` 텍스트
- 아이콘 전용 스타일링

#### 5. **Label** (Widget 상속)
- Widget의 모든 기능을 상속받고 라벨 특화 기능 추가
- `variant`: 'default' | 'heading' | 'caption' | 'error'
- `size`: 'small' | 'medium' | 'large'
- `color`: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
- `htmlFor` 속성 지원

## 🔧 백엔드 구조

### 아키텍처 패턴
- **Express.js** 기반 REST API
- **Firebase Functions** 서버리스 아키텍처
- **Firestore** NoSQL 데이터베이스
- **TypeScript** 타입 안전성

### 모듈 구조
각 도메인별로 독립적인 모듈로 구성:
- **Controller**: HTTP 요청/응답 처리 (93-293줄)
- **Service**: 비즈니스 로직 (227-250줄)
- **Route**: API 엔드포인트 정의 (24-104줄)
- **Validator**: 입력 데이터 검증 (80-94줄)
- **Types**: TypeScript 타입 정의 (52-87줄)

### 모듈별 파일 크기
- **Student**: 가장 큰 모듈 (controller: 293줄, service: 250줄)
- **Attendance**: 출석 관리 모듈 (service: 227줄, controller: 161줄)
- **Users**: 사용자 관리 모듈 (service: 239줄, route: 104줄)
- **Auth**: 인증 모듈 (service: 148줄, route: 113줄)

### 주요 API 엔드포인트
```
/students          # 학생 관리
/auth             # 인증 관련
/users            # 사용자 관리
/roles            # 역할 관리
/user-roles       # 사용자-역할 관계
/parents          # 부모 관리
/attendance       # 출석 관리
/teachers         # 선생님 관리
/subjects         # 과목 관리
/classes          # 반 관리
/teacher-subjects # 선생님-과목 관계
/class-students   # 반-학생 관계
/schedules        # 일정 관리
```

### 데이터베이스 스키마
주요 테이블:
- **User**: 사용자 정보 (user_name, user_phone, user_email, user_password_hash, user_status)
- **Student**: 학생 정보 (student_name, student_target_univ, student_photo, student_age, student_schoolname)
- **Teacher**: 선생님 정보 (teacher_name, teacher_subject)
- **Class**: 반 정보 (class_name, subject_id)
- **Subject**: 과목 정보 (subject_name)
- **Attendance**: 출석 정보 (att_date, att_status, att_reason, att_checkin_time, att_checkout_time)
- **Schedule**: 일정 정보 (start_date, end_date, title, description)
- **Roles**: 역할 정보 (role_name)
- **Parents**: 부모 정보
- **Exam**: 시험 정보 (exam_score, exam_type_id2)
- **Notification**: 알림 정보 (noti_channel, noti_message, noti_status)
- **Seats**: 자리 정보 (room_id, pos_x, pos_y)
- **Seat_assignments**: 자리 배정 정보
- **Class_Students**: 반-학생 관계
- **Teacher_Subjects**: 선생님-과목 관계
- **Parent_student**: 부모-학생 관계
- **User_roles**: 사용자-역할 관계

## 🔧 주요 기능

### 1. **조건부 페이지 렌더링**
- Layout 컴포넌트에서 사이드바 선택에 따라 메인 콘텐츠 변경
- 페이지 새로고침 없이 SPA 방식으로 동작

### 2. **전역 상태 관리**
- AppContext를 통한 전역 상태 관리
- `currentPage`: 현재 활성 페이지 ('home', 'attendance', 'timetable', 'students', 'learning', 'grades')
- `sidebarCollapsed`: 사이드바 접힘/펼침 상태
- `user`: 사용자 정보 상태

### 3. **이벤트 핸들링 시스템**
- useEventHandler 훅을 통한 일관된 이벤트 처리
- **25개 이벤트 완전 지원**:
  - **마우스 이벤트** (11개): click, hover, mouseLeave, doubleClick, mouseDown, mouseUp, mouseMove, mouseOver, mouseOut, contextMenu, wheel
  - **키보드 이벤트** (2개): keyDown, keyUp
  - **포커스 이벤트** (2개): focus, blur
  - **드래그 이벤트** (6개): dragStart, drag, dragEnd, dragEnter, dragLeave, drop
  - **터치 이벤트** (3개): touchStart, touchMove, touchEnd
- **상태 관리**: hovered, focused, pressed, dragging
- **접근성 지원**: 키보드 네비게이션, 스크린 리더 호환
- **모바일 지원**: 터치 이벤트, 드래그 앤 드롭

### 4. **반응형 레이아웃**
- 사이드바 고정 (256px)
- 메인 콘텐츠 영역 동적 크기 조정
- CSS 변수를 통한 일관된 크기 관리

### 5. **백엔드 API 통합**
- RESTful API 설계
- Firebase Functions 서버리스 아키텍처
- Firestore 실시간 데이터베이스
- JWT 기반 인증 시스템

## 🚀 개발 환경 설정

### 필수 요구사항
- Node.js 22.0.0 이상
- npm 9.0.0 이상
- Firebase CLI
- Google Cloud Platform 계정

### 설치 및 실행

```bash
# 전체 프로젝트 의존성 설치
npm install

# 프론트엔드 개발 서버 실행
cd frontend
npm run dev

# 백엔드 개발 서버 실행
cd functions
npm run serve

# 전체 개발 환경 실행 (루트에서)
./dev.sh
# - 프론트엔드 빌드
# - 백엔드 빌드
# - Firebase Emulator 실행 (백그라운드)
# - 프론트엔드 개발 서버 실행
```

### 백엔드 스크립트
```bash
# 백엔드 빌드
cd functions
npm run build

# 백엔드 배포
npm run deploy

# 로그 확인
npm run logs
```

### 배포

```bash
# 프론트엔드 빌드
cd frontend
npm run build

# 백엔드 배포
cd functions
npm run deploy

# 전체 배포
firebase deploy
```

## 📁 주요 파일 설명

### 프론트엔드 핵심 컴포넌트
- **`App.tsx`**: 애플리케이션의 루트 컴포넌트
- **`Layout/Layout.tsx`**: 전체 레이아웃과 사이드바 관리
- **`components/Widget/Widget.tsx`**: 모든 UI 컴포넌트의 기본 클래스

### 프론트엔드 상태 관리
- **`contexts/AppContext.tsx`**: 전역 상태 관리
- **`hooks/useEventHandler.ts`**: 이벤트 핸들링 로직

### 프론트엔드 라우팅
- **`routes/routerConfig.tsx`**: React Router 설정 (현재 홈페이지만 정의)
- **`routes/paths.ts`**: 경로 상수 정의 (HOME: '/')

### 백엔드 핵심 파일
- **`functions/src/index.ts`**: Express 서버 설정 및 라우터 마운트 (41줄)
- **`functions/src/common/firestore.types.ts`**: Firestore 타입 정의 (136줄)
- **`functions/src/common/wiseup_system_db_ver3.sql`**: 데이터베이스 스키마 (416줄)
- **`functions/src/common/batch-query.ts`**: 배치 쿼리 유틸리티 (208줄)
- **`functions/src/common/errors.ts`**: 에러 정의 (109줄)
- **`functions/src/common/validator.ts`**: 유효성 검사 (27줄)

### 백엔드 모듈 예시 (Student)
- **`student.controller.ts`**: HTTP 요청/응답 처리 (293줄)
- **`student.service.ts`**: 비즈니스 로직 (250줄)
- **`student.route.ts`**: API 엔드포인트 정의 (97줄)
- **`student.validator.ts`**: 입력 데이터 검증 (80줄)
- **`student.types.ts`**: TypeScript 타입 정의 (58줄)

## 🎨 스타일링 시스템

### CSS 변수 활용
```css
:root {
  --sidebar-length: 256px;
  --main-content-length: calc(100vw - var(--sidebar-length));
  --font-primary: 'Noto Sans KR', 'Inter', system-ui, Avenir, Helvetica, Arial, sans-serif;
  --font-secondary: 'Inter', 'Noto Sans KR', system-ui, Avenir, Helvetica, Arial, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
}
```

### 컴포넌트별 스타일 분리
- 각 컴포넌트마다 독립적인 CSS 파일
- BEM 방법론 적용
- CSS 변수를 통한 일관된 디자인 시스템

## 🔄 일괄 수정 가능성

### 상속 구조의 장점
1. **Widget 수정** → 모든 컴포넌트에 자동 반영
2. **Button 수정** → SidebarButton, IconButton에 자동 반영
3. **Label 수정** → 모든 Label 인스턴스에 자동 반영

### 사용 예시
```tsx
// 기본 Button 사용
<Button variant="primary" size="medium" onClick={handleClick}>
  클릭하세요
</Button>

// SidebarButton 사용 (Layout에서 실제 사용)
<SidebarButton 
  icon={sidebarLogo} 
  isActive={currentPage === item.id} 
  onClick={() => handleMenuClick(item.id)}
>
  {item.label}
</SidebarButton>

// Label 사용
<Label variant="heading" size="large" color="primary">
  제목
</Label>

// 드래그 앤 드롭 가능한 Widget
<Widget
  draggable={true}
  onDragStart={() => console.log('드래그 시작')}
  onDrop={() => console.log('드롭됨')}
  onTouchStart={() => console.log('터치 시작')}
  onContextMenu={() => console.log('우클릭')}
>
  드래그 가능한 아이템
</Widget>

// 키보드 지원 Widget
<Widget
  onKeyDown={(key) => console.log(`키 누름: ${key}`)}
  onKeyUp={(key) => console.log(`키 뗌: ${key}`)}
  tabIndex={0}
>
  키보드로 조작 가능
</Widget>
```

## 📝 개발 가이드라인

### 프론트엔드 컴포넌트 생성 시
1. Widget을 상속받아 기본 기능 확보
2. 컴포넌트별 특화 기능 추가
3. 독립적인 CSS 파일 생성
4. TypeScript 타입 정의

### 백엔드 모듈 생성 시
1. 도메인별 모듈 디렉토리 생성
2. Controller, Service, Route, Validator, Types 파일 생성
3. API 엔드포인트 정의
4. 비즈니스 로직 구현
5. 입력 데이터 검증 추가

### 스타일링 시
1. CSS 변수 활용
2. BEM 방법론 적용
3. 반응형 디자인 고려
4. 접근성 준수

## 🛠️ 기술 스택

### 프론트엔드
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS3 + CSS Variables
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Event Handling**: 25개 이벤트 완전 지원 (마우스, 키보드, 드래그, 터치, 포커스)
- **Accessibility**: ARIA 속성, 키보드 네비게이션, 스크린 리더 호환
- **Mobile Support**: 터치 이벤트, 드래그 앤 드롭
- **Development**: ESLint + TypeScript ESLint

### 백엔드
- **Runtime**: Node.js 22
- **Framework**: Express.js
- **Platform**: Firebase Functions
- **Database**: Firestore (NoSQL)
- **Language**: TypeScript
- **Authentication**: Firebase Auth
- **Validation**: Zod
- **Dependencies**: firebase-admin, firebase-functions, express, cors
- **Development**: ESLint + TypeScript ESLint

### 인프라
- **Hosting**: Firebase Hosting
- **Functions**: Firebase Functions
- **Database**: Firestore
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage
