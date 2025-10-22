# 데이터 수정 모달 구현 계획서

## 📋 개요

**목적**: 학생, 교사, 강의실 관리 페이지에서 각 항목을 편집할 수 있는 모달 컴포넌트 구현

**대상 페이지**: `StudentsPage.tsx` (frontend/src/features/students/pages/StudentsPage.tsx)

**구현 방식**: 기존 `AddXxxModal` 컴포넌트를 기반으로 편집 전용 모달 생성

---

## 🎯 구현 항목

### 1. 학생 편집 모달 (EditStudentModal)
### 2. 교사 편집 모달 (EditTeacherModal)
### 3. 강의실 편집 모달 (EditClassroomModal)

---

## 📦 1. 학생 편집 모달 (EditStudentModal)

### 1.1 파일 위치
```
frontend/src/features/students/components/EditStudentModal.tsx
frontend/src/features/students/components/EditStudentModal.css
```

### 1.2 타입 정의

#### Props 인터페이스
```typescript
interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentUpdated: (student: Student) => void;
  student: Student;  // 편집할 학생 데이터
}
```

#### Form Data 인터페이스
```typescript
interface StudentFormData {
  name: string;
  grade: Grade;  // '초1' | '초2' | ... | 'N수'
  firstAttendanceDate?: string;
  lastAttendanceDate?: string;
  parentsId?: string;
  status: StudentStatus;  // 'active' | 'inactive'
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
}
```

### 1.3 주요 필드

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| name | string | ✅ | 학생 이름 |
| grade | Grade | ✅ | 학년 (초1~고3, N수) |
| status | StudentStatus | ✅ | 상태 (재원/퇴원) |
| firstAttendanceDate | string | ❌ | 첫 등원일 (date input) |
| lastAttendanceDate | string | ❌ | 마지막 등원일 (date input) |
| parentsId | string | ❌ | 부모 ID |
| contactInfo.phone | string | ❌ | 전화번호 |
| contactInfo.email | string | ❌ | 이메일 |
| contactInfo.address | string | ❌ | 주소 |

### 1.4 API 호출

**엔드포인트**: `PUT /api/students/:id`

**API 메서드**: `apiService.updateStudent(student.id, formData)`

**백엔드 지원**: ✅ [StudentController.ts:62-81](functions/src/controllers/StudentController.ts#L62-L81)

**프론트엔드 지원**: ✅ [api.ts:354-359](frontend/src/services/api.ts#L354-L359)

### 1.5 폼 초기화

```typescript
useEffect(() => {
  if (student && isOpen) {
    setFormData({
      name: student.name,
      grade: student.grade,
      firstAttendanceDate: convertTimestampToString(student.firstAttendanceDate),
      lastAttendanceDate: convertTimestampToString(student.lastAttendanceDate),
      parentsId: student.parentsId || '',
      status: student.status,
      contactInfo: {
        phone: student.contactInfo?.phone || '',
        email: student.contactInfo?.email || '',
        address: student.contactInfo?.address || ''
      }
    });
  }
}, [student, isOpen]);
```

### 1.6 제출 로직

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    setIsLoading(true);
    setError('');

    const response = await apiService.updateStudent(student.id, formData);

    if (response.success) {
      onStudentUpdated(response.data);
      handleClose();
    } else {
      setError(response.message || '학생 수정에 실패했습니다.');
    }
  } catch (error) {
    console.error('학생 수정 실패:', error);
    setError('학생 수정 중 오류가 발생했습니다.');
  } finally {
    setIsLoading(false);
  }
};
```

### 1.7 유효성 검사

- ✅ 이름 필수 입력 (빈 문자열 방지)
- ✅ 학년 필수 선택
- ✅ 상태 필수 선택
- ❌ 날짜 형식 검증 (브라우저 date input 사용)
- ❌ 이메일 형식 검증 (선택사항)

---

## 👨‍🏫 2. 교사 편집 모달 (EditTeacherModal)

### 2.1 파일 위치
```
frontend/src/features/students/components/EditTeacherModal.tsx
frontend/src/features/students/components/EditTeacherModal.css (AddTeacherModal.css 재사용 가능)
```

### 2.2 타입 정의

#### Props 인터페이스
```typescript
interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeacherUpdated: (teacher: Teacher) => void;
  teacher: Teacher;  // 편집할 교사 데이터
}
```

#### Form Data 인터페이스
```typescript
interface TeacherFormData {
  name: string;
  subjects: string[];  // SubjectType[]
  email?: string;
  phone?: string;
}
```

### 2.3 주요 필드

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| name | string | ✅ | 교사 이름 |
| subjects | string[] | ✅ | 담당 과목 (체크박스 다중 선택) |
| email | string | ❌ | 이메일 |
| phone | string | ❌ | 전화번호 |

### 2.4 과목 옵션

```typescript
const subjectOptions = [
  'mathematics', 'english', 'korean', 'science',
  'social', 'art', 'music', 'pe', 'other'
];

