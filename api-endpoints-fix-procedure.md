# API_ENDPOINTS 상수 수정 절차

## 🎯 **목표**
현재 `frontend/src/services/api.ts`에서 발생하는 linter 에러들을 해결하기 위해 API_ENDPOINTS 상수와 타입 정의를 수정합니다.

## 📋 **현재 문제 상황**

### **Linter 에러 요약**
- **ATTENDANCE 관련**: 8개 에러
- **STUDENTS 관련**: 1개 에러  
- **SEATS 관련**: 1개 에러
- **총 에러 수**: 10개

### **주요 문제들**
1. **API_ENDPOINTS 속성 누락**: `api.ts`에서 사용하려는 속성들이 상수 파일에 정의되지 않음
2. **타입 정의 불일치**: `AttendanceSearchParams` 등에 누락된 속성들
3. **엔드포인트 URL 미정의**: 새로운 속성들의 실제 API 경로 필요

---

## 🔧 **수정 절차 (Phase별 상세 계획)**

### **Phase 1: 문제 분석 및 현황 파악 (15분)**

#### **1.1 현재 상황 정확 파악**
```bash
# 1. 공유 패키지의 API_ENDPOINTS 상수 파일 확인
cat shared/constants/api.constants.ts

# 2. 공유 패키지의 타입 정의 파일 확인
cat shared/types/attendance.types.ts
cat shared/types/student.types.ts
cat shared/types/seat.types.ts

# 3. 현재 linter 에러 정확한 목록 작성
# - ATTENDANCE 관련: 8개 에러
# - STUDENTS 관련: 1개 에러  
# - SEATS 관련: 1개 에러
```

#### **1.2 에러 패턴 분석**
- **API_ENDPOINTS 속성 누락**: 10개
- **타입 정의 불일치**: AttendanceSearchParams 속성 누락
- **엔드포인트 URL 미정의**: 새로운 속성들의 실제 URL 경로 필요

---

### **Phase 2: 백엔드 API 엔드포인트 확인 (10분)**

#### **2.1 백엔드 라우트 파일 확인**
```bash
# Firebase Functions의 라우트 파일들 확인
cat functions/src/routes/attendance.ts
cat functions/src/routes/student.ts
cat functions/src/routes/seat.ts
```

#### **2.2 실제 구현된 API 경로 파악**
- 출석 관리: `/api/attendance/*` 경로들
- 학생 관리: `/api/students/*` 경로들  
- 좌석 관리: `/api/seats/*` 경로들

---

### **Phase 3: API_ENDPOINTS 상수 수정 (20분)**

#### **3.1 ATTENDANCE 섹션 수정**
```typescript
// shared/constants/api.constants.ts
ATTENDANCE: {
  // 기존 속성들 유지
  GET_ALL: '/api/attendance/all',
  GET_BY_ID: (id: string) => `/api/attendance/${id}`,
  CREATE: '/api/attendance/create',
  UPDATE: (id: string) => `/api/attendance/${id}`,
  DELETE: (id: string) => `/api/attendance/${id}`,
  SEARCH: '/api/attendance/search',
  GET_BY_STUDENT: (studentId: string) => `/api/attendance/student/${studentId}`,
  GET_BY_DATE: (date: string) => `/api/attendance/date/${date}`,
  
  // 누락된 속성들 추가
  GET_RECORDS: '/api/attendance/records',
  GET_RECORD_BY_ID: (id: string) => `/api/attendance/record/${id}`,
  CREATE_RECORD: '/api/attendance/record/create',
  UPDATE_RECORD: (id: string) => `/api/attendance/record/${id}`,
  DELETE_RECORD: (id: string) => `/api/attendance/record/${id}`,
  GET_STATS: '/api/attendance/stats',
  BULK_UPDATE: '/api/attendance/bulk-update',
}
```

#### **3.2 STUDENTS 섹션 수정**
```typescript
STUDENTS: {
  // 기존 속성들 유지
  GET_ALL: '/api/students/all',
  GET_BY_ID: (id: string) => `/api/students/${id}`,
  CREATE: '/api/students/create',
  UPDATE: (id: string) => `/api/students/${id}`,
  DELETE: (id: string) => `/api/students/${id}`,
  SEARCH: '/api/students/search',
  COUNT_BY_GRADE: '/api/students/count-by-grade',
  COUNT_ACTIVE: '/api/students/count-active',
  
  // 누락된 속성 추가
  UPDATE_ATTENDANCE: (studentId: string) => `/api/students/${studentId}/attendance`,
}
```

