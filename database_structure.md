# WiseUp 관리 시스템 데이터베이스 구조

## 개요

WiseUp 관리 시스템은 Firebase Firestore를 기반으로 한 NoSQL 데이터베이스를 사용합니다. 이 시스템은 학생 관리, 출석 관리, 시간표 관리, 좌석 관리 등의 기능을 제공합니다.

## 데이터베이스 아키텍처

### 기본 구조

  - **데이터베이스**: Firebase Firestore (NoSQL)
  - **기본 서비스**: `BaseService` 클래스를 상속받아 모든 서비스 구현
  - **ID 생성**: Firestore의 자동 생성 ID 사용 또는 UUID 생성
  - **시간 타입**: Firebase Firestore Timestamp 사용 (나노초 단위 정밀도)

## 주요 컬렉션 구조

### 1\. `students` (학생 정보)

학생의 핵심 인적 사항을 관리합니다.

```typescript
type Grade = '초1' | '초2' | '초3' | '초4' | '초5' | '초6' | '중1' | 
  '중2' | '중3' | '고1' | '고2' | '고3';
type 
interface Student extends BaseEntity {
  id: string;                    // 학생 고유 ID
  name: string;                  // 학생 이름
  grade: Grade;                  // 학생 학년
  firstAttendanceDate?: FirestoreTimestamp;  // 첫 등원 날짜
  lastAttendanceDate?: FirestoreTimestamp;   // 마지막 등원 날짜
  parentsId?: string;             // `parents` 컬렉션의 ID
  status: 'active' | 'inactive'; // 학생 상태 (재원, 퇴원)
  contactInfo?: {                // 연락처 정보
    phone?: string;
    email?: string;
    address?: string;
  };
  createdAt: FirestoreTimestamp;          // 생성일
  updatedAt: FirestoreTimestamp;          // 수정일
}
```

### 2\. `parents` (부모 정보)

학생의 부모 연락처 등 정보를 관리합니다.

```typescript
interface Parent extends BaseEntity {
  id: string;          // 부모 고유 ID
  name: string;        // 부모 이름
  contactInfo: {       // 연락처 정보
    phone: string;
    email?: string;
  };
  childStudentIds: string[]; // 자녀(학생)들의 ID 목록
  notes?: string;      // 기타 메모
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}
```

### 3\. `student_summaries` (학생 요약 정보) (나중에 구현, 현재 삭제)

자주 조회되는 학생별 통계 데이터를 저장하여 읽기 성능을 최적화합니다. Cloud Functions에 의해 자동으로 업데이트됩니다.

```typescript
// 문서 ID는 studentId와 동일
interface StudentSummary extends BaseEntity {
  studentId: string;              // 학생 ID
  studentName: string;            // 학생 이름
  currentAttendance: AttendanceStatus;
  lastAttendanceUpdate: FirestoreTimestamp;
  totalAttendanceDays: number;
  attendanceRate: number;         // 출석률
  lateCount: number;              // 지각 횟수
  earlyLeaveCount: number;        // 조퇴 횟수
  absentCount: number;            // 결석 횟수
  dismissedCount: number;         // 하원 횟수
  lastCheckInDate: FirestoreTimestamp; // 마지막 등원일
  lastCheckOutDate: FirestoreTimestamp; // 마지막 하원일
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}
```

### 4\. `attendance_records` (출석 기록)

학생의 모든 출석 관련 기록을 저장합니다.

```typescript
interface AttendanceRecord extends BaseEntity {
  id: string;                    // 출석 기록 고유 ID
  studentId: string;             // 학생 ID
  date: FirestoreTimestamp;               // 출석 날짜
  status: AttendanceStatus;      // 출석 상태
  timestamp: FirestoreTimestamp;          // 기록 시간
  updatedBy?: string;             // 업데이트한 사용자
  checkInTime?: FirestoreTimestamp;        // 등원 시간
  checkOutTime?: FirestoreTimestamp;       // 하원 시간
  notes?: string;                 // 메모
  isLate?: boolean;               // 지각 여부
  createdAt: FirestoreTimestamp;          // 생성일
  updatedAt: FirestoreTimestamp;          // 수정일
}

type AttendanceStatus = 'present' | 'dismissed' | 'unauthorized_absent' | 'authorized_absent' | 'not_enrolled';
```

