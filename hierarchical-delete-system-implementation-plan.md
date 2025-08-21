# 학생 최상위 엔티티 기반 계층적 삭제 시스템 구현 계획서

## 📋 프로젝트 개요

### 목표
- 학생을 최상위 엔티티로 하는 계층적 삭제 시스템 구현
- 데이터 무결성 보장 및 고아 데이터 방지
- 사용자에게 안전하고 명확한 삭제 경험 제공

### 범위
- 학생 삭제 시 관련 데이터 자동 정리
- 교사/강의실 삭제 시 관련 데이터 검증
- 삭제 전 의존성 확인 및 사용자 알림

## 🏗️ 시스템 아키텍처

### 데이터 계층 구조 (실제 Firestore 구조)
```
students (최상위)
├── student_timetables (학생 개인 시간표) - 1:1 관계
├── attendance_records (출석 기록) - 1:N 관계
├── seat_assignments (좌석 배정) - 1:N 관계
├── student_summaries (학생 요약 정보) - 1:1 관계
└── class_sections (수업 등록) - student_timetables.classSectionIds를 통해 간접 참조
```

### 삭제 순서 (실제 의존성 기반)
1. **출석 기록 삭제** (attendance_records) - studentId 참조
2. **좌석 배정 삭제** (seat_assignments) - studentId 참조
3. **학생 요약 정보 삭제** (student_summaries) - studentId 참조
4. **학생 개인 시간표 삭제** (student_timetables) - studentId 참조
5. **학생 삭제** (students) - 최상위 엔티티

**참고**: class_sections는 student_timetables.classSectionIds 배열에서만 참조되므로, 학생 삭제 시 자동으로 정리됨

## 📝 구현 단계

### Phase 1: 백엔드 API 구현 (1주)

#### 1.1 의존성 확인 API
```typescript
// GET /api/students/:id/dependencies
interface StudentDependencies {
  hasAttendanceRecords: boolean;
  attendanceCount: number;
  hasTimetable: boolean;
  hasClassEnrollments: boolean;
  classEnrollmentCount: number;
  hasSeatAssignments: boolean;
  seatAssignmentCount: number;
  hasStudentSummary: boolean;
  totalRelatedRecords: number;
}
```

#### 1.2 계층적 삭제 API
```typescript
// DELETE /api/students/:id/hierarchical
interface HierarchicalDeleteResponse {
  success: boolean;
  deletedRecords: {
    attendanceRecords: number;
    seatAssignments: number;
    studentSummary: boolean;
    timetable: boolean;
    student: boolean;
  };
  message: string;
}
```

#### 1.3 백엔드 서비스 구현
- `StudentService.deleteStudentHierarchically()`
- `StudentService.getStudentDependencies()`
- `AttendanceService.deleteByStudentId()`
- `SeatAssignmentService.deleteByStudentId()`
- `StudentTimetableService.deleteByStudentId()`
- 트랜잭션 처리 및 롤백 로직

### Phase 2: 프론트엔드 UI 개선 (1주)

#### 2.1 삭제 확인 모달 개선
- 관련 데이터 미리보기
- 삭제 영향 범위 표시
- 최종 확인 체크박스

#### 2.2 진행 상황 표시
- 단계별 진행 바
- 현재 처리 중인 데이터 표시
- 실시간 상태 업데이트

#### 2.3 결과 요약 표시
- 삭제된 데이터 종류별 개수
- 성공/실패 상태 표시
- 복구 불가 경고 메시지

### Phase 3: 교사/강의실 삭제 검증 (실제 의존성 기반, 3일)

#### 3.1 교사 삭제 검증
- `class_sections.teacherId` 참조 확인
- 담당 수업이 있는 경우 삭제 차단
- 삭제 불가 시 상세 안내

#### 3.2 강의실 삭제 검증
- `class_sections.classroomId` 참조 확인
- 배정된 수업이 있는 경우 삭제 차단
- 삭제 불가 시 상세 안내

### Phase 4: 감사 및 로깅 시스템 (2일)

#### 4.1 삭제 이력 추적
- 삭제 작업 로그
- 사용자 및 시간 기록
- 삭제된 데이터 요약

#### 4.2 백업 시스템
- 삭제 전 데이터 백업
- 복구 요청 시 데이터 제공
- 백업 데이터 정리 정책

## 🔧 기술적 구현 세부사항 (실제 코드 기반)

### 백엔드 구현