#### **3.3 SEATS 섹션 수정**
```typescript
SEATS: {
  // 기존 속성들 유지
  GET_ALL: '/api/seats/all',
  GET_BY_ID: (id: string) => `/api/seats/${id}`,
  CREATE: '/api/seats/create',
  UPDATE: (id: string) => `/api/seats/${id}`,
  DELETE: (id: string) => `/api/seats/${id}`,
  GET_ACTIVE: '/api/seats/active',
  GET_AVAILABLE: '/api/seats/available',
  GET_BY_NUMBER: '/api/seats/by-number',
  GET_BY_STATUS: (status: string) => `/api/seats/status/${status}`,
  
  // 누락된 속성 추가
  GET_BY_STUDENT: (studentId: string) => `/api/seats/student/${studentId}`,
}
```

---

### **Phase 4: 타입 정의 수정 (15분)**

#### **4.1 AttendanceSearchParams 타입 수정**
```typescript
// shared/types/attendance.types.ts
export interface AttendanceSearchParams {
  // 기존 속성들
  studentId?: string;
  date?: DateString;
  status?: AttendanceStatus;
  
  // 누락된 속성들 추가
  studentName?: string;
  seatId?: string;
  startDate?: DateString;
  endDate?: DateString;
  checkInTimeRange?: {
    start: TimeString;
    end: TimeString;
  };
  totalHoursRange?: {
    min: number;
    max: number;
  };
}
```

---

### **Phase 5: 수정 사항 검증 (10분)**

#### **5.1 TypeScript 컴파일 확인**
```bash
# 공유 패키지 빌드
cd shared
npm run build

# 프론트엔드 타입 체크
cd ../frontend
npm run type-check
```

#### **5.2 Linter 에러 확인**
```bash
# ESLint 실행
npm run lint

# TypeScript 에러 확인
npx tsc --noEmit
```

---

### **Phase 6: 테스트 및 검증 (15분)**

#### **6.1 단위 테스트**
```typescript
// 간단한 테스트 코드 작성
const testEndpoints = () => {
  console.log('ATTENDANCE.GET_RECORDS:', API_ENDPOINTS.ATTENDANCE.GET_RECORDS);
  console.log('STUDENTS.UPDATE_ATTENDANCE:', API_ENDPOINTS.STUDENTS.UPDATE_ATTENDANCE('123'));
  console.log('SEATS.GET_BY_STUDENT:', API_ENDPOINTS.SEATS.GET_BY_STUDENT('456'));
};
```

#### **6.2 실제 API 호출 테스트**
```typescript
// 브라우저 콘솔에서 테스트
apiService.getAttendanceRecords().then(console.log);
apiService.getSeatByStudent('123').then(console.log);
```

---

### **Phase 7: 문서 업데이트 (10분)**

#### **7.1 수정 내용 정리**
- 수정된 API_ENDPOINTS 상수 목록
- 추가된 타입 정의
- 해결된 linter 에러 목록

#### **7.2 변경 사항 기록**
```markdown
## API_ENDPOINTS 상수 수정 완료

### 추가된 속성들
- ATTENDANCE: GET_RECORDS, GET_RECORD_BY_ID, CREATE_RECORD, UPDATE_RECORD, DELETE_RECORD, GET_STATS, BULK_UPDATE
- STUDENTS: UPDATE_ATTENDANCE  
- SEATS: GET_BY_STUDENT

### 수정된 타입들
- AttendanceSearchParams에 누락된 속성들 추가
```

---

### **Phase 8: 최종 검증 및 정리 (10분)**

#### **8.1 전체 시스템 동작 확인**
- 모든 linter 에러 해결 확인
- TypeScript 컴파일 성공 확인
- API 호출 정상 작동 확인

#### **8.2 코드 품질 확인**
- 일관된 네이밍 컨벤션
- 적절한 URL 경로 구조
- 타입 안전성 보장

---

## ⏱️ **예상 소요 시간**

**총 예상 시간**: 1시간 45분

| Phase | 작업 내용 | 예상 시간 |
|-------|-----------|-----------|
| 1 | 문제 분석 및 현황 파악 | 15분 |
| 2 | 백엔드 API 엔드포인트 확인 | 10분 |
| 3 | API_ENDPOINTS 상수 수정 | 20분 |
| 4 | 타입 정의 수정 | 15분 |
| 5 | 수정 사항 검증 | 10분 |
| 6 | 테스트 및 검증 | 15분 |
| 7 | 문서 업데이트 | 10분 |
| 8 | 최종 검증 및 정리 | 10분 |

