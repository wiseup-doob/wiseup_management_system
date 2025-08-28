# 전체 다운로드 모달 구현 계획

## 📋 **개요**
기존 `TimeTableDownloadModal`의 구조를 참고하여, 여러 학생의 시간표를 일괄 다운로드할 수 있는 모달을 구현합니다.

## 🏗️ **구조 설계**

### **1. 컴포넌트 구조**
```
BulkTimetableDownloadModal
├── 모달 헤더
│   ├── 제목: "전체 시간표 다운로드"
│   └── 닫기 버튼
├── 다운로드 옵션 (Phase 1)
│   ├── 파일 형식 선택 (PNG/JPEG)
│   ├── 품질 설정 (표준/고품질/프리미엄)
│   ├── 배경색 설정
│   ├── 헤더 포함 여부
│   ├── 시간 열 포함 여부
│   └── 설정 완료 버튼
├── 학생 선택 및 미리보기 (Phase 2)
│   ├── 학생 목록 (체크박스)
│   ├── 전체 선택/해제
│   ├── 선택된 학생 수 표시
│   └── 미리보기 영역
└── 다운로드 진행 (Phase 3)
    ├── 진행률 표시
    ├── 현재 처리 중인 학생
    ├── 완료된 학생 수
    └── 다운로드 완료 메시지
```

### **2. 파일 구조**
```
frontend/src/components/business/timetable/
├── components/
│   ├── BulkTimetableDownloadModal.tsx
│   └── BulkTimetableDownloadModal.css
├── hooks/
│   └── useBulkTimetableDownload.ts
├── types/
│   └── bulk-download.types.ts
└── utils/
    └── bulkTimetableImageGenerator.ts
```

## 🔧 **구현 단계**

### **Phase 1: 타입 및 유틸리티 구현**
- [ ] `bulk-download.types.ts` 생성
- [ ] `bulkTimetableImageGenerator.ts` 생성
- [ ] 기본 다운로드 옵션 및 고품질 옵션 함수 구현

### **Phase 2: 훅 구현**
- [ ] `useBulkTimetableDownload.ts` 생성
- [ ] 학생 선택 상태 관리
- [ ] 일괄 다운로드 로직 구현
- [ ] 진행률 및 상태 관리

### **Phase 3: 모달 UI 구현**
- [ ] `BulkTimetableDownloadModal.tsx` 생성
- [ ] 단계별 UI 구현 (옵션 → 선택 → 진행)
- [ ] 학생 목록 및 체크박스 구현
- [ ] 미리보기 영역 구현

### **Phase 4: 통합 및 테스트**
- [ ] `SchedulePage`에 전체 다운로드 버튼 추가
- [ ] 모달 연결 및 테스트
- [ ] 오류 처리 및 사용자 피드백

## 📊 **데이터 구조**

### **BulkDownloadOptions**
```typescript
interface BulkDownloadOptions {
  format: 'png' | 'jpeg'
  quality: number
  scale: number
  backgroundColor: string
  includeHeader: boolean
  includeTimeColumn: boolean
  filename: string
  zipFilename: string // ZIP 파일명
}
```

### **BulkDownloadResult**
```typescript
interface BulkDownloadResult {
  success: boolean
  message: string
  totalStudents: number
  successCount: number
  failedCount: number
  errors: string[]
  zipFile?: Blob
}
```

### **StudentSelection**
```typescript
interface StudentSelection {
  id: string
  name: string
  grade: string
  status: string
  isSelected: boolean
  timetableData?: any
}
```

## 🎯 **핵심 기능**

### **1. 학생 선택**
- 체크박스로 개별 학생 선택
- 전체 선택/해제 기능
- 선택된 학생 수 실시간 표시

### **2. 일괄 다운로드**
- 선택된 학생들의 시간표를 순차적으로 처리
- 진행률 표시 및 취소 기능
- ZIP 파일로 압축하여 다운로드

### **3. 오류 처리**
- 개별 학생 처리 실패 시 건너뛰기
- 실패한 학생 목록 표시
- 재시도 기능

### **4. 사용자 경험**
- 단계별 진행 (옵션 → 선택 → 진행)
- 실시간 피드백
- 취소 및 뒤로가기 기능

## 🔄 **상태 관리**

### **useBulkTimetableDownload 훅**
```typescript
const {
  selectedStudents,
  downloadOptions,
  isGenerating,
  downloadProgress,
  currentStudent,
  completedCount,
  failedCount,
  selectStudent,
  selectAllStudents,
  updateDownloadOptions,
  startBulkDownload,
  cancelDownload
} = useBulkTimetableDownload()
```

### **상태 변수**
- `selectedStudents`: 선택된 학생 목록
- `downloadOptions`: 다운로드 옵션
- `isGenerating`: 다운로드 진행 중 여부
- `downloadProgress`: 전체 진행률 (0-100)
- `currentStudent`: 현재 처리 중인 학생
- `completedCount`: 완료된 학생 수
- `failedCount`: 실패한 학생 수

## 🎨 **UI/UX 설계**

### **1. 단계별 진행**
- **Phase 1**: 다운로드 옵션 설정
- **Phase 2**: 학생 선택 및 미리보기
- **Phase 3**: 다운로드 진행 및 완료

### **2. 반응형 디자인**
- 모바일 친화적 레이아웃
- 터치 친화적 인터페이스
- 적절한 여백과 크기

### **3. 접근성**
- 키보드 네비게이션 지원
- 스크린 리더 호환성
- 고대비 모드 지원

## 🚀 **성능 최적화**

### **1. 메모리 관리**
- 대용량 이미지 처리 시 메모리 누수 방지
- Blob 객체 적절한 해제
- 가비지 컬렉션 최적화

### **2. 비동기 처리**
- 학생별 순차 처리로 메모리 부하 분산
- 진행률 업데이트를 위한 적절한 딜레이
- 취소 요청 시 즉시 중단

### **3. 파일 크기 최적화**
- 이미지 품질 및 크기 조정
- ZIP 압축으로 전체 파일 크기 감소
- 적절한 해상도 설정

## 🧪 **테스트 계획**

### **1. 단위 테스트**
- 각 유틸리티 함수 테스트
- 훅 로직 테스트
- 컴포넌트 렌더링 테스트

### **2. 통합 테스트**
- 전체 다운로드 플로우 테스트
- 오류 상황 처리 테스트
- 사용자 인터랙션 테스트

### **3. 성능 테스트**
- 대량 학생 처리 시 성능 측정
- 메모리 사용량 모니터링
- 다운로드 속도 측정

## 📝 **구현 순서**

1. **타입 정의** → 기본 구조 확립
2. **유틸리티 함수** → 핵심 로직 구현
3. **훅 구현** → 상태 관리 로직
4. **UI 컴포넌트** → 사용자 인터페이스
5. **통합 및 테스트** → 전체 기능 검증

## 🔮 **향후 확장 가능성**

- **배치 스케줄링**: 특정 시간에 자동 다운로드
- **템플릿 시스템**: 다양한 시간표 형식 지원
- **클라우드 연동**: Google Drive, Dropbox 등 연동
- **알림 시스템**: 다운로드 완료 시 이메일/푸시 알림
- **통계 대시보드**: 다운로드 히스토리 및 통계
