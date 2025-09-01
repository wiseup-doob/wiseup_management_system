# ClassPage 색상 편집 기능 구현 계획

## 📋 개요
ClassPage에서 수업의 시간표 색상을 편집할 수 있도록 하는 기능을 구현합니다. 현재 자동 생성되는 색상 시스템을 사용자가 직접 편집할 수 있게 하여 더 나은 사용자 경험을 제공합니다.

## 🎯 현재 상황 분석

### ✅ 이미 구현된 부분
1. **ClassPage**: 수업 목록 및 상세 정보 표시
2. **ClassDetailPanel**: 선택된 수업의 상세 정보 표시 (TimetableWidget을 통해 색상 이미 표시됨)
3. **EditClassPage**: 수업 정보 편집 모달
4. **TimetableWidget**: 시간표 표시 (이미 색상 지원 - `backgroundColor: cls.color || 'var(--timetable-accent-color)'`)
5. **백엔드 색상 시스템**: ClassSection에 color 필드 저장 및 자동 생성

### ❌ 색상 편집 기능이 없는 부분
1. **색상 편집**: EditClassPage에서 색상 필드 없음
2. **색상 생성**: AddClassPage에서 색상 필드 없음
3. **색상 입력 UI**: 색상 코드 입력 필드 없음

## 🚀 구현 계획

### Phase 1: 백엔드 인프라 구축 ✅ **완료됨**

#### 1.1 색상 팔레트 API 라우트 생성 ✅
- 새로운 라우트 파일 생성: `functions/src/routes/colors.ts` ✅
- 색상 팔레트 조회 엔드포인트 구현 ✅
- 메인 앱에 라우트 등록 ✅

**구현 내용:**
```typescript
// functions/src/routes/colors.ts (새로 생성)
import express from 'express';
import { ColorService } from '../services/ColorService';

const router = express.Router();
const colorService = new ColorService();

// 색상 팔레트 조회 (색상 코드와 이름을 함께 반환)
router.get('/palette', async (req, res) => {
  try {
    const colorsWithNames = colorService.getColorWithNames();
    res.json({
      success: true,
      data: colorsWithNames,
      message: '색상 팔레트 조회 성공'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      message: '색상 팔레트 조회 실패',
      error: error.message
    });
  }
});

export default router;
```

#### 1.2 메인 앱에 라우트 등록 ✅
```typescript
// functions/src/index.ts에 추가 ✅
import colorsRouter from './routes/colors';

// 라우트 등록 ✅
app.use('/api/colors', colorsRouter);
```

#### 1.3 ColorService 확장 ✅
- `getAvailableColors()` 메서드 존재 확인 ✅
- 색상 이름 매핑 추가 (`COLOR_NAMES` 객체) ✅
- `getColorWithNames()` 메서드 추가 ✅
- 색상 팔레트 데이터 구조 검증 ✅

**구현 내용:**
```typescript
// functions/src/services/ColorService.ts에 추가
export class ColorService extends BaseService {
  // 기존 COLOR_PALETTE 유지
  private readonly COLOR_PALETTE = [/* 60개 색상 */];
  
  // 새로운 색상 이름 매핑 추가
  private readonly COLOR_NAMES: Record<string, string> = {
    '#1f77b4': '파란색',
    '#aec7e8': '연한 파란색',
    '#ff7f0e': '주황색',
    '#ffbb78': '연한 주황색',
    '#2ca02c': '초록색',
    '#98df8a': '연한 초록색',
    '#d62728': '빨간색',
    '#ff9896': '연한 빨간색',
    '#9467bd': '보라색',
    '#c5b0d5': '연한 보라색',
    '#8c564b': '갈색',
    '#c49c94': '연한 갈색',
    '#e377c2': '분홍색',
    '#f7b6d2': '연한 분홍색',
    '#7f7f7f': '회색',
    '#c7c7c7': '연한 회색',
    '#bcbd22': '노란색',
    '#dbdb8d': '연한 노란색',
    '#17becf': '청록색',
    '#9edae5': '연한 청록색',
    // ... 나머지 40개 색상
  };

  // 색상 코드와 이름을 함께 반환하는 새로운 메서드
  getColorWithNames(): Array<{ code: string; name: string }> {
    return this.COLOR_PALETTE.map(color => ({
      code: color,
      name: this.COLOR_NAMES[color] || color
    }));
  }

  // 기존 메서드 유지 (호환성)
  getAvailableColors(): string[] {
    return [...this.COLOR_PALETTE];
  }
}
```

