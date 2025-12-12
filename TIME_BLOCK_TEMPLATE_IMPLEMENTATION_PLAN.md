# 시간 블록 템플릿 기능 구현 계획서

## 📋 문서 정보

- **작성일**: 2025-01-15
- **프로젝트**: WiseUp Management System
- **기능명**: 시간 블록 템플릿 기능 (Time Block Template)
- **목적**: 수업 추가 시 시간 입력 UX 개선 - 템플릿 선택 및 직접 입력 양방향 전환

---

## 🎯 개요

### 현재 문제점

수업 추가 모달(`AddClassPage`)에서 수업 시간을 입력할 때:
- ❌ 매번 시작/종료 시간을 드롭다운에서 **일일히 수동 선택**
- ❌ 반복적인 시간대(예: 1교시 08:30-10:00)를 매번 입력
- ❌ 입력 오류 가능성 (시간 블록 미스매치)
- ❌ 시간 소요 증가 (클릭 4회 필요: 요일, 시작시, 시작분, 종료시, 종료분)

### 개선 목표

- ✅ **미리 정의된 시간 블록 템플릿** 제공 (1교시, 2교시 등)
- ✅ **클릭 1회로 시간 설정** (템플릿 선택)
- ✅ **유연성 유지**: 템플릿 사용 또는 직접 입력 자유 전환
- ✅ 입력 오류 감소 및 작업 시간 **50% 단축**

### 기대 효과

| 항목 | 현재 | 개선 후 |
|------|------|---------|
| 시간 입력 클릭 수 | 4-6회 | 1-2회 |
| 평균 입력 시간 | 30초 | 15초 |
| 입력 오류율 | ~10% | ~2% |
| 사용자 만족도 | 보통 | 높음 |

---

## 🏗️ 아키텍처 설계

### 참고 패턴

현재 프로젝트의 **색상 선택 기능**과 동일한 패턴 적용:
- 체크박스로 모드 전환 (팔레트 vs 직접 입력)
- 조건부 렌더링 (`{useColorPalette && ...}`)
- 상태 동기화 (모드 전환 시 값 복사/유지)

**참고 코드**: `AddClassPage.tsx` line 548-667

### 데이터 구조

#### 1. 시간 블록 템플릿 정의

```typescript
interface TimeBlockTemplate {
  id: string              // 고유 ID (예: "block_1")
  label: string           // 표시 이름 (예: "1교시")
  time: string            // 시간 표시 (예: "08:30-10:00")
  startTime: string       // 시작 시간 (예: "08:30")
  endTime: string         // 종료 시간 (예: "10:00")
}

// 기본 템플릿 (하드코딩)
const TIME_BLOCK_TEMPLATES: TimeBlockTemplate[] = [
  { id: 'block_0', label: '블록0', time: '08:30-10:00', startTime: '08:30', endTime: '10:00' },
  { id: 'block_1', label: '블록1', time: '10:00-11:30', startTime: '10:00', endTime: '11:30' },
  { id: 'block_2', label: '블록2', time: '11:30-13:00', startTime: '11:30', endTime: '13:00' },
  { id: 'block_lunch', label: '점심', time: '13:00-14:00', startTime: '13:00', endTime: '14:00' },
  { id: 'block_3', label: '블록3', time: '14:00-15:30', startTime: '14:00', endTime: '15:30' },
  { id: 'block_4', label: '블록4', time: '15:30-17:00', startTime: '15:30', endTime: '17:00' },
  { id: 'block_5', label: '블록5', time: '17:00-18:30', startTime: '17:00', endTime: '18:30' },
  { id: 'block_dinner', label: '저녁', time: '18:30-19:00', startTime: '18:30', endTime: '19:00' },
  { id: 'block_6', label: '블록6', time: '19:00-20:30', startTime: '19:00', endTime: '20:30' },
  { id: 'block_7', label: '블록7', time: '20:30-22:00', startTime: '20:30', endTime: '22:00' },
]
```

#### 2. Schedule 타입 확장

```typescript
interface Schedule {
  id: string                  // 고유 ID
  dayOfWeek: string           // 요일 (monday, tuesday, ...)
  startTime: string           // 시작 시간 (HH:mm)
  endTime: string             // 종료 시간 (HH:mm)
  timeBlockId?: string        // 🆕 템플릿 ID (템플릿 모드에서만 사용)
}
```

