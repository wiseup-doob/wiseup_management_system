# 📅 Timetable 전용 다운로드 모달 구현 계획

## 🎯 **프로젝트 개요**
기존 TimetableWidget을 건드리지 않고, 전용 다운로드 모달 창을 통해 시간표를 이미지 파일(PNG/JPEG)로 다운로드할 수 있는 기능을 구현합니다.

## 🏗️ **구현 구조**

### **1. 새로운 컴포넌트 추가**
```
@timetable/
├── components/
│   ├── TimetableDownloadModal.tsx       # 전용 다운로드 모달
│   └── TimetableDownloadModal.css       # 모달 스타일
├── hooks/
│   └── useTimetableDownload.ts          # 다운로드 로직 훅
├── utils/
│   └── timetableImageGenerator.ts       # 이미지 생성 유틸리티
└── types/
    └── download.types.ts                # 다운로드 관련 타입 정의
```

### **2. 기존 파일 수정 없음**
- **TimetableWidget.tsx**: 전혀 수정하지 않음
- **TimetableWidget.css**: 전혀 수정하지 않음
- **기존 컴포넌트들**: 모두 그대로 유지

## 📦 **필요한 라이브러리**

### **핵심 라이브러리**
```bash
npm install html2canvas
npm install --save-dev @types/html2canvas
```

### **추가 유틸리티 (선택사항)**
```bash
npm install file-saver          # 파일 다운로드 처리
npm install --save-dev @types/file-saver
```

## 🔧 **구현 단계**

### **Phase 1: 기본 구조 및 타입 정의**
1. **타입 정의** (`download.types.ts`)
   ```typescript
   export interface DownloadOptions {
     format: 'png' | 'jpeg';
     quality: number;           // 0.1 ~ 1.0
     scale: number;             // 1, 2, 3 (해상도 배율)
     filename: string;          // 파일명
     includeHeader: boolean;    // 헤더 포함 여부
     includeTimeColumn: boolean; // 시간 열 포함 여부
   }
   
   export interface DownloadResult {
     success: boolean;
     message: string;
     filename?: string;
     error?: string;
     fileSize?: number;
   }
   
   export interface TimetableDownloadModalProps {
     isOpen: boolean;
     onClose: () => void;
     timetableData: any;
     studentInfo?: {
       name: string;
       grade?: string;
       status?: string;
     };
   }
   ```

2. **이미지 생성 유틸리티** (`timetableImageGenerator.ts`)
   - `generateTimetableImage()`: HTML2Canvas를 사용한 이미지 생성
   - `downloadImage()`: 이미지 다운로드 처리
   - `generateFilename()`: 자동 파일명 생성

### **Phase 2: 다운로드 훅 구현**
1. **`useTimetableDownload.ts`**
   ```typescript
   const useTimetableDownload = () => {
     const [isGenerating, setIsGenerating] = useState(false);
     const [downloadProgress, setDownloadProgress] = useState(0);
     const [downloadOptions, setDownloadOptions] = useState<DownloadOptions>();
     
     const downloadTimetable = useCallback(async (element: HTMLElement) => {
       // 이미지 생성 및 다운로드 로직
     }, [downloadOptions]);
     
     return { downloadTimetable, isGenerating, downloadProgress, downloadOptions };
   };
   ```

### **Phase 3: 모달 컴포넌트 구현**
1. **`TimetableDownloadModal.tsx`**
   - 전용 다운로드 모달
   - 좌측: 옵션 설정 패널
   - 우측: 시간표 미리보기 + 다운로드 실행
   - 학생 정보 표시

### **Phase 4: 테스트 및 검증**
1. **독립적인 테스트 페이지에서 모달 동작 확인**
2. **이미지 생성 및 다운로드 기능 테스트**
3. **다양한 시간표 데이터에서 동작 확인**

## 🎨 **UI/UX 디자인**

### **다운로드 모달 디자인**
- **크기**: 1200px × 800px (반응형)
- **레이아웃**: 좌우 분할 (옵션 패널 + 미리보기)
- **옵션 패널**: 이미지 형식, 품질, 해상도, 파일명 설정
- **미리보기**: 실제 시간표 렌더링 + 다운로드 버튼

### **상태 표시**
- **로딩**: 스피너 + "이미지 생성 중..." 메시지
- **성공**: 체크 아이콘 + "다운로드 완료" 메시지
- **실패**: 경고 아이콘 + 오류 메시지

## ⚡ **성능 최적화**

### **이미지 생성 최적화**
- **지연 로딩**: 사용자가 요청할 때만 HTML2Canvas 로드
- **메모리 관리**: 큰 이미지 생성 후 메모리 정리
- **비동기 처리**: 이미지 생성 중 UI 블로킹 방지

### **사용자 경험 개선**
- **프로그레스 바**: 이미지 생성 진행률 표시
- **취소 기능**: 생성 중 사용자 취소 가능
- **미리보기**: 다운로드 전 결과물 확인

## 🔍 **품질 및 호환성**

### **이미지 품질**
- **PNG**: 투명도 지원, 무손실 압축
- **JPEG**: 파일 크기 최적화, 손실 압축
- **해상도**: 1x (기본), 2x (고품질), 3x (프리미엄)

### **브라우저 호환성**
- **Chrome**: 완전 지원
- **Firefox**: 완전 지원
- **Safari**: 완전 지원
- **Edge**: 완전 지원

## 🚀 **사용 방법**