### 5\. `courses` (강의 카탈로그)

학원에서 제공하는 모든 강의의 기본 정보(템플릿)를 관리합니다.

```typescript
interface Course extends BaseEntity {
  id: string;
  name: string;                    // 강의명 (예: "고등 수학 I")
  subject: SubjectType;            // 과목
  description?: string;            // 강의 설명
  difficulty?: 'beginner' | 'intermediate' | 'advanced'; // 난이도
  isActive: boolean;               // 활성화 여부
  createdAt: FirestoreTimestamp;   // 생성일
  updatedAt: FirestoreTimestamp;   // 수정일
}

type SubjectType = 
  | 'mathematics'      // 수학
  | 'english'          // 영어
  | 'korean'           // 국어
  | 'other';           // 기타
```

### 6\. `class_sections` (개설된 실제 수업)

`courses`의 강의를 기반으로, 특정 교사와 시간이 배정되어 실제로 운영되는 수업(분반)입니다.

```typescript
interface ClassSection extends BaseEntity {
  id: string;
  name: string;                    // 수업명 (예: "고등 수학 I - A반")
  courseId: string;                // `courses` 컬렉션의 ID
  teacherId: string;               // `teachers` 컬렉션의 ID
  classroomId: string;             // `classrooms` 컬렉션의 ID
  
  // 수업 시간 정보
  schedule: {
    dayOfWeek: DayOfWeek;          // 요일 (예: 'monday')
    startTime: string;             // 시작 시간 (예: "09:00")
    endTime: string;               // 종료 시간 (예: "10:30")
  }[];
  
  maxStudents: number;             // 최대 수강 인원
  currentStudents?: number;         // 현재 수강 인원
  status: 'active' | 'inactive' | 'completed'; // 수업 상태
  description?: string;            // 수업 설명
  notes?: string;                  // 참고사항
  createdAt: FirestoreTimestamp;       // 생성일
  updatedAt: FirestoreTimestamp;       // 수정일
}

type DayOfWeek = 
  | 'monday'      // 월요일
  | 'tuesday'     // 화요일
  | 'wednesday'   // 수요일
  | 'thursday'    // 목요일
  | 'friday'      // 금요일
  | 'saturday'    // 토요일
  | 'sunday';     // 일요일
```

### 7\. `student_timetables` (학생 개인 시간표)

각 학생에게 배정된 `class_sections`의 목록을 저장하여 개인 시간표를 구성합니다.

```typescript
// 문서 ID는 학생 ID(studentId)와 동일하게 사용하면 편리함
interface StudentTimetable extends BaseEntity {
  studentId: string;
  // 이 학생에게 배정된 모든 `class_sections`의 ID 목록
  classSectionIds: string[];
  createAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp; // 시간표가 마지막으로 수정된 시간
}
```

### 8\. `teachers` (교사 정보)

```typescript
interface Teacher extends BaseEntity {
  id: string;
  name: string;                    // 교사 이름
  email?: string;                   // 이메일
  phone?: string;                   // 전화번호
  subjects?: SubjectType[];         // 담당 과목 목록
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}
```

### 9\. `classrooms` (강의실 정보)

```typescript
interface Classroom extends BaseEntity {
  id: string;
  name: string;                    // 강의실명 (예: "A101", "컴퓨터실")
  capacity?: number;                // 수용 인원
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}
```

### 10\. `time_slots` (시간대 정보) - **제거됨**

~~학원의 수업 시간대와 쉬는시간을 체계적으로 관리합니다.~~

**변경 사항**: `time_slots` 컬렉션을 제거하고, `class_sections`의 `schedule`에 직접 시간 정보를 저장합니다.

```typescript
// 기존 구조 (제거됨)
// interface TimeSlot extends BaseEntity {
//   id: string;
//   name: string;                    // 시간대명 (예: "1교시", "점심시간", "자율학습")
//   startTime: string;               // 시작 시간 (HH:MM 형식, 예: "09:00")
//   endTime: string;                 // 종료 시간 (HH:MM 형식, 예: "10:30")
//   order: number;                   // 시간대 순서 (1, 2, 3...)
//   isBreak: boolean;                // 쉬는시간 여부
//   createdAt: FirestoreTimestamp;       // 생성일
//   updatedAt: FirestoreTimestamp;       // 수정일
// }

// 새로운 구조
// class_sections.schedule에 직접 시간 정보 저장
```