**주요 설계 포인트:**
- `startTime`, `endTime`은 **템플릿/직접 입력 모두에서 공통 사용**
- `timeBlockId`는 **선택사항** (템플릿으로 추가한 경우만 저장)
- 백엔드 API는 **수정 불필요** (기존 스키마와 호환)

---

## 📦 구현 상세

### Phase 1: 프론트엔드 상태 관리 추가

#### 1.1 상태 변수 추가 (AddClassPage.tsx)

```typescript
// 📍 위치: line 51-55 (색상 선택 상태 뒤)

// 시간 블록 템플릿 관련 상태
const [useTimeBlockTemplate, setUseTimeBlockTemplate] = useState(true)  // 기본값: 템플릿 모드
const [selectedTimeBlock, setSelectedTimeBlock] = useState<string>('')  // 선택된 블록 ID
const [manualStartTime, setManualStartTime] = useState<string>('')      // 직접 입력: 시작 시간
const [manualEndTime, setManualEndTime] = useState<string>('')          // 직접 입력: 종료 시간
```

#### 1.2 폼 초기화 함수 수정 (resetForm)

```typescript
// 📍 위치: line 357-375

const resetForm = () => {
  setFormData({ ... })
  setSchedules([])
  setErrors({})
  setTouched({})
  setCustomColor('#3498db')
  setSelectedPaletteColor('')
  setUseColorPalette(false)

  // 🆕 시간 블록 템플릿 상태 초기화
  setUseTimeBlockTemplate(true)
  setSelectedTimeBlock('')
  setManualStartTime('')
  setManualEndTime('')
}
```

---

### Phase 2: UI 컴포넌트 구현

#### 2.1 모드 전환 체크박스 추가

```typescript
// 📍 위치: line 673 (수업 일정 섹션 시작 부분)

<div className="form-section">
  <div className="schedule-section">
    <div className="schedule-header">
      <h3>수업 일정</h3>
      <button
        type="button"
        className="btn-add-schedule"
        onClick={handleAddSchedule}  // 🆕 별도 함수로 분리
        disabled={isSubmitting}
      >
        + 일정 추가
      </button>
    </div>

    {/* 🆕 모드 전환 체크박스 */}
    <div className="time-input-mode-toggle">
      <input
        type="checkbox"
        id="useTimeBlockTemplate"
        checked={useTimeBlockTemplate}
        onChange={handleTimeInputModeChange}  // 🆕 핸들러 함수
        disabled={isSubmitting}
      />
      <label htmlFor="useTimeBlockTemplate">
        시간 블록 템플릿 사용
      </label>
    </div>

    {/* 🆕 안내 메시지 */}
    <small className="helper-text">
      {useTimeBlockTemplate
        ? '📋 미리 정의된 시간 블록을 선택하세요'
        : '⌨️ 시작 시간과 종료 시간을 직접 입력하세요'
      }
    </small>

    {/* 일정 에러 메시지 */}
    {errors.schedules && (
      <div className="error-message schedule-error">
        {errors.schedules}
      </div>
    )}

    {/* ... 기존 일정 목록 ... */}
  </div>
</div>
```

#### 2.2 일정 항목 UI 수정 (조건부 렌더링)

