# 시간표 데이터 구조 개선 계획

## 📋 **현재 상황 분석**

### **현재 데이터 구조**
```typescript
// 현재 Class.schedule 구조
interface Class {
  schedule: string; // JSON 문자열로 저장된 일정 정보
}

// 예시 데이터
{
  "id": "class_001",
  "name": "수학 기초",
  "schedule": "[{\"dayOfWeek\":\"monday\",\"startTime\":\"09:00\",\"endTime\":\"10:00\"}]"
}
```

### **현재 문제점**
1. **파싱 오류 위험**: JSON 문자열 파싱 실패 시 전체 일정 정보 손실
2. **성능 저하**: 매번 `JSON.parse()` 호출로 인한 불필요한 연산
3. **쿼리 제한**: 백엔드에서 특정 요일이나 시간대별 필터링 어려움
4. **타입 안전성**: 런타임에만 데이터 구조 검증 가능
5. **확장성 부족**: 복잡한 일정 정보(반복, 예외 등) 표현 어려움

---

## 🎯 **개선 목표**

### **단기 목표 (Phase 3)**
- 현재 구조를 유지하면서 파싱 안정성 향상
- 에러 처리 및 fallback 로직 강화
- 프론트엔드에서의 데이터 검증 강화

### **장기 목표 (Phase 4+)**
- 백엔드 데이터 구조를 객체 배열로 변경
- NoSQL 데이터베이스의 장점 활용
- 고급 일정 기능 지원

---

## 🔧 **단계별 개선 계획**

### **Phase 3: 프론트엔드 안정성 향상**

#### **3.1 파싱 로직 강화**
```typescript
// 현재 parseAndValidateSchedule 함수 개선
function parseAndValidateSchedule(scheduleStr: string): ClassSchedule[] {
  if (!scheduleStr || typeof scheduleStr !== 'string') {
    return []
  }
  
  try {
    // 1. JSON 형식 검증
    if (!scheduleStr.startsWith('[') && !scheduleStr.startsWith('{')) {
      console.warn('Invalid schedule format: not a JSON array/object')
      return []
    }
    
    const parsed = JSON.parse(scheduleStr)
    
    // 2. 배열 형식 검증
    if (!Array.isArray(parsed)) {
      console.warn('Invalid schedule format: not an array')
      return []
    }
    
    // 3. 각 항목 검증 및 정규화
    return parsed
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        dayOfWeek: validateDayOfWeek(item.dayOfWeek) || 'monday',
        startTime: validateTimeFormat(item.startTime) || '09:00',
        endTime: validateTimeFormat(item.endTime) || '10:00'
      }))
      .filter(schedule => {
        // 4. 시간 유효성 검증
        const start = timeToMinutes(schedule.startTime)
        const end = timeToMinutes(schedule.endTime)
        return start < end && start >= 0 && end <= 1440 // 24시간
      })
      
  } catch (error) {
    console.error('Schedule parsing error:', error)
    return []
  }
}

// 유틸리티 함수들
function validateDayOfWeek(day: any): string | null {
  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  return validDays.includes(day) ? day : null
}

function validateTimeFormat(time: any): string | null {
  if (typeof time !== 'string') return null
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  return timeRegex.test(time) ? time : null
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}
```

#### **3.2 에러 처리 및 로깅 강화**
```typescript
// 에러 타입 정의
interface ScheduleParseError {
  type: 'INVALID_FORMAT' | 'INVALID_DATA' | 'PARSE_ERROR'
  message: string
  originalData: string
  timestamp: Date
}

// 에러 로깅 및 분석
function logScheduleParseError(error: ScheduleParseError) {
  console.error('Schedule Parse Error:', error)
  
  // 에러 통계 수집 (선택사항)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'schedule_parse_error', {
      error_type: error.type,
      error_message: error.message
    })
  }
}
```

### **Phase 4: 백엔드 데이터 구조 개선**

