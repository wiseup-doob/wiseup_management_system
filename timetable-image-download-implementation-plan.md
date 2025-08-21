# 📅 시간표 이미지 다운로드 기능 구현 계획

## 🎯 **프로젝트 개요**
HTML2Canvas 라이브러리를 사용하여 `@timetable/` 폴더의 시간표를 이미지 파일(PNG/JPEG)로 다운로드할 수 있는 기능을 구현합니다.

## 🏗️ **구현 구조**

### **1. 새로운 컴포넌트 추가**
```
@timetable/
├── components/
│   ├── TimetableDownloadButton.tsx      # 다운로드 버튼 컴포넌트
│   ├── TimetableDownloadButton.css      # 다운로드 버튼 스타일
│   ├── DownloadOptionsModal.tsx         # 다운로드 옵션 설정 모달
│   └── DownloadOptionsModal.css         # 모달 스타일
├── hooks/
│   └── useTimetableDownload.ts          # 이미지 다운로드 로직 훅
├── utils/
│   └── timetableImageGenerator.ts       # 이미지 생성 및 다운로드 유틸리티
└── types/
    └── download.types.ts                # 다운로드 관련 타입 정의
```

### **2. 기존 파일 수정**
- `TimetableWidget.tsx`: 다운로드 버튼 추가
- `TimetableWidget.css`: 다운로드 버튼 스타일링

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
   }
   
   export interface DownloadResult {
     success: boolean;
     message: string;
     filename?: string;
     error?: string;
   }
   ```

2. **유틸리티 함수** (`timetableImageGenerator.ts`)
   - `generateTimetableImage()`: HTML2Canvas를 사용한 이미지 생성
   - `downloadImage()`: 이미지 다운로드 처리
   - `generateFilename()`: 자동 파일명 생성

### **Phase 2: 다운로드 훅 구현**
1. **`useTimetableDownload.ts`**
   ```typescript
   const useTimetableDownload = () => {
     const [isGenerating, setIsGenerating] = useState(false);
     const [downloadOptions, setDownloadOptions] = useState<DownloadOptions>();
     
     const downloadTimetable = useCallback(async (element: HTMLElement) => {
       // 이미지 생성 및 다운로드 로직
     }, [downloadOptions]);
     
     return { downloadTimetable, isGenerating, downloadOptions };
   };
   ```

### **Phase 3: UI 컴포넌트 구현**
1. **`TimetableDownloadButton.tsx`**
   - 다운로드 버튼 UI
   - 클릭 시 옵션 모달 열기
   - 다운로드 진행 상태 표시

2. **`DownloadOptionsModal.tsx`**
   - 이미지 형식 선택 (PNG/JPEG)
   - 품질 설정 (슬라이더)
   - 해상도 선택 (1x, 2x, 3x)
   - 파일명 입력/자동생성
   - 다운로드 실행 버튼

### **Phase 4: 기존 컴포넌트 통합**
1. **`TimetableWidget.tsx` 수정**
   - 다운로드 버튼을 시간표 상단에 추가
   - 다운로드 훅 연결
   - 다운로드 옵션 모달 상태 관리

## 🎨 **UI/UX 디자인**

### **다운로드 버튼 위치**
- 시간표 상단 우측에 배치
- 아이콘 + "이미지 다운로드" 텍스트
- 호버 시 툴팁 표시

### **옵션 모달 디자인**
- 중앙 정렬 모달
- 직관적인 폼 레이아웃
- 실시간 미리보기 (가능한 경우)
- 반응형 디자인

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
- **배치 처리**: 여러 시간표 동시 다운로드 (향후 확장)

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

## 🚀 **향후 확장 계획**

### **Phase 5: 고급 기능**
1. **PDF 변환**: 이미지 대신 PDF 다운로드
2. **일괄 다운로드**: 여러 학생 시간표 동시 다운로드
3. **템플릿 시스템**: 다양한 시간표 스타일 제공
4. **공유 기능**: 생성된 이미지를 이메일/메신저로 공유

### **Phase 6: 사용자 설정**
1. **기본 설정 저장**: 사용자별 선호 설정 기억
2. **단축키**: 키보드 단축키로 빠른 다운로드
3. **자동 다운로드**: 특정 조건에서 자동 다운로드

## 📋 **구현 우선순위**

### **High Priority (필수)**
- [ ] 기본 이미지 다운로드 기능
- [ ] PNG/JPEG 형식 지원
- [ ] 다운로드 버튼 UI
- [ ] 기본 다운로드 옵션

### **Medium Priority (권장)**
- [ ] 이미지 품질 설정
- [ ] 해상도 선택 옵션
- [ ] 파일명 자동 생성
- [ ] 진행 상태 표시

### **Low Priority (향후)**
- [ ] 고급 이미지 옵션
- [ ] 배치 다운로드
- [ ] PDF 변환
- [ ] 공유 기능

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

---

**예상 개발 기간**: 2-3일  
**예상 개발 난이도**: ⭐⭐⭐☆☆ (보통)  
**주요 기술**: HTML2Canvas, React Hooks, TypeScript