```typescript
// 📍 위치: line 709-778 (schedules.map 내부)

{schedules.map((schedule, index) => (
  <div key={schedule.id} className="schedule-item">
    <div className={`schedule-inputs ${!useTimeBlockTemplate ? 'manual-mode' : ''}`}>
      {/* 요일 선택 (공통) */}
      <div className="form-group">
        <label>요일 *</label>
        <select
          value={schedule.dayOfWeek}
          onChange={(e) => handleScheduleDayChange(index, e.target.value)}
          required
          disabled={isSubmitting}
        >
          <option value="">요일 선택</option>
          <option value="monday">월요일</option>
          <option value="tuesday">화요일</option>
          <option value="wednesday">수요일</option>
          <option value="thursday">목요일</option>
          <option value="friday">금요일</option>
          <option value="saturday">토요일</option>
          <option value="sunday">일요일</option>
        </select>
      </div>

      {/* 🆕 조건부 렌더링: 템플릿 모드 */}
      {useTimeBlockTemplate ? (
        <div className="form-group time-block-selector">
          <label>시간 블록 *</label>
          <select
            value={schedule.timeBlockId || ''}
            onChange={(e) => handleTimeBlockSelect(index, e.target.value)}
            required
            disabled={isSubmitting}
            className="time-block-dropdown"
          >
            <option value="">시간 블록 선택</option>
            {TIME_BLOCK_TEMPLATES.map(block => (
              <option key={block.id} value={block.id}>
                {block.label} ({block.time})
              </option>
            ))}
          </select>

          {/* 선택된 시간 미리보기 */}
          {schedule.startTime && schedule.endTime && (
            <div className="time-preview">
              ⏰ {schedule.startTime} ~ {schedule.endTime}
            </div>
          )}
        </div>
      ) : (
        /* 🆕 조건부 렌더링: 직접 입력 모드 */
        <>
          <div className="form-group">
            <label>시작 시간 *</label>
            <input
              type="time"
              value={schedule.startTime}
              onChange={(e) => handleManualTimeChange(index, 'startTime', e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="form-group">
            <label>종료 시간 *</label>
            <input
              type="time"
              value={schedule.endTime}
              onChange={(e) => handleManualTimeChange(index, 'endTime', e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
        </>
      )}
    </div>

    {/* 삭제 버튼 */}
    <button
      type="button"
      className="btn-remove-schedule"
      onClick={() => handleRemoveSchedule(index)}
      disabled={isSubmitting}
    >
      삭제
    </button>
  </div>
))}
```

---

### Phase 3: 이벤트 핸들러 구현

#### 3.1 모드 전환 핸들러

```typescript
// 📍 위치: line 266 (handleInputChange 뒤)

/**
 * 시간 입력 모드 전환 핸들러
 * 템플릿 모드 ↔ 직접 입력 모드
 */
const handleTimeInputModeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  const useTemplate = e.target.checked
  setUseTimeBlockTemplate(useTemplate)

  // 모드 전환 시 기존 값 동기화
  if (!useTemplate) {
    // 템플릿 → 직접 입력 모드 전환
    // 현재 선택된 블록이 있으면 그 시간값을 직접 입력 필드로 복사
    if (selectedTimeBlock) {
      const block = TIME_BLOCK_TEMPLATES.find(b => b.id === selectedTimeBlock)
      if (block) {
        setManualStartTime(block.startTime)
        setManualEndTime(block.endTime)
      }
    }
  } else {
    // 직접 입력 → 템플릿 모드 전환
    // 입력한 시간과 일치하는 블록이 있으면 자동 선택 (스마트 매칭)
    if (manualStartTime && manualEndTime) {
      const matchedBlock = TIME_BLOCK_TEMPLATES.find(
        block => block.startTime === manualStartTime &&
                 block.endTime === manualEndTime
      )

      if (matchedBlock) {
        setSelectedTimeBlock(matchedBlock.id)

        // 기존 일정들도 매칭되는 블록으로 업데이트
        const updatedSchedules = schedules.map(schedule => {
          const matched = TIME_BLOCK_TEMPLATES.find(
            b => b.startTime === schedule.startTime &&
                 b.endTime === schedule.endTime
          )
          return matched
            ? { ...schedule, timeBlockId: matched.id }
            : schedule
        })
        setSchedules(updatedSchedules)
      }
    }
  }
}, [selectedTimeBlock, manualStartTime, manualEndTime, schedules])
```

#### 3.2 일정 추가 핸들러

```typescript
// 📍 위치: line 681-689 수정

/**
 * 일정 추가 핸들러
 * 현재 모드에 따라 빈 일정 생성
 */
const handleAddSchedule = useCallback(() => {
  const newSchedule = {
    id: Date.now().toString(),
    dayOfWeek: '',
    startTime: useTimeBlockTemplate ? '' : manualStartTime || '',
    endTime: useTimeBlockTemplate ? '' : manualEndTime || '',
    ...(useTimeBlockTemplate && selectedTimeBlock ? { timeBlockId: selectedTimeBlock } : {})
  }
  setSchedules([...schedules, newSchedule])
}, [useTimeBlockTemplate, manualStartTime, manualEndTime, selectedTimeBlock, schedules])
```

#### 3.3 시간 블록 선택 핸들러