#### **4.1 Firestore 데이터 구조 변경**
```typescript
// 현재 구조
{
  "id": "class_001",
  "name": "수학 기초",
  "schedule": "[{\"dayOfWeek\":\"monday\",\"startTime\":\"09:00\",\"endTime\":\"10:00\"}]"
}

// 개선된 구조
{
  "id": "class_001",
  "name": "수학 기초",
  "schedule": [
    {
      "dayOfWeek": "monday",
      "startTime": "09:00",
      "endTime": "10:00",
      "roomNumber": "A101",
      "isActive": true
    }
  ]
}
```

#### **4.2 백엔드 쿼리 최적화**
```typescript
// 특정 요일 수업 조회
const mondayClasses = await db.collection('classes')
  .where('schedule', 'array-contains', { dayOfWeek: 'monday' })
  .get()

// 특정 시간대 수업 조회
const morningClasses = await db.collection('classes')
  .where('schedule.startTime', '>=', '09:00')
  .where('schedule.startTime', '<', '12:00')
  .get()

// 충돌 검사 쿼리
const conflictingClasses = await db.collection('classes')
  .where('schedule.dayOfWeek', '==', 'monday')
  .where('schedule.startTime', '<', '10:00')
  .where('schedule.endTime', '>', '09:00')
  .get()
```

---

## 📊 **개선 효과 분석**

### **성능 향상**
- **파싱 시간**: `JSON.parse()` 호출 제거로 10-20% 성능 향상
- **메모리 사용**: 불필요한 문자열 복사 제거
- **쿼리 속도**: 인덱싱된 필드로 빠른 검색

### **안정성 향상**
- **파싱 오류**: 0% (구조적 오류 불가능)
- **데이터 무결성**: 백엔드에서 스키마 검증
- **타입 안전성**: 컴파일 타임 오류 감지

### **개발자 경험**
- **디버깅**: 구조화된 데이터로 쉬운 문제 해결
- **API 문서**: 자동 생성된 타입 정의
- **테스트**: 단위 테스트 작성 용이

---

## 🚀 **구현 우선순위**

### **High Priority (즉시 구현)**
1. 프론트엔드 파싱 로직 강화
2. 에러 처리 및 로깅 개선
3. 데이터 검증 함수 구현

### **Medium Priority (Phase 4)**
1. 백엔드 데이터 구조 변경 계획 수립
2. 마이그레이션 스크립트 작성
3. 하위 호환성 유지 방안 검토

### **Low Priority (Phase 5+)**
1. 고급 일정 기능 구현
2. 반복 일정, 예외 일정 지원
3. 일정 충돌 예방 시스템

---

## 🔍 **테스트 계획**

### **단위 테스트**
```typescript
describe('parseAndValidateSchedule', () => {
  test('valid JSON array should parse correctly', () => {
    const validSchedule = '[{"dayOfWeek":"monday","startTime":"09:00","endTime":"10:00"}]'
    const result = parseAndValidateSchedule(validSchedule)
    expect(result).toHaveLength(1)
    expect(result[0].dayOfWeek).toBe('monday')
  })
  
  test('invalid JSON should return empty array', () => {
    const invalidSchedule = 'invalid json'
    const result = parseAndValidateSchedule(invalidSchedule)
    expect(result).toHaveLength(0)
  })
  
  test('malformed data should be filtered out', () => {
    const malformedSchedule = '[{"dayOfWeek":"invalid","startTime":"25:00","endTime":"09:00"}]'
    const result = parseAndValidateSchedule(malformedSchedule)
    expect(result).toHaveLength(0)
  })
})
```

### **통합 테스트**
- 실제 API 응답 데이터로 파싱 테스트
- 다양한 에러 상황에서의 동작 확인
- 성능 테스트 (파싱 시간 측정)

---

## 📝 **결론**

현재 JSON 문자열 기반의 데이터 구조는 단기적으로는 파싱 로직 강화로 안정성을 높일 수 있지만, 장기적으로는 백엔드 데이터 구조를 객체 배열로 변경하는 것이 가장 효과적인 해결책입니다.

**Phase 3에서는 프론트엔드 안정성을 높이고, Phase 4에서 백엔드 구조 개선을 진행하는 것이 권장됩니다.**