### 11\. `seats` (좌석 정보)

자율학습실 등의 좌석 배정 기능을 위해 사용됩니다.

```typescript
type SeatStatus = 'vacant' | 'occupied' | 'unavailable';

interface Seat extends BaseEntity {
  id: string;
  seatNumber: number;              // 좌석 번호
  status: SeatStatus;              // 좌석 상태
  isActive: boolean;               // 활성화 여부
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}
```

### 12\. `seat_assignments` (좌석 배정 관리)

```typescript
type AssignmentStatus = 'active' | 'released';

interface SeatAssignment extends BaseEntity {
  id: string;
  seatId: string;                  // `seats` 컬렉션의 ID
  studentId: string;               // `students` 컬렉션의 ID
  assignedDate: FirestoreTimestamp;    // 배정 날짜
  status: AssignmentStatus;        // 배정 상태
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}
```

## 시간 타입 시스템

### FirestoreTimestamp 사용

시스템에서는 Firebase Firestore의 `Timestamp` 타입을 사용하여 시간을 관리합니다.

```typescript
import { Timestamp } from 'firebase-admin/firestore';

// 타입 정의
export type FirestoreTimestamp = Timestamp;

// 사용 예시
interface BaseEntity {
  id: string;
  createdAt?: FirestoreTimestamp;  // 생성일
  updatedAt?: FirestoreTimestamp;  // 수정일
}
```

### Timestamp 유틸리티 함수

시간 관련 작업을 위한 다양한 유틸리티 함수를 제공합니다.

```typescript
import { timestampUtils } from '@shared/utils';

// 현재 시간
const now = timestampUtils.now();

// Date 객체를 Timestamp로 변환
const timestamp = timestampUtils.fromDate(new Date());

// ISO 문자열을 Timestamp로 변환
const timestamp = timestampUtils.fromISOString('2024-01-15T09:30:00.000Z');

// Timestamp를 Date로 변환
const date = timestampUtils.toDate(timestamp);

// Timestamp를 ISO 문자열로 변환
const isoString = timestampUtils.toISOString(timestamp);

// 시간 비교
const isBefore = timestampUtils.isBefore(timestamp1, timestamp2);
const isAfter = timestampUtils.isAfter(timestamp1, timestamp2);
const isEqual = timestampUtils.isEqual(timestamp1, timestamp2);

// 상대적 시간 표현
const relativeTime = timestampUtils.formatTimestamp(timestamp, 'relative'); // "오늘", "어제", "3일 전" 등

// 시간 계산
const futureTime = timestampUtils.addTime(timestamp, 2, 'hours'); // 2시간 후
const timeDiff = timestampUtils.timeDifference(timestamp1, timestamp2, 'minutes'); // 분 단위 차이
```

### 장점

- **정밀도**: 나노초 단위의 정밀한 시간 표현
- **성능**: Firestore 네이티브 타입으로 최적화된 성능
- **일관성**: 모든 시간 필드에서 동일한 타입 사용
- **기능성**: 풍부한 시간 조작 및 비교 기능

## 데이터 관계

  - **학생과 학부모**: 1:N 관계. `students.parentsId`와 `parents.childStudentIds`로 연결.
  - **학생과 출석**: 1:N 관계. `attendance_records.studentId`로 학생을 참조.
  - **학생과 개인 시간표**: 1:1 관계. `student_timetables` 문서 ID를 학생 ID와 동일하게 사용.
  - **개인 시간표와 수업**: 1:N 관계. `student_timetables.classSectionIds` 배열에 `class_sections`의 ID를 저장.
  - **강의와 개설 수업**: 1:N 관계. `class_sections.courseId`로 `courses`를 참조.
  - **수업과 교사**: N:1 관계. `class_sections.teacherId`로 `teachers`를 참조.
  - **수업과 강의실**: N:1 관계. `class_sections.classroomId`로 `classrooms`를 참조.
  - **수업과 시간대**: 직접 저장. `class_sections.schedule[]`에 `dayOfWeek`, `startTime`, `endTime`을 직접 저장하여 `time_slots` 참조 없이 시간 정보 관리.
  - **학생과 좌석**: 1:1 관계. `seat_assignments`를 통해 연결.