```typescript
/**
 * 시간 블록 선택 핸들러 (템플릿 모드)
 */
const handleTimeBlockSelect = useCallback((index: number, blockId: string) => {
  const block = TIME_BLOCK_TEMPLATES.find(b => b.id === blockId)

  if (block) {
    const updatedSchedules = schedules.map((s, i) =>
      i === index ? {
        ...s,
        timeBlockId: block.id,
        startTime: block.startTime,
        endTime: block.endTime
      } : s
    )
    setSchedules(updatedSchedules)
    setSelectedTimeBlock(blockId)
  }
}, [schedules])
```

#### 3.4 직접 입력 핸들러

```typescript
/**
 * 수동 시간 입력 핸들러 (직접 입력 모드)
 */
const handleManualTimeChange = useCallback((
  index: number,
  field: 'startTime' | 'endTime',
  value: string
) => {
  const updatedSchedules = schedules.map((s, i) =>
    i === index ? { ...s, [field]: value } : s
  )
  setSchedules(updatedSchedules)

  // 전역 상태도 업데이트 (다음 일정 추가 시 사용)
  if (field === 'startTime') {
    setManualStartTime(value)
  } else {
    setManualEndTime(value)
  }
}, [schedules])
```

#### 3.5 요일 선택 핸들러

```typescript
/**
 * 요일 선택 핸들러
 */
const handleScheduleDayChange = useCallback((index: number, dayOfWeek: string) => {
  const updatedSchedules = schedules.map((s, i) =>
    i === index ? { ...s, dayOfWeek } : s
  )
  setSchedules(updatedSchedules)
}, [schedules])
```

#### 3.6 일정 삭제 핸들러

```typescript
/**
 * 일정 삭제 핸들러
 */
const handleRemoveSchedule = useCallback((index: number) => {
  const updatedSchedules = schedules.filter((_, i) => i !== index)
  setSchedules(updatedSchedules)
}, [schedules])
```

---

### Phase 4: CSS 스타일링

#### 4.1 AddClassPage.css 추가

```css
/* ===== 시간 입력 모드 전환 체크박스 ===== */
.time-input-mode-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 16px 0;
  padding: 12px 16px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.time-input-mode-toggle input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #4CAF50;
}

.time-input-mode-toggle label {
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  color: #495057;
  user-select: none;
}

.time-input-mode-toggle input[type="checkbox"]:checked + label {
  color: #2e7d32;
}

/* ===== 안내 메시지 ===== */
.helper-text {
  display: block;
  margin: 8px 0 16px 0;
  padding: 8px 12px;
  font-size: 13px;
  color: #6c757d;
  background: #f1f3f5;
  border-left: 3px solid #adb5bd;
  border-radius: 4px;
}

/* ===== 시간 블록 선택 드롭다운 ===== */
.time-block-selector {
  flex: 2;
}

.time-block-dropdown {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-block-dropdown:hover {
  border-color: #4CAF50;
}

.time-block-dropdown:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

.time-block-dropdown option {
  padding: 8px;
}

/* ===== 시간 미리보기 ===== */
.time-preview {
  margin-top: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-left: 4px solid #4CAF50;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #2e7d32;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* ===== 일정 항목 레이아웃 조정 ===== */
.schedule-item .schedule-inputs {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
  align-items: start;
}

/* 직접 입력 모드일 때 3컬럼 레이아웃 */
.schedule-item .schedule-inputs.manual-mode {
  grid-template-columns: 1fr 1fr 1fr;
}

/* ===== 반응형 디자인 ===== */
@media (max-width: 768px) {
  .schedule-item .schedule-inputs {
    grid-template-columns: 1fr;
  }

  .time-input-mode-toggle {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* ===== 애니메이션 ===== */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.time-block-selector,
.schedule-inputs > div {
  animation: fadeIn 0.3s ease;
}
```

---

## 🔄 데이터 흐름도

### 1. 템플릿 모드에서 일정 추가

```
사용자가 "일정 추가" 클릭
  ↓
handleAddSchedule() 호출
  ↓
새 Schedule 객체 생성:
  {
    id: "1736934567890",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    timeBlockId: selectedTimeBlock || undefined
  }
  ↓
schedules 배열에 추가
  ↓
UI 렌더링: 시간 블록 드롭다운 표시
  ↓
사용자가 "2교시" 선택
  ↓
handleTimeBlockSelect(index, "block_2") 호출
  ↓
TIME_BLOCK_TEMPLATES에서 "block_2" 찾기
  ↓
schedules[index] 업데이트:
  {
    ...기존값,
    timeBlockId: "block_2",
    startTime: "10:00",
    endTime: "11:30"
  }
  ↓
UI 업데이트: 시간 미리보기 표시 "⏰ 10:00 ~ 11:30"
```