### Phase 2: 프론트엔드 API 연동

#### 2.1 API 서비스 확장
- `apiService.getColorPalette()` 메서드 추가
- 색상 팔레트 응답 타입 정의 (색상 코드 + 이름)
- 에러 처리 및 로딩 상태 관리

**구현 내용:**
```typescript
// frontend/src/services/api.ts에 추가
async getColorPalette(): Promise<ApiResponse<Array<{ code: string; name: string }>>> {
  return this.request<Array<{ code: string; name: string }>>('/api/colors/palette');
}
```

#### 2.2 색상 관련 타입 확장
- 색상 팔레트 응답 타입 정의
- 색상 선택 상태 타입 정의
- API 응답 인터페이스 확장

### Phase 3: 색상 선택 UI 구현

#### 3.1 EditClassPage.tsx 수정
- formData에 color 필드 추가
- 색상 선택 UI 추가 (체크박스 + 드롭다운 + 직접 입력)

**구현 내용:**
```typescript
// formData에 color 필드 추가
const [formData, setFormData] = useState({
  name: '',
  courseId: '',
  teacherId: '',
  classroomId: '',
  maxStudents: '',
  description: '',
  subject: 'mathematics' as const,
  difficulty: 'intermediate' as const,
  // 색상 필드 추가
  color: classData?.color || '#3498db'
})

// 색상 선택 상태 관리
const [useColorPalette, setUseColorPalette] = useState(false);
const [selectedPaletteColor, setSelectedPaletteColor] = useState('');
const [customColor, setCustomColor] = useState('');

// 색상 선택 UI 추가
<div className="form-group">
  <label>시간표 색상</label>
  
  {/* 색상 팔레트 사용 체크박스 */}
  <div className="palette-checkbox">
    <input
      type="checkbox"
      id="useColorPalette"
      checked={useColorPalette}
      onChange={(e) => setUseColorPalette(e.target.checked)}
    />
    <label htmlFor="useColorPalette">색상 팔레트 사용</label>
  </div>

  {/* 색상 팔레트 드롭다운 (체크박스 체크 시) */}
  {useColorPalette && (
    <select
      value={selectedPaletteColor}
      onChange={(e) => setSelectedPaletteColor(e.target.value)}
      className="color-palette-dropdown"
    >
      <option value="">색상을 선택하세요</option>
      {availableColors.map(color => (
        <option key={color.code} value={color.code}>
          {color.code} - {color.name}
        </option>
      ))}
    </select>
  )}

  {/* 직접 입력 필드 (체크박스 체크 안 함 시) */}
  {!useColorPalette && (
    <input
      type="text"
      value={customColor}
      onChange={(e) => setCustomColor(e.target.value)}
      placeholder="#3498db"
      className="custom-color-input"
    />
  )}
  
  <small className="form-text">
    {useColorPalette 
      ? '미리 정의된 색상 팔레트에서 선택하세요' 
      : 'HEX 색상 코드를 직접 입력하세요 (예: #3498db)'
    }
  </small>
</div>
```

#### 3.2 AddClassPage.tsx 수정
- 동일하게 색상 선택 UI 추가 (체크박스 + 드롭다운 + 직접 입력)
- 기본 색상 자동 생성 후 사용자가 수정 가능
- ColorService의 색상 팔레트 활용

### Phase 4: 색상 팔레트 시스템 구현

#### 4.1 ColorService 연동
- ColorService의 색상 팔레트 가져오기 (색상 코드 + 이름)
- 백엔드에서 제공하는 색상 이름 활용
- 색상 팔레트 API 엔드포인트 활용

**구현 내용:**
```typescript
// 색상 팔레트 로딩 (색상 코드 + 이름)
const [availableColors, setAvailableColors] = useState<Array<{ code: string; name: string }>>([]);

useEffect(() => {
  const loadColorPalette = async () => {
    try {
      const response = await apiService.getColorPalette();
      if (response.success) {
        setAvailableColors(response.data);
      }
    } catch (error) {
      console.error('색상 팔레트 로드 실패:', error);
    }
  };
  
  loadColorPalette();
}, []);

// 색상 이름은 백엔드에서 이미 제공되므로 별도 매핑 불필요
// availableColors[i].name으로 직접 접근 가능
```

