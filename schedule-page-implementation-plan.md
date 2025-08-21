# SchedulePage 구현 계획서

## 📋 개요

WiseUp 관리 시스템의 SchedulePage 구현을 위한 상세 계획서입니다. 이 페이지는 학생별 개인 시간표를 관리하고 표시하는 기능을 제공합니다.

## 🎯 현재 상황 분석

### DB 구조 분석 결과

#### 1. **`students` 컬렉션**
- 학생 기본 정보 (이름, 학년, 상태 등)
- 학년별, 상태별 필터링 가능
- 학부모 정보와 연결

#### 2. **`class_sections` 컬렉션**
- 수업 정보 (과목, 교사, 강의실, 스케줄)
- `schedule[]` 배열에 직접 시간 정보 저장
- `dayOfWeek`, `startTime`, `endTime` 포함

#### 3. **`student_timetables` 컬렉션** ✅ **확인됨**
- 학생별 개인 시간표
- `classSectionIds` 배열로 수업 연결
- 학생 ID와 1:1 관계
- **상태**: 완전히 설계되어 있고, 타입과 서비스도 구현됨

#### 4. **시간 정보 관리**
- `time_slots` 컬렉션 제거됨
- `class_sections.schedule[]`에 직접 저장
- Firestore Timestamp 사용

### 백엔드 API 분석 결과

#### 1. **학생 API** (`/students`)
- CRUD 작업
- 검색 및 필터링
- 통계 정보 조회

#### 2. **수업 API** (`/class-sections`)
- CRUD 작업
- 상세 정보 조회 (Course, Teacher, Classroom 포함)
- 시간 충돌 검증
- 스케줄 통계

#### 3. **출석 API** (`/attendance`)
- 출석 기록 관리
- 통계 및 요약 정보
- 날짜별, 학생별 조회

#### 4. **학생 시간표 API** (`/student-timetables`) ✅ **구현 완료**
- CRUD 작업 완전 구현
- 수업 추가/제거 기능
- 통합 시간표 조회 (상세 정보 포함)
- **상태**: 백엔드 API 완전 구현 및 배포 완료

## 🏗️ SchedulePage 구성 방향

### 1. 핵심 기능 정의

- **학생별 개인 시간표 관리**: 각 학생이 수강하는 수업들의 시간표 표시
- **수업 스케줄 조회**: 학생이 선택한 수업의 상세 스케줄 정보
- **시간 충돌 감지**: 학생의 수업들 간 시간 겹침 확인
- **시간표 편집**: 수업 추가/제거 기능

### 2. 데이터 흐름 설계

```
학생 선택 → student_timetables 조회 → class_sections 상세 정보 조회 → 시간표 렌더링
```

### 3. UI 구조 계획

#### 왼쪽 패널 (학생 목록)
- **학생 검색**: 이름 기반 검색
- **필터링**: 학년별, 상태별 필터
- **학생 카드**: 이름, 학년, 상태 (간소화됨)
- **학생 추가**: 새 학생 등록

#### 오른쪽 패널 (학생 시간표)
- **기본 정보**: 선택된 학생의 기본 정보
- **개인 시간표**: 해당 학생이 수강하는 모든 수업의 시간표
- **시간표 위젯**: 기존 TimetableWidget 활용

## 🔧 기술적 구현 계획

### 1. API 엔드포인트 ✅ **구현 완료**

```typescript
// 기본 CRUD
POST   /api/student-timetables                    # 학생 시간표 생성
GET    /api/student-timetables                    # 모든 학생 시간표 조회
GET    /api/student-timetables/:id                # 개별 학생 시간표 조회
PUT    /api/student-timetables/:id                # 학생 시간표 수정
DELETE /api/student-timetables/:id                # 학생 시간표 삭제

// 학생별 조회
GET    /api/student-timetables/student/:studentId                    # 학생별 시간표
GET    /api/student-timetables/student/:studentId/schedule-with-details  # 통합 시간표 (상세 정보 포함)

// 수업 관리
POST   /api/student-timetables/:id/add-class      # 수업 추가
POST   /api/student-timetables/:id/remove-class   # 수업 제거

// 검색 및 통계
GET    /api/student-timetables/search             # 학생 시간표 검색
GET    /api/student-timetables/statistics         # 학생 시간표 통계
```

### 2. 데이터 구조 설계 ✅ **백엔드에서 구현됨**