### 2. 직접 입력 모드에서 일정 추가

```
사용자가 체크박스 해제
  ↓
useTimeBlockTemplate = false
  ↓
UI 전환: 시간 블록 드롭다운 → time input 필드
  ↓
사용자가 "일정 추가" 클릭
  ↓
handleAddSchedule() 호출
  ↓
새 Schedule 객체 생성:
  {
    id: "1736934567891",
    dayOfWeek: "",
    startTime: manualStartTime || "",
    endTime: manualEndTime || ""
    // timeBlockId 없음
  }
  ↓
UI 렌더링: time input 필드 표시
  ↓
사용자가 시작/종료 시간 입력
  ↓
handleManualTimeChange() 호출
  ↓
schedules[index] 및 전역 상태 업데이트
```

### 3. 모드 전환 (템플릿 → 직접 입력)

```
사용자가 체크박스 해제
  ↓
handleTimeInputModeChange() 호출
  ↓
useTimeBlockTemplate = false
  ↓
if (selectedTimeBlock) {
  // 현재 선택된 블록의 시간을 직접 입력 필드에 복사
  const block = TIME_BLOCK_TEMPLATES.find(...)
  setManualStartTime(block.startTime)  // "10:00"
  setManualEndTime(block.endTime)      // "11:30"
}
  ↓
UI 전환: 드롭다운 숨김, input 표시
  ↓
복사된 시간값이 input에 미리 채워짐
```

### 4. 모드 전환 (직접 입력 → 템플릿) - 스마트 매칭

```
사용자가 체크박스 체크
  ↓
handleTimeInputModeChange() 호출
  ↓
useTimeBlockTemplate = true
  ↓
if (manualStartTime && manualEndTime) {
  // 입력한 시간과 일치하는 블록 찾기
  const matchedBlock = TIME_BLOCK_TEMPLATES.find(
    b => b.startTime === manualStartTime &&
         b.endTime === manualEndTime
  )

  if (matchedBlock) {
    // 자동으로 해당 블록 선택
    setSelectedTimeBlock(matchedBlock.id)

    // 기존 일정들도 매칭 업데이트
    schedules.forEach(schedule => {
      if (매칭되는 블록 있으면) {
        schedule.timeBlockId = matched.id
      }
    })
  }
}
  ↓
UI 전환: input 숨김, 드롭다운 표시
  ↓
매칭된 블록이 자동 선택됨
```

---

## 🧪 테스트 시나리오

### 기능 테스트

#### TC-01: 템플릿 모드로 일정 추가
1. 수업 추가 모달 열기
2. "시간 블록 템플릿 사용" 체크박스 확인됨 (기본값)
3. "일정 추가" 버튼 클릭
4. 요일: "월요일" 선택
5. 시간 블록: "2교시 (10:00-11:30)" 선택
6. ✅ 시간 미리보기에 "⏰ 10:00 ~ 11:30" 표시됨
7. "수업 추가" 버튼 클릭
8. ✅ API 요청에 `startTime: "10:00", endTime: "11:30"` 포함됨

#### TC-02: 직접 입력 모드로 일정 추가
1. "시간 블록 템플릿 사용" 체크박스 해제
2. "일정 추가" 버튼 클릭
3. 요일: "화요일" 선택
4. 시작 시간: "14:15" 입력
5. 종료 시간: "16:45" 입력
6. ✅ 입력한 시간이 표시됨
7. "수업 추가" 버튼 클릭
8. ✅ API 요청에 `startTime: "14:15", endTime: "16:45"` 포함됨

#### TC-03: 모드 전환 (템플릿 → 직접 입력)
1. 템플릿 모드에서 "3교시 (11:30-13:00)" 선택
2. 체크박스 해제
3. ✅ 시작 시간 input에 "11:30" 자동 입력됨
4. ✅ 종료 시간 input에 "13:00" 자동 입력됨
5. 시간 수정 가능 확인

