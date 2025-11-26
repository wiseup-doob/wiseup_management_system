# Firestore 인덱스 설정 가이드

## 개요

시간표 버전 관리 시스템을 위한 Firestore 복합 인덱스 설정 가이드입니다.

## 필수 인덱스

### 1. student_timetables - studentId + versionId
**용도**: 특정 학생의 특정 버전 시간표 조회
```typescript
// 사용 예시
db.collection('student_timetables')
  .where('studentId', '==', studentId)
  .where('versionId', '==', versionId)
  .limit(1)
```

### 2. student_timetables - classSectionIds (array-contains) + versionId
**용도**: 특정 수업을 듣는 학생 목록 조회 (버전별)
```typescript
// 사용 예시
db.collection('student_timetables')
  .where('classSectionIds', 'array-contains', classSectionId)
  .where('versionId', '==', versionId)
```

### 3. timetable_versions - isActive + order
**용도**: 활성 버전 조회 시 정렬
```typescript
// 사용 예시
db.collection('timetable_versions')
  .where('isActive', '==', true)
  .orderBy('order', 'asc')
```

## 제거된 인덱스 (2025-11-21)

### ~~4. students - name + status~~ ❌ 제거됨
**제거 이유**: Firestore 쿼리 제약 위반
- Range Query (`name >= ... <= ...`) + Equality Query (`status ==`)의 조합은 Firestore에서 지원하지 않음
- 복합 인덱스로도 해결 불가능 (근본적인 Firestore 제약사항)
- **해결 방법**: `status` 필터링은 메모리에서 처리 ([StudentService.ts](functions/src/services/StudentService.ts) 참조)

```typescript
// ❌ 사용 불가 (500 에러 발생)
db.collection('students')
  .where('name', '>=', searchName)
  .where('name', '<=', searchName + '\uf8ff')
  .where('status', '==', 'active')  // Firestore 제약 위반!

// ✅ 올바른 방법 (메모리 필터링)
const results = await db.collection('students')
  .where('name', '>=', searchName)
  .where('name', '<=', searchName + '\uf8ff')
  .get();
const filtered = results.filter(doc => doc.data().status === 'active');
```

### ~~5. students - name + grade + status~~ ❌ 제거됨
**제거 이유**: 위와 동일 (Range Query + Equality Query on different field)
- `name`에 대한 Range Query와 `status`에 대한 Equality Query 조합 불가
- **해결 방법**: `status` 필터링은 메모리에서 처리

```typescript
// ❌ 사용 불가 (500 에러 발생)
db.collection('students')
  .where('name', '>=', searchName)
  .where('name', '<=', searchName + '\uf8ff')
  .where('grade', '==', '중1')
  .where('status', '==', 'active')  // Firestore 제약 위반!

// ✅ 올바른 방법 (grade는 Firestore에서, status는 메모리에서)
const results = await db.collection('students')
  .where('name', '>=', searchName)
  .where('name', '<=', searchName + '\uf8ff')
  .where('grade', '==', '중1')
  .get();
const filtered = results.filter(doc => doc.data().status === 'active');
```

**참조**: [STUDENT_STATUS_FILTERING_IMPLEMENTATION_PLAN.md Phase 7](STUDENT_STATUS_FILTERING_IMPLEMENTATION_PLAN.md)

## 배포 방법

### 로컬 개발 환경 (Emulator)
```bash
# Emulator에서는 자동으로 인덱스가 생성됨
npm run dev
```

### 프로덕션 환경
```bash
# 1. Firestore 인덱스만 배포
firebase deploy --only firestore:indexes

# 2. Firestore rules와 인덱스 함께 배포
firebase deploy --only firestore

# 3. 전체 배포
firebase deploy
```

## 인덱스 생성 확인

### Firebase Console에서 확인
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 프로젝트 선택
3. Firestore Database → 색인(Indexes) 탭
4. 생성된 인덱스 목록 확인

### 인덱스 상태
- ✅ **사용 가능**: 쿼리 실행 가능
- 🔄 **빌드 중**: 기존 데이터 인덱싱 진행 중 (수분~수시간 소요)
- ❌ **오류**: 인덱스 설정 확인 필요

## 인덱스 자동 생성

쿼리 실행 시 필요한 인덱스가 없으면 Firebase가 자동으로 에러 메시지에 인덱스 생성 링크를 제공합니다:

```
Error: 9 FAILED_PRECONDITION: The query requires an index.
You can create it here: https://console.firebase.google.com/...
```

링크를 클릭하면 자동으로 인덱스가 생성됩니다.

## 주의사항

### 인덱스 빌드 시간
- 기존 데이터가 많을 경우 인덱스 빌드에 시간이 걸립니다
- 빌드 중에도 앱은 정상 작동하지만 해당 쿼리는 실패합니다
- 사용자가 적은 시간대에 배포하는 것을 권장합니다

### 비용 고려
- 인덱스는 추가 저장 공간을 사용합니다
- 인덱스 수가 많을수록 쓰기 작업 비용이 증가합니다
- 필요한 인덱스만 생성하세요

### 복합 인덱스 vs 단일 필드 인덱스
- 단일 필드 인덱스는 자동 생성됩니다
- 2개 이상의 필드를 사용하는 쿼리에는 복합 인덱스가 필요합니다
- `array-contains` + 다른 필터 조합은 항상 복합 인덱스가 필요합니다

## 트러블슈팅

### 인덱스 관련 오류 발생 시
1. Firebase Console에서 인덱스 상태 확인
2. 인덱스가 "빌드 중"이면 완료될 때까지 대기
3. 인덱스가 없으면 에러 메시지의 링크로 생성
4. `firestore.indexes.json` 업데이트 후 재배포

### 인덱스 삭제가 필요한 경우
```bash
# Firebase Console에서 수동 삭제 또는
firebase firestore:indexes:delete <index-id>
```

## 참고 자료

- [Firestore 인덱스 문서](https://firebase.google.com/docs/firestore/query-data/indexing)
- [복합 인덱스 관리](https://firebase.google.com/docs/firestore/query-data/index-overview)
- [인덱스 제한사항](https://firebase.google.com/docs/firestore/quotas#indexes)