```typescript
// 백엔드에서 실제로 반환하는 응답 구조
interface StudentScheduleResponse {
  success: boolean;
  data: {
    studentId: string;
    studentName: string;
    grade: string;
    status: 'active' | 'inactive';
    classSections: Array<{
      id: string;
      courseName: string;
      teacherName: string;
      classroomName: string;
      schedule: Array<{
        dayOfWeek: string;
        startTime: string;
        endTime: string;
      }>;
      color: string; // 자동 생성된 색상
    }>;
  };
  meta: {
    timestamp: string;
    requestId: string;
    classCount: number;
  };
}
```

### 3. 컴포넌트 구조

```
SchedulePage
├── SearchFilterSection (검색/필터)
│   ├── StudentSearchInput
│   ├── GradeFilter
│   ├── StatusFilter
│   └── AddStudentButton
├── StudentPanel (학생 목록)
│   ├── StudentList
│   ├── StudentCard
│   └── StudentPagination
└── StudentTimetablePanel (학생 시간표)
    ├── StudentInfoSection (기본 정보)
    │   ├── StudentBasicInfo
    │   └── StudentStats
    └── TimetableSection (시간표 위젯)
        ├── TimetableWidget (기존 컴포넌트 재사용)
        ├── ClassConflictIndicator
        └── TimetableActions
```

## 📊 데이터 처리 로직

### 1. 학생 목록 조회

```typescript
// API 호출
const fetchStudents = async (filters: StudentFilters) => {
  const response = await apiService.getStudents(filters);
  return response.data;
};

// 필터링 로직
const filteredStudents = students.filter(student => {
  const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesGrade = !filters.grade || student.grade === filters.grade;
  const matchesStatus = !filters.status || student.status === filters.status;
  
  return matchesSearch && matchesGrade && matchesStatus;
});
```

### 2. 학생 시간표 조회 ✅ **API 준비 완료**

```typescript
// 학생별 통합 시간표 조회 (백엔드에서 상세 정보 포함)
const fetchStudentScheduleWithDetails = async (studentId: string) => {
  const response = await apiService.getStudentScheduleWithDetails(studentId);
  return response.data;
};

// 시간표 데이터 가공
const processTimetableData = (studentSchedule: StudentScheduleResponse['data']) => {
  // TimetableWidget에 맞는 형태로 변환
  const timeSlots = generateTimeSlots({ startHour: 9, endHour: 23, timeInterval: 60 });
  const daySchedules = groupClassesByDay(studentSchedule.classSections);
  const conflicts = detectTimeConflicts(daySchedules);
  
  return { timeSlots, daySchedules, conflicts };
};
```

### 3. 시간 충돌 감지

```typescript
// 기존 detectTimeConflicts 로직 활용
const detectStudentTimeConflicts = (classSections: ClassSection[]) => {
  const allSchedules = classSections.flatMap(cs => cs.schedule);
  return detectTimeConflicts(allSchedules);
};
```

## 🎨 UI/UX 개선 계획

### 1. 시간표 표시

- **요일별 정렬**: 월~일 순서로 수업 배치
- **시간별 정렬**: 시작 시간 순서로 정렬
- **색상 구분**: 백엔드에서 자동 생성된 색상 사용
- **충돌 표시**: 겹치는 시간대 시각적 강조

### 2. 상호작용

- **수업 클릭**: 수업 상세 정보 모달
- **시간표 편집**: 수업 추가/제거 기능 (API 준비 완료)
- **드래그 앤 드롭**: 수업 시간 변경 (향후 구현)
- **즐겨찾기**: 자주 보는 학생 즐겨찾기

### 3. 반응형 디자인

- **데스크톱**: 좌우 패널 구조
- **태블릿**: 세로 배치
- **모바일**: 탭 기반 구조

## ⚡ 성능 최적화 계획

### 1. 데이터 캐싱

```typescript
// React Query 또는 SWR 활용
const { data: students, isLoading } = useQuery(
  ['students', filters],
  () => fetchStudents(filters),
  { staleTime: 5 * 60 * 1000 } // 5분 캐시
);

const { data: timetable } = useQuery(
  ['student-schedule', selectedStudentId],
  () => fetchStudentScheduleWithDetails(selectedStudentId),
  { enabled: !!selectedStudentId }
);
```

### 2. 지연 로딩

- 학생 선택 시에만 시간표 데이터 로드
- 페이지네이션으로 대량 데이터 처리
- 이미지 및 아이콘 지연 로딩

### 3. 메모이제이션

```typescript
// React.memo, useMemo, useCallback 활용
const filteredStudents = useMemo(() => {
  return students.filter(student => {
    // 필터링 로직
  });
}, [students, searchTerm, filters]);

const handleStudentSelect = useCallback((student: Student) => {
  setSelectedStudent(student);
}, []);
```