#### TC-04: 모드 전환 (직접 입력 → 템플릿) - 스마트 매칭
1. 직접 입력 모드에서 "08:30" ~ "10:00" 입력
2. 체크박스 체크
3. ✅ 시간 블록 드롭다운에서 "1교시" 자동 선택됨
4. ✅ timeBlockId가 "block_1"로 설정됨

#### TC-05: 모드 전환 (직접 입력 → 템플릿) - 매칭 실패
1. 직접 입력 모드에서 "14:15" ~ "16:45" 입력 (템플릿에 없는 시간)
2. 체크박스 체크
3. ✅ 드롭다운은 "시간 블록 선택" 상태로 유지
4. ✅ 사용자가 수동으로 블록 선택 가능

#### TC-06: 여러 일정 추가 (혼합 모드)
1. 템플릿 모드로 "월요일 1교시" 추가
2. 직접 입력 모드로 "화요일 14:15-16:45" 추가
3. 다시 템플릿 모드로 "수요일 5교시" 추가
4. ✅ 모든 일정이 schedules 배열에 정상 저장됨
5. "수업 추가" 제출
6. ✅ 백엔드에 3개 일정 모두 전송됨

### 검증 테스트

#### TC-07: 일정 검증 (시간 블록 미선택)
1. 템플릿 모드에서 일정 추가
2. 요일만 선택하고 시간 블록 미선택
3. "수업 추가" 클릭
4. ✅ 에러 메시지: "시간 블록을 선택해주세요" 표시

#### TC-08: 일정 검증 (직접 입력 시간 누락)
1. 직접 입력 모드에서 일정 추가
2. 시작 시간만 입력하고 종료 시간 미입력
3. "수업 추가" 클릭
4. ✅ 에러 메시지: "종료 시간을 입력해주세요" 표시

#### TC-09: 일정 검증 (시간 순서 오류)
1. 직접 입력 모드에서 일정 추가
2. 시작: "16:00", 종료: "14:00" 입력
3. ✅ 실시간 검증 에러: "종료 시간은 시작 시간보다 늦어야 합니다"

### UI/UX 테스트

#### TC-10: 반응형 디자인
1. 모바일 화면 크기로 조정 (< 768px)
2. ✅ 일정 입력 필드가 세로 배치됨
3. ✅ 체크박스가 세로 배치됨

#### TC-11: 접근성 테스트
1. 키보드만으로 모든 기능 조작
2. ✅ Tab 키로 포커스 이동 가능
3. ✅ Enter/Space로 버튼 클릭 가능
4. ✅ 드롭다운 키보드 네비게이션 가능

---

## 📁 파일 구조

```
wiseUp_management_system_online_academy/
├── frontend/src/features/class/
│   ├── pages/
│   │   ├── AddClassPage.tsx          # ✏️ 수정 (메인 구현)
│   │   └── AddClassPage.css          # ✏️ 수정 (스타일 추가)
│   └── components/
│       └── TimeInputForm.tsx         # 📌 참고용 (변경 없음)
├── shared/
│   ├── types/
│   │   └── class-section.types.ts    # 📌 확인 (Schedule 타입 - 변경 불필요)
│   └── constants/
│       └── (새 파일 생성 고려)         # 🆕 선택사항: timeBlocks.constants.ts
└── TIME_BLOCK_TEMPLATE_IMPLEMENTATION_PLAN.md  # 📄 본 문서
```

---

## 📅 구현 일정

### Phase 1: 기본 구현 (2-3시간)
- [ ] 상태 변수 추가
- [ ] 시간 블록 템플릿 상수 정의
- [ ] 체크박스 UI 추가
- [ ] 조건부 렌더링 구현
- [ ] 기본 이벤트 핸들러 구현

### Phase 2: 고급 기능 (1-2시간)
- [ ] 모드 전환 로직 구현
- [ ] 스마트 매칭 기능
- [ ] 시간 미리보기
- [ ] CSS 스타일링

### Phase 3: 테스트 및 검증 (1시간)
- [ ] 기능 테스트 (TC-01 ~ TC-06)
- [ ] 검증 테스트 (TC-07 ~ TC-09)
- [ ] UI/UX 테스트 (TC-10 ~ TC-11)
- [ ] 버그 수정

### Phase 4: 문서화 및 배포 (30분)
- [ ] 코드 주석 추가
- [ ] CHANGELOG.md 업데이트
- [ ] PR 생성 및 리뷰 요청