const subjectLabels: Record<string, string> = {
  mathematics: '수학',
  english: '영어',
  korean: '국어',
  science: '과학',
  social: '사회',
  art: '미술',
  music: '음악',
  pe: '체육',
  other: '기타'
};
```

### 2.5 API 호출

**엔드포인트**: `PUT /api/teachers/:id`

**API 메서드**: `apiService.updateTeacher(teacher.id, formData)`

**백엔드 지원**: ✅ [TeacherController.ts:77-107](functions/src/controllers/TeacherController.ts#L77-L107)

**프론트엔드 지원**: ✅ [api.ts:874-879](frontend/src/services/api.ts#L874-L879)

### 2.6 폼 초기화

```typescript
useEffect(() => {
  if (teacher && isOpen) {
    setFormData({
      name: teacher.name,
      subjects: teacher.subjects || [],
      email: teacher.email || '',
      phone: teacher.phone || ''
    });
  }
}, [teacher, isOpen]);
```

### 2.7 과목 체크박스 핸들러

```typescript
const handleSubjectChange = (subject: string) => {
  setFormData(prev => ({
    ...prev,
    subjects: prev.subjects.includes(subject)
      ? prev.subjects.filter(s => s !== subject)
      : [...prev.subjects, subject]
  }));
};
```

### 2.8 제출 로직

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // 유효성 검사
  if (!formData.name.trim()) {
    setError('교사 이름을 입력해주세요.');
    return;
  }

  if (formData.subjects.length === 0) {
    setError('최소 하나의 과목을 선택해주세요.');
    return;
  }

  try {
    setIsLoading(true);
    setError('');

    const response = await apiService.updateTeacher(teacher.id, {
      name: formData.name.trim(),
      subjects: formData.subjects,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined
    });

    if (response.success) {
      onTeacherUpdated(response.data);
      handleClose();
    } else {
      setError(response.message || '교사 수정에 실패했습니다.');
    }
  } catch (error) {
    console.error('교사 수정 실패:', error);
    setError('교사 수정 중 오류가 발생했습니다.');
  } finally {
    setIsLoading(false);
  }
};
```

### 2.9 유효성 검사

- ✅ 이름 필수 입력
- ✅ 최소 1개 과목 선택 필수
- ❌ 이메일 형식 검증 (선택사항)
- ❌ 전화번호 형식 검증 (선택사항)

---

## 🏫 3. 강의실 편집 모달 (EditClassroomModal)

### 3.1 파일 위치
```
frontend/src/features/students/components/EditClassroomModal.tsx
frontend/src/features/students/components/EditClassroomModal.css (AddClassroomModal.css 재사용 가능)
```

### 3.2 타입 정의

#### Props 인터페이스
```typescript
interface EditClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClassroomUpdated: (classroom: Classroom) => void;
  classroom: Classroom;  // 편집할 강의실 데이터
}
```

#### Form Data 인터페이스
```typescript
interface ClassroomFormData {
  name: string;
  capacity: number;
  location?: string;
  description?: string;
}
```

### 3.3 주요 필드

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| name | string | ✅ | 강의실명 |
| capacity | number | ✅ | 수용 인원 (1~100) |
| location | string | ❌ | 위치 (예: "1층", "2층 동쪽") |
| description | string | ❌ | 설명 (textarea) |

### 3.4 API 호출

**엔드포인트**: `PUT /api/classrooms/:id`

