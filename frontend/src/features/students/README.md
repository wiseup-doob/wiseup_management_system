# Students Feature

학생 관리 기능을 제공하는 feature입니다.

## 구성 요소

### Pages
- `StudentsPage`: 학생 목록을 표시하는 메인 페이지
- `CreateStudentPage`: 새로운 학생을 등록하는 페이지

### Types
- `Student`: 학생 정보 인터페이스
- `Grade`: 학년 타입 (초1~고3)
- `StudentStatus`: 학생 상태 (active/inactive)
- `StudentContactInfo`: 연락처 정보
- `CreateStudentRequest`: 학생 생성 요청 데이터
- `UpdateStudentRequest`: 학생 수정 요청 데이터

### Services
- `createStudent`: 새로운 학생 생성
- `getAllStudents`: 모든 학생 조회
- `getStudentById`: 특정 학생 조회
- `searchStudents`: 학생 검색
- `updateStudent`: 학생 정보 수정
- `deleteStudent`: 학생 삭제
- `getStudentStatistics`: 학생 통계 조회
- `getStudentCountByGrade`: 학년별 학생 수 조회

## 사용법

### 새로운 학생 등록

```tsx
import { CreateStudentPage } from '@features/students';

// 라우터에 추가
<Route path="/students/create" element={<CreateStudentPage />} />
```

### 학생 생성 API 호출

```tsx
import { createStudent } from '@features/students';

const handleCreate = async (studentData) => {
  const response = await createStudent(studentData);
  
  if (response.success) {
    console.log('학생 생성 성공:', response.data);
  } else {
    console.error('학생 생성 실패:', response.error);
  }
};
```

## 데이터 구조

### Student 인터페이스
```typescript
interface Student {
  id: string;                    // 학생 고유 ID
  name: string;                  // 학생 이름
  grade: Grade;                  // 학생 학년
  firstAttendanceDate?: string;  // 첫 등원 날짜
  lastAttendanceDate?: string;   // 마지막 등원 날짜
  parentsId?: string;            // 부모 ID
  status: StudentStatus;         // 학생 상태
  contactInfo?: StudentContactInfo; // 연락처 정보
  createdAt: string;             // 생성일
  updatedAt: string;             // 수정일
}
```

### Grade 타입
```typescript
type Grade = '초1' | '초2' | '초3' | '초4' | '초5' | '초6' | 
             '중1' | '중2' | '중3' | 
             '고1' | '고2' | '고3';
```

## 스타일링

- `CreateStudentPage.css`: 학생 생성 페이지 스타일
- 반응형 디자인 지원
- 모던한 UI/UX
- 접근성 고려

## 백엔드 연동

- RESTful API 사용
- 에러 처리 및 로딩 상태 관리
- 타입 안전성 보장
