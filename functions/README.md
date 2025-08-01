# 🔧 WiseUp Management System - Backend API

Firebase Functions를 사용한 백엔드 API 서버입니다.

## 🏗️ 프로젝트 구조

```
functions/
├── src/
│   ├── index.ts              # 메인 진입점
│   ├── config/               # 설정 파일들
│   ├── common/               # 공통 유틸리티
│   │   ├── errorHandler.ts   # 에러 핸들러
│   │   ├── asyncWrap.ts      # 비동기 래퍼
│   │   └── validator.ts      # 검증 유틸리티
│   └── modules/              # 도메인별 모듈
│       ├── auth/             # 인증 관리
│       ├── users/            # 사용자 관리
│       ├── students/         # 학생 관리
│       ├── teachers/         # 선생님 관리
│       ├── subjects/         # 과목 관리
│       ├── classes/          # 반 관리
│       ├── attendance/       # 출석 관리
│       ├── schedules/        # 일정 관리
│       ├── roles/            # 역할 관리
│       ├── parents/          # 부모 관리
│       ├── user_roles/       # 사용자-역할 관계
│       ├── teacher_subjects/ # 선생님-과목 관계
│       └── class_students/   # 반-학생 관계
```

## 🚀 실행 방법

### 개발 환경
```bash
# 의존성 설치
npm install

# TypeScript 빌드
npm run build

# Firebase Emulator 실행
firebase emulators:start --only functions
```

### 프로덕션 배포
```bash
# 배포
npm run deploy

# 로그 확인
npm run logs
```

## 📡 API 엔드포인트

### 🔐 인증 관리 (`/auth`)

#### 회원가입
- **POST** `/auth/register`
- **설명**: 새로운 사용자 등록
- **요청 본문**:
  ```json
  {
    "name": "홍길동",
    "phone": "010-1234-5678",
    "email": "hong@example.com",
    "password": "SecurePass123!"
  }
  ```

#### 로그인
- **POST** `/auth/login`
- **설명**: 사용자 로그인
- **요청 본문**:
  ```json
  {
    "email": "hong@example.com",
    "password": "SecurePass123!"
  }
  ```

#### 로그아웃
- **POST** `/auth/logout/:id`
- **설명**: 사용자 로그아웃
- **경로 매개변수**: `id` (사용자 ID)

#### 비밀번호 변경
- **PUT** `/auth/password/:id`
- **설명**: 사용자 비밀번호 변경
- **요청 본문**:
  ```json
  {
    "currentPassword": "OldPass123!",
    "newPassword": "NewPass456!"
  }
  ```

#### 비밀번호 재설정 요청
- **POST** `/auth/password/reset`
- **설명**: 비밀번호 재설정 이메일 발송
- **요청 본문**:
  ```json
  {
    "email": "hong@example.com"
  }
  ```

#### 비밀번호 재설정 확인
- **POST** `/auth/password/confirm`
- **설명**: 재설정 토큰으로 새 비밀번호 설정
- **요청 본문**:
  ```json
  {
    "token": "reset_token_here",
    "newPassword": "NewPass456!"
  }
  ```

#### 토큰 검증
- **POST** `/auth/verify`
- **설명**: JWT 토큰 검증
- **요청 본문**:
  ```json
  {
    "token": "jwt_token_here"
  }
  ```

#### 토큰 갱신
- **POST** `/auth/refresh`
- **설명**: JWT 토큰 갱신
- **요청 본문**:
  ```json
  {
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
  ```

### 👥 사용자 관리 (`/users`)

#### 전체 사용자 조회
- **GET** `/users`
- **설명**: 모든 사용자 목록 조회

#### 사용자 생성
- **POST** `/users`
- **설명**: 새로운 사용자 생성
- **요청 본문**:
  ```json
  {
    "name": "홍길동",
    "email": "hong@example.com",
    "phone": "010-1234-5678",
    "status": "active"
  }
  ```

#### 사용자 검색 (필터)
- **GET** `/users/search`
- **설명**: 필터를 사용한 사용자 검색
- **쿼리 매개변수**:
  - `status`: 사용자 상태 (active/inactive)
  - `email`: 이메일 (정확한 일치)
  - `phone`: 전화번호 (정확한 일치)
  - `name`: 이름 (부분 일치)
- **예시**:
  ```
  GET /users/search?status=active&name=김철수
  GET /users/search?email=test@example.com
  ```

#### 특정 사용자 조회
- **GET** `/users/:id`
- **설명**: 특정 사용자 정보 조회