#### 4.2 class.types.ts 수정
- ClassFormDataWithIds에 color 필드 추가
- 색상 관련 타입 확장

**구현 내용:**
```typescript
export interface ClassFormDataWithIds {
  name: string
  courseId: string
  teacherId: string
  classroomId: string
  maxStudents: number
  description?: string
  subject: string
  difficulty: string
  // 색상 필드 추가
  color?: string
}
```

### Phase 5: API 연동 및 상태 관리

#### 5.1 백엔드 API 호출
- `updateClassSection` API에 색상 필드 포함
- 색상 변경 후 즉시 반영
- 색상 팔레트 API 엔드포인트 활용

#### 5.2 상태 관리
- 색상 선택 상태 관리 (체크박스, 드롭다운, 직접 입력)
- Redux store에 색상 변경 반영
- 실시간 UI 업데이트 (TimetableWidget에서 자동 반영)

#### 5.3 색상 검증 및 처리
- 색상 팔레트 선택 시 유효성 검증
- 직접 입력 시 HEX 코드 형식 검증
- 잘못된 색상 입력 시 기본 색상으로 대체

## 📁 수정이 필요한 파일들

### 1. 백엔드 라우트 및 서비스 (새로 생성/수정)
- `functions/src/routes/colors.ts` 파일 생성
- `functions/src/services/ColorService.ts`에 색상 이름 매핑 추가
- 색상 팔레트 API 엔드포인트 구현 (색상 코드 + 이름 반환)
- 메인 앱에 라우트 등록

### 2. 프론트엔드 API 서비스
- `apiService.getColorPalette()` 메서드 추가
- 색상 팔레트 응답 타입 정의
- 에러 처리 및 로딩 상태 관리

### 3. EditClassPage.tsx
- formData에 color 필드 추가
- 색상 선택 UI 추가 (체크박스 + 드롭다운 + 직접 입력)
- 색상 팔레트 로딩 및 상태 관리

### 4. AddClassPage.tsx
- 동일하게 색상 선택 UI 추가
- 기본 색상 자동 생성 후 사용자가 수정 가능
- ColorService의 색상 팔레트 활용

### 5. class.types.ts
- ClassFormDataWithIds에 color 필드 추가
- 색상 관련 타입 확장

### 6. ClassPage.tsx (선택사항)
- 색상 변경 후 목록 새로고침 (필요시)

**참고**: ClassDetailPanel은 수정할 필요가 없습니다. TimetableWidget에서 이미 색상이 표시되고 있습니다.

## 🎨 UI/UX 개선 사항

### 색상 선택 방식
- **체크박스 기반 선택**: "색상 팔레트 사용" 체크박스로 선택 방식 구분
- **색상 팔레트 드롭다운**: 60개 미리 정의된 아름다운 색상 중 선택
- **직접 입력**: 완전한 색상 자유도로 HEX 코드 직접 입력

### 색상 표시
- TimetableWidget에서 자동으로 색상 표시
- 색상 변경 시 즉시 반영
- 기존 색상 시스템과 완벽 호환

### 색상 검증
- 색상 팔레트 선택 시 자동 유효성 검증
- 직접 입력 시 HEX 코드 형식 검증
- 잘못된 색상 입력 시 기본 색상으로 자동 대체

### 사용자 경험
- 직관적인 체크박스 + 드롭다운 조합
- 색상 이름과 코드 동시 표시 (예: "#1f77b4 - 파란색")
- 선택 방식에 따른 동적 도움말 텍스트

## 🔧 기술적 구현 세부사항

### 색상 선택 시스템
- **체크박스 상태 관리**: useColorPalette, selectedPaletteColor, customColor 상태
- **조건부 렌더링**: 체크박스 상태에 따른 동적 UI 표시
- **ColorService 연동**: 백엔드의 60개 색상 팔레트 활용

### 색상 팔레트 시스템
- **API 엔드포인트**: `/api/colors/palette`로 색상 팔레트 제공
- **색상 이름 매핑**: HEX 코드와 사용자 친화적 이름 연결
- **그룹별 분류**: 색상 계열별 그룹화 (파란색, 초록색, 빨간색 등)

### 실시간 반영
- 색상 변경 시 TimetableWidget에서 즉시 반영
- 기존 색상 시스템과 완벽 통합
- 별도 컴포넌트 없이 기존 구조 활용