**API 메서드**: `apiService.updateClassroom(classroom.id, formData)`

**백엔드 지원**: ✅ [ClassroomController.ts:74-104](functions/src/controllers/ClassroomController.ts#L74-L104)

**프론트엔드 지원**: ✅ [api.ts:984-989](frontend/src/services/api.ts#L984-L989)

### 3.5 폼 초기화

```typescript
useEffect(() => {
  if (classroom && isOpen) {
    setFormData({
      name: classroom.name,
      capacity: classroom.capacity,
      location: classroom.location || '',
      description: classroom.description || ''
    });
  }
}, [classroom, isOpen]);
```

### 3.6 숫자 입력 핸들러

```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: name === 'capacity' ? parseInt(value) || 0 : value
  }));
};
```

### 3.7 제출 로직

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // 유효성 검사
  if (!formData.name.trim()) {
    setError('강의실명을 입력해주세요.');
    return;
  }

  if (formData.capacity <= 0) {
    setError('수용 인원은 1명 이상이어야 합니다.');
    return;
  }

  try {
    setIsLoading(true);
    setError('');

    const response = await apiService.updateClassroom(classroom.id, {
      name: formData.name.trim(),
      capacity: formData.capacity,
      location: formData.location?.trim() || undefined,
      description: formData.description?.trim() || undefined
    });

    if (response.success) {
      onClassroomUpdated(response.data);
      handleClose();
    } else {
      setError(response.message || '강의실 수정에 실패했습니다.');
    }
  } catch (error) {
    console.error('강의실 수정 실패:', error);
    setError('강의실 수정 중 오류가 발생했습니다.');
  } finally {
    setIsLoading(false);
  }
};
```

### 3.8 유효성 검사

- ✅ 강의실명 필수 입력
- ✅ 수용 인원 1명 이상 (min="1" max="100")
- ❌ 위치 선택사항
- ❌ 설명 선택사항

---

## 🔧 StudentsPage.tsx 수정 사항

### 4.1 추가 상태 변수

```typescript
// 학생 편집 상태
const [showEditStudentModal, setShowEditStudentModal] = useState(false);
const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

// 교사 편집 상태
const [showEditTeacherModal, setShowEditTeacherModal] = useState(false);
const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

// 강의실 편집 상태
const [showEditClassroomModal, setShowEditClassroomModal] = useState(false);
const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
```

### 4.2 편집 핸들러

```typescript
// 학생 편집 열기
const handleEditStudent = (student: Student) => {
  setSelectedStudent(student);
  setShowEditStudentModal(true);
};

// 학생 수정 완료
const handleStudentUpdated = (updatedStudent: Student) => {
  console.log('학생 수정 완료:', updatedStudent);
  dispatch(fetchStudents());
  setShowEditStudentModal(false);
  setSelectedStudent(null);
};

// 교사 편집 열기
const handleEditTeacher = (teacher: Teacher) => {
  setSelectedTeacher(teacher);
  setShowEditTeacherModal(true);
};

// 교사 수정 완료
const handleTeacherUpdated = (updatedTeacher: Teacher) => {
  console.log('교사 수정 완료:', updatedTeacher);
  loadTeachers();
  setShowEditTeacherModal(false);
  setSelectedTeacher(null);
};

// 강의실 편집 열기
const handleEditClassroom = (classroom: Classroom) => {
  setSelectedClassroom(classroom);
  setShowEditClassroomModal(true);
};

// 강의실 수정 완료
const handleClassroomUpdated = (updatedClassroom: Classroom) => {
  console.log('강의실 수정 완료:', updatedClassroom);
  loadClassrooms();
  setShowEditClassroomModal(false);
  setSelectedClassroom(null);
};
```

### 4.3 UI 변경 - 편집 버튼 추가

#### 학생 테이블 (라인 628-655)
```typescript
<td>
  <div className="action-buttons">
    <Button
      type="button"
      variant="secondary"
      onClick={() => handleEditStudent(student)}
      className="edit-btn"
    >
      편집
    </Button>
    <Button
      type="button"
      variant="danger"
      onClick={() => handleOpenDeleteModal(student.id, student.name, 'student')}
      className="delete-btn"
    >
      삭제
    </Button>
  </div>
</td>
```

#### 교사 카드 (라인 735-744)
```typescript
<div className="teacher-actions">
  <Button
    type="button"
    variant="secondary"
    onClick={() => handleEditTeacher(teacher)}
    className="edit-btn"
  >
    편집
  </Button>
  <Button
    type="button"
    variant="danger"
    onClick={() => handleOpenDeleteModal(teacher.id, teacher.name, 'teacher')}
    className="delete-btn"
  >
    삭제
  </Button>
</div>
```

#### 강의실 카드 (라인 798-807)
```typescript
<div className="classroom-actions">
  <Button
    type="button"
    variant="secondary"
    onClick={() => handleEditClassroom(classroom)}
    className="edit-btn"
  >
    편집
  </Button>
  <Button
    type="button"
    variant="danger"
    onClick={() => handleOpenDeleteModal(classroom.id, classroom.name, 'classroom')}
    className="delete-btn"
  >
    삭제
  </Button>
</div>
```

### 4.4 모달 렌더링 (라인 819-849 이후 추가)

```typescript
{/* 학생 편집 모달 */}
{showEditStudentModal && selectedStudent && (
  <EditStudentModal
    isOpen={showEditStudentModal}
    onClose={() => {
      setShowEditStudentModal(false);
      setSelectedStudent(null);
    }}
    onStudentUpdated={handleStudentUpdated}
    student={selectedStudent}
  />
)}

{/* 교사 편집 모달 */}
{showEditTeacherModal && selectedTeacher && (
  <EditTeacherModal
    isOpen={showEditTeacherModal}
    onClose={() => {
      setShowEditTeacherModal(false);
      setSelectedTeacher(null);
    }}
    onTeacherUpdated={handleTeacherUpdated}
    teacher={selectedTeacher}
  />
)}

{/* 강의실 편집 모달 */}
{showEditClassroomModal && selectedClassroom && (
  <EditClassroomModal
    isOpen={showEditClassroomModal}
    onClose={() => {
      setShowEditClassroomModal(false);
      setSelectedClassroom(null);
    }}
    onClassroomUpdated={handleClassroomUpdated}
    classroom={selectedClassroom}
  />
)}
```

---

## 🎨 CSS 스타일링

### 5.1 공통 버튼 스타일

```css
/* StudentsPage.css에 추가 */
.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.edit-btn {
  background-color: #1890ff;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.edit-btn:hover {
  background-color: #40a9ff;
}

.delete-btn {
  background-color: #ff4d4f;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
}

.delete-btn:hover {
  background-color: #ff7875;
}
```

### 5.2 모달 스타일

- **EditStudentModal.css**: 별도 생성 필요 (AddTeacherModal.css 참고)
- **EditTeacherModal.css**: AddTeacherModal.css 재사용 가능
- **EditClassroomModal.css**: AddClassroomModal.css 재사용 가능

---

## ✅ 구현 체크리스트

### 학생 편집 모달
- [ ] EditStudentModal.tsx 파일 생성
- [ ] EditStudentModal.css 파일 생성
- [ ] Props 인터페이스 정의
- [ ] Form 상태 관리
- [ ] 폼 초기화 (useEffect)
- [ ] 입력 핸들러 구현
- [ ] 제출 로직 구현
- [ ] 유효성 검사
- [ ] 에러 처리
- [ ] 로딩 상태 처리

### 교사 편집 모달
- [ ] EditTeacherModal.tsx 파일 생성
- [ ] Props 인터페이스 정의
- [ ] Form 상태 관리
- [ ] 폼 초기화 (useEffect)
- [ ] 과목 체크박스 핸들러
- [ ] 제출 로직 구현
- [ ] 유효성 검사
- [ ] 에러 처리
- [ ] 로딩 상태 처리

### 강의실 편집 모달
- [ ] EditClassroomModal.tsx 파일 생성
- [ ] Props 인터페이스 정의
- [ ] Form 상태 관리
- [ ] 폼 초기화 (useEffect)
- [ ] 숫자 입력 핸들러
- [ ] 제출 로직 구현
- [ ] 유효성 검사
- [ ] 에러 처리
- [ ] 로딩 상태 처리

### StudentsPage 수정
- [ ] 상태 변수 추가
- [ ] 편집 핸들러 추가
- [ ] 학생 테이블에 편집 버튼 추가
- [ ] 교사 카드에 편집 버튼 추가
- [ ] 강의실 카드에 편집 버튼 추가
- [ ] 모달 렌더링 코드 추가
- [ ] CSS 스타일 추가

---

## 🚀 구현 순서 (권장)

1. **1단계**: EditStudentModal 구현 (가장 단순)
   - AddTeacherModal.tsx 복사
   - Props 및 Form 데이터 수정
   - API 호출 변경
   - 테스트

2. **2단계**: EditTeacherModal 구현
   - AddTeacherModal.tsx 복사
   - 폼 초기화 로직 추가
   - API 호출 변경
   - 테스트

3. **3단계**: EditClassroomModal 구현
   - AddClassroomModal.tsx 복사
   - 폼 초기화 로직 추가
   - API 호출 변경
   - 테스트

4. **4단계**: StudentsPage 통합
   - 상태 및 핸들러 추가
   - 버튼 및 모달 렌더링 추가
   - 전체 통합 테스트

---

## 🧪 테스트 시나리오

### 학생 편집 테스트
1. 학생 목록에서 "편집" 버튼 클릭
2. 모달이 열리고 기존 데이터가 폼에 채워짐
3. 이름, 학년 등 수정
4. "수정" 버튼 클릭
5. 목록이 새로고침되고 변경사항 반영 확인

### 교사 편집 테스트
1. 교사 카드에서 "편집" 버튼 클릭
2. 모달이 열리고 기존 과목이 체크됨
3. 이름, 과목, 연락처 수정
4. "수정" 버튼 클릭
5. 목록이 새로고침되고 변경사항 반영 확인

### 강의실 편집 테스트
1. 강의실 카드에서 "편집" 버튼 클릭
2. 모달이 열리고 기존 데이터가 폼에 채워짐
3. 강의실명, 수용인원 등 수정
4. "수정" 버튼 클릭
5. 목록이 새로고침되고 변경사항 반영 확인

### 에러 처리 테스트
1. 필수 필드 비우고 제출 → 에러 메시지 표시
2. 유효하지 않은 데이터 입력 → 에러 메시지 표시
3. API 실패 시나리오 → 에러 메시지 표시

---

## 📝 참고 파일

### 기존 생성 모달
- `frontend/src/features/students/components/AddTeacherModal.tsx`
- `frontend/src/features/students/components/AddClassroomModal.tsx`

### API 서비스
- `frontend/src/services/api.ts:354-359` - updateStudent
- `frontend/src/services/api.ts:874-879` - updateTeacher
- `frontend/src/services/api.ts:984-989` - updateClassroom

### 백엔드 Controller
- `functions/src/controllers/StudentController.ts:62-81`
- `functions/src/controllers/TeacherController.ts:77-107`
- `functions/src/controllers/ClassroomController.ts:74-104`

### 타입 정의
- `shared/types/student.types.ts:60-72` - UpdateStudentRequest
- `shared/types/teacher.types.ts:26-32` - UpdateTeacherRequest
- `shared/types/classroom.types.ts:22-27` - UpdateClassroomRequest

---

## 💡 구현 팁

1. **코드 재사용**: AddXxxModal 컴포넌트를 복사하여 시작
2. **타입 안전성**: TypeScript 인터페이스를 정확히 정의
3. **에러 처리**: try-catch로 모든 API 호출 감싸기
4. **UX**: 로딩 중 버튼 비활성화, 에러 메시지 표시
5. **초기화**: 모달 닫을 때 상태 초기화
6. **데이터 동기화**: 수정 후 목록 새로고침

---

## 🎯 완료 기준

- ✅ 3개 편집 모달 모두 구현 완료
- ✅ StudentsPage에서 모든 편집 버튼 동작
- ✅ API 호출 성공 및 데이터 업데이트 확인
- ✅ 유효성 검사 및 에러 처리 정상 동작
- ✅ 사용자 경험 테스트 완료

---

**문서 작성일**: 2025-01-22
**작성자**: Claude Code Assistant
**버전**: 1.0