## 🚀 구현 우선순위

### Phase 1: 기본 구조 (1주) ✅ **백엔드 준비 완료**
1. **학생 목록 조회 및 표시**
   - 학생 API 연동
   - 검색 및 필터링 구현
   - 학생 카드 컴포넌트 완성

2. **학생 선택 시 기본 정보 표시**
   - 학생 상세 정보 API 연동
   - 기본 정보 섹션 완성

3. **기본 레이아웃 완성**
   - 반응형 디자인 적용
   - 로딩 및 에러 상태 처리

### Phase 2: 시간표 연동 (1-2주) ✅ **API 준비 완료**
1. **학생별 수업 목록 조회**
   - `student_timetables` API 연동 ✅
   - `class_sections` 상세 정보 조회 ✅

2. **TimetableWidget 연동**
   - 기존 컴포넌트 재사용
   - 데이터 형태 맞춤

3. **시간표 데이터 표시**
   - 요일별, 시간별 정렬
   - 색상 구분 및 스타일링

### Phase 3: 고급 기능 (1-2주) ✅ **API 준비 완료**
1. **시간 충돌 감지**
   - 충돌 로직 구현
   - 시각적 표시 개선

2. **수업 편집 기능**
   - 수업 추가/제거 ✅ (API 준비 완료)
   - 시간 변경 (기본)

3. **검색 및 필터링 고도화**
   - 고급 검색 옵션
   - 필터 조합 기능

## ❓ 고려사항 및 질문

### 1. 데이터베이스 관련 ✅ **해결됨**
- **`student_timetables` 컬렉션이 실제로 존재하는가?** ✅ **존재함**
- **학생별 수업 등록/해제는 어떻게 처리되는가?** ✅ **API 구현 완료**
- **시간표 편집 권한은 누구에게 있는가?** ✅ **시간표 편집 버튼 + 편집 페이지 구현 예정**

### 2. 기능 관련 ✅ **해결됨**
- **기존 TimetableWidget을 재사용할 수 있는가?** ✅ **가능함**
- **시간표 편집 시 실시간 동기화가 필요한가?** ✅ **API 준비 완료**
- **학생별 시간표 백업/복원 기능이 필요한가?** ⚠️ **요구사항 확인 필요**

### 3. 성능 관련
- **대량의 학생 데이터 처리 방법은?** ✅ **페이지네이션 API 준비**
- **실시간 업데이트가 필요한가?** ⚠️ **요구사항 확인 필요**
- **오프라인 지원이 필요한가?** ⚠️ **요구사항 확인 필요**

## 📝 다음 단계 ✅ **백엔드 완료**

### ✅ **완료된 작업**
1. **백엔드 API 엔드포인트 구현** ✅ **완료**
   - `StudentTimetableController` 생성 ✅
   - `StudentTimetableService` 연동 ✅
   - 모든 CRUD 및 비즈니스 로직 구현 ✅
   - Firebase Functions 배포 완료 ✅

### 🚀 **다음 진행 작업**
2. **프론트엔드 컴포넌트 개발**
   - `StudentPanel` 컴포넌트 구현
   - `StudentTimetablePanel` 컴포넌트 구현
   - 기존 `TimetableWidget` 연동
   - API 연동 및 데이터 처리

3. **데이터 연동 및 테스트**
   - API 연동 테스트
   - UI/UX 테스트
   - 성능 테스트

## 🔗 구현된 API 정보

### **배포된 함수 URL**
- **Base URL**: https://api-xkhcgo7jrq-uc.a.run.app
- **학생 시간표 API**: `/api/student-timetables`

### **사용 가능한 엔드포인트**
- **생성**: `POST /api/student-timetables`
- **전체 조회**: `GET /api/student-timetables`
- **개별 조회**: `GET /api/student-timetables/:id`
- **학생별 조회**: `GET /api/student-timetables/student/:studentId`
- **통합 시간표**: `GET /api/student-timetables/student/:studentId/schedule-with-details`
- **수정**: `PUT /api/student-timetables/:id`
- **삭제**: `DELETE /api/student-timetables/:id`
- **수업 추가**: `POST /api/student-timetables/:id/add-class`
- **수업 제거**: `POST /api/student-timetables/:id/remove-class`
- **검색**: `GET /api/student-timetables/search`
- **통계**: `GET /api/student-timetables/statistics`

---

**작성일**: 2024년 12월  
**작성자**: AI Assistant  
**버전**: 2.0  
**상태**: 백엔드 API 구현 완료, 프론트엔드 개발 준비 단계