## 인덱스 구조

자주 사용될 쿼리에 대한 필수 인덱스 목록입니다.

```typescript
// students 컬렉션
- students/grade/Ascending/name/Ascending

// attendance_records 컬렉션
- attendance_records/studentId/Ascending/date/Descending
- attendance_records/date/Ascending

// class_sections 컬렉션
- class_sections/teacherId/Ascending
- class_sections/courseId/Ascending
- class_sections/classroomId/Ascending

// student_timetables 컬렉션
- student_timetables/studentId/Ascending

// seat_assignments 컬렉션
- seat_assignments/studentId/Ascending
- seat_assignments/seatId/Ascending

// time_slots 컬렉션 - **제거됨**
// ~~time_slots/order/Ascending~~
```

## 데이터 무결성 및 제약사항

  - **트랜잭션 사용**: 좌석 배정/해제, `student_timetables`에 수업을 추가/삭제하는 등 여러 문서를 동시에 수정해야 하는 작업에는 트랜잭션을 사용하여 데이터 일관성을 보장합니다.
  - **데이터 검증**: Cloud Functions 또는 Firestore 보안 규칙을 사용하여 필수 필드의 존재 여부와 데이터 타입을 검증합니다.
  - **중복 방지**:
      - 한 좌석에는 한 명의 학생만 배정될 수 있도록 로직을 구현합니다.
      - `class_sections`의 `schedule` 내에서 동일한 시간에 동일한 교사나 강의실이 중복 배정되지 않도록 검증 로직을 추가합니다.
  - **시간 형식 검증**: `class_sections.schedule[]`의 시간 형식은 HH:MM 형식을 사용하며, 시작 시간이 종료 시간보다 빨라야 합니다.
  - **상태 관리**: 각 엔티티의 상태 필드를 통해 활성/비활성 상태를 관리합니다.
  - **Timestamp 검증**: 모든 시간 필드는 유효한 Firestore Timestamp 값이어야 합니다.

## 추가 기능 및 확장성

  - **난이도 시스템**: `courses`에 난이도 필드를 추가하여 학생 수준에 맞는 강의 선택을 지원합니다.
  - **선수 과목**: `courses`에 선수 과목 목록을 추가하여 수강 순서를 관리합니다.
  - **출석 통계**: `student_summaries`를 통해 학생별 출석 통계를 실시간으로 제공합니다.
  - **장비 관리**: `classrooms`에 장비 목록을 추가하여 강의실별 시설 현황을 관리합니다.
  - **시간대 순서**: `class_sections.schedule[]`의 시간 순서를 기반으로 시간표 정렬을 지원합니다.
  - **고정밀 시간 관리**: Firestore Timestamp를 사용하여 나노초 단위의 정밀한 시간 기록을 지원합니다.
  - **시간 기반 쿼리**: Timestamp를 활용한 효율적인 시간 범위 검색 및 정렬을 지원합니다.

## 구조 단순화 변경 사항

### **제거된 컬렉션**
- **`time_slots`**: 표준 시간대 정의 컬렉션 제거
- **`timetables`**: 학기별 시간표 메타데이터 컬렉션 제거  
- **`timetable_items`**: 개별 수업 시간 정보 컬렉션 제거

### **변경된 구조**
- **기존**: `timetables` → `timetable_items` → `class_sections` (3단계 구조)
- **현재**: `class_sections`에 직접 시간 정보 저장 (1단계 구조)

### **장점**
- **구조 단순화**: 복잡한 참조 관계 제거
- **성능 향상**: 불필요한 컬렉션 조회 감소
- **유지보수성**: 코드 복잡도 감소
- **직관성**: 시간 정보가 수업 정보와 함께 저장

### **새로운 시간 관리 방식**
```typescript
// 기존 방식 (제거됨)
interface ClassSchedule {
  dayOfWeek: DayOfWeek;
  timeSlotId: string;        // time_slots 참조
  startTime: string;
  endTime: string;
}

// 새로운 방식
interface ClassSchedule {
  dayOfWeek: DayOfWeek;      // 직접 저장
  startTime: string;          // 직접 저장
  endTime: string;            // 직접 저장
}
```