#### 이메일로 사용자 조회
- **GET** `/users/email/:email`
- **설명**: 이메일로 사용자 검색

#### 사용자 수정
- **PUT** `/users/:id`
- **설명**: 사용자 정보 수정 (비밀번호 제외)

#### 사용자 삭제
- **DELETE** `/users/:id`
- **설명**: 사용자 삭제

#### 이메일 중복 확인
- **GET** `/users/check/email/:email`
- **설명**: 이메일 사용 가능 여부 확인

#### 전화번호 중복 확인
- **GET** `/users/check/phone/:phone`
- **설명**: 전화번호 사용 가능 여부 확인 (URL 인코딩 필요)

### 📚 학생 관리 (`/students`)

#### 전체 학생 조회
- **GET** `/students`
- **설명**: 모든 학생 목록 조회

#### 학생 생성
- **POST** `/students`
- **설명**: 새로운 학생 등록
- **요청 본문**:
  ```json
  {
    "user_id": "user_id_here",
    "name": "김학생",
    "school": "서울고등학교",
    "grade": "2학년"
  }
  ```

#### 특정 학생 조회
- **GET** `/students/:studentId`
- **설명**: 특정 학생 정보 조회

#### User ID로 학생 조회
- **GET** `/students/user/:userId`
- **설명**: User ID로 학생 검색

#### 학생과 사용자 정보 함께 조회
- **GET** `/students/:studentId/with-user`
- **설명**: 학생 정보와 연관된 사용자 정보 함께 조회

#### 학생 수정
- **PUT** `/students/:studentId`
- **설명**: 학생 정보 수정

#### 학생 삭제
- **DELETE** `/students/:studentId`
- **설명**: 학생 삭제

#### 필터로 학생 검색
- **GET** `/students/filter/search`
- **설명**: 필터를 사용한 학생 검색
- **쿼리 매개변수**:
  - `user_id`: 사용자 ID
  - `name`: 학생 이름
  - `school`: 학교명
  - `grade`: 학년

#### 부모-학생 관계 생성
- **POST** `/students/parent-relation`
- **설명**: 부모와 학생 간의 관계 생성
- **요청 본문**:
  ```json
  {
    "parent_id": "parent_id_here",
    "student_id": "student_id_here"
  }
  ```

#### 학생의 부모 목록 조회
- **GET** `/students/:studentId/parents`
- **설명**: 특정 학생의 부모 목록 조회

#### 부모의 학생 목록 조회
- **GET** `/students/parent/:parentId/students`
- **설명**: 특정 부모의 학생 목록 조회

### 👨‍🏫 선생님 관리 (`/teachers`)

#### 전체 선생님 조회
- **GET** `/teachers`
- **설명**: 모든 선생님 목록 조회

#### 특정 선생님 조회
- **GET** `/teachers/:id`
- **설명**: 특정 선생님 정보 조회

#### 선생님 생성
- **POST** `/teachers`
- **설명**: 새로운 선생님 등록
- **요청 본문**:
  ```json
  {
    "user_id": "user_id_here",
    "teacher_name": "박선생님",
    "teacher_bio": "수학 전문 선생님"
  }
  ```

#### 선생님 수정
- **PUT** `/teachers/:id`
- **설명**: 선생님 정보 수정

#### 선생님 삭제
- **DELETE** `/teachers/:id`
- **설명**: 선생님 삭제

### 📖 과목 관리 (`/subjects`)

#### 전체 과목 조회
- **GET** `/subjects`
- **설명**: 모든 과목 목록 조회

#### 과목 생성
- **POST** `/subjects`
- **설명**: 새로운 과목 생성
- **요청 본문**:
  ```json
  {
    "subject_name": "수학",
    "subject_description": "고등학교 수학"
  }
  ```

#### 과목 검색 (필터)
- **GET** `/subjects/search`
- **설명**: 필터를 사용한 과목 검색
- **쿼리 매개변수**:
  - `name`: 과목명 (부분 일치)
- **예시**:
  ```
  GET /subjects/search?name=수학
  ```

#### 특정 과목 조회
- **GET** `/subjects/:id`
- **설명**: 특정 과목 정보 조회

#### 과목과 선생님 정보 함께 조회
- **GET** `/subjects/:id/with-teachers`
- **설명**: 과목 정보와 연관된 선생님 정보 함께 조회

#### 과목과 반 정보 함께 조회
- **GET** `/subjects/:id/with-classes`
- **설명**: 과목 정보와 연관된 반 정보 함께 조회

#### 과목명 중복 확인
- **GET** `/subjects/check/:name`
- **설명**: 과목명 사용 가능 여부 확인