### **1. 기본 사용법**
```tsx
import { TimetableDownloadModal } from '@timetable'

function MyComponent() {
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false)
  
  return (
    <>
      <Button onClick={() => setIsDownloadModalOpen(true)}>
        시간표 다운로드
      </Button>
      
      <TimetableDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        timetableData={timetableData}
        studentInfo={{ name: '학생명', grade: '학년' }}
      />
    </>
  )
}
```

### **2. 테스트 페이지에서 사용**
```tsx
// TestDownloadPage.tsx (임시 테스트용)
function TestDownloadPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const mockTimetableData = { /* 테스트용 데이터 */ }
  
  return (
    <div>
      <h1>다운로드 모달 테스트</h1>
      <Button onClick={() => setIsModalOpen(true)}>
        다운로드 모달 열기
      </Button>
      
      <TimetableDownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        timetableData={mockTimetableData}
        studentInfo={{ name: '테스트 학생', grade: '1학년' }}
      />
    </div>
  )
}
```

## 📋 **구현 우선순위**

### **High Priority (필수)**
- [ ] 기본 타입 정의 및 유틸리티
- [ ] 전용 다운로드 모달 구현
- [ ] 기본 이미지 다운로드 기능
- [ ] 독립적인 테스트 및 검증

### **Medium Priority (권장)**
- [ ] 다운로드 옵션 패널
- [ ] 미리보기 기능
- [ ] 파일명 자동 생성
- [ ] 진행 상태 표시

### **Low Priority (향후)**
- [ ] 고급 이미지 옵션
- [ ] 배치 다운로드
- [ ] PDF 변환
- [ ] 공유 기능
- [ ] **각 페이지에 다운로드 버튼 통합** (ClassPage, SchedulePage 등)

## 🧪 **테스트 계획**

### **기능 테스트**
- [ ] 다양한 시간표 크기에서 이미지 생성
- [ ] 다양한 브라우저에서 동작 확인
- [ ] 이미지 품질 및 해상도 검증
- [ ] 파일명 및 다운로드 경로 확인

### **성능 테스트**
- [ ] 큰 시간표에서 이미지 생성 시간 측정
- [ ] 메모리 사용량 모니터링
- [ ] 동시 다운로드 요청 처리

### **사용성 테스트**
- [ ] 사용자 인터페이스 직관성 검증
- [ ] 다양한 사용자 시나리오 테스트
- [ ] 접근성 가이드라인 준수 확인

## 📝 **구현 시 주의사항**

### **기술적 고려사항**
1. **HTML2Canvas 제한사항**: 일부 CSS 속성은 제대로 렌더링되지 않을 수 있음
2. **메모리 관리**: 고해상도 이미지 생성 시 메모리 사용량 주의
3. **비동기 처리**: 이미지 생성 중 사용자 경험 개선

### **사용자 경험 고려사항**
1. **명확한 피드백**: 다운로드 진행 상태를 명확하게 표시
2. **오류 처리**: 실패 시 사용자 친화적인 오류 메시지
3. **접근성**: 키보드 네비게이션 및 스크린 리더 지원

### **코드 구조 및 호환성 주의사항**
1. **기존 코드 영향 없음**: TimetableWidget을 전혀 수정하지 않음
2. **독립적인 기능**: 다운로드 기능이 완전히 분리됨
3. **재사용성**: 다른 곳에서도 쉽게 사용 가능
4. **타입 안전성**: TypeScript를 활용한 안전한 타입 정의

## 🔗 **기존 코드와의 연동**

### **데이터 흐름**
```
기존 TimetableWidget → 전용 다운로드 모달 → HTML2Canvas → 이미지 파일
```

### **장점**
- **기존 코드 영향 없음**: TimetableWidget의 모든 로직이 그대로 유지됨
- **독립적인 기능**: 다운로드 기능이 완전히 분리되어 관리
- **재사용성**: 다른 곳에서도 쉽게 사용 가능
- **유지보수성**: 각 기능이 독립적으로 관리됨

## 🎯 **현재 단계의 목표**

### **핵심 기능 완성**
1. **다운로드 모달이 정상적으로 열리고 닫힘**
2. **시간표 데이터를 받아서 표시**
3. **이미지 생성 및 다운로드 기능 동작**
4. **다양한 옵션 설정 가능**

### **나중에 할 일**
1. **ClassPage에 다운로드 버튼 추가**
2. **SchedulePage에 다운로드 버튼 추가**
3. **TimetableEditModal에 다운로드 버튼 추가**
4. **페이지별 UI 스타일 조정**

## 💡 **단계별 접근의 장점**

### **1. 단계별 검증**
- 핵심 기능을 독립적으로 테스트 가능
- 문제 발생 시 원인 파악이 쉬움
- 각 단계별로 완성도 확인 가능

### **2. 개발 효율성**
- 복잡한 페이지 통합 없이 핵심 기능에 집중
- 모달 컴포넌트 완성 후 재사용 가능
- 나중에 페이지 통합 시 빠른 적용

### **3. 유지보수성**
- 모달 로직과 페이지 UI 로직 분리
- 각각 독립적으로 수정 및 개선 가능

---

**예상 개발 기간**: 1-2일  
**예상 개발 난이도**: ⭐⭐☆☆☆ (쉬움)  
**주요 기술**: HTML2Canvas, React Hooks, TypeScript  
**파일 위치**: `frontend/src/components/business/timetable/`

**핵심 원칙**: 기존 코드를 건드리지 않고, 전용 모달로 깔끔하게 해결!

**현재 목표**: 다운로드 모달 자체만 완벽하게 구현  
**나중 목표**: 각 페이지에 다운로드 버튼 통합