**총 예상 시간**: 4.5-6.5시간

---

## 🔮 향후 확장 계획 (Optional)

### Phase 5: 데이터베이스 연동 (4-6시간)

#### 5.1 Firestore 컬렉션 추가

```typescript
// systemSettings 컬렉션
{
  id: 'timeBlockTemplates',
  templates: [
    {
      id: 'block_1',
      label: '1교시',
      displayName: '1교시 (08:30-10:00)',
      startTime: '08:30',
      endTime: '10:00',
      color: '#4CAF50',
      order: 1,
      isActive: true
    },
    ...
  ],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### 5.2 백엔드 API 추가

```typescript
// functions/src/services/SystemSettingsService.ts
class SystemSettingsService extends BaseService {
  async getTimeBlockTemplates(): Promise<TimeBlockTemplate[]>
  async updateTimeBlockTemplates(templates: TimeBlockTemplate[]): Promise<void>
  async createTimeBlockTemplate(template: TimeBlockTemplate): Promise<string>
  async deleteTimeBlockTemplate(templateId: string): Promise<void>
}

// functions/src/routes/systemSettings.routes.ts
router.get('/time-block-templates', controller.getTimeBlockTemplates)
router.put('/time-block-templates', controller.updateTimeBlockTemplates)
router.post('/time-block-templates', controller.createTimeBlockTemplate)
router.delete('/time-block-templates/:id', controller.deleteTimeBlockTemplate)
```

#### 5.3 관리자 페이지 추가

```typescript
// frontend/src/features/admin/pages/TimeBlockSettingsPage.tsx
// - 시간 블록 목록 표시
// - 추가/수정/삭제 기능
// - 순서 변경 (드래그 앤 드롭)
// - 색상 설정
```

#### 5.4 프론트엔드 API 연동

```typescript
// frontend/src/services/api.ts
class ApiService {
  async getTimeBlockTemplates(): Promise<ApiResponse<TimeBlockTemplate[]>>
  async updateTimeBlockTemplates(templates: TimeBlockTemplate[]): Promise<ApiResponse<void>>
}

// AddClassPage.tsx
useEffect(() => {
  const loadTemplates = async () => {
    const response = await apiService.getTimeBlockTemplates()
    if (response.success) {
      setTimeBlockTemplates(response.data)
    }
  }
  loadTemplates()
}, [])
```

### Phase 6: UX 개선 (2-3시간)

#### 6.1 빠른 전환 버튼

```typescript
<div className="quick-toggle-buttons">
  <button
    className={`toggle-btn ${useTimeBlockTemplate ? 'active' : ''}`}
    onClick={() => setUseTimeBlockTemplate(true)}
  >
    📋 템플릿
  </button>
  <button
    className={`toggle-btn ${!useTimeBlockTemplate ? 'active' : ''}`}
    onClick={() => setUseTimeBlockTemplate(false)}
  >
    ⌨️ 직접 입력
  </button>