#### 의존성 확인 로직
```typescript
async getStudentDependencies(studentId: string): Promise<StudentDependencies> {
  const [
    attendanceCount,
    seatAssignmentCount,
    hasStudentSummary,
    hasTimetable,
    classEnrollmentCount
  ] = await Promise.all([
    this.attendanceService.countByStudentId(studentId),
    this.seatAssignmentService.countByStudentId(studentId),
    this.studentSummaryService.existsByStudentId(studentId),
    this.studentTimetableService.existsByStudentId(studentId),
    this.studentTimetableService.getClassEnrollmentCount(studentId)
  ]);

  return {
    hasAttendanceRecords: attendanceCount > 0,
    attendanceCount,
    hasTimetable: hasTimetable,
    hasClassEnrollments: classEnrollmentCount > 0,
    classEnrollmentCount,
    hasSeatAssignments: seatAssignmentCount > 0,
    seatAssignmentCount,
    hasStudentSummary: hasStudentSummary,
    totalRelatedRecords: attendanceCount + seatAssignmentCount + (hasStudentSummary ? 1 : 0) + (hasTimetable ? 1 : 0)
  };
}
```

#### 계층적 삭제 로직
```typescript
async deleteStudentHierarchically(studentId: string): Promise<HierarchicalDeleteResponse> {
  const transaction = await this.db.beginTransaction();
  
  try {
    // 1단계: 출석 기록 삭제
    const attendanceDeleted = await this.attendanceService.deleteByStudentId(studentId, transaction);
    
    // 2단계: 좌석 배정 삭제
    const seatAssignmentDeleted = await this.seatAssignmentService.deleteByStudentId(studentId, transaction);
    
    // 3단계: 학생 요약 정보 삭제
    const studentSummaryDeleted = await this.studentSummaryService.deleteByStudentId(studentId, transaction);
    
    // 4단계: 학생 개인 시간표 삭제
    const timetableDeleted = await this.studentTimetableService.deleteByStudentId(studentId, transaction);
    
    // 5단계: 학생 삭제
    const studentDeleted = await this.studentService.delete(studentId, transaction);
    
    await transaction.commit();
    
    return {
      success: true,
      deletedRecords: {
        attendanceRecords: attendanceDeleted,
        seatAssignments: seatAssignmentDeleted,
        studentSummary: studentSummaryDeleted,
        timetable: timetableDeleted,
        student: studentDeleted
      },
      message: '학생과 관련 데이터가 모두 삭제되었습니다.'
    };
    
  } catch (error) {
    await transaction.rollback();
    throw new Error(`계층적 삭제 실패: ${error.message}`);
  }
}
```

### 프론트엔드 구현

#### 삭제 확인 모달 컴포넌트
```typescript
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  student: Student;
  dependencies: StudentDependencies;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  student,
  dependencies,
  onConfirm,
  onCancel
}) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <ModalHeader>학생 삭제 확인</ModalHeader>
      <ModalBody>
        <div className="delete-warning">
          <h4>⚠️ 주의: 이 작업은 되돌릴 수 없습니다!</h4>
          <p><strong>{student.name}</strong> 학생을 삭제하면 다음 데이터도 함께 삭제됩니다:</p>
          
          <div className="dependencies-list">
            {dependencies.hasAttendanceRecords && (
              <div className="dependency-item">
                📊 출석 기록: {dependencies.attendanceCount}개
              </div>
            )}
            {dependencies.hasTimetable && (
              <div className="dependency-item">
                📅 시간표: 1개
              </div>
            )}
            {dependencies.hasClassEnrollments && (
              <div className="dependency-item">
                📚 수업 등록: {dependencies.classEnrollmentCount}개
              </div>
            )}
            {dependencies.hasSeatAssignments && (
              <div className="dependency-item">
                🪑 좌석 배정: {dependencies.seatAssignmentCount}개
              </div>
            )}
            {dependencies.hasStudentSummary && (
              <div className="dependency-item">
                📊 학생 요약 정보: 1개
              </div>
            )}
          </div>
          
          <div className="total-impact">
            <strong>총 {dependencies.totalRelatedRecords + 1}개의 데이터가 삭제됩니다.</strong>
          </div>
        </div>
        
        <div className="confirmation-checkbox">
          <label>
            <input
              type="checkbox"
              checked={isConfirmed}
              onChange={(e) => setIsConfirmed(e.target.checked)}
            />
            위 내용을 모두 이해했으며, 데이터 삭제에 동의합니다.
          </label>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onCancel}>
          취소
        </Button>
        <Button 
          variant="danger" 
          onClick={onConfirm}
          disabled={!isConfirmed}
        >
          삭제 확인
        </Button>
      </ModalFooter>
    </Modal>
  );
};
```