#### 과목 수정
- **PUT** `/subjects/:id`
- **설명**: 과목 정보 수정

#### 과목 삭제
- **DELETE** `/subjects/:id`
- **설명**: 과목 삭제

### 🏫 반 관리 (`/classes`)

#### 반 생성
- **POST** `/classes`
- **설명**: 새로운 반 생성
- **요청 본문**:
  ```json
  {
    "class_name": "2학년 1반",
    "subject_id": "subject_id_here",
    "max_students": 30
  }
  ```

#### 반 조회 (필터)
- **GET** `/classes`
- **설명**: 필터를 사용한 반 조회
- **쿼리 매개변수**: ClassFilter 스키마에 따라 필터링

#### 모든 반 조회
- **GET** `/classes/all`
- **설명**: 필터 없이 모든 반 조회

#### 특정 반 조회
- **GET** `/classes/:id`
- **설명**: 특정 반 정보 조회

#### 반과 선생님 정보 함께 조회
- **GET** `/classes/:id/with-teacher`
- **설명**: 반 정보와 연관된 선생님 정보 함께 조회

#### 반과 과목 정보 함께 조회
- **GET** `/classes/:id/with-subject`
- **설명**: 반 정보와 연관된 과목 정보 함께 조회

#### 반과 학생 정보 함께 조회
- **GET** `/classes/:id/with-students`
- **설명**: 반 정보와 연관된 학생 정보 함께 조회

#### 반과 모든 관련 정보 함께 조회
- **GET** `/classes/:id/with-details`
- **설명**: 반 정보와 모든 관련 정보(선생님, 과목, 학생) 함께 조회

#### 반명 중복 확인
- **GET** `/classes/check/:name`
- **설명**: 반명 사용 가능 여부 확인

#### 반 수정
- **PUT** `/classes/:id`
- **설명**: 반 정보 수정

#### 반 삭제
- **DELETE** `/classes/:id`
- **설명**: 반 삭제

### ✅ 출석 관리 (`/attendance`)

#### 출석 생성
- **POST** `/attendance`
- **설명**: 새로운 출석 기록 생성
- **요청 본문**:
  ```json
  {
    "student_id": "student_id_here",
    "class_id": "class_id_here",
    "att_date": "2024-01-15",
    "att_status": "present",
    "att_reason": "정상 출석"
  }
  ```

#### 전체 출석 조회
- **GET** `/attendance`
- **설명**: 모든 출석 기록 조회

#### 특정 출석 조회
- **GET** `/attendance/:attendanceId`
- **설명**: 특정 출석 기록 조회

#### 출석 수정
- **PUT** `/attendance/:attendanceId`
- **설명**: 출석 기록 수정

#### 출석 삭제
- **DELETE** `/attendance/:attendanceId`
- **설명**: 출석 기록 삭제

#### 학생별 날짜별 출석 조회
- **GET** `/attendance/student/:studentId/date/:date`
- **설명**: 특정 학생의 특정 날짜 출석 조회

#### 출석/퇴실 체크
- **POST** `/attendance/checkinout`
- **설명**: 학생 출석/퇴실 체크

#### 학생별 출석 통계
- **GET** `/attendance/student/:studentId/stats`
- **설명**: 특정 학생의 출석 통계 조회

#### 일별 출석 요약
- **GET** `/attendance/daily/:date/summary`
- **설명**: 특정 날짜의 출석 요약 조회

#### 학생별 출석 요약
- **GET** `/attendance/summaries`
- **설명**: 모든 학생의 출석 요약 조회

### 📅 일정 관리 (`/schedules`)

#### 일정 생성
- **POST** `/schedules`
- **설명**: 새로운 일정 생성
- **요청 본문**:
  ```json
  {
    "room_id": "room_id_here",
    "start_time": "2024-01-15T09:00:00Z",
    "end_time": "2024-01-15T10:00:00Z",
    "schedule_type": "class",
    "title": "수학 수업",
    "description": "2학년 1반 수학 수업"
  }
  ```

#### 일정 목록 조회 (필터)
- **GET** `/schedules`
- **설명**: 필터를 사용한 일정 목록 조회
- **쿼리 매개변수**:
  - `user_id`: 사용자 ID
  - `class_id`: 반 ID
  - `subject_id`: 과목 ID
  - `student_id`: 학생 ID
  - `title`: 일정 제목
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 20)

#### 일정 통계 조회
- **GET** `/schedules/stats`
- **설명**: 일정 통계 조회

#### 일별 일정 요약 조회
- **GET** `/schedules/daily/:date`
- **설명**: 특정 날짜의 일정 요약 조회