### 성능 최적화
- 색상 팔레트 한 번만 로딩 (useEffect)
- 조건부 렌더링으로 불필요한 DOM 요소 제거
- 기존 컴포넌트 재사용으로 메모리 효율성 확보

## 🎯 구현 우선순위

### 1. 높음 (필수)
- 백엔드 색상 팔레트 API 라우트 생성 및 등록
- 프론트엔드 API 서비스 확장 (getColorPalette)
- EditClassPage에 색상 선택 UI 추가 (체크박스 + 드롭다운 + 직접 입력)
- AddClassPage에 색상 선택 UI 추가
- 색상 변경 API 연동

### 2. 중간 (권장)
- 색상 팔레트 로딩 및 상태 관리
- 색상 이름 매핑 및 표시
- 색상 입력 검증 로직
- 색상 변경 후 UI 업데이트

### 3. 낮음 (선택사항)
- 색상 그룹별 분류 및 필터링
- 색상 미리보기 및 미리보기
- 고급 색상 관리 기능

## 🚧 구현 시 주의사항

### 1. 기존 코드 호환성
- 현재 자동 색상 생성 시스템과의 호환성 유지
- 색상이 없는 경우 기본 색상 사용
- TimetableWidget의 기존 색상 표시 로직 유지

### 2. 사용자 경험
- 간단하고 직관적인 색상 입력
- 색상 변경 시 즉시 피드백 제공
- 기존 UI/UX 패턴과 일관성 유지

### 3. 성능
- 최소한의 코드 변경으로 구현
- 기존 컴포넌트 재사용
- 불필요한 리렌더링 방지

## 📝 체크리스트

### Phase 1: 백엔드 인프라 구축
- [ ] `functions/src/routes/colors.ts` 파일 생성
- [ ] `functions/src/services/ColorService.ts`에 색상 이름 매핑 추가
- [ ] `getColorWithNames()` 메서드 구현
- [ ] 색상 팔레트 API 엔드포인트 구현 (`/api/colors/palette`)
- [ ] 메인 앱에 라우트 등록 (`functions/src/index.ts`)
- [ ] ColorService 메서드 확인 및 테스트

### Phase 2: 프론트엔드 API 연동
- [ ] `apiService.getColorPalette()` 메서드 추가
- [ ] 색상 팔레트 응답 타입 정의 (색상 코드 + 이름)
- [ ] 에러 처리 및 로딩 상태 관리
- [ ] API 연동 테스트

### Phase 3: 색상 선택 UI 구현
- [ ] EditClassPage에 색상 선택 UI 추가 (체크박스 + 드롭다운 + 직접 입력)
- [ ] AddClassPage에 색상 선택 UI 추가
- [ ] 색상 선택 상태 관리 구현
- [ ] 조건부 렌더링 로직 구현

### Phase 4: 색상 팔레트 시스템 구현
- [ ] ColorService 연동 및 색상 팔레트 로딩 (색상 코드 + 이름)
- [ ] 백엔드에서 제공하는 색상 이름 활용
- [ ] 색상 팔레트 드롭다운 UI 구현
- [ ] 색상 팔레트 시스템 테스트

### Phase 5: 타입 정의 및 API 연동
- [ ] ClassFormDataWithIds에 color 필드 추가
- [ ] 색상 관련 타입 확장
- [ ] 색상 변경 API 호출 구현
- [ ] 색상 검증 및 처리 로직 구현
- [ ] 실시간 UI 업데이트 확인
- [ ] 최종 테스트 및 디버깅

## 🔮 향후 확장 가능성

### 1. 색상 팔레트 고도화
- 색상 그룹별 필터링 및 검색
- 사용자별 색상 선호도 저장
- 색상 테마 시스템

### 2. 색상 자동 최적화
- 시간표 가독성을 위한 자동 색상 조정
- 색상 대비 최적화
- 색상 충돌 자동 해결

### 3. 색상 관리 고도화
- 색상 변경 히스토리 및 롤백
- 색상 일관성 검사 및 권장사항
- 팀 간 색상 공유 및 동기화
- 색상 접근성 검사 (색맹 친화적)

---

**작성일**: 2024년 12월  
**작성자**: AI Assistant  
**프로젝트**: WiseUp Management System - ClassPage 색상 편집 기능