#### 진행 상황 표시 컴포넌트
```typescript
interface DeleteProgressModalProps {
  isOpen: boolean;
  currentStep: string;
  progress: number;
  totalSteps: number;
}

const DeleteProgressModal: React.FC<DeleteProgressModalProps> = ({
  isOpen,
  currentStep,
  progress,
  totalSteps
}) => {
  return (
    <Modal isOpen={isOpen} onClose={() => {}}>
      <ModalHeader>삭제 진행 중...</ModalHeader>
      <ModalBody>
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(progress / totalSteps) * 100}%` }}
            />
          </div>
          <div className="progress-text">
            {currentStep} ({progress}/{totalSteps})
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};
```

## 🎯 구현 우선순위

### 높음 (즉시 구현)
1. 학생 의존성 확인 API
2. 계층적 삭제 API
3. 기본 삭제 확인 모달

### 중간 (1주 내)
1. 진행 상황 표시 UI
2. 결과 요약 표시
3. 에러 처리 및 롤백

### 낮음 (2주 내)
1. 교사/강의실 삭제 검증
2. 감사 및 로깅 시스템
3. 백업 시스템

## 🧪 테스트 계획

### 단위 테스트
- 각 삭제 단계별 로직 테스트
- 트랜잭션 롤백 테스트
- 의존성 확인 로직 테스트

### 통합 테스트
- 전체 삭제 플로우 테스트
- 에러 상황 처리 테스트
- 데이터 무결성 검증 테스트

### 사용자 테스트
- 삭제 확인 UI 사용성 테스트
- 진행 상황 표시 명확성 테스트
- 에러 메시지 이해도 테스트

## 📊 성능 고려사항 (Firestore 최적화)

### 데이터베이스 최적화
- Firestore 인덱스 설정: `studentId` 기반 복합 인덱스
- 배치 삭제로 대량 데이터 처리 (WriteBatch 사용)
- 트랜잭션 타임아웃 설정 (Firestore 제한: 10초)
- 컬렉션별 병렬 처리로 성능 향상

### 사용자 경험
- 비동기 처리로 UI 블로킹 방지
- 진행 상황 실시간 업데이트
- 적절한 로딩 상태 표시

## 🔒 보안 고려사항 (Firestore 보안 규칙)

### 권한 관리
- Firestore 보안 규칙으로 학생 삭제 권한 확인
- 관리자 승인 필요 시나리오
- 감사 로그 접근 권한
- 트랜잭션 기반 원자적 삭제로 데이터 무결성 보장

### 데이터 보호
- 민감한 정보 삭제 시 추가 확인
- 삭제 작업 로그 보관
- 백업 데이터 접근 제한

## 📈 모니터링 및 알림

### 성능 모니터링
- 삭제 작업 소요 시간 추적
- 데이터베이스 성능 지표 모니터링
- 에러율 및 성공률 추적

### 알림 시스템
- 삭제 작업 실패 시 관리자 알림
- 대량 삭제 작업 시 알림
- 시스템 리소스 부족 시 알림

## 🚀 배포 계획

### 단계별 배포
1. **1주차**: 백엔드 API 배포 및 테스트
2. **2주차**: 프론트엔드 UI 배포 및 테스트
3. **3주차**: 전체 시스템 통합 테스트 및 안정화
4. **4주차**: 프로덕션 배포 및 모니터링

### 롤백 계획
- 기존 삭제 로직으로 즉시 복구 가능
- 데이터베이스 스키마 변경 없음
- 점진적 기능 활성화

## 📋 체크리스트

### 백엔드
- [ ] 의존성 확인 API 구현
- [ ] 계층적 삭제 API 구현
- [ ] 트랜잭션 처리 및 롤백
- [ ] 에러 처리 및 로깅
- [ ] 단위 테스트 작성

### 프론트엔드
- [ ] 삭제 확인 모달 개선
- [ ] 진행 상황 표시 UI
- [ ] 결과 요약 표시
- [ ] 에러 처리 UI
- [ ] 사용자 테스트

### 통합
- [ ] 전체 플로우 테스트
- [ ] 성능 테스트
- [ ] 보안 테스트
- [ ] 사용자 가이드 작성
- [ ] 프로덕션 배포

## 📞 지원 및 문의

### 개발팀 연락처
- 백엔드 개발: [담당자명]
- 프론트엔드 개발: [담당자명]
- QA 테스트: [담당자명]

### 문서 및 리소스
- API 문서: [링크]
- UI 가이드: [링크]
- 테스트 시나리오: [링크]

---

**문서 버전**: 1.0  
**작성일**: 2024년 12월  
**작성자**: AI Assistant  
**검토자**: [검토자명]  
**승인자**: [승인자명]