#### 학생별 일정 요약 조회
- **GET** `/schedules/student/:student_id/summary`
- **설명**: 특정 학생의 일정 요약 조회

#### 반별 일정 요약 조회
- **GET** `/schedules/class/:class_id/summary`
- **설명**: 특정 반의 일정 요약 조회

#### 배치 일정 상세 정보 조회
- **POST** `/schedules/batch/details`
- **설명**: 여러 일정의 상세 정보를 한 번에 조회
- **요청 본문**:
  ```json
  {
    "schedule_ids": ["id1", "id2", "id3"]
  }
  ```

#### 배치 일정 통계 조회
- **GET** `/schedules/batch/stats`
- **설명**: 배치 일정 통계 조회

#### 특정 일정 조회
- **GET** `/schedules/:id`
- **설명**: 특정 일정 조회

#### 일정 상세 정보 조회
- **GET** `/schedules/:id/details`
- **설명**: 일정과 관련된 모든 정보 조회

#### 일정 수정
- **PUT** `/schedules/:id`
- **설명**: 일정 수정

#### 일정 삭제
- **DELETE** `/schedules/:id`
- **설명**: 일정 삭제

### 🔧 역할 관리 (`/roles`)

#### 역할 생성
- **POST** `/roles`
- **설명**: 새로운 역할 생성
- **요청 본문**:
  ```json
  {
    "role_name": "관리자",
    "role_description": "시스템 관리자"
  }
  ```

#### 역할 조회 (필터)
- **GET** `/roles`
- **설명**: 필터를 사용한 역할 조회

#### 모든 역할 조회
- **GET** `/roles/all`
- **설명**: 필터 없이 모든 역할 조회

#### 특정 역할 조회
- **GET** `/roles/:id`
- **설명**: 특정 역할 조회

#### 역할 수정
- **PUT** `/roles/:id`
- **설명**: 역할 수정

#### 역할 삭제
- **DELETE** `/roles/:id`
- **설명**: 역할 삭제

## 🔗 관계 관리 API

### 사용자-역할 관계 (`/user-roles`)
### 선생님-과목 관계 (`/teacher-subjects`)
### 반-학생 관계 (`/class-students`)
### 부모 관리 (`/parents`)

각 관계 관리 API도 동일한 CRUD 패턴을 따릅니다.

## 📊 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": {
    // 응답 데이터
  },
  "message": "작업이 성공적으로 완료되었습니다."
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "에러 메시지",
  "code": "ERROR_CODE"
}
```

## 🔐 인증

대부분의 API는 JWT 토큰 인증이 필요합니다. 헤더에 다음을 포함하세요:

```
Authorization: Bearer <jwt_token>
```

## 🛠️ 개발 도구

### 로그 확인
```bash
npm run logs
```

### 린트 검사
```bash
npm run lint
```

### 타입 체크
```bash
npm run build
```

## 📝 환경 변수

- `FIREBASE_PROJECT_ID`: Firebase 프로젝트 ID
- `JWT_SECRET`: JWT 서명 키
- `NODE_ENV`: 실행 환경 (development/production)

## 🚨 주의사항

1. **개발 환경**: Firebase Emulator 사용
2. **프로덕션**: Firebase Functions 배포
3. **데이터베이스**: Firestore 사용
4. **인증**: Firebase Auth 사용

## 🧪 API 테스트 예시

### 개발 환경에서 테스트
```bash
# 기본 URL
BASE_URL="http://localhost:5001/wiseupmanagementsystem/us-central1/api"

# 1. 회원가입
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트유저",
    "phone": "010-1234-5678",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# 2. 로그인
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# 3. 사용자 목록 조회
curl -X GET "$BASE_URL/users"

# 4. 학생 생성
curl -X POST "$BASE_URL/students" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_id_from_step_2",
    "name": "김학생",
    "school": "서울고등학교",
    "grade": "2학년"
  }'

# 5. 과목 생성
curl -X POST "$BASE_URL/subjects" \
  -H "Content-Type: application/json" \
  -d '{
    "subject_name": "수학",
    "subject_description": "고등학교 수학"
  }'
```

### Postman/Insomnia 사용
1. **환경 변수 설정**:
   - `base_url`: `http://localhost:5001/wiseupmanagementsystem/us-central1/api`
2. **요청 헤더**:
   - `Content-Type: application/json`
   - `Authorization: Bearer <token>` (인증 필요 시)

## 📞 지원

API 관련 문의사항이 있으시면 개발팀에 연락해주세요. 