---

## 🎯 **핵심 원칙**

### **1. 기존 코드 보존**
- 이미 작동하는 부분은 건드리지 않음
- 기존 API 호출에 영향 없도록 수정

### **2. 점진적 수정**
- 한 번에 하나씩 수정하고 검증
- 각 Phase 완료 후 즉시 테스트

### **3. 타입 안전성**
- 모든 수정이 TypeScript 타입 체크를 통과하도록
- 타입 정의와 실제 사용이 일치하도록

### **4. 일관성 유지**
- 기존 네이밍 패턴과 URL 구조와 일치
- 백엔드 API 경로와 일치하는 URL 사용

### **5. 테스트 우선**
- 수정 후 즉시 검증하여 추가 문제 방지
- 실제 API 호출 테스트로 동작 확인

---

## 🚨 **주의사항**

### **수정 전 확인사항**
1. **백업**: 수정 전 현재 파일들 백업
2. **의존성**: 다른 모듈에서 사용하는 속성들 파악
3. **URL 경로**: 백엔드에서 실제 구현된 경로와 일치하는지 확인

### **수정 중 주의사항**
1. **기존 속성 유지**: 이미 사용 중인 속성들은 그대로 유지
2. **네이밍 일관성**: 기존 패턴과 일치하는 속성명 사용
3. **URL 구조**: RESTful API 설계 원칙에 맞는 경로 구조

### **수정 후 확인사항**
1. **컴파일 성공**: TypeScript 컴파일 에러 없는지 확인
2. **Linter 통과**: ESLint 에러 없는지 확인
3. **API 동작**: 실제 API 호출이 정상 작동하는지 확인

---

## 📝 **체크리스트**

### **Phase 1: 문제 분석**
- [ ] 현재 linter 에러 목록 작성
- [ ] 에러 패턴 분석 완료
- [ ] 영향받는 파일들 파악

### **Phase 2: 백엔드 확인**
- [ ] 백엔드 라우트 파일들 확인
- [ ] 실제 API 경로 파악
- [ ] URL 구조 이해

### **Phase 3: 상수 수정**
- [ ] ATTENDANCE 섹션 수정 완료
- [ ] STUDENTS 섹션 수정 완료
- [ ] SEATS 섹션 수정 완료

### **Phase 4: 타입 수정**
- [ ] AttendanceSearchParams 타입 수정 완료
- [ ] 기타 필요한 타입 정의 추가

### **Phase 5: 검증**
- [ ] TypeScript 컴파일 성공
- [ ] Linter 에러 해결 확인

### **Phase 6: 테스트**
- [ ] 단위 테스트 통과
- [ ] 실제 API 호출 테스트 성공

### **Phase 7: 문서**
- [ ] 수정 내용 정리 완료
- [ ] 변경 사항 기록 완료

### **Phase 8: 최종 검증**
- [ ] 전체 시스템 동작 확인
- [ ] 코드 품질 확인 완료

---

## 🎉 **완료 후 기대 효과**

### **즉시 해결되는 문제들**
- ✅ 모든 linter 에러 해결
- ✅ TypeScript 컴파일 성공
- ✅ API 호출 정상 작동

### **향상되는 품질**
- 🚀 타입 안전성 향상
- 🚀 코드 가독성 개선
- 🚀 유지보수성 향상

### **개발자 경험 개선**
- 💡 더 나은 IDE 자동완성
- 💡 컴파일 타임 에러 감지
- 💡 리팩토링 안전성 향상

---

## 📚 **참고 자료**

### **관련 파일들**
- `shared/constants/api.constants.ts` - API 엔드포인트 상수
- `shared/types/attendance.types.ts` - 출석 관련 타입 정의
- `shared/types/student.types.ts` - 학생 관련 타입 정의
- `shared/types/seat.types.ts` - 좌석 관련 타입 정의
- `frontend/src/services/api.ts` - API 서비스 클래스

### **관련 문서들**
- `class-system-implementation-plan.md` - Class 시스템 구현 계획
- 백엔드 API 문서 (Firebase Functions)
- TypeScript 타입 시스템 가이드

---

*이 문서는 API_ENDPOINTS 상수 수정 작업의 완벽한 가이드라인을 제공합니다. 각 Phase를 순서대로 진행하여 모든 linter 에러를 안전하게 해결할 수 있습니다.*