</div>
```

#### 6.2 시간 블록 그리드 뷰

```typescript
// 요일 × 시간 블록 2차원 그리드
<div className="time-block-grid">
  <table>
    <thead>
      <tr>
        <th></th>
        <th>월</th>
        <th>화</th>
        <th>수</th>
        <th>목</th>
        <th>금</th>
        <th>토</th>
        <th>일</th>
      </tr>
    </thead>
    <tbody>
      {TIME_BLOCK_TEMPLATES.map(block => (
        <tr key={block.id}>
          <td>{block.label}<br/><small>{block.time}</small></td>
          {DAYS_OF_WEEK.map(day => (
            <td key={day.value}>
              <button onClick={() => addSchedule(day.value, block)}>
                +
              </button>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

#### 6.3 최근 사용 블록 저장

```typescript
// localStorage에 최근 사용한 블록 저장
const [recentBlocks, setRecentBlocks] = useState<string[]>([])

useEffect(() => {
  const saved = localStorage.getItem('recentTimeBlocks')
  if (saved) setRecentBlocks(JSON.parse(saved))
}, [])

const saveRecentBlock = (blockId: string) => {
  const updated = [blockId, ...recentBlocks.filter(id => id !== blockId)].slice(0, 5)
  setRecentBlocks(updated)
  localStorage.setItem('recentTimeBlocks', JSON.stringify(updated))
}

// UI에 "최근 사용" 섹션 추가
```

---

## ⚠️ 주의사항 및 제약사항

### 기술적 제약

1. **백엔드 호환성**
   - 현재 백엔드 API는 `startTime`, `endTime`만 받음
   - `timeBlockId`는 프론트엔드 전용 (DB에 저장하지 않음)
   - 백엔드 수정 불필요 (기존 스키마와 완전 호환)

2. **브라우저 호환성**
   - `<input type="time">`은 IE11 미지원
   - 모던 브라우저(Chrome, Firefox, Safari, Edge) 타겟

3. **시간 형식**
   - HH:mm 형식 (24시간제) 고정
   - 백엔드와 동일한 형식 사용

### UX 고려사항

1. **기본값 설정**
   - 체크박스 기본값: `true` (템플릿 모드)
   - 이유: 대부분의 사용자가 정해진 시간 블록 사용
   - 직접 입력이 필요한 경우만 체크 해제

2. **에러 처리**
   - 템플릿 미선택 시: "시간 블록을 선택해주세요"
   - 직접 입력 누락 시: 기존 검증 로직 재사용
   - 시간 순서 오류: 실시간 검증

3. **데이터 일관성**
   - 모드 전환 시 기존 값 최대한 보존
   - 스마트 매칭으로 사용자 의도 유지

### 성능 최적화

1. **useCallback 사용**
   - 모든 이벤트 핸들러를 `useCallback`으로 메모이제이션
   - 불필요한 재렌더링 방지

2. **조건부 렌더링**
   - 템플릿/직접 입력 UI를 완전히 분리
   - 사용하지 않는 모드의 DOM 생성하지 않음

3. **상태 최소화**
   - `schedules` 배열이 단일 진실 공급원(Single Source of Truth)
   - 중복 상태 최소화

---

## 📊 성공 지표 (KPI)

### 정량적 지표

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 시간 입력 속도 | 50% 향상 | 일정 1개 추가 시간 측정 (30초 → 15초) |
| 클릭 수 감소 | 60% 감소 | 일정 1개 추가 클릭 수 (5회 → 2회) |
| 입력 오류율 | 80% 감소 | 시간 불일치 발생 빈도 (10% → 2%) |
| 사용자 만족도 | 4.5/5.0 이상 | 설문조사 |

### 정성적 지표

- ✅ 사용자 피드백: "시간 입력이 편해졌어요"
- ✅ 사용률 분석: 템플릿 모드 사용률 > 80%
- ✅ 지원 요청 감소: 시간 입력 관련 문의 감소

---

## 🔗 참고 자료

### 코드 참고

- **색상 선택 기능**: `AddClassPage.tsx` line 548-667
  - 체크박스 전환 패턴
  - 조건부 렌더링
  - 상태 동기화 로직

- **시간 입력 폼**: `TimeInputForm.tsx`
  - TIME_OPTIONS 상수
  - 시간 검증 로직

- **시간표 상수**: `timetable.constants.ts`
  - TIME_INTERVAL: 30분 단위

### 관련 문서

- [CLAUDE.md](CLAUDE.md) - 프로젝트 아키텍처 및 개발 가이드
- [database_structure.md](database_structure.md) - 데이터베이스 스키마
- [AddClassPage.tsx](frontend/src/features/class/pages/AddClassPage.tsx) - 수업 추가 모달 컴포넌트

---

## 📝 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0 | 2025-01-15 | Claude | 초안 작성 |

---

## ✅ 체크리스트

### 개발 전 준비
- [ ] 이 문서를 팀과 공유하고 리뷰 완료
- [ ] 백엔드 API 호환성 확인
- [ ] 디자인 시안 확인 (필요 시)

### 구현 중
- [ ] Phase 1 완료: 기본 구조
- [ ] Phase 2 완료: 고급 기능
- [ ] Phase 3 완료: 테스트
- [ ] Phase 4 완료: 문서화

### 배포 전
- [ ] 모든 테스트 케이스 통과
- [ ] 코드 리뷰 완료
- [ ] 사용자 가이드 작성 (필요 시)
- [ ] 스테이징 환경에서 QA 완료

### 배포 후
- [ ] 프로덕션 모니터링
- [ ] 사용자 피드백 수집
- [ ] KPI 측정 및 분석
- [ ] 개선 사항 도출

---

**문서 끝**
